# Project Title: BetterOS

**Target Audience:** Productivity enthusiasts, creators, and systems thinkers.
**Philosophy:** High ROI on time, minimal friction, maximum context.

---

## 1. Executive Summary

**BetterOS** is not just a chatbot; it is a context-aware Life Operating System. It solves the biggest friction point in AI adoption: **Context Switching**. Instead of starting from scratch with every prompt, _BetterOS_ understands who you are ("The Context Engine") and allows you to interact with your data through specific "Lenses" or "Modes" (The Mode Switcher). It combines the depth of a Notion workspace with the speed of a native mobile app.

---

## 2. Feature Architecture

### Feature A: "Orbit" – The Context Engine (Onboarding & Memory)

_The foundation of the app. Solves the "Cold Start" problem._

- **The Concept:** A "set it and forget it" database of the user's life.
- **User Flow:**
  - **The Interview:** Onboarding isn't a tutorial; it’s a beautiful, minimal interview. "What are your 3 Core values?", "What is your 5-year goal?", "What brings you anxiety right now?"
  - **The Realignment Button:** A panic button for the overwhelmed. The user hits this, types "I'm drowning," and the AI references the _Onboarding Answers_ to ruthlessly filter the user's current to-do list, telling them what to say "No" to based on their pre-defined values.
- **Tech Stack:** Vector database (RAG) storing user values as the "System Prompt" for all other modes.

### Feature B: The "Mode Switcher" (The Interface)

_The direct translation of Simon’s "Agent OS" into mobile UI._

- **The Concept:** Users don't chat with a generic bot; they select a "Mode" via a haptic dial or card stack UI.
- **The Default Modes:**
  1.  **The Boss:** Ruthless prioritization. Short answers. Asks "Is this necessary?"
  2.  **The Creative:** Warm tone. Expands on ideas. "Yes, and..." mentality.
  3.  **The Stoic:** Journaling companion. Helps process emotion.
- **Unified Context:** All modes share the memory from _Feature A_. The "Boss" knows your 5-year goal; the "Stoic" knows your anxieties.

### Feature C: "Clarity" – Voice-First Ambulation (Input)

_Getting away from the desk._

- **The Concept:** A mode designed specifically for walking.
- **UI:** Zero text. Just a pulsing waveform.
- **Functionality:**
  - User taps and "brain dumps" (rants/rambles).
  - **Silent Processing:** The AI waits for silence, processes the messy audio, and speaks back a synthesized question to clarify the thought: "It sounds like you're stuck on X. Is that fear or lack of data?"
  - **Post-Walk Artifact:** Once the session ends, the app generates a perfectly formatted text summary/action plan and saves it to the user's history.

### Feature D: The "Daily Standup" (Accountability Loop)

_Initiating the conversation so the user doesn't have to._

- **The Concept:** The app proactively notifications the user based on previous context.
- **The Loop:**
  - **08:00 AM (Briefing):** "Good morning. Yesterday you said you needed to focus on the Video Script. Is that still the priority?"
  - **06:00 PM (Review):** "How did it go? Let's log what we learned."
- **Pattern Recognition:** The AI analyzes the _Orbit_ history. "I've noticed you procrastinate every Thursday. Let's try a smaller goal today."

### Feature E: "Marketplace of Minds" (Community & Growth)

_The Creator Economy & RevenueCat integration._

- **The Concept:** Users can build custom Modes and share them via deep links.
- **The Flow:**
  - Simon builds the "Better Creating Coach" (Custom system prompt + specific temperature settings).
  - He exports it as a link.
  - Users click the link to "Install" this coach into their app.
- **RevenueCat Strategy:**
  - **Free Tier:** 3 Standard Modes + 1 Custom Install.
  - **Pro Tier ($X/mo):** Unlimited Custom Mode installs, access to "Verified Creator" agents, and advanced voice models.

---

## 3. The "Winning" Aesthetic

To appeal to Simon, the app must strictly adhere to **Essentialism**:

- **Typography:** Clean sans-serif (Inter or SF Pro), heavy use of white space.
- **Palette:** Monochrome with single accent colors for different Modes (e.g., Orange for "Boss", Blue for "Creative").
- **Haptics:** The "Mode Switcher" needs satisfying haptic feedback (using standard iOS/Android haptic engines) to feel like a physical tool.

## 4. Technical Stack Proposal

- **Frontend:** React Native (Expo) or Swift/SwiftUI (for maximum polish).
- **Backend:** Supabase (Auth + Database).
- **AI:** Gemini 3.0 for the reasoning capabilities.
- **Monetization:** **RevenueCat** (Required for competition).
