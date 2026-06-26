# ADR 0006: Firestore Repository Adapter for Player State

## Status
Accepted

## Context
Our Go backend's domain logic currently executes entirely in-memory. If the server crashes or restarts, all Player state (AP, Reputation, HeatLevel) is lost. We need persistence to synchronize state between the backend simulation and the Angular frontend (which reads from Firestore).

## Decision
We introduce a `PlayerRepository` port in the Core Domain.
We implement a `FirestorePlayerRepository` adapter inside `adapter/db` that fulfills this port.
- It will read/write `Player` entities to the `players` collection in Google Cloud Firestore.
- Because introducing the actual Firebase Admin SDK in a TDD loop exceeds the 150 LOC / complexity limit, we will start by defining the interface and a robust In-Memory mock implementation. The actual Firestore binding will be structured to inject a Firestore Client, simulating the exact CRUD behavior.

## Consequences
* **Positive:** State persistence enables true cross-platform synchronization between the Go backend and the Angular App.
* **Negative:** Introduces I/O latency to domain operations, which must be handled asynchronously or carefully to avoid bottlenecking the Action Queue.
