import type { JiraConfig, JiraProject, JiraIssueType, JiraLinkType, JiraUploadResult, TestCase } from './types'

function authHeader(cfg: JiraConfig): string {
  if (cfg.authType === 'pat') return `Bearer ${cfg.apiToken}`
  return `Basic ${Buffer.from(`${cfg.email}:${cfg.apiToken}`).toString('base64')}`
}

async function jiraFetch<T>(
  cfg: JiraConfig,
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${cfg.baseUrl.replace(/\/$/, '')}/rest/api/3${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: authHeader(cfg),
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers ?? {}),
    },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`JIRA ${res.status}: ${body.slice(0, 300)}`)
  }
  return res.json() as Promise<T>
}

export async function testConnection(cfg: JiraConfig): Promise<{ name: string; email: string }> {
  const data = await jiraFetch<{ displayName: string; emailAddress: string }>(cfg, '/myself')
  return { name: data.displayName, email: data.emailAddress }
}

export async function fetchProjects(cfg: JiraConfig): Promise<JiraProject[]> {
  const data = await jiraFetch<{ values: Array<{ id: string; key: string; name: string }> }>(
    cfg, '/project/search?maxResults=50'
  )
  return data.values.map(p => ({ id: p.id, key: p.key, name: p.name }))
}

export async function fetchIssueTypes(cfg: JiraConfig): Promise<JiraIssueType[]> {
  const data = await jiraFetch<Array<{ id: string; name: string; subtask: boolean }>>(
    cfg, `/project/${cfg.projectKey}/statuses`
  )
  // Use metadata endpoint for issue types
  const meta = await jiraFetch<{ projects: Array<{ issuetypes: Array<{ id: string; name: string }> }> }>(
    cfg, `/issue/createmeta?projectKeys=${cfg.projectKey}&expand=projects.issuetypes`
  )
  return meta.projects?.[0]?.issuetypes?.map(it => ({ id: it.id, name: it.name })) ?? []
}

export async function fetchLinkTypes(cfg: JiraConfig): Promise<JiraLinkType[]> {
  const data = await jiraFetch<{ issueLinkTypes: JiraLinkType[] }>(cfg, '/issueLinkType')
  return data.issueLinkTypes
}

// Convert our priority → JIRA priority name
const DEFAULT_PRIORITY_MAP: Record<string, string> = {
  critical: 'Blocker',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

function buildADF(paragraphs: string[]): object {
  return {
    type: 'doc',
    version: 1,
    content: paragraphs.filter(Boolean).map(p => ({
      type: 'paragraph',
      content: [{ type: 'text', text: p }],
    })),
  }
}

function buildStepsADF(steps: string[], expectedResult?: string): object {
  const items = steps.map(s => ({
    type: 'listItem',
    content: [{ type: 'paragraph', content: [{ type: 'text', text: s }] }],
  }))

  const content: object[] = [{ type: 'orderedList', content: items }]

  if (expectedResult) {
    content.push({
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Expected Result: ', marks: [{ type: 'strong' }] },
        { type: 'text', text: expectedResult },
      ],
    })
  }

  return { type: 'doc', version: 1, content }
}

function buildDescription(tc: TestCase): object {
  const parts: string[] = []

  if (tc.preconditions?.length) {
    parts.push(`Preconditions: ${tc.preconditions.join('; ')}`)
  }

  if (tc.gherkin) {
    return {
      type: 'doc',
      version: 1,
      content: [
        ...(tc.preconditions?.length
          ? [{ type: 'paragraph', content: [{ type: 'text', text: `Preconditions: ${tc.preconditions.join('; ')}` }] }]
          : []),
        {
          type: 'codeBlock',
          attrs: { language: 'gherkin' },
          content: [{ type: 'text', text: tc.gherkin }],
        },
      ],
    }
  }

  if (tc.steps?.length) {
    return buildStepsADF(tc.steps, tc.expectedResult)
  }

  return buildADF(parts.length ? parts : ['No additional description.'])
}

export async function uploadTestCases(
  cfg: JiraConfig,
  testCases: TestCase[],
  suiteName: string,
  priorityMap: Record<string, string> = DEFAULT_PRIORITY_MAP,
  onProgress?: (done: number, total: number) => void
): Promise<JiraUploadResult[]> {
  const results: JiraUploadResult[] = []

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i]

    const payload: Record<string, unknown> = {
      fields: {
        project: { key: cfg.projectKey },
        issuetype: { name: cfg.issueType },
        summary: `[${tc.id}] ${tc.title}`,
        description: buildDescription(tc),
        priority: { name: priorityMap[tc.priority] ?? 'Medium' },
        labels: [
          ...tc.tags,
          `test-type-${tc.type}`,
          `generated-by-ai`,
          ...(cfg.labels ?? []),
        ],
        ...(cfg.componentName
          ? { components: [{ name: cfg.componentName }] }
          : {}),
      },
    }

    const created = await jiraFetch<{ id: string; key: string; self: string }>(cfg, '/issue', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    let linked = false
    if (cfg.parentKey) {
      try {
        await jiraFetch(cfg, '/issueLink', {
          method: 'POST',
          body: JSON.stringify({
            type: { name: cfg.linkType || 'Relates' },
            inwardIssue: { key: created.key },
            outwardIssue: { key: cfg.parentKey },
          }),
        })
        linked = true
      } catch {
        // Link creation is best-effort — don't fail the whole upload
      }
    }

    results.push({
      key: created.key,
      id: created.id,
      title: tc.title,
      url: `${cfg.baseUrl}/browse/${created.key}`,
      linked,
    })

    onProgress?.(i + 1, testCases.length)
  }

  return results
}
