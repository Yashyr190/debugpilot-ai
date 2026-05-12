# DebugPilot AI

DebugPilot AI is a lightweight debugging assistant for developers. Paste a stack trace, runtime error, API failure, deployment log, or messy production note, and the app turns it into a concise engineering report with likely subsystem, immediate next step, root cause, severity, fix path, checklist, prevention tips, and confidence score.

## Problem Statement

Debugging often starts with scattered context: a stack trace in Slack, an API response from the browser console, a CI failure, or a log snippet from production. Developers lose time sorting signal from noise before they can decide what to fix first.

DebugPilot AI gives that first triage pass a clean workflow. It helps classify the issue, estimate severity, and produce practical next steps without burying the developer in generic advice.

## Solution Approach

The app uses a small Next.js API route as the analysis boundary. If `OPENAI_API_KEY` is configured, the route calls an AI model with a strict JSON response shape. If no key is present, it falls back to a local heuristic analyzer so the product remains usable during local development and demos.

The UI keeps the workflow direct: pick a realistic preset or paste an issue, analyze it, read the structured cards, and copy the report or individual sections.

## Features

- Modern dark SaaS interface with subtle glass styling
- Large developer-friendly textarea for logs and stack traces
- Issue classification across React, API, database, auth, runtime, network, and deployment failures
- Severity levels from low to critical
- Structured report cards for category, subsystem, severity, immediate next step, root cause, suggested fix, checklist, prevention tips, and confidence
- Staggered report-card reveal animations and an animated confidence progress bar
- Loading shimmer, animated empty state, error states, clear input, and realistic sample presets
- Copy-to-clipboard for the full report and key sections
- Mock AI fallback when no API key is configured
- Fully responsive layout built with Tailwind CSS

## Tech Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- React
- Lucide React icons

## Setup

Install dependencies:

```bash
npm install
```

Create an environment file:

```bash
cp .env.example .env.local
```

Optional AI configuration:

```bash
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4o-mini
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Development Notes

Without `OPENAI_API_KEY`, DebugPilot uses the local analyzer in `lib/analyze-issue.ts`. This keeps the app predictable for local testing and still returns realistic debugging reports.

The browser-facing code never reads API keys. The client posts the pasted issue to `app/api/analyze/route.ts`, and the server decides whether to use the AI provider or mock analyzer.

## Future Improvements

- GitHub integration for issue and PR context
- Repository-aware debugging with file and dependency understanding
- AI-generated fix PRs for common failure patterns
- Live log monitoring and alert triage
- CI/CD debugging workflows for failed builds and deployments
- Team report history with searchable incidents
