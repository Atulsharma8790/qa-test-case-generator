'use client'

import { useState, useRef, useEffect } from 'react'
import { Lock, Unlock, X, ExternalLink, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/auth'
import { PORTFOLIO_URL } from '@/lib/config'

interface Props {
  onClose: () => void
  onUnlocked?: () => void
}

export function PasscodeModal({ onClose, onUnlocked }: Props) {
  const { unlock } = useAuth()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return
    setLoading(true)
    setError('')
    const result = await unlock(code.trim())
    setLoading(false)
    if (result.ok) {
      onUnlocked?.()
      onClose()
    } else {
      setError(result.error ?? 'Invalid passcode. Please try again.')
      setCode('')
      inputRef.current?.focus()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-2xl p-6 animate-fade-in">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.07] transition-all"
        >
          <X size={16} />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6366F1]/20 to-[#8B5CF6]/20 border border-[#6366F1]/30 flex items-center justify-center">
            <Lock size={24} className="text-[#6366F1]" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-center text-lg font-bold text-[var(--text-primary)] mb-1">Access Required</h2>
        <p className="text-center text-sm text-[var(--text-muted)] mb-6 leading-relaxed">
          This tool uses a private AI API. Enter the passcode to unlock all features.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              ref={inputRef}
              type="password"
              value={code}
              onChange={e => { setCode(e.target.value); setError('') }}
              placeholder="Enter passcode…"
              autoComplete="off"
              className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors input-themed"
              style={{ borderColor: error ? '#EF4444' : 'var(--border-default)' }}
            />
            {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={!code.trim() || loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              color: 'white',
              boxShadow: code.trim() && !loading ? '0 0 24px rgba(99,102,241,0.4)' : 'none',
            }}
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Unlock size={15} />}
            {loading ? 'Verifying…' : 'Unlock Tool'}
          </button>
        </form>

        {/* Request access */}
        <div className="mt-5 pt-5 border-t border-[var(--border-subtle)]">
          <p className="text-center text-xs text-[var(--text-muted)]">
            Don&apos;t have the passcode?{' '}
            <a
              href={`${PORTFOLIO_URL}#contact`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#6366F1] hover:text-[#818CF8] transition-colors inline-flex items-center gap-0.5 font-medium"
            >
              Request access <ExternalLink size={10} />
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
