# ADR 0002: Dynamic Quest Generation via AI (Genkit / Vertex AI)

## Status
Accepted

## Context
In order to provide infinite, dynamic, and narrative-driven gameplay for Zero Sum RPG, the GM requires the ability to instantly generate context-aware Quests. The system needs an integration with an AI Engine (e.g., Google Vertex AI via Firebase Genkit).

## Decision
We will use the **Hexagonal Architecture (Ports & Adapters)** to decouple the AI implementation from the Core Domain.
1. **Port:** We define an `AIEngine` interface in the core domain that takes a narrative context and returns a generated quest payload.
2. **Domain Service:** We create a `QuestGeneratorService` that uses the `AIEngine` to orchestrate the generation and mapping to the domain `Quest` entity.
3. **Result Pattern:** All failures during AI generation (e.g., rate limits, parsing errors) will be returned via the strictly typed `Result[T]` pattern. No panics.
4. **Complexity:** The orchestration logic must remain under McCabe complexity of 10.

## Consequences
* **Positive:** The core domain remains completely agnostic to the specific AI vendor (Vertex AI vs. OpenAI). We can mock the AI engine in tests easily.
* **Negative:** Requires strict mapping between unstructured AI output (JSON) and our rigid Domain Entities.
