# ASU Navigator

ASU Navigator is a full-stack web app that helps Arizona State University students turn a class schedule into a campus navigation tool. Users can create an account with an `@asu.edu` email address, upload a MyASU `.ics` calendar export, browse classes by day, and preview walking routes between in-person classes on Google Maps.

![ASU Navigator screenshot](image.png)

## Features

- Sign up and sign in with email/password accounts restricted to `@asu.edu`
- Upload `.ics` calendar files exported from MyASU
- Store multiple schedules per user
- Rename or delete saved schedules
- View classes for a selected day
- Estimate walking gaps between consecutive classes
- Visualize class locations and walking routes on Google Maps
- Save a custom starting pin or use the device's current location
- Simulate a hypothetical schedule before registration
- Treat online and virtual classes differently from in-person locations

## Tech Stack

- Frontend: React 19, TypeScript, Vite, React Router, Tailwind CSS v4, TanStack Query, tRPC client
- Backend: Node.js, Express 5, TypeScript, tRPC, Zod, Better Auth
- Database: Prisma ORM with PostgreSQL
- Integrations: Google Maps JavaScript API, Google Directions API, ICAL.js
- Deployment: Vercel with an `esbuild` serverless bundle in `api/`

## Repository Layout

- `frontend/` - React app and UI components
- `backend/` - Express server, tRPC router, auth, Prisma schema, and ICS parsing
- `api/` - Vercel serverless entry built from the backend app
- `TestForASUNavigator.ics` - sample calendar file for local testing

## Prerequisites

- Node.js 20 or newer
- A PostgreSQL database
- Google Maps credentials for browser map rendering and backend directions requests

## Environment Variables

Create a `backend/.env` file:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/asu_navigator"
BETTER_AUTH_URL="http://localhost:5173"
API_KEY="your_server_side_google_maps_key"
```

Create a `frontend/.env` file:

```env
VITE_GOOGLE_MAPS_API_KEY="your_browser_google_maps_key"
```

Notes:

- `API_KEY` is used by the backend when it calls the Google Directions API.
- `VITE_GOOGLE_MAPS_API_KEY` is exposed to the browser for the Google Maps JavaScript SDK.
- If Better Auth requires additional standard secrets in your environment, add them to `backend/.env` as well.

## Local Development

Install dependencies:

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

Run database migrations and generate the Prisma client:

```bash
npm --prefix backend exec prisma migrate dev
npm --prefix backend exec prisma generate
```

Start the backend:

```bash
npm --prefix backend run dev
```

Start the frontend in a second terminal:

```bash
npm --prefix frontend run dev
```

Open `http://localhost:5173`.

The frontend proxies `/api` and `/trpc` requests to the backend running on `http://localhost:3000`.

## Typical Workflow

1. Create an account with an `@asu.edu` email address.
2. Export your schedule from MyASU as an `.ics` file.
3. Upload the file on the dashboard.
4. Pick a day to view classes and time gaps.
5. Open the map to preview walking routes between class locations.
6. Optionally save a start pin or use simulation mode to test a hypothetical schedule.

## Run locally

Front-end:
- pnpm install
- pnpm run dev

Back-end:
- npx prisma migrate dev
- npx prisma generate
- pnpm install
- pnpm install axios
- pnpm run dev

To update back-end:
pnpm exec prisma generate
## Production Build

To run the Vercel-style production build locally:

```bash
npm run vercel-build
```

That command:

- generates the Prisma client from `backend/prisma/schema.prisma`
- bundles the backend app into `api/index.js`
- builds the frontend into `frontend/dist`

`vercel.json` rewrites `/api/*` and `/trpc/*` to the serverless function and serves the frontend as a single-page app.

## Data Utilities

The scripts in `frontend/src/data/scripts/` are for maintaining ASU building data and are not required for normal app usage:

- `convert.js`
- `fixBuildingCoords.js`

## To obtain accurate buildings list:
- Search up "ASU building codes JSON" and click on ASU link
- Download the Excel file on the website
- In the Excel file, change the "Building Name" column using "PROPER" formula
- Export the Excel sheet to CSV file
- Run the CSV file to a JSON converter website: "https://csvjson.com/csv2json"
- Paste the node file in .\frontent\src\data\scripts
- Run the convert.js script using "node convert.js"
- paste the javascript list into the fixBuildingCoordinates list in "const buildings = [...]"

## To run fixBuildingCoords.js script:
- cd .\ASU_Navigator\data\scripts
- node fixBuildingCoords.js
- Should create a new file with accurate building coordinates in a .json file

![alt text](image.png)

## Current Auth Behavior

The current implementation uses Better Auth with email/password login. Sign-up is restricted to ASU email addresses by server-side validation in the backend.
