# ADR 0003: Action Point (AP) Validation

## Status
Accepted

## Context
Players interact with the Zero Sum RPG through Actions (e.g., "Hack Node", "Evade"). These actions require mental and physical resources, represented by Action Points (AP). We need a strict domain validation to ensure players cannot execute actions they lack AP for.

## Decision
We introduce `AP` (Action Points) to the `Player` domain entity. We create an `Action` value object with an `APCost`. We implement an `ExecuteAction` method on the `Player` entity that evaluates the AP balance.
Validation errors will be returned as domain errors using our `Result[T]` pattern (`ErrInsufficientAP`). No panics are permitted.

## Consequences
* **Positive:** Centralized, immutable logic for resource spending. Easy to test via TDD.
* **Negative:** Actions now strictly require AP tracking, increasing state management complexity.
