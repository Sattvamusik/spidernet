# Runbook

## How to start
1. Open Ubuntu / WSL terminal.
2. Go to the project:
   `cd $HOME/projects/spidernet-ops-console`
3. Install dependencies:
   `npm install`
4. Start local development server:
   `npm run dev`

## How to stop
- Press `Ctrl + C` in the terminal running the app.

## Ports used
- 3000: web app

## Required env vars
- APP_ENV=application environment
- APP_PORT=application port
- OPENAI_API_KEY=only if later features require it
- DATABASE_URL=only if later storage requires it

## Health checks
- app opens locally on port 3000
- terminal shows no repeated critical errors
- main page loads in browser

## Smoke checks
1. App starts without crashing.
2. Browser opens localhost:3000.
3. No repeated critical errors appear in terminal logs.

## Common failures

### Problem
`npm: command not found`

### Check
Confirm Node.js and npm are installed.

### Fix
Install Node.js and npm before running the project.

### Problem
`package.json` missing

### Check
Confirm actual app scaffold has been created.

### Fix
Create the application scaffold in the next phase before trying to run npm commands.

### Problem
Port 3000 already in use

### Check
See what is using the port.

### Fix
Stop the other process or use a different local port temporarily.

## Rollback steps
1. Check git status.
2. Identify the last good commit.
3. Revert or checkout known good state.
4. Restart the service.
5. Rerun smoke checks.
