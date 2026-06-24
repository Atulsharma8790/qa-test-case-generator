export type OutputFormat = 'gherkin' | 'plain' | 'both'
export type TestDepth = 'quick' | 'standard' | 'thorough'
export type CoverageScope = 'positive' | 'positive-negative' | 'full'

export interface GenerateOptions {
  input: string
  format: OutputFormat
  depth: TestDepth
  coverage: CoverageScope
}

export interface TestCase {
  id: string
  title: string
  type: 'positive' | 'negative' | 'edge' | 'boundary'
  priority: 'critical' | 'high' | 'medium' | 'low'
  preconditions?: string[]
  gherkin?: string
  steps?: string[]
  expectedResult?: string
  tags: string[]
}

export interface GenerateResult {
  suiteName: string
  summary: string
  testCases: TestCase[]
  totalCount: number
  coverageSummary: {
    positive: number
    negative: number
    edge: number
    boundary: number
  }
}
