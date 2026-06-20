# Zero Sum RPG - Android Companion App

This is a natively built Android Companion App for the ZERO SUM RPG. It uses **Kotlin** and **Jetpack Compose** to deliver a highly performant, state-of-the-art UI optimized for Android devices.

## Features

1. **Character Management**: Track your health, stealth, and assets (monofilament blades, netrunner rigs, credits) in real-time.
2. **Dice Roller Simulation**: A built-in virtual D20 roller for rapid resolution of high-stakes checks without needing physical dice.
3. **Remote Comms Integration**: Built with the Agora Audio/Video SDK (`io.agora.rtc:full-sdk`) to allow peer-to-peer remote play and tactical comms directly from the app.

## Aesthetic

The app uses a strict "Glassmorphism" cyberpunk dark mode design to match the ZERO SUM tactical feel. 
- Deep black backgrounds (`#0A0F14`)
- High contrast Neon Blue (`#00E5FF`) and Neon Red (`#FF2A2A`) accents
- Borderless UI with translucency elements

## Build Instructions

Since this is a native Android Gradle project, you can easily build it using Android Studio:

1. Open Android Studio.
2. Select **Open an existing Android Studio project**.
3. Point it to this directory (`zero_sum_android/`).
4. Wait for Gradle to sync.
5. Click **Run** on your connected Android device or emulator.

*Note: For the Agora video feeds to become live, you must plug your Agora App ID into the engine initialization code within `MainActivity.kt` once you register your developer account.*
