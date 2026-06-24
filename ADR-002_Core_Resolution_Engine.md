# ADR 002: Core Resolution Engine (Degrees of Success)

## Status
**Accepted** (Angewiesen durch Evaluator-Konsens)

## Context
Im vorherigen Systemdesign (*TTRPG_ARCHITECTURE_V2.md*) gab es ein eklatantes Paradoxon: Es wurde einerseits eine flache "Bounded Accuracy" (Werte von 1-20) gefordert, andererseits aber ein narrativer Würfelpool (FFG/Genesys mit Success/Advantage/Threat). Diese beiden Systeme sind mathematisch und operativ völlig inkompatibel und erzeugen massiven Overhead bei der Programmierung und Verwirrung am Spieltisch.

Zusätzlich bestrafte die 3-Action-Economy Spieler dafür, überhaupt Handlungen auszuführen (Acoustic SNR Penalty on Attack Spam), was zu "Action Paralysis" führt. 

## Decision
Wir entfernen das komplexe, narrative Symbol-Würfelsystem komplett und wechseln zu einem gestrafften **Degrees of Success** System auf Basis eines **1d20 + Modifikator**, inspiriert durch PbtA (Powered by the Apocalypse) und Forged in the Dark, aber hochskaliert auf ein Bounded d20.

### Die neuen Kernregeln:
1. **Der Würfelwurf:** Der Spieler würfelt 1d20 und addiert seinen statischen Skill-Modifikator (der streng zwischen +1 und +5 gecappt ist).
2. **Degrees of Success (Die flache Kurve):**
   * **1 - 9 (Critical Failure):** Die Aktion schlägt katastrophal fehl. Der Spieler verliert die Kontrolle, erleidet Schaden oder das *Acoustic SNR* steigt extrem an.
   * **10 - 15 (Mixed Success):** Die Aktion gelingt, aber mit einem hohen Preis (z. B. Munitionsverlust, Entdeckung, leichter Stress).
   * **16 - 19 (Clean Success):** Die Aktion gelingt fehlerfrei wie geplant.
   * **20+ (Critical Triumph):** Die Aktion gelingt spektakulär. Der Spieler erhält Momentum oder regeneriert 1 AP.
3. **Action Economy Fix:** Die AP-Kosten bleiben bei maximal 3. Aber anstatt Aktionen global mit SNR-Erhöhungen zu bestrafen, generieren nur *Mixed Successes* oder bestimmte *Reckless Actions* Chaos. Taktisches Vorgehen wird belohnt.

## Consequences
**Positive:**
* Die Backend-Berechnung (`ResolutionEngine.ts`) wird extrem simpel und O(1). Keine komplexen Pool-Arrays oder Symbole mehr.
* Die UI muss keine komplizierten 3D-Würfel mit Symbolen mehr rendern. Eine reine Zahl und das Farbschema (Rot, Gelb, Grün, Neon) reichen aus.
* Schnellerer Gameplay-Loop. Der GM muss keine Advantage/Threat-Bedeutungen mehr improvisieren.

**Negative:**
* Weniger Granularität in der Narrative. Der GM muss den *Mixed Success* kontextuell spannend ausspielen.
