package domain

const (
	TeamCapacityLimit  = 150
	SupportShadowCache = 15
)

// Team represents a group of characters working together.
type Team struct {
	ID         string
	Name       string
	Characters []*Character
}

// NewTeam creates a new Team with the given ID and name.
func NewTeam(id, name string) *Team {
	return &Team{
		ID:         id,
		Name:       name,
		Characters: make([]*Character, 0),
	}
}

// AddCharacter adds a character to the team.
func (t *Team) AddCharacter(c *Character) {
	t.Characters = append(t.Characters, c)
}

// UsedCapacity calculates the total bandwidth used by all characters in the team.
// It accounts for the 15MB Shadow-Cache for Support classes.
func (t *Team) UsedCapacity() int {
	total := 0
	supportCache := SupportShadowCache
	for _, c := range t.Characters {
		charUsed := c.UsedCapacity()
		if c.Class == ClassSupport {
			if charUsed <= supportCache {
				supportCache -= charUsed
				charUsed = 0
			} else {
				charUsed -= supportCache
				supportCache = 0
			}
		}
		total += charUsed
	}
	return total
}

// IsInVerzweiflungsAktion returns true if the team's used capacity exceeds the limit.
func (t *Team) IsInVerzweiflungsAktion() bool {
	return t.UsedCapacity() > TeamCapacityLimit
}

// ApplyVerzweiflungsAktionTrauma applies atrophy to all characters' skills if the team is in a desperate state.
func (t *Team) ApplyVerzweiflungsAktionTrauma() {
	if t.IsInVerzweiflungsAktion() {
		for _, c := range t.Characters {
			// Skill Trauma / Abstumpfung when limit is exceeded
			c.ApplyTraumaAbstumpfung(1)
		}
	}
}
