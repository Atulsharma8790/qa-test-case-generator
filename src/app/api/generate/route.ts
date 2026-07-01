import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { buildSystemPrompt, buildUserPrompt } from '@/lib/prompts'
import { verifyPasscode, unauthorizedResponse } from '@/lib/auth'
import type { GenerateOptions, GenerateResult } from '@/lib/types'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  if (!verifyPasscode(req.headers.get('x-access-code'))) return unauthorizedResponse()
  try {
    const body: GenerateOptions = await req.json()
    const { input, format, depth, coverage } = body

    if (!input?.trim()) {
      return NextResponse.json({ error: 'Input is required.' }, { status: 400 })
    }
    if (input.trim().length < 20) {
      return NextResponse.json({ error: 'Please provide a more detailed requirement (at least 20 characters).' }, { status: 400 })
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: buildSystemPrompt(),
      messages: [
        {
          role: 'user',
          content: buildUserPrompt(input.trim(), format, depth, coverage),
        },
      ],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''

    let result: GenerateResult
    try {
      // Strip any accidental markdown fences just in case
      const cleaned = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
      result = JSON.parse(cleaned)
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI response. Please try again.' }, { status: 500 })
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('Generate error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
