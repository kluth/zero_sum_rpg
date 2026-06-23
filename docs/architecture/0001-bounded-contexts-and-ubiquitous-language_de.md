# ADR 0001: Bounded Contexts und Ubiquitous Language

## Status
Proposed

## Context
Um die "Zero Sum RPG" Engine zu einer AAA State-of-the-Art Cyber-Warfare Simulation zu überführen, müssen wir striktes Domain-Driven Design (DDD) über Hexagonal Architecture erzwingen. Die Core Logic muss komplett von Infrastructure-Anliegen (z.B. Firebase RTDB) isoliert sein. 

Dieses Dokument definiert die System Boundaries und die Ubiquitous Language für unsere zwei kritischsten Domains: den `ZeroSumLedger` und `Psychophysics`.

---

## 1. Bounded Context: ZeroSumLedger
**Responsibility:** Erzwingt die brutalen Zero-Sum Economic Transfers der Simulation. Es stellt sicher, dass Life Support Mechanics dem Gesetz des Equivalent Exchange gehorchen—kein Character kann geheilt werden, ohne ein irreversibles, geloggtes Casualty woanders in der Facility.

### Ubiquitous Language
*   **Ledger:** Der unveränderliche (immutable) Append-Only Record aller Zero-Sum Transactions (Trauma Events).
*   **Equivalent Exchange:** Die Core Domain Rule, die besagt, dass `Player Healing Amount` exakt dem `Civilian Life Support Drain` entsprechen muss.
*   **Emergency Heal:** Ein spezifischer Command, der von einem Player erteilt wird, um Hit Points (HP) wiederherzustellen.
*   **Civilian Entity:** Ein Non-Player Character, der mathematisch als Life-Support Resource Constraint innerhalb der Facility repräsentiert wird.
*   **Trauma Event:** Ein Domain Event, das emittiert wird, wenn ein Emergency Heal eine Civilian Entity dazu zwingt, zu einem Casualty zu werden.
*   **Casualty Log:** Eine Read-Model Projection von Trauma Events, die von den GM und Spectator Views verwendet wird.

---

## 2. Bounded Context: Psychophysics
**Responsibility:** Simuliert Acoustic Physics für Stealth Tracking und physiologischen Strain über Allostatic Load Models. Dieser Context handhabt das chaotische Interface zwischen der physischen Welt (dB Level, Android Hardware Tremors) und dem digitalen Game State.

### Ubiquitous Language
*   **Allostatic Load (Stress):** Ein quantifizierbares Value Object (0-100), das den kumulativen psychologischen und physischen Strain eines Characters repräsentiert.
*   **Cyberpsychosis Threshold:** Ein striktes Domain Rule Constraint. Wenn der `Allostatic Load` 75 überschreitet, geht der State in `Psychotic` über.
*   **Acoustic Emission:** Ein transientes Event, das einen `dB` Wert enthält, der den durch eine Action erzeugten Lärm (z.B. Gunshot, Footsteps) repräsentiert.
*   **Signal-to-Noise Ratio (SNR):** Ein dynamisch berechnetes Value Object abgeleitet vom Inverse Square Law, das eine `Acoustic Emission` mit dem ambienten Environmental Noise vergleicht.
*   **Detection Radius:** Die geografische Distanz, bei der eine `Acoustic Emission` SNR den Threshold of Observability durchbricht.
*   **Haptic Feedback Signal:** Ein Domain Event, das durch das Überschreiten des Cyberpsychosis Thresholds getriggert wird und dem Infrastructure Layer befiehlt, Physical Device Tremors zu initiieren.
