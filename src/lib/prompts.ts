import type { OutputFormat, TestDepth, CoverageScope } from './types'

const depthGuide: Record<TestDepth, string> = {
  quick: 'Generate 4–6 focused test cases covering only the most critical paths.',
  standard: 'Generate 8–12 test cases with good positive and negative coverage.',
  thorough: 'Generate 14–20 test cases covering all scenarios including boundary values, edge cases, and data variations.',
}

const coverageGuide: Record<CoverageScope, string> = {
  'positive': 'Focus only on happy-path and valid-input scenarios.',
  'positive-negative': 'Cover happy-path scenarios AND common negative/invalid-input scenarios.',
  'full': 'Cover happy-path, negative, boundary values, edge cases, security-relevant inputs, and performance considerations.',
}

const formatGuide: Record<OutputFormat, string> = {
  gherkin: 'Write each test case as Gherkin BDD (Given / When / Then / And). Include a Scenario title.',
  plain: 'Write each test case as numbered plain-English steps with a clear Expected Result.',
  both: 'Include both a Gherkin BDD block AND a plain-English steps block for each test case.',
}

export function buildSystemPrompt(): string {
  return `You are a Principal QA Engineer with 15+ years of experience across enterprise software, fintech, e-commerce, and mobile applications. You specialise in writing precise, executable, and comprehensive test cases that development teams can immediately act on.

Your test cases are:
- Independent (each can run standalone)
- Atomic (test exactly one behaviour per case)
- Traceable (tied to the requirement being tested)
- Realistic (use domain-realistic data, not generic placeholders like "user1" or "test@test.com")
- Prioritised (critical path first, then degraded scenarios)

Always return ONLY valid JSON — no markdown fences, no explanations outside the JSON structure.`
}

export function buildUserPrompt(
  input: string,
  format: OutputFormat,
  depth: TestDepth,
  coverage: CoverageScope
): string {
  return `Analyse the following requirement and generate a structured test suite.

REQUIREMENT:
---
${input}
---

INSTRUCTIONS:
- Depth: ${depthGuide[depth]}
- Coverage scope: ${coverageGuide[coverage]}
- Output format: ${formatGuide[format]}

Return a JSON object with this exact structure:
{
  "suiteName": "short descriptive name for this test suite",
  "summary": "1-2 sentence summary of what is being tested and why",
  "testCases": [
    {
      "id": "TC001",
      "title": "concise test case title in plain English",
      "type": "positive" | "negative" | "edge" | "boundary",
      "priority": "critical" | "high" | "medium" | "low",
      "preconditions": ["list of preconditions if any"],
      ${format === 'gherkin' || format === 'both' ? `"gherkin": "Feature: ...\\n\\n  Scenario: ...\\n    Given ...\\n    When ...\\n    Then ...\\n    And ...",` : ''}
      ${format === 'plain' || format === 'both' ? `"steps": ["Step 1: ...", "Step 2: ...", "..."], "expectedResult": "clear expected outcome",` : ''}
      "tags": ["relevant", "tags"]
    }
  ],
  "coverageSummary": {
    "positive": <count>,
    "negative": <count>,
    "edge": <count>,
    "boundary": <count>
  }
}

Use realistic, domain-appropriate test data. Prioritise critical and high cases first.`
}
