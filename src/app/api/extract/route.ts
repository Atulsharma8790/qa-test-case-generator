export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { detectAttachmentType, extractPdf, extractDocx, extractExcel, extractCsv, extractTxt } from '@/lib/extractors'
import { verifyPasscode, unauthorizedResponse } from '@/lib/auth'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  if (!verifyPasscode(req.headers.get('x-access-code'))) return unauthorizedResponse()
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) return NextResponse.json({ error: 'No file provided.' }, { status: 400 })

    const maxBytes = 10 * 1024 * 1024 // 10 MB
    if (file.size > maxBytes) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10 MB.' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const type = detectAttachmentType(file.name, file.type)

    let extractedText = ''
    let preview: string | undefined

    if (type === 'image') {
      // Use Claude Vision to extract/describe requirements from the image
      const base64 = buffer.toString('base64')
      const mediaType = (file.type || 'image/png') as 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp'

      const msg = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 },
            },
            {
              type: 'text',
              text: `This image appears to be a software requirement, wireframe, user flow diagram, or design document.
Extract and describe ALL visible requirements, user actions, acceptance criteria, and business rules from this image.
Format as structured requirement text that a QA engineer can use to write test cases.
If it's a diagram or wireframe, describe each flow, state, and user interaction.
Be comprehensive — capture everything visible.`,
            },
          ],
        }],
      })

      extractedText = msg.content[0].type === 'text' ? msg.content[0].text : ''
      preview = `data:${file.type};base64,${base64.slice(0, 200)}` // Small preview hint

    } else if (type === 'pdf') {
      extractedText = await extractPdf(buffer)
    } else if (type === 'docx') {
      extractedText = await extractDocx(buffer)
    } else if (type === 'excel') {
      extractedText = await extractExcel(buffer)
    } else if (type === 'csv') {
      extractedText = extractCsv(buffer)
    } else {
      extractedText = extractTxt(buffer)
    }

    if (!extractedText.trim()) {
      return NextResponse.json({ error: 'Could not extract text from this file. Please try a different format.' }, { status: 422 })
    }

    return NextResponse.json({
      name: file.name,
      type,
      size: file.size,
      extractedText: extractedText.slice(0, 15000), // cap at 15k chars
      preview,
    })
  } catch (err) {
    console.error('Extract error:', err)
    return NextResponse.json({ error: 'Failed to process file. Please try again.' }, { status: 500 })
  }
}
