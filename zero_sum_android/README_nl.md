# Zero Sum RPG - Android Companion App

Dit is een native gebouwde Android Companion App voor de ZERO SUM RPG. Het gebruikt **Kotlin** en **Jetpack Compose** om een zeer performante, state-of-the-art UI te leveren die is geoptimaliseerd voor Android apparaten.

## Features

1. **Character Management**: Houd je health, stealth, en assets (monofilament blades, netrunner rigs, credits) in real-time bij.
2. **Dice Roller Simulation**: Een ingebouwde virtuele D20 roller voor een snelle afhandeling van high-stakes checks zonder fysieke dobbelstenen nodig te hebben.
3. **Remote Comms Integration**: Gebouwd met de Agora Audio/Video SDK (`io.agora.rtc:full-sdk`) om peer-to-peer remote play en tactische comms direct vanuit de app mogelijk te maken.

## Aesthetic

De app maakt gebruik van een strikt "Glassmorphism" cyberpunk dark mode design om te passen bij het tactische ZERO SUM gevoel.
- Diepzwarte achtergronden (`#0A0F14`)
- Hoog contrast Neon Blue (`#00E5FF`) en Neon Red (`#FF2A2A`) accenten
- Randloze UI met doorschijnende elementen

## Build Instructions

Aangezien dit een native Android Gradle project is, kun je het eenvoudig builden met Android Studio:

1. Open Android Studio.
2. Selecteer **Open an existing Android Studio project**.
3. Wijs naar deze directory (`zero_sum_android/`).
4. Wacht tot Gradle gesynchroniseerd is.
5. Klik op **Run** op je verbonden Android apparaat of emulator.

*Notitie: Om de Agora video feeds live te laten gaan, moet je je Agora App ID in de engine initialization code binnen `MainActivity.kt` plaatsen zodra je je developer account hebt geregistreerd.*
