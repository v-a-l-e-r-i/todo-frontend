# Ledger — tasks & projects

A Next.js (App Router) frontend for a FastAPI backend with JWT auth, projects, and tasks.

## Features

- Email/password register, login, logout with automatic access-token refresh
- Projects ("lists") — create, rename, recolor, delete
- Tasks — create, edit, delete, change status, move between projects
- Views: Today, Upcoming, Overdue, All tasks, and per-project lists, with search
- Task detail panel for editing title/description/priority/due date/status/project
- "Share list" — send a project's task list to another email address for review

## Getting started

```bash
npm install
cp .env.local.example .env.local   # point NEXT_PUBLIC_API_URL at your backend
npm run dev
```

Open http://localhost:3000. You'll land on `/login`; register a user first.

## Backend contract

Matches the provided FastAPI routes/schemas exactly:

- `POST /auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `GET /auth/me`
- `GET/PATCH /users/me`
- `GET/POST /projects`, `GET/PATCH/DELETE /projects/{id}`
- `GET/POST /tasks`, `GET/PATCH/DELETE /tasks/{id}`, `PATCH /tasks/{id}/status`, `PATCH /tasks/{id}/move`

All responses are unwrapped from the `SuccessResponse`/`PaginatedResponse` envelopes described in `app/schemas/common.py`.

## Email sharing — backend note

The provided backend doesn't yet expose an endpoint for sending a project's task
list by email. The "Share list" button in a project calls `POST /projects/{id}/share`
with `{ email }` — a REST-conventional route that isn't implemented server-side yet.
Until it exists, the UI shows a clear "not available yet" message instead of failing
silently. Add that endpoint (e.g. render the project's tasks and send via your mailer
of choice) and sharing will work with no frontend changes.

## Notes

- Auth tokens are kept in `localStorage`; the API client retries once on a 401 after
  refreshing.
- Google Fonts are intentionally not used (this sandbox has no network access to
  `fonts.googleapis.com`); the design tokens fall back to system font stacks — swap in
  `next/font/google` for Inter / Space Grotesk if you have network access when you run
  this for real.
