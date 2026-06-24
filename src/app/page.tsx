'use client'

import { useState } from 'react'
import type { OutputFormat, TestDepth, CoverageScope, GenerateResult } from '@/lib/types'
import { Header } from '@/components/Header'
import { InputPanel } from '@/components/InputPanel'
import { OutputPanel } from '@/components/OutputPanel'

export default function Home() {
  const [input, setInput] = useState('')
  const [format, setFormat] = useState<OutputFormat>('gherkin')
  const [depth, setDepth] = useState<TestDepth>('standard')
  const [coverage, setCoverage] = useState<CoverageScope>('positive-negative')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GenerateResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    if (!input.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, format, depth, coverage }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.')
      } else {
        setResult(data)
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setResult(null)
    setError(null)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-8 lg:py-12">
        {!result ? (
          <InputPanel
            input={input}
            setInput={setInput}
            format={format}
            setFormat={setFormat}
            depth={depth}
            setDepth={setDepth}
            coverage={coverage}
            setCoverage={setCoverage}
            loading={loading}
            error={error}
            onGenerate={handleGenerate}
          />
        ) : (
          <OutputPanel
            result={result}
            format={format}
            onBack={handleReset}
            onRegenerate={handleGenerate}
            loading={loading}
          />
        )}
      </main>

      <footer className="border-t border-white/[0.06] py-5">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#6B7F96]">
            Built by{' '}
            <a href="https://atulsharma8790.github.io" target="_blank" rel="noopener noreferrer" className="text-[#6366F1] hover:text-[#818CF8] transition-colors">
              Atul Sharma
            </a>
            {' '}· QA Automation Architect
          </p>
          <p className="text-xs text-[#6B7F96]">Powered by Claude AI · Open source on GitHub</p>
        </div>
      </footer>
    </div>
  )
}
