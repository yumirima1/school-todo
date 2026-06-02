# School Dock

School Dock is a school life dashboard built with Next.js App Router, TypeScript, Tailwind CSS, and localStorage.

## Features

- Today's dashboard with timetable, due assignments, next preparation, and upcoming event countdown
- Assignment creation, editing, deletion, completion toggle, priority, status, and memo
- Timetable registration for weekdays and periods
- Event registration with countdown display
- Phase 2 placeholder pages for study tasks, calendar, subjects, and settings

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Checks

Run lint:

```bash
npm run lint
```

Run a production build:

```bash
npm run build
```

## Notes

- Data is saved in the browser's localStorage.
- Most features run without environment variables.
- Blackboard AI analysis uses the server-side `OPENAI_API_KEY` environment variable. If it is not set, `/board` shows `AI解析未設定` and manual input remains available.
