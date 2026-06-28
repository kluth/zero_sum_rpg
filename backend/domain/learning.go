package domain

import "errors"

// CharacterClass represents the role of a character.
type CharacterClass string

const (
	ClassStandard CharacterClass = "Standard"
	ClassSupport  CharacterClass = "Support"
)

// Character represents a game entity with cognitive capacity constraints.
type Character struct {
	maxCapacity int
	skills      map[string]int
	Class       CharacterClass
}

// NewCharacter creates a new character with a specific cognitive capacity limit and class.
func NewCharacter(max int, class CharacterClass) *Character {
	return &Character{
		maxCapacity: max,
		skills:      make(map[string]int),
		Class:       class,
	}
}

// UsedCapacity calculates the total bandwidth used by all current skills.
func (c *Character) UsedCapacity() int {
	total := 0
	for _, cost := range c.skills {
		total += cost
	}
	return total
}

// AvailableCapacity returns the remaining cognitive bandwidth.
func (c *Character) AvailableCapacity() int {
	return c.maxCapacity - c.UsedCapacity()
}

// LearnSkill attempts to add a skill, failing if it exceeds the maximum cognitive capacity.
func (c *Character) LearnSkill(name string, cost int) error {
	if c.UsedCapacity()+cost > c.maxCapacity {
		return errors.New("cognitive capacity exceeded: zero-sum limit reached")
	}
	c.skills[name] += cost
	return nil
}

// SkillLevel retrieves the current investment in a skill.
func (c *Character) SkillLevel(name string) int {
	return c.skills[name]
}

// ApplyTraumaAbstumpfung reduces all skills linearly based on the days of inactivity.
func (c *Character) ApplyTraumaAbstumpfung(daysInactive int) {
	for name, cost := range c.skills {
		// A simple linear atrophy model for the test
		atrophied := cost - daysInactive
		if atrophied < 0 {
			atrophied = 0
		}
		c.skills[name] = atrophied
	}
}
