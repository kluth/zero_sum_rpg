# ADR 003: Neuro-Evolutionary Fitness Evaluator & TDD Setup

## Status
**Proposed** (Warten auf APPROVAL)

## Context
Zur atomaren Zerstörung und anschließenden Perfektionierung der "Zero Sum" Game Engine (Engine Annihilator) benötigen wir ein isoliertes, neuroevolutionäres TDD-Setup. Dieses Setup muss Millionen von deterministischen Fuzzing-Iterationen aushalten und die Fitness eines Angriffsvektors bewerten. Ein Vektor ist "fit", wenn er System-Invarianten (Panics, NaN-Values, Security-Bypasses) bricht.

## Decision
1. **Property-Based Testing:** Wir integrieren **FastCheck** in die `core-domain`. Es generiert mutierte, extreme `RollRequest` und `PlayerActionDTO` Payloads (inkl. Boundary Values wie `Number.MAX_SAFE_INTEGER`, negative Modifikatoren, null-Injections).
2. **Fitness Evaluator (The Sandbox):** Wir implementieren eine `ChaosFitnessEvaluator` Klasse. Diese isoliert den auszuführenden Domain-Code und fängt ALLE States ab. 
3. **Monadisches Result Pattern:** Wir nutzen das `neverthrow` Package (oder ein custom `Result<T, E>` Typ), um die Ausführung zu kapseln. Jegliche Node-Panics oder `throw new Error()` Aufrufe innerhalb der Engine gelten als **Invariant Breach** und treiben den Issue-Counter für die Eskalationsstufe hoch.
4. **TDD Strictness:** Code wird inkrementell in < 150 LOC Blöcken entwickelt. McCabe-Komplexität von 10 wird durch strikte Linter-Regeln enforced.

## Consequences
*   **Positiv:** Absolute Vorhersagbarkeit des Chaos. Falls ein Seed die Invarianten bricht, ist der Reproduktionspfad exakt dokumentiert.
*   **Negativ:** Extrem hohe CPU-Last bei Eskalation in die 1000+ Generationen-Blöcke.

## Telemetry
Jeder Loop trackt via OpenTelemetry Memory-Pressure und Dauer, um den Evaluator selbst vor einem Out-of-Memory Crash zu bewahren.
