'use client'

import { Sparkles, Loader2, FileText, ChevronRight } from 'lucide-react'
import type { OutputFormat, TestDepth, CoverageScope } from '@/lib/types'

const EXAMPLES = [
  {
    label: 'User Login',
    text: `As a registered user, I want to log in to my account using my email and password so that I can access my personalised dashboard.

Acceptance Criteria:
- User can log in with valid email and password
- System shows an error for invalid credentials
- Account is locked after 5 failed attempts
- User can reset their password via email
- Session expires after 30 minutes of inactivity`,
  },
  {
    label: 'Payment Checkout',
    text: `As a customer, I want to complete a purchase using my saved credit card so that I can quickly check out without re-entering my payment details.

Acceptance Criteria:
- User can select a saved card from their wallet
- CVV re-entry is required for security
- Payment should be processed within 5 seconds
- A confirmation email is sent immediately after success
- Failed payments show a clear error with retry option
- 3DS authentication is triggered for transactions above £500`,
  },
  {
    label: 'File Upload',
    text: `Story: Upload profile photo
As a user, I want to upload a profile photo so my colleagues can recognise me.

Constraints:
- Accepted formats: JPG, PNG, WebP
- Max file size: 5MB
- Image should be auto-cropped to 1:1 ratio
- Uploaded image should appear immediately without page reload
- Old photo should be replaced, not stacked`,
  },
]

interface Props {
  input: string
  setInput: (v: string) => void
  format: OutputFormat
  setFormat: (v: OutputFormat) => void
  depth: TestDepth
  setDepth: (v: TestDepth) => void
  coverage: CoverageScope
  setCoverage: (v: CoverageScope) => void
  loading: boolean
  error: string | null
  onGenerate: () => void
}

