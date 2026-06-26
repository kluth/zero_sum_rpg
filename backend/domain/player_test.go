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

func TestPlayer_Inventory(t *testing.T) {
	p := NewPlayer("p1", "Neo")
	
	if p.InventoryCapacity != 10 {
		t.Errorf("expected default capacity 10, got %d", p.InventoryCapacity)
	}

	item := Item{ID: "i-1", Name: "Cyberdeck", Type: ItemTypeHardware}
	
	// Add Item
	res := p.AddItem(item)
	if !res.IsOk() {
		t.Fatalf("expected item to be added, got error %v", res.Err)
	}
	if len(p.Inventory) != 1 {
		t.Errorf("expected inventory size 1, got %d", len(p.Inventory))
	}

	// Fill Inventory
	for i := 0; i < 9; i++ {
		p.AddItem(Item{ID: "dummy", Name: "Dummy Item", Type: ItemTypeSoftware})
	}

	if len(p.Inventory) != 10 {
		t.Errorf("expected inventory size 10, got %d", len(p.Inventory))
	}

	// Exceed capacity
	resFail := p.AddItem(item)
	if resFail.IsOk() {
		t.Errorf("expected error when adding past capacity")
	}

	// Remove item
	resRemove := p.RemoveItem("i-1")
	if !resRemove.IsOk() {
		t.Errorf("expected successful removal")
	}
	if len(p.Inventory) != 9 {
		t.Errorf("expected inventory size 9 after removal, got %d", len(p.Inventory))
	}

	// Remove non-existent
	resRemoveFail := p.RemoveItem("ghost-item")
	if resRemoveFail.IsOk() {
		t.Errorf("expected error removing non-existent item")
	}
}

func TestPlayer_Economy(t *testing.T) {
	p := NewPlayer("p2", "Trinity")

	if p.Credits != 0 {
		t.Errorf("expected 0 starting credits, got %d", p.Credits)
	}

	// Add Credits
	res := p.AddCredits(500)
	if !res.IsOk() || p.Credits != 500 {
		t.Errorf("expected 500 credits, got %d", p.Credits)
	}

	// Spend Credits
	resSpend := p.SpendCredits(200)
	if !resSpend.IsOk() || p.Credits != 300 {
		t.Errorf("expected 300 credits after spending 200, got %d", p.Credits)
	}

	// Insufficient Credits
	resFail := p.SpendCredits(1000)
	if resFail.IsOk() {
		t.Errorf("expected error when overspending")
	}
	if p.Credits != 300 {
		t.Errorf("expected credits to remain 300 after failed spend, got %d", p.Credits)
	}

	// Negative amounts
	resNeg1 := p.AddCredits(-100)
	if resNeg1.IsOk() {
		t.Errorf("expected error adding negative credits")
	}
	resNeg2 := p.SpendCredits(-100)
	if resNeg2.IsOk() {
		t.Errorf("expected error spending negative credits")
	}
}
