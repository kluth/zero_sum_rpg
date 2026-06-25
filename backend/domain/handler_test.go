package domain

import (
	"testing"
	pb "zero_sum_rpg_backend/api/feed"
)

func TestHandler_DetermineNetworks(t *testing.T) {
	handler := NewHandler()

	t.Run("inactive hotspot", func(t *testing.T) {
		h := NewHotspot("h1", "Test")
		h.Deactivate()
		nets := handler.DetermineNetworks(h)
		if len(nets) != 0 {
			t.Errorf("expected 0 networks")
		}
	})

	t.Run("low heat hotspot", func(t *testing.T) {
		h := NewHotspot("h1", "Test")
		nets := handler.DetermineNetworks(h)
		if len(nets) != 1 || nets[0] != pb.NetworkID_WHISPERNET {
			t.Errorf("expected only whispernet")
		}
	})

	t.Run("high heat hotspot", func(t *testing.T) {
		h := NewHotspot("h1", "Test")
		h.HeatLevel = 10
		nets := handler.DetermineNetworks(h)
		if len(nets) != 3 {
			t.Errorf("expected 3 networks, got %v", nets)
		}
	})
}
