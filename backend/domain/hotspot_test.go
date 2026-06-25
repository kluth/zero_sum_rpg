package domain

import (
	"testing"
)

func TestHotspot_Escalate(t *testing.T) {
	t.Run("successful escalation", func(t *testing.T) {
		h := NewHotspot("h1", "Downtown")
		res := h.Escalate(5)
		if !res.IsOk() {
			t.Errorf("expected ok, got err: %v", res.Err)
		}
		if h.HeatLevel != 5 {
			t.Errorf("expected heat level 5, got %d", h.HeatLevel)
		}
	})

	t.Run("fail on negative amount", func(t *testing.T) {
		h := NewHotspot("h1", "Downtown")
		res := h.Escalate(-1)
		if res.IsOk() || res.Err != ErrInvalidAmount {
			t.Errorf("expected invalid amount error, got %v", res.Err)
		}
	})

	t.Run("fail on inactive hotspot", func(t *testing.T) {
		h := NewHotspot("h1", "Downtown")
		h.Deactivate()
		res := h.Escalate(5)
		if res.IsOk() || res.Err != ErrInactiveHotspot {
			t.Errorf("expected inactive error, got %v", res.Err)
		}
	})
}
