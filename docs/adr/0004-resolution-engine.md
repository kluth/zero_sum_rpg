# ADR 0004: Core Resolution Engine (Skill Checks)

## Status
Accepted

## Context
Zero Sum RPG requires a probabilistic resolution system when players attempt risky actions. We need a deterministic core engine for resolving these skill checks (e.g., 2d6 + Attribute vs. Target Number) to ensure fairness and track outcomes.

## Decision
We introduce a `ResolutionEngine` in the core domain.
- A `SkillCheck` struct defines the BaseStat, SkillBonus, and Target Number (TN).
- The engine computes the result using a pseudo-random 2d6 roll (injected via an RNG port for determinism in testing).
- The outcome is returned as a `CheckOutcome` enum (e.g., CriticalSuccess, Success, Failure, CriticalFailure) wrapped in a `Result`.

## Consequences
* **Positive:** All dice logic is centralized and easily testable without flaky tests (thanks to the RNG port).
* **Negative:** We must inject an RNG adapter anywhere we want to resolve an action, slightly complicating initialization.
