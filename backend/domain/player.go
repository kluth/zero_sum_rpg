package domain

import "errors"

var ErrInsufficientAP = errors.New("insufficient action points")

type Action struct {
	ID     string
	Name   string
	APCost int
}

type Player struct {
	ID          string
	Name        string
	Reputation  int
	HeatLevel   int
	AP          int
	IsBlindSpot bool
}

func NewPlayer(id, name string) *Player {
	return &Player{
		ID:          id,
		Name:        name,
		Reputation:  0,
		HeatLevel:   0,
		AP:          10,
		IsBlindSpot: false,
	}
}

func (p *Player) IncreaseReputation(amount int) {
	if amount > 0 {
		p.Reputation += amount
	}
}

func (p *Player) IncreaseHeat(amount int) {
	if amount > 0 {
		p.HeatLevel += amount
	}
}

func (p *Player) DecreaseHeat(amount int) {
	if amount > 0 {
		p.HeatLevel -= amount
		if p.HeatLevel < 0 {
			p.HeatLevel = 0
		}
	}
}

func (p *Player) EnterBlindSpot() {
	p.IsBlindSpot = true
}

func (p *Player) LeaveBlindSpot() {
	p.IsBlindSpot = false
}

func (p *Player) ExecuteAction(action Action) Result[struct{}] {
	if p.AP < action.APCost {
		return Err[struct{}](ErrInsufficientAP)
	}
	p.AP -= action.APCost
	return Ok(struct{}{})
}
