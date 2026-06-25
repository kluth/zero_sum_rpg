package feed

import (
	"crypto/rand"
	"encoding/hex"
	"log"
	"net/http"
)

var SessionKey string

func init() {
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		log.Fatal(err)
	}
	SessionKey = hex.EncodeToString(bytes)
	log.Printf("==================================================\n")
	log.Printf("SECURE SESSION KEY GENERATED: %s\n", SessionKey)
	log.Printf("==================================================\n")
}

func AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Allow preflight
		if r.Method == "OPTIONS" {
			next.ServeHTTP(w, r)
			return
		}

		token := r.Header.Get("Authorization")
		queryToken := r.URL.Query().Get("token")

		if token == "Bearer "+SessionKey || queryToken == SessionKey {
			next.ServeHTTP(w, r)
		} else {
			http.Error(w, "Unauthorized - Invalid Session Key", http.StatusUnauthorized)
		}
	}
}
