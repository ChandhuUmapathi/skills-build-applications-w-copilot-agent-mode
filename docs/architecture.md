# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Keep presentation, business logic, and persistence in their respective tiers; have the frontend use the shared API client and relative `/api` paths.

- Presentation tier decision: Each capability page loads data through the shared client and exposes accessible loading, empty, and error states.
- Logic tier decision: Implement API contracts in Express routes/services, validate inputs and referenced records, and return deliberate 4xx responses for invalid or unknown resources. Do not add authentication.
- Data tier decision: Define required fields, defaults, and references in Mongoose models. Keep seeding idempotent and preserve unrelated records.
- Activity tracking approach: Validate `userId` and `teamId` formats and existence before creating an activity; persist them as `user` and `team`, calculate `points` in the logic tier, and set `occurredAt` when created.
- Team management approach: List and create teams through the API, preserving submitted names and mascots and supporting members; reject a missing name with `400`.
- Leaderboard approach: Sum activity points by team, sort descending by total, and return each team's name, total, and 1-based rank.
- Workout suggestions approach: Find the user by email, use their goal and recent activity to choose relevant workouts, explain the first recommendation with a reason, and return a deliberate 4xx for an unknown email.

## Test plan

Commands run and current results:

- Data tier — `npm run test:data --prefix octofit-tracker/backend`: **failed, 4 of 5 tests**. Empty user, team, activity, and workout documents are missing required-field validation; the seed/idempotency test passes.
- API — `npm run test:api --prefix octofit-tracker/backend`: **failed, 4 of 4 tests**. Invalid activity/team requests return `501` instead of `400`, leaderboard aggregation returns no entries, and workout suggestions omit the expected reason.
- Frontend — `npm test --prefix octofit-tracker/frontend`: **failed, 15 of 15 tests**. Pages do not meet the API rendering/fetch, accessible loading, empty-state, or error-alert contracts.
- Backend build — `npm run build --prefix octofit-tracker/backend`: **passed** (`tsc --noEmit`).
- Frontend build — `npm run build --prefix octofit-tracker/frontend`: **passed** (TypeScript check and Vite production build).
