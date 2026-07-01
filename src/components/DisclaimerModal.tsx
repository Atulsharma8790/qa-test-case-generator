'use client'

import { X, ShieldCheck, AlertTriangle, Info, Cpu, Lock } from 'lucide-react'

interface Props {
  onClose: () => void
}

const sections = [
  {
    icon: <ShieldCheck size={16} className="text-emerald-400" />,
    title: 'No Data Storage or Retention',
    body: `This tool does not store, log, cache, or persist any data you submit — including requirements, test cases, JIRA credentials, or any other input. All processing is stateless and in-memory. Once your browser session ends, nothing is retained on any server operated by this tool.`,
  },
  {
    icon: <Cpu size={16} className="text-[#6366F1]" />,
    title: 'Third-Party AI Processing (Anthropic Claude)',
    body: `To generate test cases, your input text is transmitted to Anthropic's Claude API over an encrypted HTTPS connection. Anthropic's own privacy policy and data processing terms apply to that transmission. This tool does not control how Anthropic processes API requests. Please review Anthropic's privacy policy at anthropic.com/privacy before submitting sensitive or confidential content.`,
  },
  {
    icon: <Lock size={16} className="text-[#06B6D4]" />,
    title: 'JIRA Credentials & API Tokens',
    body: `If you use the JIRA integration, your JIRA base URL, email, and API token are transmitted directly from your browser to your JIRA instance over HTTPS. These credentials are never sent to, stored by, or logged by this tool's backend servers. They exist only in your browser's memory for the duration of your session.`,
  },
  {
    icon: <AlertTriangle size={16} className="text-amber-400" />,
    title: 'AI Accuracy & Limitations',
    body: `AI-generated test cases, coverage suggestions, and outputs may contain errors, omissions, or hallucinations. All generated content should be reviewed and validated by a qualified QA professional before use in any production environment. This tool does not guarantee the completeness, accuracy, or suitability of its outputs for any specific purpose.`,
  },
  {
    icon: <Info size={16} className="text-[#8B5CF6]" />,
    title: 'Proof-of-Concept — Self-Developed Tool',
    body: `This is a personal proof-of-concept project built and maintained independently by Atul Sharma, a QA Automation Architect. It is provided free of charge for demonstration and educational purposes. It is not a commercially licensed software product. No SLA, uptime guarantee, or formal support is offered.`,
  },
  {
    icon: <AlertTriangle size={16} className="text-red-400" />,
    title: 'No Liability',
    body: `This tool is provided "as is" without warranty of any kind, express or implied. The developer shall not be liable for any direct, indirect, incidental, or consequential damages arising from the use of or inability to use this tool, including but not limited to damages from incorrect test cases, missed defects, JIRA upload failures, or data loss. Use this tool at your own risk.`,
  },
  {
    icon: <ShieldCheck size={16} className="text-emerald-400" />,
    title: 'No Personal Information Collection',
    body: `This tool does not collect, process, or store personally identifiable information (PII). No analytics, tracking cookies, or third-party monitoring services are used. The access passcode feature is a lightweight usage gate and does not constitute a security system — do not use sensitive or regulated data (HIPAA, GDPR-regulated, financial secrets) with this tool.`,
  },
]

export function DisclaimerModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl shadow-2xl animate-fade-in mb-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 rounded-t-2xl" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-card)' }}>
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#6366F1]" />
            <h2 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Disclaimer & Privacy Notice</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors hover:bg-white/[0.07]" style={{ color: 'var(--text-muted)' }}>
            <X size={16} />
          </button>
        </div>

        {/* Intro */}
        <div className="px-6 pt-5 pb-2">
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Please read this notice before using the <strong style={{ color: 'var(--text-primary)' }}>AI Test Case Generator</strong>. By using this tool you acknowledge and accept the terms below.
          </p>
        </div>

        {/* Sections */}
        <div className="px-6 pb-6 space-y-4 mt-3">
          {sections.map(s => (
            <div key={s.title} className="rounded-xl p-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center gap-2 mb-2">
                {s.icon}
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{s.title}</h3>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{s.body}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t rounded-b-2xl flex items-center justify-between gap-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-elevated)' }}>
          <p className="text-xs" style={{ color: 'var(--text-dimmer)' }}>
            Built by Atul Sharma · QA Automation Architect · POC Project
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-all"
            style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  )
}
