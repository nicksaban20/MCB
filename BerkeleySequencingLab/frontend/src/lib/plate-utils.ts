export function wellIndexToLabel(idx: number): string {
  if (idx < 0 || idx > 95) return '?'
  const row = Math.floor(idx / 12)
  const col = idx % 12
  return `${String.fromCharCode(65 + row)}${col + 1}`
}

export function wellLabelToIndex(label: string): number | null {
  const m = /^([A-H])\s*(\d{1,2})$/i.exec(label.trim())
  if (!m) return null
  const row = m[1].toUpperCase().charCodeAt(0) - 65
  const col = parseInt(m[2], 10) - 1
  if (row < 0 || row > 7 || col < 0 || col > 11) return null
  return row * 12 + col
}
