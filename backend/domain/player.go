package domain

import "errors"

var (
	ErrInsufficientAP      = errors.New("insufficient action points")
	ErrInventoryFull       = errors.New("inventory is full")
	ErrItemNotFound        = errors.New("item not found in inventory")
	ErrInsufficientCredits = errors.New("insufficient credits")
)

type ItemType string

const (
	ItemTypeHardware   ItemType = "Hardware"
	ItemTypeSoftware   ItemType = "Software"
	ItemTypeIntel      ItemType = "Intel"
	ItemTypeConsumable ItemType = "Consumable"
)

type Item struct {
	ID          string
	Name        string
	Description string
	Type        ItemType
}

type Action struct {
	ID            string
	Name          string
	APCost        int
	HeatGenerated int
}

type Player struct {
	ID                string
	Name              string
	Reputation        int
	HeatLevel         int
	AP                int // Action Points
	Credits           int
	Inventory         []Item
	InventoryCapacity int
	IsBlindSpot       bool
}

func NewPlayer(id, name string) *Player {
	return &Player{
		ID:                id,
		Name:              name,
		Reputation:        0,
		HeatLevel:         0,
		AP:                10, // Default start AP
		Credits:           0,
		Inventory:         make([]Item, 0),
		InventoryCapacity: 10,
		IsBlindSpot:       false,
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
	if p.AP-action.APCost < 0 {
		return Err[struct{}](ErrInsufficientAP)
	}

	p.AP -= action.APCost
	p.HeatLevel += action.HeatGenerated

	return Ok(struct{}{})
}

func (p *Player) AddItem(item Item) Result[struct{}] {
	if len(p.Inventory) >= p.InventoryCapacity {
		return Err[struct{}](ErrInventoryFull)
	}
	p.Inventory = append(p.Inventory, item)
	return Ok(struct{}{})
}

func (p *Player) RemoveItem(itemID string) Result[struct{}] {
	for i, item := range p.Inventory {
		if item.ID == itemID {
			p.Inventory = append(p.Inventory[:i], p.Inventory[i+1:]...)
			return Ok(struct{}{})
		}
	}
	return Err[struct{}](ErrItemNotFound)
}

func (p *Player) ConsumeItem(itemID string) Result[struct{}] {
	for i, item := range p.Inventory {
		if item.ID == itemID {
			if item.Type != ItemTypeConsumable {
				return Err[struct{}](errors.New("item is not consumable"))
			}
			// Hardcoded for now: Consumables restore 5 AP
			p.AP += 5
			
			// Remove from inventory
			p.Inventory = append(p.Inventory[:i], p.Inventory[i+1:]...)
			return Ok(struct{}{})
		}
	}
	return Err[struct{}](ErrItemNotFound)
}

func (p *Player) AddCredits(amount int) Result[struct{}] {
	if amount < 0 {
		return Err[struct{}](ErrInvalidAmount)
	}
	p.Credits += amount
	return Ok(struct{}{})
}

func (p *Player) SpendCredits(amount int) Result[struct{}] {
	if amount < 0 {
		return Err[struct{}](ErrInvalidAmount)
	}
	if p.Credits < amount {
		return Err[struct{}](ErrInsufficientCredits)
	}
	p.Credits -= amount
	return Ok(struct{}{})
}
