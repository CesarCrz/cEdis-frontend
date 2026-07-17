export type PrintFormat = 'full' | 'mini-80' | 'mini-58'

const FORMAT_LABELS: Record<PrintFormat, string> = {
  'full': 'Impresora normal',
  'mini-80': 'Mini printer 80mm',
  'mini-58': 'Mini printer 58mm',
}

export const PRINT_FORMAT_OPTIONS: { value: PrintFormat; label: string }[] = [
  { value: 'full', label: FORMAT_LABELS['full'] },
  { value: 'mini-80', label: FORMAT_LABELS['mini-80'] },
  { value: 'mini-58', label: FORMAT_LABELS['mini-58'] },
]

export function printWithFormat(format: PrintFormat = 'full') {
  const existingStyle = document.getElementById('__cedis_print_format')
  if (existingStyle) existingStyle.remove()

  const style = document.createElement('style')
  style.id = '__cedis_print_format'

  if (format === 'mini-80' || format === 'mini-58') {
    const width = format === 'mini-58' ? '58mm' : '80mm'
    style.textContent = `
      @page {
        size: ${width} auto;
        margin: 3mm 2mm;
      }
      body, body * {
        font-size: 7.5pt !important;
        line-height: 1.3 !important;
      }
      .print-mini-hide {
        display: none !important;
      }
      table {
        width: 100% !important;
        border-collapse: collapse !important;
      }
      td, th {
        padding: 1.5mm 1mm !important;
        word-break: break-word !important;
      }
      .print-mini-stack {
        display: block !important;
      }
      .print-mini-stack > * {
        display: block !important;
        width: 100% !important;
      }
    `
  }

  document.head.appendChild(style)

  const cleanup = () => {
    style.remove()
    window.removeEventListener('afterprint', cleanup)
  }
  window.addEventListener('afterprint', cleanup)

  window.print()
}
