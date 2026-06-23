# Zero Sum RPG - Full Remote Session & Spectator Suite

Deze repository bevat nu de complete suite die nodig is om de Zero Sum RPG volledig remote te spelen, inclusief live Twitch spectator views, real-time dice rolls en procedurele tactical map generation.

## 1. Backend Server (`server/`)
Een pure Node.js + Socket.io event-server die fungeert als de single source of truth voor de game state.
- Handelt `updateCharacter`, `rollDice` en `generateMap` events af.
- Zendt `stateSync` direct uit (broadcasts) naar alle verbonden clients.
- Starten met: `npm install && node index.js`

## 2. Spectator Web App (`web-app/`)
Een Angular 17 webapplicatie die speciaal is gebouwd voor Twitch streamers en remote viewers.
- Een pure read-only interface die live rolls, speler HP/assets en de momenteel gegenereerde tactical map weergeeft.
- Gebouwd met strikte HTML/CSS (geen bloated frameworks) met de vereiste cyberpunk glassmorphism-esthetiek.
- Starten met: `npm install && ng serve`

## 3. Android Companion App (`zero_sum_android/`)
De native Kotlin / Jetpack Compose app voor spelers.
- Maakt direct verbinding met de backend server via `io.socket:socket.io-client`.
- Wanneer een speler op **ROLL D20** of **GENERATE MAP** tikt, wordt het event naar de server gepusht en direct gesynchroniseerd over alle andere spelers en de web spectator view.
- Open het project in Android Studio, zorg ervoor dat de server-IP correct is voor uw lokale netwerk en deploy naar uw telefoon of emulator.

**Alle systemen zijn mock-less, example-less en stub-less.** De data die tussen de apps vloeit, is 100% in real-time en functioneel compleet voor remote tabletop operations.
