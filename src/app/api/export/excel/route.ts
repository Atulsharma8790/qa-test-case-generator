export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { buildExcel } from '@/lib/exportBuilders'
import { verifyPasscode, unauthorizedResponse } from '@/lib/auth'
import type { GenerateResult, ExportColumn } from '@/lib/types'

export async function POST(req: NextRequest) {
  if (!verifyPasscode(req.headers.get('x-access-code'))) return unauthorizedResponse()
  try {
    const { result, columns, parentKey } = await req.json() as {
      result: GenerateResult
      columns: ExportColumn[]
      parentKey: string
    }

    const enabled = columns.filter(c => c.enabled)
    const buffer = await buildExcel(result, enabled, parentKey)

    const filename = `${result.suiteName.toLowerCase().replace(/\s+/g, '-')}-test-cases.xlsx`

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err) {
    console.error('Excel export error:', err)
    return NextResponse.json({ error: 'Failed to generate Excel file.' }, { status: 500 })
  }
}
