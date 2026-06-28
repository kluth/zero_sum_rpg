package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
	"github.com/improbable-eng/grpc-web/go/grpcweb"
	"google.golang.org/grpc"

	"zero_sum_rpg_backend/adapter/db"
	"zero_sum_rpg_backend/api/rest"
	"zero_sum_rpg_backend/domain"
	"zero_sum_rpg_backend/feed"
)

// --- WebSocket & State Management ---

// AppState hält den globalen Status des Spiels, z.B. das 150MB Satelliten-Limit.
type AppState struct {
	mu               sync.RWMutex
	SatelliteLimitMB float64 `json:"current_limit_mb"`
}

var globalState = &AppState{
	SatelliteLimitMB: 150.0, // Startwert: 150MB
}

// upgrader wird verwendet, um die HTTP-Verbindung zu einer WebSocket-Verbindung hochzustufen.
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Für dieses Setup erlauben wir alle Origins (sollte für Prod angepasst werden)
	},
}

// Hub verwaltet alle aktiven WebSocket-Clients und verteilt (broadcasts) Nachrichten.
type Hub struct {
	// Registrierte Clients
	clients map[*websocket.Conn]bool
	// Eingehende Broadcast-Nachrichten
	broadcast chan []byte
	// Registrierungsanfragen von neuen Clients
	register chan *websocket.Conn
	// Abmeldungen von Clients
	unregister chan *websocket.Conn
	// Mutex für den sicheren Zugriff auf die clients-Map
	mu sync.Mutex
}

func NewHub() *Hub {
	return &Hub{
		broadcast:  make(chan []byte),
		register:   make(chan *websocket.Conn),
		unregister: make(chan *websocket.Conn),
		clients:    make(map[*websocket.Conn]bool),
	}
}

// Run startet die Hauptschleife des Hubs.
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()
			log.Println("Neuer WebSocket-Client verbunden")

			// Sende dem neuen Client direkt den aktuellen Status
			globalState.mu.RLock()
			currentState, _ := json.Marshal(globalState)
			globalState.mu.RUnlock()
			client.WriteMessage(websocket.TextMessage, currentState)

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				client.Close()
				log.Println("WebSocket-Client getrennt")
			}
			h.mu.Unlock()

		case message := <-h.broadcast:
			h.mu.Lock()
			for client := range h.clients {
				err := client.WriteMessage(websocket.TextMessage, message)
				if err != nil {
					log.Printf("Fehler beim Senden an Client: %v", err)
					client.Close()
					delete(h.clients, client)
				}
			}
			h.mu.Unlock()
		}
	}
}

// PlayerAction repräsentiert eine Aktion, die ein Spieler über den WebSocket sendet (z.B. Verbrauch von Bandbreite).
type PlayerAction struct {
	Type   string  `json:"type"`   // z.B. "consume"
	Amount float64 `json:"amount"` // z.B. 30.0
}

// serveWs verarbeitet WebSocket-Anfragen vom Client.
func serveWs(hub *Hub, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Fehler beim WebSocket Upgrade:", err)
		return
	}

	hub.register <- conn

	// Lese-Schleife: Wartet auf Aktionen des Spielers (z.B. limit verringern)
	go func() {
		defer func() {
			hub.unregister <- conn
		}()
		for {
			_, message, err := conn.ReadMessage()
			if err != nil {
				if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
					log.Printf("Unerwarteter Verbindungsabbruch: %v", err)
				}
				break
			}

			var action PlayerAction
			if err := json.Unmarshal(message, &action); err != nil {
				log.Printf("Ungültiges Aktionsformat: %v", err)
				continue
			}

			if action.Type == "consume" {
				globalState.mu.Lock()
				// Limit abziehen, aber nicht unter 0 fallen lassen
				globalState.SatelliteLimitMB -= action.Amount
				if globalState.SatelliteLimitMB < 0 {
					globalState.SatelliteLimitMB = 0
				}
				log.Printf("Spieleraktion 'consume': %.2fMB. Neues Limit: %.2fMB", action.Amount, globalState.SatelliteLimitMB)

				// Status als JSON serialisieren und an alle Clients broadcasten
				newState, _ := json.Marshal(globalState)
				globalState.mu.Unlock()

				hub.broadcast <- newState
			}
		}
	}()
}

func main() {
	log.Println("Starting Zero Sum RPG Handler Event Backend...")

	// 1. Initialize Domain logic
	h := domain.NewHandler()

	// 2. Initialize gRPC Server
	grpcServer := grpc.NewServer()
	feedServer := feed.NewServer(h)
	feed.Register(grpcServer, feedServer)

	// 3. Wrap gRPC server with gRPC-Web proxy
	wrappedGrpc := grpcweb.WrapServer(grpcServer, grpcweb.WithOriginFunc(func(origin string) bool {
		return origin == "http://localhost:4200" || origin == "http://localhost:9000" || origin == "http://localhost:4000"
	}))

	// 4. Start HTTP Server for gRPC-Web, SSE and WebSocket
	port := ":8080"
	log.Printf("Server listening on %s\n", port)

	mux := http.NewServeMux()
	
	// Vorhandene Endpunkte registrieren
	feed.RegisterSSEHandler(mux, h)

	// REST API Setup
	playerRepo := db.NewInMemoryPlayerRepository()
	playerHandler := rest.NewPlayerHandler(playerRepo)
	playerHandler.RegisterRoutes(mux)

	// 5. WebSocket Setup (Satelliten-Limit State & Broadcast)
	hub := NewHub()
	go hub.Run() // Hub im Hintergrund starten
	
	mux.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		serveWs(hub, w, r)
	})

	httpServer := &http.Server{
		Addr: port,
		Handler: http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// gRPC-Web Anfragen weiterleiten
			if wrappedGrpc.IsGrpcWebRequest(r) || wrappedGrpc.IsAcceptableGrpcCorsRequest(r) {
				wrappedGrpc.ServeHTTP(w, r)
				return
			}
			// Normale HTTP/WebSocket Anfragen (inkl. REST, SSE, WS)
			mux.ServeHTTP(w, r)
		}),
	}

	if err := httpServer.ListenAndServe(); err != nil {
		log.Fatalf("Failed to serve: %v", err)
	}
}
