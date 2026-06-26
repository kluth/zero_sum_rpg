# ADR 0009: Economy & Credits System

## Status
Accepted

## Context
A critical aspect of any cyberpunk setting is the acquisition and expenditure of wealth. Players need a way to earn currency from quests and spend it on hardware/software items. Currently, the `Player` domain entity has no concept of currency.

## Decision
We introduce `Credits` (int) to the `Player` entity.
We implement two methods:
- `AddCredits(amount int) Result[struct{}]`
- `SpendCredits(amount int) Result[struct{}]`
A player cannot spend more credits than they have. Attempting to do so returns `ErrInsufficientCredits`.

## Consequences
* **Positive:** Creates an economic gameplay loop. Enables the GM to reward players monetarily and allows hackers to buy exploits.
* **Negative:** Further expands the `Player` domain entity, though it remains highly cohesive.
