# WEBSITE SKILL MOTION
## Comprehensive Architecture, Production Workflows & Implementation Blueprint
### Quarter Spoon Network // Unda Tha Radar Filmz // Tha Hogg Command
**Platform Version:** 0.1.0 (Next.js 16 App Router // Turbopack // Tailwind CSS v4)  
**Author / Director:** Tha Hogg (Fresno, CA)  
**System Class:** High-Performance Multimedia Broadcasting Vault & Live Telemetry Engine  
**Universal Compatibility:** Compatible with all LLMs (Gemini, Claude, GPT-4, DeepSeek, Llama) & IDEs (Cursor, VS Code, Antigravity, Windsurf)

---

## Table of Contents
1. [Executive Vision & Cultural DNA](#1-executive-vision--cultural-dna)
2. [Full Tech Stack & System Requirements](#2-full-tech-stack--system-requirements)
3. [Page Architecture & User Journey Matrix](#3-page-architecture--user-journey-matrix)
4. [Live Telemetry & Database Engine (lib/db.ts)](#4-live-telemetry--database-engine-libdbts)
5. [Authentication & Cryptographic Security](#5-authentication--cryptographic-security)
6. [Email Validation & Real-Time DNS Checking](#6-email-validation--real-time-dns-checking)
7. [Communications Engine & Authentic Tha Hogg Tone](#7-communications-engine--authentic-tha-hogg-tone)
8. [Subscriber-Only Gating Protocols](#8-subscriber-only-gating-protocols)
9. [Admin Command Deck & Real-Time Telemetry](#9-admin-command-deck--real-time-telemetry)
10. [CI/CD, Git & Netlify Deployment Protocols](#10-cicd-git--netlify-deployment-protocols)
11. [Cross-IDE & LLM Context Prompt Directives](#11-cross-ide--llm-context-prompt-directives)

---

## 1. Executive Vision & Cultural DNA

Quarter Spoon Network (QSN) is an independent broadcasting hub and subscriber vault engineered to distribute original films, studio sessions, and cutting-edge creative AI workflows directly to audiences without corporate intermediaries.

### Guiding Principles:
- **Uncompromised Authenticity**: The voice of the network is authentically West Fresno street culture—straightforward, respectful, and sharp. It does not use generic corporate marketing jargon.
- **Cinematic Production Standards**: Visual assets, UI designs, and video delivery maintain a high-end noir aesthetic: obsidian black (#05060A, #0A0E1A), glowing cyan (#06B6D4), neon amber (#F59E0B), and emerald signal lights (#10B981).
- **Strict Real-Data Integrity**: All metrics, analytics, counters, and play logs displayed on the platform are 100% authentic real-time events. No placeholder numbers, mock counters, or synthetic floors exist in production.

---

## 2. Full Tech Stack & System Requirements

| Domain | Technology | Details / Configuration |
| :--- | :--- | :--- |
| **Core Framework** | Next.js 16.3.4 (App Router) | Turbopack engine, strict server/client boundary separation |
| **Language** | TypeScript 5.x | Strict mode, zero `any` leakage on critical data paths |
| **Styling** | Tailwind CSS v4.0.0 | High-performance CSS engine, custom ambient glow shaders |
| **Iconography** | Lucide React | Clean, scalable vector UI components |
| **Data Engine** | File-backed JSON DB (`lib/db.ts`) | Transactional JSON store at `data/network_db.json` |
| **Crypto Security** | Web Crypto API (SubtleCrypto) | SHA-256 password hashing with salt (`_qsn_salt_2026`) |
| **Email Verifier** | Node.js DNS (`dns.resolveMx`) | Real-time MX lookup blocking 300+ disposable domains |
| **Admin Alerts** | Formspree Webhook Endpoint | Instant notification relay to Tha Hogg (`mrdulow12@gmail.com`) |
| **Hosting & CI/CD** | Netlify + GitHub | Automated deployments on push to `origin/main` via `@netlify/plugin-nextjs` |

---

## 3. Page Architecture & User Journey Matrix

### Matrix of Access Levels:
- **Public**: `/auth/login`, `/auth/register`
- **Authenticated (Member Floor)**: `/` (Home), `/tha-visuals` (Video Vault)
- **VIP Subscriber Only**: `/digital-workflow` (Creator Arsenal), `/get-u-some-game` (Direct Dialog)
- **Restricted Command**: `/admin` (Tha Hogg & QSE Admin Accounts Only)

### Page Breakdown:

#### 1. Home Studio Deck (`app/page.tsx`)
- Features the **HeroReveal** and **CinematicStorySection**.
- Displays the authenticated user HUD in the top right.
- **Zero-Overflow Rule**: Symmetrical viewport constraint preventing horizontal scrolling.
- **Button Visibility Rule**: The "GET U SOME GAME" button is strictly **NOT visible or accessible** on the Home Page.

#### 2. Cinema Theater Vault (`app/tha-visuals/page.tsx`)
- Custom HTML5 responsive theater screen with poster fallbacks and streaming controls.
- **Monitored Transmissions**:
  1. *IN EVERY SECTION* (West Fresno Dedication) — MP4 visual broadcast.
  2. *THA HOGG // VISUAL CREATIONS* — Official YouTube channel portal.
  3. *THA GAME SHOULD BE TOLD* — 3-part AI tutorial series.
  4. *SCENE OF SCREAMS* — Original Films channel.
- **Dynamic Play Telemetry**: Dispatches `POST /api/video/play` on every play event, recording subscriber vs guest telemetry.
- **"GET U SOME GAME" Entrypoint**:
  - Top header badge renders **exclusively** for subscribed members (`isSubscribed === true`).
  - Symmetrical floating card button (bottom-left) renders **exclusively** for subscribed members.
  - Non-subscribers enjoy an uncluttered theater screen with no floating distractions.

#### 3. Digital Workflow Creator Vault (`app/digital-workflow/page.tsx`)
- Subscriber-gated portal delivering master prompt architecture:
  - *The Plug-And-Play Production Suite (Vol. 1)*: 10 cinematic scene blueprints.
  - *Monster Master Set*: 6-second timeline JSON architecture (Arri RAW, ACEScg, Unreal Engine path-traced optics).
- Interactive 1-click clipboard prompt copying with instant visual feedback.
- PDF download tracking through `/api/download/track`.
- "Tha Suggestion Box": Direct feedback loop for requesting upcoming prompt bundles.

#### 4. "Get U Some Game" Direct Dialog (`app/get-u-some-game/page.tsx`)
- VIP subscriber direct communication line to Tha Hogg.
- If a non-subscriber visits this route directly, the page renders State B: "Access Gated // Tha Network Members Only" with a modal trigger to subscribe.
- Inquiries are recorded in `data/network_db.json` and simultaneously dispatched to Tha Hogg's email via Formspree.

#### 5. Admin Command Deck (`app/admin/page.tsx`)
- Strictly restricted to authorized admins: `mrdulow12@gmail.com` and `qse6209@gmail.com`.
- Automatic 5-second live telemetry polling from `/api/admin/data` with countdown and pause controls.
- Live metric cards and tables auditing Subscribers, Users, Video Plays, PDF Downloads, Inquiries, and Dispatches.
- Mass blast transmission launcher for non-subscribers and VIP subscribers.

---

## 4. Live Telemetry & Database Engine (`lib/db.ts`)

### Persistent JSON Architecture:
`data/network_db.json` stores all platform state:
- `users`: Member profiles, auth providers, creation and login timestamps.
- `subscribers`: Active VIP subscribers with acquisition source.
- `loginLogs`: Audit trail of authentication events.
- `emailDispatches`: Log of all automated thank-yous, invites, and blasts.
- `videoStats` & `videoPlays`: Real-time playback counters and individual play logs.
- `pdfStats` & `pdfDownloads`: Download tallies and subscriber breakdown.
- `gameInquiries`: Member questions with admin reply status and text.

### Zero Placeholder Protocol:
- **Baseline Video Stats**: Initialized to `totalPlays: 0, subscriberPlays: 0, nonSubscriberPlays: 0, lastPlayedAt: null`.
- **Real-Time Incrementing**: As visitors watch videos or download files, counters increment from 0 in real time.
- **Active Sessions Counter**: Computed strictly as `users.filter(u => Date.now() - new Date(u.lastLoginAt) < 24h).length` with zero artificial minimum floor.

---

## 5. Authentication & Cryptographic Security

### Web Crypto API (SHA-256 + Salt):
Passwords are never stored in plaintext. They are salted with `_qsn_salt_2026` and hashed client-side:
```typescript
const encoder = new TextEncoder();
const data = encoder.encode(password + "_qsn_salt_2026");
const hashBuffer = await crypto.subtle.digest("SHA-256", data);
const passwordHash = Array.from(new Uint8Array(hashBuffer))
  .map((b) => b.toString(16).padStart(2, "0"))
  .join("");
```

### Brute-Force Lockout Engine:
- Tracks consecutive failed attempts per email address.
- 5 consecutive failures triggers an automatic 30-minute lockout window.
- Lockout time remaining is persisted and rendered in the UI countdown.

### Session Persistence:
- Synchronized between `localStorage` (`qsn_active_session`) and Edge cookies (`qsn_session`).
- Sessions maintain 30-day persistence for "Remember Me" or Google OAuth logins, and 1-day for standard logins.

---

## 6. Email Validation & Real-Time DNS Checking

### Client-Side (`lib/emailValidator.ts`):
- RFC-compliant syntax verification.
- Instant blacklist matching against 300+ disposable/temporary mail providers.
- Disposable username heuristics (e.g., rejecting accounts starting with `temp_`, `fake_`, `test123`).

### Server-Side (`lib/emailServerValidator.ts`):
- Fast-track for established providers (Gmail, Yahoo, Outlook, iCloud).
- Real-time DNS MX record lookup (`dns.resolveMx`) with 2.5-second timeout.
- Confirms domain has active, routable mail exchangers before accepting subscriptions or user registrations.

---

## 7. Communications Engine & Authentic Tha Hogg Tone

All network dispatches are written in Tha Hogg's authentic, direct West Fresno voice:
- Greetings: "Peace", "Whutz Up?", "Salute".
- Directives: "locc in", "Peep:", "put game on the table", "the real transmission lives".
- Signature: Always signed:
  ```text
  Respect,
  Tha Hogg
  Quarter Spoon Network // Unda Tha Radar Filmz
  Fresno, CA
  ```
- Formspree notification integration dispatches instant alert payloads to `mrdulow12@gmail.com` on signups, logins, and inquiries.

---

## 8. Subscriber-Only Gating Protocols

### Access Gating Logic:
1. **Verification**: Checked dynamically via `/api/subscribe?email=<email>`.
2. **Event Listening**: Components listen to the window event `tha-network-subscribed` for instant in-session unlocking upon joining.
3. **Button Placement**:
   - The "GET U SOME GAME" button is rendered **strictly on the "THA VISUALS" page** and only when `isSubscribed === true`.
   - The button is completely removed from global wrappers (`components/AuthGate.tsx`) and the Home Page (`app/page.tsx`).

---

## 9. Admin Command Deck & Real-Time Telemetry

### Authorized Administrators:
- `mrdulow12@gmail.com` (Tha Hogg)
- `qse6209@gmail.com` (Quarter Spoon Executive / Tha Hogg)

### Capabilities:
- Live 5-second polling of all system telemetry.
- 1-click test dispatches for "Thank You", "Invite", and "Workflow" emails.
- Mass blast dispatching to all non-subscribers or all VIP subscribers.
- In-console direct reply modal to answer member inquiries with automatic status updates.
- 1-click CSV subscriber list export for external mailers.

---

## 10. CI/CD, Git & Netlify Deployment Protocols

### Build Verification:
```bash
npm run build
```
Verifies Next.js Turbopack compilation across all 17 routes with zero TypeScript errors.

### Git & Netlify Deployment:
```bash
git add -A
git commit -m "feat: <clear description>"
git push origin main
```
Pushing to `origin/main` automatically triggers Netlify's build webhook via `@netlify/plugin-nextjs` (Node 20 runtime, Git LFS enabled for visual assets).

---

## 11. Cross-IDE & LLM Context Prompt Directives

When interacting with this codebase in any LLM or IDE:
1. **Never Inject Fake Data**: Always preserve the 0-count baseline for unrecorded events. Never seed mock users.
2. **Preserve Next.js Agent Rules**: Keep the `<!-- BEGIN:nextjs-agent-rules -->` block in `AGENTS.md`.
3. **Respect Admin Boundary**: Only `mrdulow12@gmail.com` and `qse6209@gmail.com` possess admin clearance.
4. **Preserve Cultural Tone**: Retain Tha Hogg's authentic phrasing in all user-facing copy and email templates.
