package domain

import (
	"testing"
)

func TestPlayer_IncreaseReputation(t *testing.T) {
	p := NewPlayer("p1", "Neo")
	p.IncreaseReputation(10)
	if p.Reputation != 10 {
		t.Errorf("expected 10, got %d", p.Reputation)
	}
	p.IncreaseReputation(-5) // should ignore
	if p.Reputation != 10 {
		t.Errorf("expected 10, got %d", p.Reputation)
	}
}

func TestPlayer_Heat(t *testing.T) {
	p := NewPlayer("p1", "Neo")
	p.IncreaseHeat(5)
	if p.HeatLevel != 5 {
		t.Errorf("expected 5, got %d", p.HeatLevel)
	}
	p.DecreaseHeat(2)
	if p.HeatLevel != 3 {
		t.Errorf("expected 3, got %d", p.HeatLevel)
	}
	p.DecreaseHeat(5) // should cap at 0
	if p.HeatLevel != 0 {
		t.Errorf("expected 0, got %d", p.HeatLevel)
	}
}

func TestPlayer_BlindSpot(t *testing.T) {
	p := NewPlayer("p1", "Neo")
	if p.IsBlindSpot {
		t.Errorf("expected false, got true")
	}
	p.EnterBlindSpot()
	if !p.IsBlindSpot {
		t.Errorf("expected true, got false")
	}
	p.LeaveBlindSpot()
	if p.IsBlindSpot {
		t.Errorf("expected false, got true")
	}
}
