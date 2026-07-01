'use client'

import { useState, useEffect } from 'react'
import { X, ShieldCheck } from 'lucide-react'

const SESSION_KEY = 'qa_tool_disclaimer_dismissed'

export function DisclaimerBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!sessionStorage.getItem(SESSION_KEY)) setVisible(true)
  }, [])

  function dismiss() {
    sessionStorage.setItem(SESSION_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="w-full px-4 py-2.5 flex items-center gap-3 text-xs" style={{ background: 'rgba(99,102,241,0.08)', borderBottom: '1px solid rgba(99,102,241,0.2)' }}>
      <ShieldCheck size={14} className="text-[#818CF8] flex-shrink-0" />
      <p className="flex-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        <strong className="text-[#A5B4FC]">Privacy notice:</strong>{' '}
        This tool is a self-developed POC. No input data, credentials, or personal information is stored on any server — all processing is stateless and in-memory. Your content is sent only to{' '}
        <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" className="underline text-[#818CF8]">Anthropic&apos;s Claude API</a>
        {' '}for generation. AI output may contain errors — always verify before use.
      </p>
      <button onClick={dismiss} className="p-1 rounded transition-colors hover:bg-white/[0.1] flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
        <X size={14} />
      </button>
    </div>
  )
}
