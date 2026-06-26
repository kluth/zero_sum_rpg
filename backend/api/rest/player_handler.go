package rest

import (
	"encoding/json"
	"net/http"

	"zero_sum_rpg_backend/domain"
)

type PlayerHandler struct {
	repo domain.PlayerRepository
}

func NewPlayerHandler(repo domain.PlayerRepository) *PlayerHandler {
	return &PlayerHandler{repo: repo}
}

func (h *PlayerHandler) GetPlayer(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		http.Error(w, "missing player id", http.StatusBadRequest)
		return
	}

	res := h.repo.FindByID(id)
	if !res.IsOk() {
		http.Error(w, "player not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(res.Value); err != nil {
		http.Error(w, "failed to encode player", http.StatusInternalServerError)
	}
}

// RegisterRoutes attaches the endpoints to the provided ServeMux
func (h *PlayerHandler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("GET /api/player/{id}", h.GetPlayer)
}
