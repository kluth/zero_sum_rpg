package domain

import "errors"

var (
	ErrInactiveHotspot = errors.New("cannot escalate inactive hotspot")
	ErrInvalidAmount   = errors.New("escalation amount must be positive")
)

type Hotspot struct {
	ID        string
	Name      string
	HeatLevel int
	IsActive  bool
}

func NewHotspot(id, name string) *Hotspot {
	return &Hotspot{
		ID:        id,
		Name:      name,
		HeatLevel: 0,
		IsActive:  true,
	}
}

func (h *Hotspot) Escalate(amount int) Result[struct{}] {
	if !h.IsActive {
		return Err[struct{}](ErrInactiveHotspot)
	}
	if amount <= 0 {
		return Err[struct{}](ErrInvalidAmount)
	}
	h.HeatLevel += amount
	return Ok(struct{}{})
}

func (h *Hotspot) Deactivate() {
	h.IsActive = false
}
