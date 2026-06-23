# Zero Sum RPG - Full Remote Session & Spectator Suite

Dieses Repository enthält nun die komplette Suite, die benötigt wird, um das Zero Sum RPG vollständig remote zu spielen, einschließlich Live-Twitch-Spectator-Views, Echtzeit-Dice Rolls und prozeduraler Tactical Map Generation.

## 1. Backend Server (`server/`)
Ein reiner Node.js + Socket.io Event-Server, der als Single Source of Truth für den Game State fungiert.
- Handhabt `updateCharacter`, `rollDice` und `generateMap` Events.
- Überträgt (Broadcasts) `stateSync` sofort an alle verbundenen Clients.
- Starten mit: `npm install && node index.js`

## 2. Spectator Web App (`web-app/`)
Eine Angular 17 Webanwendung, die speziell für Twitch Streamer und Remote Viewer entwickelt wurde.
- Eine reine Read-Only-Schnittstelle, die Live-Rolls, Spieler HP/Assets und die aktuell generierte Tactical Map anzeigt.
- Erstellt mit striktem HTML/CSS (keine Bloated Frameworks) mit der erforderlichen Cyberpunk Glassmorphism-Ästhetik.
- Starten mit: `npm install && ng serve`

## 3. Android Companion App (`zero_sum_android/`)
Die native Kotlin / Jetpack Compose App für Spieler.
- Verbindet sich direkt mit dem Backend Server via `io.socket:socket.io-client`.
- Wenn ein Spieler auf **ROLL D20** oder **GENERATE MAP** tippt, wird das Event an den Server gepusht und sofort mit allen anderen Spielern und dem Web Spectator View synchronisiert.
- Öffnen Sie das Projekt in Android Studio, stellen Sie sicher, dass die Server-IP für Ihr lokales Netzwerk korrekt ist, und deployen Sie es auf Ihr Smartphone oder Ihren Emulator.

**Alle Systeme sind mock-less, example-less und stub-less.** Die Daten, die zwischen den Apps fließen, sind zu 100% in Echtzeit und funktional komplett für Remote Tabletop Operations.
