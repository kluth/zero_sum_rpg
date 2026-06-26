# ADR 0005: Vertex AI / Gemini Adapter

## Status
Accepted

## Context
In ADR 0002, we decoupled the `AIEngine` from the Core Domain using a Port (`AIEngine`). Now, we need the actual implementation (the Adapter) that communicates with Google's Vertex AI / Gemini API to generate dynamic quests based on the game's narrative context.

## Decision
We implement a `VertexAIEngine` inside the `adapter/ai` package.
- It will use Go's standard `net/http` to communicate with the Gemini REST API (to minimize heavy SDK dependencies and maintain sub-150 LOC files).
- We use a strict JSON schema prompt to force the LLM to output a `GeneratedQuestPayload`.
- HTTP timeouts and non-200 responses are caught and returned strictly via `domain.Result`, preventing panics and unhandled exceptions.

## Consequences
* **Positive:** The Core Domain remains clean. If we ever switch to Genkit's native Go SDK or a different LLM, we just swap the adapter.
* **Negative:** Requires managing API keys (`GEMINI_API_KEY`) in the environment.
