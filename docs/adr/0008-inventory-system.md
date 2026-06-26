# ADR 0008: Inventory & Item System

## Status
Accepted

## Context
A cyberpunk RPG requires players to acquire, store, and utilize hardware, software exploits, and intel (Items). The Player entity currently lacks any concept of possessions or loadout constraints.

## Decision
We introduce an `Item` value object containing an ID, Name, Description, and ItemType (Hardware, Software, Intel).
We update the `Player` domain entity to include an `Inventory` slice of `Item`.
To enforce tactical gameplay, the `Player` has a fixed `InventoryCapacity` (e.g., 10 slots).
We implement `AddItem(item Item)` and `RemoveItem(itemID string)` methods on the `Player`.
Adding an item when at capacity returns an `ErrInventoryFull` via the Result pattern.

## Consequences
* **Positive:** Lays the foundation for an economy and rewards system. Allows quests to grant tangible Items.
* **Negative:** Inventory state adds complexity to persistence (Firestore Repository must be updated to marshal/unmarshal the Inventory array).
