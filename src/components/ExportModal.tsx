'use client'

import { useState } from 'react'
import { X, Download, FileText, Table, Code, FileDown, CheckSquare, Square, Info } from 'lucide-react'
import type { GenerateResult, ExportColumn, ExportFormat } from '@/lib/types'
import { DEFAULT_COLUMNS, buildFeatureFile, buildCsv, buildTxt, buildXrayXml } from '@/lib/exportBuilders'
import { useAuth } from '@/context/auth'

const FORMAT_OPTIONS: Array<{ id: ExportFormat; label: string; desc: string; icon: React.ReactNode; badge?: string }> = [
  { id: 'excel',    label: 'Excel (.xlsx)',        desc: 'JIRA-ready, 3 sheets: test cases, summary, import guide', icon: <Table size={15} className="text-emerald-400" />, badge: 'Recommended' },
  { id: 'csv',      label: 'CSV (JIRA Import)',     desc: 'Direct JIRA bulk import via Project Settings → Import',   icon: <Table size={15} className="text-blue-400" />,    badge: 'Firewall Safe' },
  { id: 'feature',  label: 'Feature File (.feature)', desc: 'BDD Gherkin format for Cucumber/Behave/Pytest-BDD',    icon: <Code size={15} className="text-purple-400" /> },
  { id: 'xray-xml', label: 'Xray XML',             desc: 'Import directly into Xray for JIRA test management',     icon: <FileText size={15} className="text-orange-400" /> },
  { id: 'txt',      label: 'Plain Text',            desc: 'Human-readable format for docs, wikis, or email',        icon: <FileDown size={15} className="text-[#7B8FA8]" /> },
]

interface Props {
  result: GenerateResult
  onClose: () => void
  onNeedAuth: () => void
}

