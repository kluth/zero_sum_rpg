# Zero Sum RPG - Project Rules & Guidelines

## 1. CORE THEME & AESTHETIC: EVERYDAY HERO CRISIS REALISM & NEOMORPHIC UI
**CRITICAL RULE: DO NOT USE CYBERPUNK, SCI-FI, OR FANTASY AESTHETICS.**

- **Theme:** The game is a highly realistic "Everyday Hero" crisis simulator (e.g., urban blackout, disaster response, civilian survival). The players are normal people (Paramedic, IT Technician, Journalist, Activist) facing a massive infrastructural collapse.
- **Aesthetics & UI Standard (STITCH SILK):** The interface MUST strictly follow the generated Stitch designs (the "Silk" Neomorphic / Soft UI design system). 
  - **Colors:** Primary Indigo (`#6366f1`), Background Cool Gray (`#e8eaf0`), Tertiary Violet (`#7c3aed`). Depth comes from light and shadow, not color variation.
  - **Neomorphism:** Use raised and inset box-shadows to create "extruded light" tactile elements. Never combine with flat borders or gradients. 
  - **Typography:** Plus Jakarta Sans.
- **Forbidden Elements:** Do NOT add glowing neon effects, cyberpunk elements, sci-fi tropes, magic, or fantasy language to the code, UI, or descriptions.
- **Tone:** Gritty, realistic, grounded, desperate, and strictly contemporary. All code logic and naming conventions must strictly adhere to this rule, while the UI strictly adheres to the Neomorphic Silk standard.


## 2. GOOGLE PLAY STORE CHANGELOGS
**CRITICAL RULE:** Whenever making updates that change functionality, design, or include bug fixes that will be pushed to the Google Play Store, ALWAYS update the fastlane changelogs before pushing.
- Modify the `default.txt` file located in the respective fastlane language directories (e.g., `zero_sum_android/fastlane/metadata/android/de-DE/changelogs/default.txt` and `en-US`).
- Ensure the changelog accurately reflects the changes in the target language.
