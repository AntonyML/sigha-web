export function formatColones(v: number | string): string {
  const n = typeof v === 'string' ? parseFloat(v.replace(/\./g, '').replace(',', '.')) : v
  if (!n && n !== 0) return ''
  return n.toLocaleString('es-CR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

export function parseColones(s: string): number {
  return parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0
}
