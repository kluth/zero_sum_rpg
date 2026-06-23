# Zero Sum RPG - Android Companion App

Dies ist eine nativ entwickelte Android Companion App für das ZERO SUM RPG. Sie verwendet **Kotlin** und **Jetpack Compose**, um eine hochperformante, hochmoderne UI zu liefern, die für Android-Geräte optimiert ist.

## Features

1. **Character Management**: Verfolge deine Health, Stealth und Assets (Monofilament Blades, Netrunner Rigs, Credits) in Echtzeit.
2. **Dice Roller Simulation**: Ein integrierter virtueller D20 Roller zur schnellen Abwicklung von High-Stakes Checks, ohne physische Würfel zu benötigen.
3. **Remote Comms Integration**: Entwickelt mit dem Agora Audio/Video SDK (`io.agora.rtc:full-sdk`), um Peer-to-Peer Remote Play und taktische Comms direkt aus der App heraus zu ermöglichen.

## Aesthetic

Die App verwendet ein striktes "Glassmorphism" Cyberpunk Dark Mode Design, um dem taktischen Gefühl von ZERO SUM zu entsprechen.
- Tiefe schwarze Hintergründe (`#0A0F14`)
- Kontrastreiche Akzente in Neonblau (`#00E5FF`) und Neonrot (`#FF2A2A`)
- Rahmenlose UI mit transparenten Elementen

## Build Instructions

Da es sich hierbei um ein natives Android Gradle-Projekt handelt, kannst du es einfach mit Android Studio builden:

1. Öffne Android Studio.
2. Wähle **Open an existing Android Studio project**.
3. Verweise auf dieses Verzeichnis (`zero_sum_android/`).
4. Warte, bis Gradle synchronisiert ist.
5. Klicke auf **Run** auf deinem verbundenen Android-Gerät oder Emulator.

*Hinweis: Damit die Agora Video Feeds live gehen, musst du deine Agora App ID in den Engine Initialization Code innerhalb von `MainActivity.kt` eintragen, sobald du deinen Developer Account registriert hast.*
