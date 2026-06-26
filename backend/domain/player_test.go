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

func TestPlayer_ExecuteAction(t *testing.T) {
	p := NewPlayer("p1", "Neo")
	
	// Default AP should be 10 (or whatever we initialize it to, let's say 10)
	if p.AP != 10 {
		t.Errorf("expected 10 initial AP, got %d", p.AP)
	}

	hackAction := Action{ID: "act-1", Name: "Hack Firewall", APCost: 4}
	
	res := p.ExecuteAction(hackAction)
	if !res.IsOk() {
		t.Errorf("expected success, got error: %v", res.Err)
	}
	if p.AP != 6 {
		t.Errorf("expected 6 AP left, got %d", p.AP)
	}

	heavyAction := Action{ID: "act-2", Name: "Upload Virus", APCost: 10}
	res2 := p.ExecuteAction(heavyAction)
	if res2.IsOk() {
		t.Errorf("expected failure due to insufficient AP, but got success")
	}
	if p.AP != 6 {
		t.Errorf("expected AP to remain 6, got %d", p.AP)
	}
}
