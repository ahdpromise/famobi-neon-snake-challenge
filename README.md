
# Neon Snake — Famobi Development Challenge

A browser-based Snake game built with Phaser 3, TypeScript, and Vite, extended with Famobi SDK integration, gameplay analytics, a Node.js backend, Firebase Firestore storage, and a React analytics dashboard.

## Project Overview

This repository contains four parts:

- **Game:** The original Neon Snake game with Famobi SDK integration.
- **Analytics:** Gameplay session tracking and HTTP reporting.
- **Backend:** A Node.js and Express API connected to the Firebase Firestore Emulator.
- **Dashboard:** A React application displaying gameplay statistics and charts.

The solution runs entirely locally without a real Firebase project or cloud credentials.

## Requirements

- Node.js 22 or newer
- pnpm 11
- Java JDK 21 for the Firebase Emulator

## Installation and Local Setup

Open four separate terminals.

### 1. Firebase Firestore Emulator

From the project root:

```bash
cd server
pnpm install
pnpm exec firebase emulators:start --only firestore
```

Firestore Emulator: `127.0.0.1:8080`

Emulator UI: http://127.0.0.1:4000/

The emulator uses the project ID `demo-neon-snake`.

### 2. Backend API

In a second terminal, from the project root:

```bash
cd server
pnpm dev
```

Backend: http://localhost:3000

Health check: http://localhost:3000/health

### 3. Snake Game

In a third terminal, from the project root:

```bash
pnpm install
pnpm build
pnpm preview
```

Game: http://localhost:4173/

The production preview is used to verify the Famobi integration with the built game assets.

### 4. React Dashboard

In a fourth terminal, from the project root:

```bash
cd dashboard
pnpm install
pnpm dev
```

Dashboard: http://localhost:5173/

## Gameplay

The original game supports:

- Three increasingly challenging levels.
- Fruit collection, scoring, and level progression.
- Wall, obstacle, and self-collision detection.
- Pause, resume, retry, and return to menu.
- Persistent best score, unlocked levels, and mute preferences.
- Keyboard, swipe, and on-screen controls.
- Procedurally generated sound effects.

The existing game architecture and gameplay mechanics were preserved.

## Challenge 1 — Famobi SDK Integration

The Famobi integration connects important game lifecycle events to the SDK, including:

- Game readiness and loading.
- Gameplay start and end.
- Score updates.
- Level progress.
- Pause and resume behavior.
- Game completion.

The SDK integration is separated from the core game logic.

The integration was tested locally using the built game and Vite's production preview.

## Challenge 2 — Gameplay Analytics

Gameplay sessions are recorded with the following fields:

| Field | Description |
|---|---|
| `sessionId` | Unique session identifier |
| `level` | Played level |
| `startedAt` | Session start timestamp |
| `endedAt` | Session end timestamp |
| `result` | `completed`, `failed`, or `left` |
| `score` | Player score |
| `progress` | Level progress between 0 and 1 |
| `durationMs` | Session duration in milliseconds |

Analytics are collected from game events and sent to the backend through HTTP.

## Challenge 3 — Node.js Backend and Firebase

The backend uses Express, TypeScript, Firebase Admin SDK, and the Firebase Local Emulator Suite.

### API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Check API availability |
| POST | `/analytics/sessions` | Validate and save a gameplay session |
| GET | `/analytics/sessions` | Retrieve recorded sessions |

Gameplay sessions are stored in the Firestore collection `gameplaySessions`, using their unique session IDs as document IDs.

The API validates incoming data before saving it. Invalid sessions return HTTP 400, while unexpected storage errors return HTTP 500.

The GET endpoint returns sessions ordered by their start timestamp, newest first.

Firebase Admin SDK communicates with the local Firestore Emulator. No service account or cloud credentials are required.

## Challenge 4 — React Analytics Dashboard

The dashboard retrieves gameplay sessions from the backend and displays:

- Total gameplay sessions.
- Completion rate.
- Average score.
- Average session duration.
- A pie chart showing completed, failed, and left sessions.
- A bar chart showing average score by level.

Charts use Recharts.

The dashboard fetches data when the page loads. Refresh the page to retrieve new sessions.

## Testing the Complete Flow

1. Start the Firebase Firestore Emulator.
2. Start the Node.js backend.
3. Start the game and open it in the browser.
4. Play a session and complete, fail, or leave the gameplay.
5. Open the Firebase Emulator UI and check the `gameplaySessions` collection.
6. Confirm that the session document contains the expected result, score, progress, level, and timestamps.
7. Open the React dashboard.
8. Confirm that the statistics and charts reflect the recorded session.

Recorded sessions can also be inspected directly at:

http://localhost:3000/analytics/sessions

### Build and Validation Commands

Game, from the project root:

```bash
pnpm check
pnpm build
```

Backend, from `server/`:

```bash
pnpm check
pnpm build
```

Dashboard, from `dashboard/`:

```bash
pnpm build
pnpm lint
```

## Main Technical Decisions

- **Preserve the existing game:** The provided Phaser game remains the foundation of the project.
- **Separate SDK integration:** Famobi-specific functionality is isolated from the game simulation.
- **Use session-based analytics:** A session record provides the timing, outcome, score, and progress information needed for analysis.
- **Validate on the backend:** Incoming analytics are checked before being written to Firestore.
- **Use the Firebase Emulator:** Local storage and testing work without cloud credentials or a real Firebase project.
- **Keep the dashboard simple:** React and Recharts provide the required overview and meaningful visualizations without unnecessary UI complexity.

## Assumptions and Known Limitations

- The solution is designed for local development and evaluation, not production deployment.
- The game, API, dashboard, and Firestore Emulator use fixed localhost addresses.
- The API allows cross-origin requests for local testing.
- Emulator data is not automatically preserved between restarts.
- The dashboard does not update in real time; a page refresh loads the latest sessions.
- Failed analytics requests are not automatically retried.
- Large JavaScript bundle warnings may appear during builds because of the game and charting dependencies. Builds complete successfully.

## Improvements With More Time

For a production environment, possible improvements include:

- Configurable API and emulator addresses.
- Restricted CORS and API authentication.
- Automated integration tests.
- Retry handling for failed analytics requests.
- Persistent emulator test data.
- Dashboard auto-refresh or live updates.
- Production bundle optimization.

## Use of External Tools

AI tools were used as supporting resources during development, including documentation summarization, learning support for unfamiliar tools and libraries, and README preparation and formatting.


## License

MIT
