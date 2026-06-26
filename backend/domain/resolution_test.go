package domain

import (
	"testing"
)

type MockRNG struct {
	FixedRoll int
}

func (m *MockRNG) Roll2D6() int {
	return m.FixedRoll
}

func TestResolutionEngine_Evaluate(t *testing.T) {
	// Success Case (TN 8, Roll 6 + Stat 2 + Skill 1 = 9)
	t.Run("Success", func(t *testing.T) {
		engine := NewResolutionEngine(&MockRNG{FixedRoll: 6})
		check := SkillCheck{BaseStat: 2, SkillBonus: 1, TargetNumber: 8}

		res := engine.Evaluate(check)
		if !res.IsOk() {
			t.Fatalf("expected ok, got error")
		}

		if res.Value != OutcomeSuccess {
			t.Errorf("expected OutcomeSuccess, got %v", res.Value)
		}
	})

	// Failure Case (TN 10, Roll 4 + Stat 2 + Skill 0 = 6)
	t.Run("Failure", func(t *testing.T) {
		engine := NewResolutionEngine(&MockRNG{FixedRoll: 4})
		check := SkillCheck{BaseStat: 2, SkillBonus: 0, TargetNumber: 10}

		res := engine.Evaluate(check)
		if !res.IsOk() {
			t.Fatalf("expected ok, got error")
		}

		if res.Value != OutcomeFailure {
			t.Errorf("expected OutcomeFailure, got %v", res.Value)
		}
	})
	
	// Critical Success (Natural 12)
	t.Run("Critical Success", func(t *testing.T) {
		engine := NewResolutionEngine(&MockRNG{FixedRoll: 12})
		check := SkillCheck{BaseStat: 0, SkillBonus: 0, TargetNumber: 20} // TN doesn't matter on natural 12

		res := engine.Evaluate(check)
		if res.Value != OutcomeCriticalSuccess {
			t.Errorf("expected OutcomeCriticalSuccess on roll 12, got %v", res.Value)
		}
	})

	// Critical Failure (Natural 2)
	t.Run("Critical Failure", func(t *testing.T) {
		engine := NewResolutionEngine(&MockRNG{FixedRoll: 2})
		check := SkillCheck{BaseStat: 10, SkillBonus: 10, TargetNumber: 5} // TN doesn't matter on natural 2

		res := engine.Evaluate(check)
		if res.Value != OutcomeCriticalFailure {
			t.Errorf("expected OutcomeCriticalFailure on roll 2, got %v", res.Value)
		}
	})
}
