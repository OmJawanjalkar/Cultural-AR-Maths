/**
 * Export helpers for CSV and PDF report generation.
 */

// ── CSV ────────────────────────────────────────────────────────────────────

/**
 * Convert an array of objects to a CSV string.
 * @param {Object[]} rows
 * @param {string[]} columns - header keys
 * @param {string[]} [labels] - optional display labels (same order as columns)
 */
export function toCSV(rows, columns, labels) {
  const headers = labels || columns
  const escape = (val) => {
    const str = val === null || val === undefined ? '' : String(val)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const headerRow = headers.map(escape).join(',')
  const dataRows = rows.map((row) =>
    columns.map((col) => escape(row[col])).join(',')
  )
  return [headerRow, ...dataRows].join('\n')
}

/**
 * Trigger a CSV file download in the browser.
 * @param {string} csvContent
 * @param {string} filename
 */
export function downloadCSV(csvContent, filename = 'report.csv') {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Generate and download a class report CSV.
 * @param {Object[]} students
 * @param {string} className
 * @param {{ from: string, to: string }} dateRange
 */
export function downloadClassReportCSV(students, className = 'Class', dateRange = {}) {
  const columns = ['name', 'karma_points', 'streak', 'avg_score', 'weak_topic', 'last_active']
  const labels = ['Name', 'Karma Points', 'Streak (days)', 'Avg Score (%)', 'Weak Topic', 'Last Active']

  const rows = students.map((s) => ({
    name: s.name || '—',
    karma_points: s.karma_points ?? 0,
    streak: s.streak ?? 0,
    avg_score: s.avg_score ?? 0,
    weak_topic: s.weak_topic || '—',
    last_active: s.last_active ? new Date(s.last_active).toLocaleDateString('en-IN') : '—',
  }))

  const period = dateRange.from && dateRange.to
    ? `_${dateRange.from}_to_${dateRange.to}`
    : `_${new Date().toISOString().split('T')[0]}`

  const csv = toCSV(rows, columns, labels)
  downloadCSV(csv, `cultural_ar_maths_${className.replace(/\s+/g, '_')}${period}.csv`)
}

// ── PDF (HTML → Print) ────────────────────────────────────────────────────

/**
 * Generate a printable HTML report and open the browser print dialog.
 * This uses a hidden iframe to avoid disrupting the main window.
 * @param {Object[]} students
 * @param {Object} classStats  { className, totalStudents, avgScore, activeToday, classCode }
 * @param {{ from: string, to: string }} dateRange
 */
export function downloadClassReportPDF(students, classStats = {}, dateRange = {}) {
  const period = dateRange.from && dateRange.to
    ? `${dateRange.from} — ${dateRange.to}`
    : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

  const rows = students
    .map(
      (s, i) => `
      <tr style="background:${i % 2 === 0 ? '#fff' : '#FFF8E7'}">
        <td>${i + 1}</td>
        <td>${s.name || '—'}</td>
        <td>${s.karma_points ?? 0}</td>
        <td>${s.streak ?? 0} days</td>
        <td style="color:${(s.avg_score ?? 0) >= 70 ? '#16a34a' : (s.avg_score ?? 0) >= 50 ? '#FF6B00' : '#dc2626'};font-weight:700">${s.avg_score ?? 0}%</td>
        <td>${s.weak_topic || '—'}</td>
        <td>${s.last_active ? new Date(s.last_active).toLocaleDateString('en-IN') : '—'}</td>
      </tr>`
    )
    .join('')

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Cultural AR Maths — Class Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; padding: 32px; color: #1F2937; }
    .header { border-bottom: 3px solid #FF6B00; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
    .logo { font-size: 22px; font-weight: 800; color: #FF6B00; letter-spacing: -0.5px; }
    .subtitle { font-size: 12px; color: #6B7280; margin-top: 4px; }
    .meta { text-align: right; font-size: 12px; color: #6B7280; line-height: 1.6; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
    .stat-box { background: #FFF8E7; border: 1px solid #FFD4A8; border-radius: 8px; padding: 12px 16px; }
    .stat-value { font-size: 22px; font-weight: 800; color: #FF6B00; }
    .stat-label { font-size: 11px; color: #6B7280; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background: #FF6B00; color: white; padding: 8px 10px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
    td { padding: 8px 10px; border-bottom: 1px solid #F3F4F6; }
    .footer { margin-top: 24px; font-size: 10px; color: #9CA3AF; text-align: center; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">📐 Cultural AR Maths</div>
      <div class="subtitle">Class Performance Report</div>
    </div>
    <div class="meta">
      <div><strong>Class:</strong> ${classStats.className || 'My Class'}</div>
      <div><strong>Code:</strong> ${classStats.classCode || '—'}</div>
      <div><strong>Period:</strong> ${period}</div>
      <div><strong>Generated:</strong> ${new Date().toLocaleDateString('en-IN')}</div>
    </div>
  </div>

  <div class="stats-grid">
    <div class="stat-box">
      <div class="stat-value">${classStats.totalStudents ?? students.length}</div>
      <div class="stat-label">Total Students</div>
    </div>
    <div class="stat-box">
      <div class="stat-value">${classStats.avgScore ?? '—'}%</div>
      <div class="stat-label">Class Average</div>
    </div>
    <div class="stat-box">
      <div class="stat-value">${classStats.activeToday ?? '—'}</div>
      <div class="stat-label">Active Today</div>
    </div>
    <div class="stat-box">
      <div class="stat-value">${students.filter(s => (s.avg_score ?? 0) < 50).length}</div>
      <div class="stat-label">Need Attention (&lt;50%)</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Name</th>
        <th>Karma</th>
        <th>Streak</th>
        <th>Avg Score</th>
        <th>Weak Topic</th>
        <th>Last Active</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="footer">Generated by Cultural AR Maths — Culturally Contextual AR Mathematics Learning Platform</div>
</body>
</html>`

  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  document.body.appendChild(iframe)
  iframe.contentDocument.open()
  iframe.contentDocument.write(html)
  iframe.contentDocument.close()
  iframe.contentWindow.focus()
  setTimeout(() => {
    iframe.contentWindow.print()
    setTimeout(() => document.body.removeChild(iframe), 1000)
  }, 400)
}