export function InputPanel({
  input, setInput,
  format, setFormat,
  depth, setDepth,
  coverage, setCoverage,
  loading, error, onGenerate,
}: Props) {
  const canSubmit = input.trim().length >= 20 && !loading

  return (
    <div className="max-w-[900px] mx-auto">
      {/* Hero text */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#6366F1]/10 border border-[#6366F1]/20 text-[#A5B4FC] text-xs font-medium mb-5">
          <Sparkles size={12} className="text-[#6366F1]" />
          Powered by Claude AI · Built for QA Engineers
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
          Requirements in.{' '}
          <span className="bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#06B6D4] bg-clip-text text-transparent">
            Test cases out.
          </span>
        </h1>
        <p className="text-[#7B8FA8] text-lg max-w-xl mx-auto">
          Paste a JIRA ticket, user story, or acceptance criteria — get a complete, structured test suite in seconds.
        </p>
      </div>

      {/* Main card */}
      <div className="rounded-2xl bg-[#12121E] border border-white/[0.08] overflow-hidden">
        {/* Input area */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-white flex items-center gap-2">
              <FileText size={15} className="text-[#6366F1]" />
              Requirement / User Story
            </label>
            <span className="text-xs text-[#6B7F96]">{input.length} chars</span>
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Paste your JIRA ticket, user story, acceptance criteria, or feature description here…"
            rows={9}
            className="w-full bg-[#0A0A0F] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-[#4A5568] resize-none focus:outline-none focus:border-[#6366F1]/50 transition-colors leading-relaxed"
          />
          {/* Quick examples */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-xs text-[#6B7F96]">Try an example:</span>
            {EXAMPLES.map(ex => (
              <button
                key={ex.label}
                onClick={() => setInput(ex.text)}
                className="text-xs px-2.5 py-1 rounded-lg bg-[#1E1E2E] border border-white/[0.07] text-[#94A3B8] hover:text-white hover:border-[#6366F1]/40 transition-all"
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        {/* Config bar */}
        <div className="border-t border-white/[0.06] bg-[#0D0D18] px-6 py-5">
          <div className="grid sm:grid-cols-3 gap-5">
            {/* Output format */}
            <div>
              <p className="text-xs font-semibold text-[#7B8FA8] uppercase tracking-wider mb-2.5">Output Format</p>
              <div className="flex flex-col gap-1.5">
                {([
                  ['gherkin', 'BDD Gherkin', 'Given / When / Then'],
                  ['plain', 'Plain English', 'Numbered steps'],
                  ['both', 'Both', 'Gherkin + steps'],
                ] as const).map(([val, label, sub]) => (
                  <button
                    key={val}
                    onClick={() => setFormat(val)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all"
                    style={{
                      background: format === val ? 'rgba(99,102,241,0.12)' : 'transparent',
                      border: `1px solid ${format === val ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.06)'}`,
                    }}
                  >
                    <div className="w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 transition-colors" style={{ borderColor: format === val ? '#6366F1' : '#3D4663', background: format === val ? '#6366F1' : 'transparent' }} />
                    <div>
                      <span className="text-xs font-medium text-white">{label}</span>
                      <span className="text-xs text-[#6B7F96] ml-1.5">{sub}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Depth */}
            <div>
              <p className="text-xs font-semibold text-[#7B8FA8] uppercase tracking-wider mb-2.5">Test Depth</p>
              <div className="flex flex-col gap-1.5">
                {([
                  ['quick', 'Quick', '4–6 test cases'],
                  ['standard', 'Standard', '8–12 test cases'],
                  ['thorough', 'Thorough', '14–20 test cases'],
                ] as const).map(([val, label, sub]) => (
                  <button
                    key={val}
                    onClick={() => setDepth(val)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all"
                    style={{
                      background: depth === val ? 'rgba(139,92,246,0.12)' : 'transparent',
                      border: `1px solid ${depth === val ? 'rgba(139,92,246,0.35)' : 'rgba(255,255,255,0.06)'}`,
                    }}
                  >
                    <div className="w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 transition-colors" style={{ borderColor: depth === val ? '#8B5CF6' : '#3D4663', background: depth === val ? '#8B5CF6' : 'transparent' }} />
                    <div>
                      <span className="text-xs font-medium text-white">{label}</span>
                      <span className="text-xs text-[#6B7F96] ml-1.5">{sub}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Coverage */}
            <div>
              <p className="text-xs font-semibold text-[#7B8FA8] uppercase tracking-wider mb-2.5">Coverage Scope</p>
              <div className="flex flex-col gap-1.5">
                {([
                  ['positive', 'Happy Path', 'Valid scenarios only'],
                  ['positive-negative', 'Pos + Negative', 'Valid & invalid inputs'],
                  ['full', 'Full Coverage', '+ Edge & boundary'],
                ] as const).map(([val, label, sub]) => (
                  <button
                    key={val}
                    onClick={() => setCoverage(val)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all"
                    style={{
                      background: coverage === val ? 'rgba(6,182,212,0.1)' : 'transparent',
                      border: `1px solid ${coverage === val ? 'rgba(6,182,212,0.35)' : 'rgba(255,255,255,0.06)'}`,
                    }}
                  >
                    <div className="w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 transition-colors" style={{ borderColor: coverage === val ? '#06B6D4' : '#3D4663', background: coverage === val ? '#06B6D4' : 'transparent' }} />
                    <div>
                      <span className="text-xs font-medium text-white">{label}</span>
                      <span className="text-xs text-[#6B7F96] ml-1.5">{sub}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Generate button */}
        <div className="border-t border-white/[0.06] px-6 py-4 flex items-center justify-between gap-4">
          {error && (
            <p className="text-sm text-red-400 flex-1">{error}</p>
          )}
          {!error && (
            <p className="text-xs text-[#6B7F96] flex-1">
              {input.trim().length < 20 && input.length > 0
                ? 'Add more detail for better results.'
                : input.length === 0
                ? 'Paste your requirement above to get started.'
                : `Generating in ${format === 'both' ? '~20' : '~12'}s with ${depth} depth…`}
            </p>
          )}
          <button
            onClick={onGenerate}
            disabled={!canSubmit}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: canSubmit ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : '#2D2D44',
              color: 'white',
              boxShadow: canSubmit ? '0 0 30px rgba(99,102,241,0.35)' : 'none',
            }}
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Sparkles size={15} />
                Generate Test Suite
                <ChevronRight size={15} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Feature chips */}
      <div className="flex flex-wrap justify-center gap-3 mt-8">
        {[
          'BDD Gherkin output',
          'Positive + negative coverage',
          'Edge & boundary cases',
          'Priority labelling',
          'Export as .feature file',
          'Copy to clipboard',
        ].map(f => (
          <span key={f} className="text-xs px-3 py-1.5 rounded-full bg-[#12121E] border border-white/[0.07] text-[#7B8FA8]">
            ✓ {f}
          </span>
        ))}
      </div>
    </div>
  )
}
