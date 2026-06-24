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

// ─── File Attachments ─────────────────────────────────────────────────────────

export type AttachmentType = 'pdf' | 'docx' | 'excel' | 'csv' | 'image' | 'txt'

export interface Attachment {
  id: string
  name: string
  type: AttachmentType
  size: number
  extractedText: string
  preview?: string
}

// ─── Export ───────────────────────────────────────────────────────────────────

export interface ExportColumn {
  key: string
  label: string
  description: string
  jiraField: string
  enabled: boolean
  required?: boolean
}

export type ExportFormat = 'feature' | 'csv' | 'excel' | 'xray-xml' | 'txt'

export interface ExportConfig {
  format: ExportFormat
  columns: ExportColumn[]
  parentStoryKey: string
  projectKey: string
  issueType: string
  priorityMap: Record<string, string>
}

// ─── JIRA Integration ─────────────────────────────────────────────────────────

export interface JiraConfig {
  baseUrl: string
  email: string
  apiToken: string
  authType: 'basic' | 'pat'
  projectKey: string
  issueType: string
  parentKey: string
  linkType: string
  componentName?: string
  labels?: string[]
}

export interface JiraProject {
  id: string
  key: string
  name: string
}

export interface JiraIssueType {
  id: string
  name: string
}

export interface JiraLinkType {
  id: string
  name: string
  inward: string
  outward: string
}

export interface JiraUploadResult {
  key: string
  id: string
  title: string
  url: string
  linked: boolean
}
