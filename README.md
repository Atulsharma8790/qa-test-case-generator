# AI Test Case Generator

> Paste a JIRA ticket, user story, or acceptance criteria — get a complete, structured test suite in seconds.

**Live Demo:** [Coming soon on Vercel]  
**Built by:** [Atul Sharma](https://atulsharma8790.github.io) — QA Automation Architect

---

## What it does

Takes any requirement text (JIRA ticket, user story, acceptance criteria, feature description) and generates:

- **BDD Gherkin** (Given / When / Then) test scenarios
- **Plain English** numbered test steps with expected results
- **Or both formats** simultaneously
- Positive, negative, edge case, and boundary test coverage
- Priority labelling (Critical / High / Medium / Low)
- Tags for each test case
- Export as `.feature` file or copy to clipboard

## Configuration options

| Option | Choices |
|---|---|
| Output Format | BDD Gherkin / Plain English / Both |
| Test Depth | Quick (4–6) / Standard (8–12) / Thorough (14–20) |
| Coverage Scope | Happy Path / Positive+Negative / Full Coverage |

---

## Getting started

### Prerequisites
- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com)

### Local setup

```bash
git clone https://github.com/atulsharma8790/qa-test-case-generator
cd qa-test-case-generator
npm install

# Copy env file and add your key
cp .env.example .env.local
# Edit .env.local: ANTHROPIC_API_KEY=sk-ant-...

npm run dev
# Open http://localhost:3000
```

### Deploy to Vercel (one click)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project
3. Set environment variable: `ANTHROPIC_API_KEY=sk-ant-...`
4. Deploy — done in ~60 seconds

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| AI | Claude claude-sonnet-4-6 (Anthropic SDK) |
| Hosting | Vercel |

---

## Project structure

```
src/
├── app/
│   ├── page.tsx          ← Main page, state management
│   ├── layout.tsx        ← HTML shell, metadata
│   └── api/generate/
│       └── route.ts      ← Claude API call, JSON parsing
├── components/
│   ├── Header.tsx        ← Top navigation
│   ├── InputPanel.tsx    ← Requirement input + config
│   └── OutputPanel.tsx   ← Test case display, copy, export
└── lib/
    ├── types.ts          ← TypeScript interfaces
    └── prompts.ts        ← System + user prompt builders
```

---

## Part of the QA Open Source Suite

This tool is part of a collection of open-source QA engineering tools:

- **AI Test Case Generator** ← you are here
- [QA Candidate Profile Analyzer](https://github.com/atulsharma8790/qa-candidate-analyzer)
- [QA Metrics Dashboard](https://github.com/atulsharma8790/qa-metrics-dashboard)
- [Smart Defect Triage](https://github.com/atulsharma8790/smart-defect-triage)
- [AI QA Orchestrator](https://github.com/atulsharma8790/ai-qa-orchestrator)
- [Universal QA Framework](https://github.com/atulsharma8790/universal-qa-framework)

---

## License

MIT — use freely, attribution appreciated.
