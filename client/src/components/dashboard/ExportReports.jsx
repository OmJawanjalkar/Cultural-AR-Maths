import { useState } from 'react'
import { Download, FileText, Table2, Calendar } from 'lucide-react'
import { downloadClassReportCSV, downloadClassReportPDF } from '../../utils/exportHelpers'

export default function ExportReports({ students = [], classStats = {} }) {
  const today = new Date().toISOString().split('T')[0]
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]

  const [dateFrom, setDateFrom] = useState(thirtyDaysAgo)
  const [dateTo, setDateTo] = useState(today)
  const [csvLoading, setCsvLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [preview, setPreview] = useState(false)

  const handleCSV = () => {
    setCsvLoading(true)
    setTimeout(() => {
      downloadClassReportCSV(students, classStats.className || 'Class', { from: dateFrom, to: dateTo })
      setCsvLoading(false)
    }, 400)
  }

  const handlePDF = () => {
    setPdfLoading(true)
    setTimeout(() => {
      downloadClassReportPDF(students, classStats, { from: dateFrom, to: dateTo })
      setPdfLoading(false)
    }, 400)
  }

  const lowPerformers = students.filter(s => (s.avg_score ?? 0) < 50).length
  const avgScore = students.length
    ? Math.round(students.reduce((s, st) => s + (st.avg_score ?? 0), 0) / students.length)
    : classStats.avgScore ?? 0

  return (
    <div>
      <h3 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: '600', fontSize: '16px', color: '#2D2D2D', margin: '0 0 20px' }}>
        Export &amp; Reports
      </h3>

      {/* Date range */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={15} color="#9CA3AF" />
          <span style={{ fontSize: '13px', color: '#6B7280', fontFamily: '"Noto Sans", sans-serif' }}>Period:</span>
        </div>
        <input
          type="date"
          value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
          style={{ padding: '7px 10px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', fontFamily: '"Noto Sans", sans-serif', color: '#2D2D2D', outline: 'none' }}
        />
        <span style={{ fontSize: '13px', color: '#9CA3AF' }}>—</span>
        <input
          type="date"
          value={dateTo}
          onChange={e => setDateTo(e.target.value)}
          style={{ padding: '7px 10px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', fontFamily: '"Noto Sans", sans-serif', color: '#2D2D2D', outline: 'none' }}
        />
      </div>

      {/* Preview toggle */}
      <div style={{
        background: '#FFF8E7',
        border: '1px solid rgba(255,107,0,0.15)',
        borderRadius: '10px',
        padding: '16px 18px',
        marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: preview ? '14px' : '0' }}>
          <div>
            <p style={{ fontFamily: '"Poppins", sans-serif', fontWeight: '600', fontSize: '14px', color: '#2D2D2D', margin: '0 0 2px' }}>
              Report Preview
            </p>
            <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0, fontFamily: '"Noto Sans", sans-serif' }}>
              {students.length} students · {dateFrom} to {dateTo}
            </p>
          </div>
          <button
            onClick={() => setPreview(p => !p)}
            style={{
              padding: '6px 14px',
              background: 'rgba(255,107,0,0.1)',
              border: '1px solid rgba(255,107,0,0.2)',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              color: '#FF6B00',
              cursor: 'pointer',
              fontFamily: '"Poppins", sans-serif',
            }}
          >
            {preview ? 'Hide' : 'Preview'}
          </button>
        </div>

        {preview && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
            {[
              { label: 'Total Students', value: students.length || classStats.totalStudents || 0, icon: '👥' },
              { label: 'Class Average', value: `${avgScore}%`, icon: '📊' },
              { label: 'Need Attention', value: lowPerformers, icon: '⚠️' },
              { label: 'Active Today', value: classStats.activeToday || '—', icon: '✅' },
            ].map(stat => (
              <div key={stat.label} style={{ background: '#FFFFFF', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>{stat.icon}</div>
                <p style={{ fontFamily: '"Poppins", sans-serif', fontWeight: '800', fontSize: '18px', color: '#FF6B00', margin: '0 0 2px' }}>{stat.value}</p>
                <p style={{ fontSize: '10px', color: '#9CA3AF', margin: 0, fontFamily: '"Noto Sans", sans-serif' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Download buttons */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={handleCSV}
          disabled={csvLoading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 22px',
            background: csvLoading ? '#F0EDE8' : '#FFFFFF',
            border: '1.5px solid rgba(255,107,0,0.3)',
            borderRadius: '8px',
            color: '#FF6B00',
            fontSize: '13px',
            fontWeight: '700',
            cursor: csvLoading ? 'not-allowed' : 'pointer',
            fontFamily: '"Poppins", sans-serif',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => { if (!csvLoading) e.currentTarget.style.background = 'rgba(255,107,0,0.07)' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF' }}
        >
          <Table2 size={15} />
          {csvLoading ? 'Generating...' : 'Download CSV'}
        </button>

        <button
          onClick={handlePDF}
          disabled={pdfLoading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 22px',
            background: pdfLoading ? '#F0EDE8' : '#FF6B00',
            border: 'none',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontSize: '13px',
            fontWeight: '700',
            cursor: pdfLoading ? 'not-allowed' : 'pointer',
            fontFamily: '"Poppins", sans-serif',
            transition: 'filter 0.2s',
          }}
          onMouseEnter={e => { if (!pdfLoading) e.currentTarget.style.filter = 'brightness(1.1)' }}
          onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}
        >
          <FileText size={15} />
          {pdfLoading ? 'Preparing...' : 'Download PDF Report'}
        </button>
      </div>

      <p style={{
        fontSize: '11px',
        color: '#9CA3AF',
        margin: '12px 0 0',
        fontFamily: '"Noto Sans", sans-serif',
      }}>
        CSV contains all student data. PDF opens a formatted print dialog.
      </p>
    </div>
  )
}
