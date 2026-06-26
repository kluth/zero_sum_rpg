package db

import (
	"testing"
	"zero_sum_rpg_backend/domain"
)

func TestInMemoryPlayerRepository_SaveAndFind(t *testing.T) {
	repo := NewInMemoryPlayerRepository()
	player := domain.NewPlayer("player-01", "Cipher")
	player.AP = 5

	// Save
	saveRes := repo.Save(player)
	if !saveRes.IsOk() {
		t.Fatalf("expected successful save, got error")
	}

	// Find
	findRes := repo.FindByID("player-01")
	if !findRes.IsOk() {
		t.Fatalf("expected to find player, got error")
	}

	found := findRes.Value
	if found.Name != "Cipher" {
		t.Errorf("expected Cipher, got %s", found.Name)
	}
	if found.AP != 5 {
		t.Errorf("expected AP 5, got %d", found.AP)
	}

	// Find non-existent
	findRes2 := repo.FindByID("ghost")
	if findRes2.IsOk() {
		t.Fatalf("expected error finding non-existent player, got ok")
	}
}