export function ExportModal({ result, onClose, onNeedAuth }: Props) {
  const { isUnlocked, getHeaders } = useAuth()
  const [format, setFormat] = useState<ExportFormat>('excel')
  const [columns, setColumns] = useState<ExportColumn[]>(DEFAULT_COLUMNS)
  const [parentKey, setParentKey] = useState('')
  const [projectKey, setProjectKey] = useState('')
  const [downloading, setDownloading] = useState(false)

  function toggleColumn(key: string) {
    setColumns(prev => prev.map(c => c.key === key && !c.required ? { ...c, enabled: !c.enabled } : c))
  }

  async function handleDownload() {
    if (format === 'excel' && !isUnlocked) { onNeedAuth(); return }
    setDownloading(true)
    try {
      const enabled = columns.filter(c => c.enabled)
      const filename = result.suiteName.toLowerCase().replace(/\s+/g, '-')

      if (format === 'excel') {
        const res = await fetch('/api/export/excel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getHeaders() },
          body: JSON.stringify({ result, columns: enabled, parentKey }),
        })
        if (res.status === 401) { onNeedAuth(); return }
        const blob = await res.blob()
        download(blob, `${filename}-test-cases.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

      } else if (format === 'csv') {
        const csv = buildCsv(result, enabled, parentKey)
        download(new Blob([csv], { type: 'text/csv' }), `${filename}-jira-import.csv`, 'text/csv')

      } else if (format === 'feature') {
        const text = buildFeatureFile(result, parentKey)
        download(new Blob([text], { type: 'text/plain' }), `${filename}.feature`, 'text/plain')

      } else if (format === 'xray-xml') {
        const xml = buildXrayXml(result, projectKey || 'PROJ', parentKey)
        download(new Blob([xml], { type: 'application/xml' }), `${filename}-xray.xml`, 'application/xml')

      } else {
        const text = buildTxt(result, parentKey)
        download(new Blob([text], { type: 'text/plain' }), `${filename}-test-cases.txt`, 'text/plain')
      }
    } finally {
      setDownloading(false)
    }
  }

  function download(blob: Blob, filename: string, type: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const showColumnSelector = format === 'excel' || format === 'csv'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-[780px] max-h-[90vh] overflow-y-auto rounded-2xl bg-[#12121E] border border-white/[0.1] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07] sticky top-0 bg-[#12121E] z-10">
          <div>
            <h2 className="text-white font-bold text-lg">Export Test Suite</h2>
            <p className="text-[#6B7F96] text-xs mt-0.5">{result.testCases.length} test cases · {result.suiteName}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-[#6B7F96] hover:text-white hover:bg-white/[0.06] transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Traceability */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#7B8FA8] uppercase tracking-wider block mb-2">
                Parent Story Key <span className="text-[#6B7F96] normal-case font-normal">(for traceability)</span>
              </label>
              <input
                value={parentKey}
                onChange={e => setParentKey(e.target.value.toUpperCase())}
                placeholder="e.g. PROJ-123"
                className="w-full rounded-lg px-3 py-2 text-sm font-mono focus:outline-none transition-colors" style={{ background: "var(--bg-app)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
              />
              <p className="text-xs text-[#6B7F96] mt-1">Added as a column + used in JIRA link creation</p>
            </div>
            {(format === 'xray-xml') && (
              <div>
                <label className="text-xs font-semibold text-[#7B8FA8] uppercase tracking-wider block mb-2">JIRA Project Key</label>
                <input
                  value={projectKey}
                  onChange={e => setProjectKey(e.target.value.toUpperCase())}
                  placeholder="e.g. PROJ"
                  className="w-full rounded-lg px-3 py-2 text-sm font-mono focus:outline-none transition-colors" style={{ background: "var(--bg-app)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                />
              </div>
            )}
          </div>

          {/* Format selector */}
          <div>
            <p className="text-xs font-semibold text-[#7B8FA8] uppercase tracking-wider mb-3">Export Format</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {FORMAT_OPTIONS.map(f => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className="relative text-left px-4 py-3 rounded-xl transition-all"
                  style={{
                    background: format === f.id ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${format === f.id ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.07)'}`,
                  }}
                >
                  {f.badge && (
                    <span className="absolute top-2 right-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/25">
                      {f.badge}
                    </span>
                  )}
                  <div className="flex items-center gap-2 mb-1">
                    {f.icon}
                    <span className="text-sm font-medium text-white">{f.label}</span>
                  </div>
                  <p className="text-xs text-[#6B7F96] leading-relaxed pr-12">{f.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Column selector (Excel & CSV only) */}
          {showColumnSelector && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-[#7B8FA8] uppercase tracking-wider">Column Selection</p>
                <div className="flex gap-3">
                  <button onClick={() => setColumns(prev => prev.map(c => ({ ...c, enabled: true })))} className="text-xs text-[#6366F1] hover:text-white transition-colors">All</button>
                  <button onClick={() => setColumns(prev => prev.map(c => ({ ...c, enabled: !!c.required })))} className="text-xs text-[#6B7F96] hover:text-white transition-colors">Required only</button>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-1.5">
                {columns.map(col => (
                  <button
                    key={col.key}
                    onClick={() => toggleColumn(col.key)}
                    disabled={col.required}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all disabled:opacity-60"
                    style={{
                      background: col.enabled ? 'rgba(99,102,241,0.08)' : 'transparent',
                      border: `1px solid ${col.enabled ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.06)'}`,
                    }}
                  >
                    {col.enabled
                      ? <CheckSquare size={14} className="text-[#6366F1] flex-shrink-0" />
                      : <Square size={14} className="text-[#4A5568] flex-shrink-0" />
                    }
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-white block">{col.label}</span>
                      <span className="text-xs text-[#6B7F96] truncate block">{col.jiraField}</span>
                    </div>
                    {col.required && <span className="text-[10px] text-[#6B7F96] ml-auto flex-shrink-0">required</span>}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex items-start gap-2 px-3 py-2.5 rounded-lg bg-[#0A0A0F] border border-white/[0.06]">
                <Info size={13} className="text-[#6366F1] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-[#6B7F96]">
                  Column headers in the export match JIRA field names for direct bulk import.
                  For custom fields, map them in the JIRA import wizard.
                </p>
              </div>
            </div>
          )}

          {/* Firewall note */}
          {(format === 'csv' || format === 'excel') && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-emerald-500/[0.07] border border-emerald-500/20">
              <span className="text-emerald-400 mt-0.5 flex-shrink-0">🔒</span>
              <div>
                <p className="text-sm font-semibold text-emerald-300 mb-1">Enterprise Firewall Workaround</p>
                <p className="text-xs text-[#7B8FA8] leading-relaxed">
                  No JIRA connection needed. Download this file, then go to your JIRA instance:
                  <strong className="text-white"> Project Settings → Issue Import → Import from CSV</strong>.
                  Upload the file, map columns, and your test cases are imported — works behind any firewall.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.07] flex items-center justify-between gap-4 sticky bottom-0 bg-[#12121E]">
          <p className="text-xs text-[#6B7F96]">
            {columns.filter(c => c.enabled).length} columns selected · {result.testCases.length} test cases
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-[#7B8FA8] hover:text-white transition-colors">Cancel</button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#6366F1] hover:bg-[#4F46E5] text-white text-sm font-medium transition-all disabled:opacity-60"
            >
              <Download size={14} />
              {downloading ? 'Generating…' : `Download ${FORMAT_OPTIONS.find(f => f.id === format)?.label}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
