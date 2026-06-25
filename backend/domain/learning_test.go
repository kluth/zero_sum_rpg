package domain

import (
	"testing"
	"testing/quick"
)

// TestLearnSkill_IncreasesUsedCapacity tests that learning a skill correctly uses cognitive capacity.
func TestLearnSkill_IncreasesUsedCapacity(t *testing.T) {
	char := NewCharacter(100) // Initialize with max capacity 100
	
	err := char.LearnSkill("Archery", 20)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	
	if char.UsedCapacity() != 20 {
		t.Errorf("expected used capacity to be 20, got %d", char.UsedCapacity())
	}
}

// TestLearnSkill_ExceedsCapacity_ReturnsError tests the upper bounds of cognitive capacity.
func TestLearnSkill_ExceedsCapacity_ReturnsError(t *testing.T) {
	char := NewCharacter(30)
	
	err := char.LearnSkill("Magic", 40)
	if err == nil {
		t.Errorf("expected error when learning skill exceeding max capacity")
	}
}

// TestSkillAtrophy_ReducesSkillOverTime checks if skill atrophy is applied properly over time.
func TestSkillAtrophy_ReducesSkillOverTime(t *testing.T) {
	char := NewCharacter(100)
	char.LearnSkill("Swordsmanship", 50)
	
	// Fast forward 10 days of inactivity
	char.ApplyAtrophy(10)
	
	level := char.SkillLevel("Swordsmanship")
	if level >= 50 {
		t.Errorf("expected skill to atrophy below 50, but got %d", level)
	}
}

// TestZeroSumLearning_Property uses property-based testing to verify the Zero-Sum constraint.
func TestZeroSumLearning_Property(t *testing.T) {
	// Property: The sum of all active skill levels and the available cognitive capacity 
	// must always perfectly equal the character's maximum cognitive capacity, no matter the inputs.
	assertion := func(capacity int16, skill1Cost int16, skill2Cost int16) bool {
		// Constrain values to avoid extreme overflows in our simple test
		if capacity <= 0 { capacity = 100 }
		if skill1Cost < 0 { skill1Cost = 10 }
		if skill2Cost < 0 { skill2Cost = 10 }
		
		maxCap := int(capacity)
		s1 := int(skill1Cost)
		s2 := int(skill2Cost)
		
		char := NewCharacter(maxCap)
		_ = char.LearnSkill("Skill1", s1)
		_ = char.LearnSkill("Skill2", s2)
		
		totalUsed := char.UsedCapacity()
		available := char.AvailableCapacity()
		
		// In a zero-sum system: Used Capacity + Available Capacity MUST equal Max Capacity
		return (totalUsed + available) == maxCap
	}

	if err := quick.Check(assertion, nil); err != nil {
		t.Errorf("property validation failed: %v", err)
	}
}
