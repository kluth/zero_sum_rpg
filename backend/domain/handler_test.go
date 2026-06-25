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

func TestHandler_FindEligiblePlayers(t *testing.T) {
	handler := NewHandler()
	hotspot := NewHotspot("h1", "Test")

	p1 := NewPlayer("p1", "Alice")
	p1.Reputation = 60
	p1.HeatLevel = 10

	p2 := NewPlayer("p2", "Bob")
	p2.EnterBlindSpot()

	p3 := NewPlayer("p3", "Charlie")
	p3.Reputation = 10

	p4 := NewPlayer("p4", "Dave")
	p4.HeatLevel = 90

	players := []*Player{p1, p2, p3, p4}

	t.Run("normal hotspot", func(t *testing.T) {
		hotspot.HeatLevel = 5
		eligible := handler.FindEligiblePlayers(players, hotspot)
		if len(eligible) != 3 {
			t.Errorf("expected 3 eligible players, got %d", len(eligible))
		}
	})

	t.Run("high heat hotspot", func(t *testing.T) {
		hotspot.HeatLevel = 15
		eligible := handler.FindEligiblePlayers(players, hotspot)
		if len(eligible) != 1 || eligible[0].ID != "p1" {
			t.Errorf("expected 1 eligible player (Alice), got %d", len(eligible))
		}
	})
}

func TestHandler_GenerateQuest(t *testing.T) {
	handler := NewHandler()
	hotspot := NewHotspot("h1", "Downtown")
	hotspot.HeatLevel = 5

	t.Run("high rep player", func(t *testing.T) {
		p := NewPlayer("p1", "Alice")
		p.Reputation = 60
		q := handler.GenerateQuest(p, hotspot)

		if q.Title != "High Profile Extraction" {
			t.Errorf("expected high profile title, got %s", q.Title)
		}
		if q.Reward != 1000 {
			t.Errorf("expected 1000 reward, got %d", q.Reward)
		}
	})

	t.Run("low rep player", func(t *testing.T) {
		p := NewPlayer("p2", "Bob")
		p.Reputation = 10
		q := handler.GenerateQuest(p, hotspot)

		if q.Title != "Data Retrieval" {
			t.Errorf("expected data retrieval title, got %s", q.Title)
		}
		if q.Reward != 500 {
			t.Errorf("expected 500 reward, got %d", q.Reward)
		}
	})
}
