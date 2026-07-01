export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { testConnection, fetchProjects, fetchLinkTypes, uploadTestCases } from '@/lib/jiraClient'
import { verifyPasscode, unauthorizedResponse } from '@/lib/auth'
import type { JiraConfig, TestCase } from '@/lib/types'

export async function POST(req: NextRequest) {
  if (!verifyPasscode(req.headers.get('x-access-code'))) return unauthorizedResponse()
  try {
    const body = await req.json()
    const { action, config, testCases, suiteName, priorityMap } = body as {
      action: 'test' | 'projects' | 'link-types' | 'upload'
      config: JiraConfig
      testCases?: TestCase[]
      suiteName?: string
      priorityMap?: Record<string, string>
    }

    if (!config?.baseUrl || !config?.apiToken) {
      return NextResponse.json({ error: 'JIRA URL and API token are required.' }, { status: 400 })
    }

    // Sanitise base URL
    config.baseUrl = config.baseUrl.replace(/\/$/, '')

    switch (action) {
      case 'test': {
        const user = await testConnection(config)
        return NextResponse.json({ success: true, user })
      }

      case 'projects': {
        const projects = await fetchProjects(config)
        return NextResponse.json({ projects })
      }

      case 'link-types': {
        const linkTypes = await fetchLinkTypes(config)
        return NextResponse.json({ linkTypes })
      }

      case 'upload': {
        if (!testCases?.length) {
          return NextResponse.json({ error: 'No test cases provided.' }, { status: 400 })
        }
        const results = await uploadTestCases(
          config,
          testCases,
          suiteName ?? 'Test Suite',
          priorityMap
        )
        return NextResponse.json({ results })
      }

      default:
        return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'JIRA operation failed.'
    console.error('JIRA error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
