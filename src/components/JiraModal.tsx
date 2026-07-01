'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Loader2, ExternalLink, Upload, Link } from 'lucide-react'
import type { JiraConfig, JiraProject, JiraLinkType, JiraUploadResult, GenerateResult } from '@/lib/types'
import { useAuth } from '@/context/auth'

const DEFAULT_CONFIG: JiraConfig = {
  baseUrl: '',
  email: '',
  apiToken: '',
  authType: 'basic',
  projectKey: '',
  issueType: 'Task',
  parentKey: '',
  linkType: 'Relates',
  componentName: '',
  labels: [],
}

type Step = 'connect' | 'configure' | 'upload' | 'done'

interface Props {
  result: GenerateResult
  onClose: () => void
  onNeedAuth: () => void
}

export function JiraModal({ result, onClose, onNeedAuth }: Props) {
  const { isUnlocked, getHeaders } = useAuth()
  const [step, setStep] = useState<Step>('connect')
  const [config, setConfig] = useState<JiraConfig>(DEFAULT_CONFIG)
  const [testing, setTesting] = useState(false)
  const [connectedUser, setConnectedUser] = useState<{ name: string; email: string } | null>(null)
  const [connError, setConnError] = useState('')
  const [projects, setProjects] = useState<JiraProject[]>([])
  const [linkTypes, setLinkTypes] = useState<JiraLinkType[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResults, setUploadResults] = useState<JiraUploadResult[]>([])
  const [uploadError, setUploadError] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(result.testCases.map(tc => tc.id)))
  const [priorityMap, setPriorityMap] = useState<Record<string, string>>({
    critical: 'Blocker', high: 'High', medium: 'Medium', low: 'Low',
  })

  function update(key: keyof JiraConfig, val: string) {
    setConfig(prev => ({ ...prev, [key]: val }))
  }

  async function jiraAction(action: string, extra: object = {}) {
    if (!isUnlocked) { onNeedAuth(); throw new Error('auth_required') }
    const res = await fetch('/api/jira', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getHeaders() },
      body: JSON.stringify({ action, config, ...extra }),
    })
    if (res.status === 401) { onNeedAuth(); throw new Error('auth_required') }
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'Request failed')
    return data
  }

  async function testConnection() {
    setTesting(true)
    setConnError('')
    try {
      const data = await jiraAction('test')
      setConnectedUser(data.user)
      const [proj, links] = await Promise.all([
        jiraAction('projects'),
        jiraAction('link-types'),
      ])
      setProjects(proj.projects)
      setLinkTypes(links.linkTypes)
      setStep('configure')
    } catch (e: unknown) {
      if (e instanceof Error && e.message === 'auth_required') return
      setConnError(e instanceof Error ? e.message : 'Connection failed')
    } finally {
      setTesting(false)
    }
  }

  async function handleUpload() {
    setUploading(true)
    setUploadError('')
    setUploadProgress(0)
    const toUpload = result.testCases.filter(tc => selectedIds.has(tc.id))

    try {
      // Upload in batches of 5, polling progress
      const batchSize = 5
      const allResults: JiraUploadResult[] = []

      for (let i = 0; i < toUpload.length; i += batchSize) {
        const batch = toUpload.slice(i, i + batchSize)
        const data = await jiraAction('upload', {
          testCases: batch,
          suiteName: result.suiteName,
          priorityMap,
        })
        allResults.push(...data.results)
        setUploadProgress(Math.round(((i + batch.length) / toUpload.length) * 100))
      }

      setUploadResults(allResults)
      setStep('done')
    } catch (e: unknown) {
      if (e instanceof Error && e.message === 'auth_required') return
      setUploadError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const toggleAll = () => {
    if (selectedIds.size === result.testCases.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(result.testCases.map(tc => tc.id)))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-[720px] max-h-[90vh] overflow-y-auto rounded-2xl bg-[#12121E] border border-white/[0.1] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0052CC]/20 border border-[#0052CC]/30 flex items-center justify-center">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="#2684FF">
                <path d="M11.53 2c-.13 0-.26.07-.34.18L6.43 8.51a.42.42 0 0 0 0 .47l5.1 7.86c.17.27.55.27.72 0l5.1-7.86a.42.42 0 0 0 0-.47L12.27 2.18A.4.4 0 0 0 11.93 2h-.4zm0 3.28l3.6 5.55-3.6 5.55-3.6-5.55 3.6-5.55zm.4 8.72c-.13 0-.26.07-.34.18l-4.76 7.33c-.17.27 0 .62.34.62h9.52c.34 0 .51-.35.34-.62l-4.76-7.33a.4.4 0 0 0-.34-.18z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-white font-bold text-base">Upload to JIRA</h2>
              <p className="text-[#6B7F96] text-xs">{result.testCases.length} test cases · {result.suiteName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-[#6B7F96] hover:text-white hover:bg-white/[0.06] transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-0 px-6 pt-4 pb-2">
          {(['connect', 'configure', 'upload', 'done'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={{
                    background: step === s ? '#6366F1' : ['connect', 'configure', 'upload', 'done'].indexOf(step) > i ? '#10B981' : '#1E1E2E',
                    color: 'white',
                  }}
                >
                  {['connect', 'configure', 'upload', 'done'].indexOf(step) > i ? '✓' : i + 1}
                </div>
                <span className="text-xs font-medium capitalize" style={{ color: step === s ? 'white' : '#6B7F96' }}>{s}</span>
              </div>
              {i < 3 && <div className="w-8 h-px bg-white/[0.1] mx-2" />}
            </div>
          ))}
        </div>

        <div className="p-6 space-y-5">
          {/* Step 1: Connect */}
          {step === 'connect' && (
            <div className="space-y-4">
              {/* Auth type */}
              <div className="flex gap-2">
                {(['basic', 'pat'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => update('authType', t)}
                    className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: config.authType === t ? 'rgba(99,102,241,0.12)' : 'transparent',
                      border: `1px solid ${config.authType === t ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.07)'}`,
                      color: config.authType === t ? 'white' : '#7B8FA8',
                    }}
                  >
                    {t === 'basic' ? 'Cloud (Email + API Token)' : 'Server/DC (PAT)'}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs font-semibold text-[#7B8FA8] uppercase tracking-wider block mb-1.5">JIRA Base URL</label>
                <input value={config.baseUrl} onChange={e => update('baseUrl', e.target.value)}
                  placeholder={config.authType === 'basic' ? 'https://yourcompany.atlassian.net' : 'https://jira.yourcompany.com'}
                  className="w-full rounded-lg px-3 py-2 text-sm font-mono focus:outline-none transition-colors input-themed"
                />
              </div>

              {config.authType === 'basic' && (
                <div>
                  <label className="text-xs font-semibold text-[#7B8FA8] uppercase tracking-wider block mb-1.5">Email</label>
                  <input value={config.email} onChange={e => update('email', e.target.value)}
                    placeholder="you@company.com"
                    className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors input-themed"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-[#7B8FA8] uppercase tracking-wider block mb-1.5">
                  {config.authType === 'basic' ? 'API Token' : 'Personal Access Token (PAT)'}
                </label>
                <input value={config.apiToken} onChange={e => update('apiToken', e.target.value)}
                  type="password" placeholder="••••••••••••••••"
                  className="w-full rounded-lg px-3 py-2 text-sm font-mono focus:outline-none transition-colors input-themed"
                />
                <p className="text-xs text-[#6B7F96] mt-1">
                  {config.authType === 'basic'
                    ? <>Generate at <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" rel="noopener noreferrer" className="text-[#6366F1] hover:underline">id.atlassian.com → API tokens</a></>
                    : 'Generate in JIRA: Profile → Personal Access Tokens → Create token'
                  }
                </p>
              </div>

              {connError && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-500/[0.08] border border-red-500/20">
                  <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300">{connError}</p>
                </div>
              )}

              <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[#F59E0B]/[0.06] border border-[#F59E0B]/20">
                <span className="text-[#F59E0B] mt-0.5 flex-shrink-0">⚡</span>
                <p className="text-xs text-[#7B8FA8]">
                  <strong className="text-white">Behind a firewall?</strong> Close this and use the <strong className="text-white">Export → CSV or Excel</strong> option instead.
                  Download the file and import it via <strong className="text-white">JIRA Project Settings → Import Issues → CSV</strong> — no network connection to JIRA required from this tool.
                </p>
              </div>

              <button onClick={testConnection} disabled={testing || !config.baseUrl || !config.apiToken}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold text-sm transition-all disabled:opacity-50"
              >
                {testing ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
                {testing ? 'Testing connection…' : 'Test Connection & Continue'}
              </button>
            </div>
          )}

          {/* Step 2: Configure */}
          {step === 'configure' && connectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-500/[0.08] border border-emerald-500/20">
                <CheckCircle size={13} className="text-emerald-400" />
                <p className="text-xs text-emerald-300">Connected as <strong>{connectedUser.name}</strong> ({connectedUser.email})</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#7B8FA8] uppercase tracking-wider block mb-1.5">Project</label>
                  <select value={config.projectKey} onChange={e => update('projectKey', e.target.value)}
                    className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors input-themed"
                  >
                    <option value="">Select project…</option>
                    {projects.map(p => <option key={p.key} value={p.key}>{p.key} — {p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#7B8FA8] uppercase tracking-wider block mb-1.5">Issue Type</label>
                  <input value={config.issueType} onChange={e => update('issueType', e.target.value)}
                    placeholder="Test / Task / Story / Sub-task"
                    className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors input-themed"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#7B8FA8] uppercase tracking-wider block mb-1.5">
                    Parent Story Key <span className="normal-case font-normal text-[#6B7F96]">(traceability)</span>
                  </label>
                  <input value={config.parentKey} onChange={e => update('parentKey', e.target.value.toUpperCase())}
                    placeholder="e.g. PROJ-123"
                    className="w-full rounded-lg px-3 py-2 text-sm font-mono focus:outline-none transition-colors input-themed"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#7B8FA8] uppercase tracking-wider block mb-1.5">Link Type</label>
                  <select value={config.linkType} onChange={e => update('linkType', e.target.value)}
                    className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors input-themed"
                  >
                    {linkTypes.map(lt => (
                      <option key={lt.id} value={lt.name}>{lt.name} ({lt.inward} / {lt.outward})</option>
                    ))}
                    <option value="Relates">Relates To</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#7B8FA8] uppercase tracking-wider block mb-1.5">Component <span className="normal-case font-normal text-[#6B7F96]">(optional)</span></label>
                  <input value={config.componentName ?? ''} onChange={e => update('componentName', e.target.value)}
                    placeholder="e.g. Authentication"
                    className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors input-themed"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#7B8FA8] uppercase tracking-wider block mb-1.5">Labels <span className="normal-case font-normal text-[#6B7F96]">(comma-separated)</span></label>
                  <input
                    value={config.labels?.join(', ') ?? ''}
                    onChange={e => setConfig(prev => ({ ...prev, labels: e.target.value.split(',').map(l => l.trim()).filter(Boolean) }))}
                    placeholder="ai-generated, regression"
                    className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors input-themed"
                  />
                </div>
              </div>

              {/* Priority mapping */}
              <div>
                <p className="text-xs font-semibold text-[#7B8FA8] uppercase tracking-wider mb-2">Priority Mapping</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(priorityMap).map(([our, jira]) => (
                    <div key={our} className="flex items-center gap-2">
                      <span className="text-xs text-[#94A3B8] w-14 flex-shrink-0 capitalize">{our}</span>
                      <span className="text-[#6B7F96] text-xs">→</span>
                      <input value={jira}
                        onChange={e => setPriorityMap(prev => ({ ...prev, [our]: e.target.value }))}
                        className="flex-1 rounded px-2 py-1 text-xs focus:outline-none input-themed"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => setStep('upload')} disabled={!config.projectKey}
                className="w-full py-2.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold text-sm transition-all disabled:opacity-50"
              >
                Review & Upload →
              </button>
            </div>
          )}

          {/* Step 3: Upload */}
          {step === 'upload' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-[#7B8FA8] uppercase tracking-wider">Select Test Cases to Upload</p>
                  <button onClick={toggleAll} className="text-xs text-[#6366F1] hover:text-white transition-colors">
                    {selectedIds.size === result.testCases.length ? 'Deselect all' : 'Select all'}
                  </button>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {result.testCases.map(tc => (
                    <label key={tc.id} className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-white/[0.03] transition-all">
                      <input type="checkbox" checked={selectedIds.has(tc.id)}
                        onChange={() => setSelectedIds(prev => {
                          const next = new Set(prev)
                          next.has(tc.id) ? next.delete(tc.id) : next.add(tc.id)
                          return next
                        })}
                        className="accent-[#6366F1]"
                      />
                      <span className="text-xs font-mono text-[#6B7F96] w-12 flex-shrink-0">{tc.id}</span>
                      <span className="text-sm text-white flex-1">{tc.title}</span>
                      <span className="text-xs text-[#7B8FA8]">{tc.priority}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-[#0A0A0F] border border-white/[0.06] p-4 space-y-1.5 text-xs text-[#7B8FA8]">
                <div className="flex justify-between"><span>Project</span><span className="text-white font-mono">{config.projectKey}</span></div>
                <div className="flex justify-between"><span>Issue Type</span><span className="text-white">{config.issueType}</span></div>
                <div className="flex justify-between"><span>Parent / Traceability</span><span className="text-white font-mono">{config.parentKey || 'None'}</span></div>
                <div className="flex justify-between"><span>Link Type</span><span className="text-white">{config.linkType}</span></div>
                <div className="flex justify-between"><span>Selected</span><span className="text-[#6366F1] font-semibold">{selectedIds.size} test cases</span></div>
              </div>

              {uploading && (
                <div>
                  <div className="flex justify-between text-xs text-[#6B7F96] mb-1.5">
                    <span>Uploading…</span><span>{uploadProgress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full rounded-full bg-[#6366F1] transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-500/[0.08] border border-red-500/20">
                  <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300">{uploadError}</p>
                </div>
              )}

              <button onClick={handleUpload} disabled={uploading || selectedIds.size === 0}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold text-sm transition-all disabled:opacity-50"
              >
                {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                {uploading ? `Uploading ${uploadProgress}%…` : `Upload ${selectedIds.size} Test Cases to JIRA`}
              </button>
            </div>
          )}

          {/* Step 4: Done */}
          {step === 'done' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20">
                <CheckCircle size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-emerald-300">{uploadResults.length} test cases uploaded successfully</p>
                  <p className="text-xs text-[#7B8FA8] mt-0.5">
                    {uploadResults.filter(r => r.linked).length} linked to {config.parentKey || 'parent story'}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {uploadResults.map(r => (
                  <div key={r.key} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#0A0A0F] border border-white/[0.06]">
                    <span className="text-xs font-mono font-bold text-[#6366F1] w-20 flex-shrink-0">{r.key}</span>
                    <span className="text-sm text-white flex-1 truncate">{r.title}</span>
                    {r.linked && <Link size={12} className="text-emerald-400 flex-shrink-0" />}
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-[#6B7F96] hover:text-white flex-shrink-0">
                      <ExternalLink size={12} />
                    </a>
                  </div>
                ))}
              </div>

              <button onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold text-sm transition-all"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
