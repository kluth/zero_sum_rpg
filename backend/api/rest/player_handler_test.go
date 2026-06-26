package rest

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"zero_sum_rpg_backend/adapter/db"
	"zero_sum_rpg_backend/domain"
)

func TestPlayerHandler_GetPlayer(t *testing.T) {
	// Setup Repo & Data
	repo := db.NewInMemoryPlayerRepository()
	p := domain.NewPlayer("p-123", "Morpheus")
	p.AddCredits(1000)
	repo.Save(p)

	handler := NewPlayerHandler(repo)

	// Setup Request
	req, err := http.NewRequest("GET", "/api/player/p-123", nil)
	if err != nil {
		t.Fatal(err)
	}

	// Fake the PathValue logic (if using Go 1.22 mux) or pass manually.
	// For testing the handler directly, we can just use a recorder and a mux.
	mux := http.NewServeMux()
	mux.HandleFunc("/api/player/{id}", handler.GetPlayer)

	rr := httptest.NewRecorder()
	mux.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusOK)
	}

	var resp domain.Player
	if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if resp.Name != "Morpheus" {
		t.Errorf("expected Morpheus, got %s", resp.Name)
	}
	if resp.Credits != 1000 {
		t.Errorf("expected 1000 credits, got %d", resp.Credits)
	}

	// Test Not Found
	reqNotFound, _ := http.NewRequest("GET", "/api/player/ghost", nil)
	rrNotFound := httptest.NewRecorder()
	mux.ServeHTTP(rrNotFound, reqNotFound)

	if rrNotFound.Code != http.StatusNotFound {
		t.Errorf("expected 404 for missing player, got %v", rrNotFound.Code)
	}
}
