# ADR 0010: REST API for Player Commands

## Status
Accepted

## Context
While the gRPC interface is excellent for real-time streaming of quests (the "Feed"), traditional commands (e.g., fetching a player's profile, accepting a quest, buying an item) fit more cleanly into a RESTful architecture due to its statelessness and simple integration with the Angular frontend via standard HTTP clients.

## Decision
We introduce a RESTful API layer under `api/rest`.
We build a `PlayerHandler` that uses standard `net/http`.
Endpoints:
- `GET /api/player/{id}`: Returns the serialized JSON state of the Player.
- The handler will depend on the `PlayerRepository` port from the core domain to fetch the data.

## Consequences
* **Positive:** Creates a robust bridge between the backend state and the frontend client. Avoids protobuf regeneration overhead for simple CRUD operations.
* **Negative:** Mixing gRPC and REST in `main.go` increases routing complexity, though Go 1.22's new ServeMux routing features mitigate this.
