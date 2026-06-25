package feed

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"zero_sum_rpg_backend/domain"
)

func RegisterSSEHandler(mux *http.ServeMux, h *domain.Handler) {
	mux.HandleFunc("/events", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/event-stream")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Connection", "keep-alive")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		log.Printf("New SSE client connected")

		ticker := time.NewTicker(2 * time.Second)
		defer ticker.Stop()

		for {
			select {
			case <-r.Context().Done():
				log.Printf("SSE client disconnected")
				return
			case <-ticker.C:
				event := map[string]interface{}{
					"id":        fmt.Sprintf("q_%s", time.Now().Format("150405")),
					"network":   "WHISPERNET",
					"content":   "New handler packet received via secure channel.",
					"timestamp": time.Now().Format(time.RFC3339),
				}
				data, _ := json.Marshal(event)
				fmt.Fprintf(w, "data: %s\n\n", string(data))
				if f, ok := w.(http.Flusher); ok {
					f.Flush()
				}
			}
		}
	})
}
