'use client'

import { Sparkles, ExternalLink, Sun, Moon, Lock, Unlock } from 'lucide-react'
import { useTheme } from '@/context/theme'
import { useAuth } from '@/context/auth'
import { PORTFOLIO_URL } from '@/lib/config'

interface Props {
  onShowPasscode?: () => void
  onLock?: () => void
}

export function Header({ onShowPasscode, onLock }: Props) {
  const { theme, toggle } = useTheme()
  const { isUnlocked, lock } = useAuth()
  function handleLock() { lock(); onLock?.() }

  return (
    <header
      className="border-b backdrop-blur-xl sticky top-0 z-50 transition-colors"
      style={{ background: 'var(--bg-app)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#06B6D4] flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <div>
            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>AI Test Case Generator</span>
            <span className="hidden sm:inline text-xs ml-2" style={{ color: 'var(--text-dimmer)' }}>· by Atul Sharma</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={PORTFOLIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs transition-colors hover:text-white"
            style={{ color: 'var(--text-muted)' }}
          >
            Portfolio
            <ExternalLink size={11} />
          </a>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:bg-white/[0.08]"
            style={{ color: 'var(--text-muted)' }}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Lock / unlock indicator */}
          {isUnlocked ? (
            <button onClick={handleLock} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold" style={{ background: 'rgba(16,185,129,0.15)', color: '#6EE7B7', border: '2px solid rgba(16,185,129,0.5)' }}>
              <Unlock size={14} /> Unlocked
            </button>
          ) : (
            <button onClick={onShowPasscode} className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#DC2626,#EF4444)', boxShadow: '0 0 12px rgba(239,68,68,0.4)' }}>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-400 animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500" />
              <Lock size={14} /> Locked
            </button>
          )}

          <a
            href="https://github.com/atulsharma8790/qa-test-case-generator"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-white text-xs font-medium transition-all hover:bg-white/[0.1]"
            style={{ background: 'var(--bg-chip)', borderColor: 'var(--border-default)' }}
          >
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            GitHub
          </a>
        </div>
      </div>
    </header>
  )
}
