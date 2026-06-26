package main

import (
	"log"
	"net/http"

	"github.com/improbable-eng/grpc-web/go/grpcweb"
	"google.golang.org/grpc"

	"zero_sum_rpg_backend/adapter/db"
	"zero_sum_rpg_backend/api/rest"
	"zero_sum_rpg_backend/domain"
	"zero_sum_rpg_backend/feed"
)

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

	// 4. Start HTTP Server for gRPC-Web and SSE
	port := ":8080"
	log.Printf("Server listening on %s\n", port)
	
	mux := http.NewServeMux()
	feed.RegisterSSEHandler(mux, h)
	
	// REST API Setup
	playerRepo := db.NewInMemoryPlayerRepository()
	playerHandler := rest.NewPlayerHandler(playerRepo)
	playerHandler.RegisterRoutes(mux)
	
	httpServer := &http.Server{
		Addr: port,
		Handler: http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if wrappedGrpc.IsGrpcWebRequest(r) || wrappedGrpc.IsAcceptableGrpcCorsRequest(r) {
				wrappedGrpc.ServeHTTP(w, r)
				return
			}
			mux.ServeHTTP(w, r)
		}),
	}

	if err := httpServer.ListenAndServe(); err != nil {
		log.Fatalf("Failed to serve: %v", err)
	}
}
