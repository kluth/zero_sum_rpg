package domain

type CheckOutcome int

const (
	OutcomeCriticalFailure CheckOutcome = iota
	OutcomeFailure
	OutcomeSuccess
	OutcomeCriticalSuccess
)

type SkillCheck struct {
	BaseStat     int
	SkillBonus   int
	TargetNumber int
}

// RNGEngine is the Port interface for random number generation.
type RNGEngine interface {
	Roll2D6() int
}

type ResolutionEngine struct {
	rng RNGEngine
}

func NewResolutionEngine(rng RNGEngine) *ResolutionEngine {
	return &ResolutionEngine{rng: rng}
}

// Evaluate performs the skill check against the TN and returns the outcome.
func (e *ResolutionEngine) Evaluate(check SkillCheck) Result[CheckOutcome] {
	roll := e.rng.Roll2D6()

	// Natural 12 is always a critical success
	if roll == 12 {
		return Ok(OutcomeCriticalSuccess)
	}

	// Natural 2 is always a critical failure
	if roll == 2 {
		return Ok(OutcomeCriticalFailure)
	}

	total := roll + check.BaseStat + check.SkillBonus

	if total >= check.TargetNumber {
		return Ok(OutcomeSuccess)
	}

	return Ok(OutcomeFailure)
}
