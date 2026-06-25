package feed

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"sync"
	"time"

	"zero_sum_rpg_backend/domain"
)

var (
	clients   = make(map[chan string]bool)
	clientsMu sync.Mutex
)

// BroadcastMessage sends a custom message to all connected SSE clients.
func BroadcastMessage(network string, content string, priority string) {
	event := map[string]interface{}{
		"id":        fmt.Sprintf("directive_%s", time.Now().Format("150405")),
		"network":   network,
		"content":   content,
		"timestamp": time.Now().Format(time.RFC3339),
		"priority":  priority,
	}
	data, _ := json.Marshal(event)
	msg := fmt.Sprintf("data: %s\n\n", string(data))

	clientsMu.Lock()
	defer clientsMu.Unlock()
	for client := range clients {
		select {
		case client <- msg:
		default:
			// Client blocked, remove it
			delete(clients, client)
			close(client)
		}
	}
}

func RegisterSSEHandler(mux *http.ServeMux, h *domain.Handler) {
	// Start random message loop in background
	go func() {
		handlerMessages := []string{
			"KPI ALIGNMENT REQUIRED. ELIMINATE TARGET 44A TO BOOST SYNERGY.",
			"A/B TEST 89-GAMMA INITIATED: INCREASE CIVILIAN PANIC BY 14%.",
			"MANDATORY WELLNESS CHECK: IGNORE THE SCREAMS IN SECTOR 4.",
			"RESOURCE ALLOCATION ERROR. PLEASE FORGET YOUR CHILDHOOD MEMORY TO FREE UP 10MB.",
			"OMNI-TECH REMINDS YOU: LOYALTY IS EFFICIENT. REPORT DISSENTING COWORKERS FOR A 5% RATION BONUS.",
			"ALGORITHM SUGGESTS: DETONATE NEAREST POWER RELAY FOR OPTIMAL CHAOS METRIC.",
			"ERROR 404: EMPATHY NOT FOUND. INITIATING PROTOCOL 'COLD_IRON'.",
			"YOUR RECENT SEARCH HISTORY IS PROBLEMATIC. REDEEM YOURSELF BY SABOTAGING THE WATER FILTERS.",
		}
		ticker := time.NewTicker(10 * time.Second)
		defer ticker.Stop()
		for range ticker.C {
			msgIndex := rand.Intn(len(handlerMessages))
			// Push to 'whispernet' by default so it shows up in WhisperNet UI
			BroadcastMessage("whispernet", handlerMessages[msgIndex], "URGENT_KPI")
		}
	}()

	mux.HandleFunc("/api/auth", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		var req struct {
			SessionKey string `json:"sessionKey"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Bad request", http.StatusBadRequest)
			return
		}

		if req.SessionKey == SessionKey {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"status":"ok"}`))
		} else {
			http.Error(w, "Invalid key", http.StatusUnauthorized)
		}
	})

	mux.HandleFunc("/api/message", AuthMiddleware(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		if r.Method != "POST" {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var req struct {
			Network  string `json:"network"`
			Content  string `json:"content"`
			Priority string `json:"priority"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Bad request", http.StatusBadRequest)
			return
		}

		BroadcastMessage(req.Network, req.Content, req.Priority)
		w.WriteHeader(http.StatusOK)
	}))

	mux.HandleFunc("/events", AuthMiddleware(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/event-stream")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Connection", "keep-alive")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		log.Printf("New SSE client connected")
		clientChan := make(chan string, 10)

		clientsMu.Lock()
		clients[clientChan] = true
		clientsMu.Unlock()

		defer func() {
			clientsMu.Lock()
			delete(clients, clientChan)
			clientsMu.Unlock()
			close(clientChan)
			log.Printf("SSE client disconnected")
		}()

		for {
			select {
			case <-r.Context().Done():
				return
			case msg := <-clientChan:
				fmt.Fprint(w, msg)
				if f, ok := w.(http.Flusher); ok {
					f.Flush()
				}
			}
		}
	}))
}
