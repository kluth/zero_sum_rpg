package domain

import (
	pb "zero_sum_rpg_backend/api/feed"
)

type Handler struct {
}

func NewHandler() *Handler {
	return &Handler{}
}

func (h *Handler) DetermineNetworks(hotspot *Hotspot) []pb.NetworkID {
	if !hotspot.IsActive {
		return []pb.NetworkID{}
	}

	networks := []pb.NetworkID{pb.NetworkID_WHISPERNET}

	if hotspot.HeatLevel > 5 {
		networks = append(networks, pb.NetworkID_OCGF)
	}
	if hotspot.HeatLevel > 8 {
		networks = append(networks, pb.NetworkID_FREQUENZ_X)
	}
	if hotspot.HeatLevel > 15 {
		networks = append(networks, pb.NetworkID_NEON_LOTUS)
	}

	return networks
}

func (h *Handler) FindEligiblePlayers(players []*Player, hotspot *Hotspot) []*Player {
	var eligible []*Player

	for _, p := range players {
		if p.IsBlindSpot {
			continue
		}

		if hotspot.HeatLevel > 10 && p.Reputation < 50 {
			continue
		}

		if p.HeatLevel > 80 && hotspot.HeatLevel > 5 {
			continue
		}

		eligible = append(eligible, p)
	}

	return eligible
}
