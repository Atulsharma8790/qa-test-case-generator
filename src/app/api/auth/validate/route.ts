import { NextRequest } from 'next/server'
import { verifyPasscode } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { code } = await req.json().catch(() => ({ code: '' }))
  if (verifyPasscode(code)) {
    return Response.json({ ok: true })
  }
  return Response.json({ error: 'Invalid passcode.' }, { status: 401 })
}
