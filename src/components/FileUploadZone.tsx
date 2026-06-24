'use client'

import { useRef, useState, DragEvent } from 'react'
import { Upload, FileText, Image, Table, X, Loader2, CheckCircle } from 'lucide-react'
import type { Attachment, AttachmentType } from '@/lib/types'

const ACCEPTED = '.pdf,.docx,.xlsx,.csv,.txt,.png,.jpg,.jpeg,.webp,.gif'

const typeIcon: Record<AttachmentType, React.ReactNode> = {
  pdf:   <FileText size={14} className="text-red-400" />,
  docx:  <FileText size={14} className="text-blue-400" />,
  excel: <Table size={14} className="text-emerald-400" />,
  csv:   <Table size={14} className="text-emerald-400" />,
  image: <Image size={14} className="text-purple-400" />,
  txt:   <FileText size={14} className="text-[#7B8FA8]" />,
}

const typeLabel: Record<AttachmentType, string> = {
  pdf: 'PDF', docx: 'Word', excel: 'Excel', csv: 'CSV', image: 'Image', txt: 'Text',
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface Props {
  attachments: Attachment[]
  onAdd: (a: Attachment) => void
  onRemove: (id: string) => void
}

export function FileUploadZone({ attachments, onAdd, onRemove }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState<string[]>([]) // file names currently uploading

  async function processFile(file: File) {
    if (uploading.includes(file.name)) return
    setUploading(prev => [...prev, file.name])

    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/extract', { method: 'POST', body: fd })
      const data = await res.json()

      if (!res.ok) {
        alert(`${file.name}: ${data.error}`)
        return
      }

      onAdd({
        id: `${Date.now()}-${Math.random()}`,
        name: data.name,
        type: data.type,
        size: data.size,
        extractedText: data.extractedText,
        preview: data.preview,
      })
    } catch {
      alert(`Failed to process ${file.name}. Please try again.`)
    } finally {
      setUploading(prev => prev.filter(n => n !== file.name))
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files) return
    Array.from(files).forEach(processFile)
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const isUploading = uploading.length > 0

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className="relative border-2 border-dashed rounded-xl px-4 py-5 text-center cursor-pointer transition-all duration-200"
        style={{
          borderColor: dragging ? '#6366F1' : 'rgba(255,255,255,0.12)',
          background: dragging ? 'rgba(99,102,241,0.06)' : 'transparent',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={ACCEPTED}
          multiple
          onChange={e => handleFiles(e.target.files)}
        />
        <div className="flex flex-col items-center gap-2">
          {isUploading ? (
            <Loader2 size={22} className="text-[#6366F1] animate-spin" />
          ) : (
            <Upload size={22} className="text-[#6B7F96]" />
          )}
          <div>
            <p className="text-sm text-white font-medium">
              {isUploading ? `Processing ${uploading[0]}…` : 'Attach requirement documents'}
            </p>
            <p className="text-xs text-[#6B7F96] mt-0.5">
              PDF, Word, Excel, CSV, images — or drag & drop
            </p>
          </div>
        </div>

        {/* Format badges */}
        <div className="flex flex-wrap justify-center gap-1.5 mt-3">
          {(['PDF', 'DOCX', 'XLSX', 'CSV', 'PNG/JPG'] as const).map(f => (
            <span key={f} className="text-xs px-2 py-0.5 rounded bg-[#1E1E2E] border border-white/[0.06] text-[#6B7F96]">{f}</span>
          ))}
        </div>
      </div>

      {/* Attached files */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map(a => (
            <div
              key={a.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#0D0D18] border border-white/[0.07]"
            >
              <div className="w-7 h-7 rounded-lg bg-[#1E1E2E] flex items-center justify-center flex-shrink-0">
                {typeIcon[a.type]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{a.name}</p>
                <p className="text-xs text-[#6B7F96]">
                  {typeLabel[a.type]} · {formatSize(a.size)} · {a.extractedText.split(/\s+/).length} words extracted
                </p>
              </div>
              <CheckCircle size={13} className="text-emerald-400 flex-shrink-0" />
              <button
                onClick={() => onRemove(a.id)}
                className="p-1 rounded-lg text-[#6B7F96] hover:text-red-400 hover:bg-red-400/10 transition-all flex-shrink-0"
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
