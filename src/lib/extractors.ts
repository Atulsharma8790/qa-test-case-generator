import type { AttachmentType } from './types'

export function detectAttachmentType(filename: string, mime: string): AttachmentType {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  if (mime.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'].includes(ext)) return 'image'
  if (mime === 'application/pdf' || ext === 'pdf') return 'pdf'
  if (mime.includes('wordprocessingml') || ext === 'docx') return 'docx'
  if (mime.includes('spreadsheetml') || mime.includes('excel') || ext === 'xlsx') return 'excel'
  if (mime === 'text/csv' || ext === 'csv') return 'csv'
  return 'txt'
}

export async function extractPdf(buffer: Buffer): Promise<string> {
  // Lazy import to avoid build-time issues
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require('pdf-parse') as (b: Buffer) => Promise<{ text: string }>
  const data = await pdfParse(buffer)
  return data.text.trim()
}

export async function extractDocx(buffer: Buffer): Promise<string> {
  const mammoth = await import('mammoth')
  const result = await mammoth.extractRawText({ buffer })
  return result.value.trim()
}

export async function extractExcel(buffer: Buffer): Promise<string> {
  const XLSX = await import('xlsx')
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const lines: string[] = []
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]
    const csv = XLSX.utils.sheet_to_csv(sheet)
    if (csv.trim()) {
      lines.push(`=== Sheet: ${sheetName} ===`)
      lines.push(csv)
    }
  }
  return lines.join('\n\n').trim()
}

export function extractCsv(buffer: Buffer): string {
  return buffer.toString('utf-8').trim()
}

export function extractTxt(buffer: Buffer): string {
  return buffer.toString('utf-8').trim()
}
