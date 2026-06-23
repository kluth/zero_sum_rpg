# ADR 0001: Bounded Contexts en Ubiquitous Language

## Status
Proposed

## Context
Om de "Zero Sum RPG" Engine te laten overgaan in een AAA State-of-the-Art Cyber-Warfare Simulation, moeten we strikt Domain-Driven Design (DDD) via Hexagonal Architecture afdwingen. De Core Logic moet volledig geïsoleerd zijn van Infrastructure concerns (bijv. Firebase RTDB). 

Dit document definieert de System Boundaries en Ubiquitous Language voor onze twee meest kritieke Domains: de `ZeroSumLedger` en `Psychophysics`.

---

## 1. Bounded Context: ZeroSumLedger
**Responsibility:** Dwingt de brutale Zero-Sum Economic Transfers van de simulatie af. Het zorgt ervoor dat Life Support Mechanics gehoorzamen aan de wet van Equivalent Exchange—geen Character kan worden genezen zonder een onomkeerbare, gelogde Casualty elders in de Facility.

### Ubiquitous Language
*   **Ledger:** Het onveranderlijke (immutable) Append-Only Record van alle Zero-Sum Transactions (Trauma Events).
*   **Equivalent Exchange:** De Core Domain Rule die stelt dat `Player Healing Amount` precies gelijk moet zijn aan de `Civilian Life Support Drain`.
*   **Emergency Heal:** Een specifiek Command uitgevaardigd door een Player om Hit Points (HP) te herstellen.
*   **Civilian Entity:** Een Non-Player Character wiskundig gerepresenteerd als een Life-Support Resource Constraint binnen de Facility.
*   **Trauma Event:** Een Domain Event dat wordt uitgezonden wanneer een Emergency Heal een Civilian Entity dwingt een Casualty te worden.
*   **Casualty Log:** Een Read-Model Projection van Trauma Events gebruikt door de GM en Spectator Views.

---

## 2. Bounded Context: Psychophysics
**Responsibility:** Simuleert Acoustic Physics voor Stealth Tracking en fysiologische Strain via Allostatic Load Models. Deze Context handelt de chaotische Interface af tussen de fysieke wereld (dB levels, Android Hardware Tremors) en de digitale Game State.

### Ubiquitous Language
*   **Allostatic Load (Stress):** Een kwantificeerbaar Value Object (0-100) dat de cumulatieve psychologische en fysieke Strain van een Character vertegenwoordigt.
*   **Cyberpsychosis Threshold:** Een strikte Domain Rule Constraint. Wanneer de `Allostatic Load` 75 overschrijdt, gaat de State over in `Psychotic`.
*   **Acoustic Emission:** Een transient Event met een `dB` waarde die het lawaai vertegenwoordigt dat door een Action is gegenereerd (bijv. Gunshot, Footsteps).
*   **Signal-to-Noise Ratio (SNR):** Een dynamisch berekend Value Object afgeleid van de Inverse Square Law, die een `Acoustic Emission` vergelijkt met de ambient Environmental Noise.
*   **Detection Radius:** De geografische afstand waarop een `Acoustic Emission` SNR de Threshold of Observability doorbreekt.
*   **Haptic Feedback Signal:** Een Domain Event getriggerd door het overschrijden van de Cyberpsychosis Threshold, dat de Infrastructure Layer opdraagt om Physical Device Tremors te initiëren.
