import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { reportsAPI } from '../services/api';

export default function ReportViewer() {
  const [reports, setReports] = useState([]);
  const [selected, setSelected] = useState('');
  const [fetching, setFetching] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [jsonReport, setJsonReport] = useState(null);

  useEffect(() => {
    reportsAPI.getAll()
      .then((res) => {
        const items = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setReports(items);
      })
      .catch((err) => toast.error('Failed to load reports'))
      .finally(() => setFetching(false));
  }, []);

  const handleGenerate = async () => {
    if (!selected) return;
    setGenerating(true);
    setJsonReport(null);
    try {
      const res = await reportsAPI.generate(selected);
      setJsonReport(res.data);
      toast.success('Report generated successfully!');
    } catch (err) {
      toast.error('Generation failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadHtml = async () => {
    if (!selected) return;
    setDownloading(true);
    try {
      const res = await reportsAPI.generateHtml(selected);
      const blob = new Blob([res.data], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${selected}.html`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('HTML report downloaded!');
    } catch (err) {
      toast.error('Download failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setDownloading(false);
    }
  };

  const passRate = jsonReport?.summary?.passRate;

  return (
    <div style={{ maxWidth: '1000px' }}>
      <h2 style={{ marginBottom: '4px', fontSize: '24px' }}>Report Viewer</h2>
      <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '14px' }}>
        Generate and download detailed test reports with pass/fail counts, coverage, and security findings
      </p>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <select
          value={selected}
          onChange={(e) => { setSelected(e.target.value); setJsonReport(null); }}
          style={{
            flex: 1, minWidth: '200px', padding: '10px 14px', borderRadius: '8px',
            background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0', fontSize: '14px',
          }}
        >
          <option value="">Select a report...</option>
          {reports.map((r) => (
            <option key={r.id} value={r.id}>[{r.id}] {r.name} ({r.type})</option>
          ))}
        </select>
        <button
          onClick={handleGenerate}
          disabled={!selected || generating}
          style={{
            padding: '10px 20px', borderRadius: '8px', border: 'none',
            background: !selected || generating ? '#334155' : '#7c3aed',
            color: '#fff', fontWeight: 600, cursor: !selected || generating ? 'not-allowed' : 'pointer',
          }}
        >
          {generating ? 'Generating...' : 'Generate JSON'}
        </button>
        <button
          onClick={handleDownloadHtml}
          disabled={!selected || downloading}
          style={{
            padding: '10px 20px', borderRadius: '8px', border: 'none',
            background: !selected || downloading ? '#334155' : '#059669',
            color: '#fff', fontWeight: 600, cursor: !selected || downloading ? 'not-allowed' : 'pointer',
          }}
        >
          {downloading ? 'Downloading...' : 'Download HTML'}
        </button>
      </div>

      {fetching && <p style={{ color: '#64748b' }}>Loading reports...</p>}

      {reports.length === 0 && !fetching && (
        <div style={{ background: '#1e293b', borderRadius: '12px', padding: '24px', color: '#64748b' }}>
          No reports found. Create reports in the Reports section first.
        </div>
      )}

      {jsonReport && (
        <div>
          {/* Summary KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {[
              { label: 'Total Tests', val: jsonReport.summary?.totalTests || 0, color: '#e2e8f0' },
              { label: 'Passed', val: jsonReport.summary?.totalPassed || 0, color: '#4ade80' },
              { label: 'Failed', val: jsonReport.summary?.totalFailed || 0, color: '#f87171' },
              { label: 'Pass Rate', val: passRate ? `${passRate}%` : 'N/A', color: '#a78bfa' },
              { label: 'Coverage', val: jsonReport.summary?.coverage ? `${jsonReport.summary.coverage}%` : 'N/A', color: '#60a5fa' },
              { label: 'Vulnerabilities', val: jsonReport.security?.totalVulnerabilities || 0, color: '#fb923c' },
              { label: 'Critical Vulns', val: jsonReport.security?.criticalVulnerabilities || 0, color: '#f87171' },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ background: '#1e293b', borderRadius: '10px', padding: '16px', border: '1px solid #334155', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color }}>{val}</div>
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', marginTop: '4px' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Pass Rate Bar */}
          <div style={{ background: '#1e293b', borderRadius: '12px', padding: '20px', marginBottom: '20px', border: '1px solid #334155' }}>
            <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>Pass Rate</h3>
            <div style={{ background: '#334155', borderRadius: '6px', height: '16px', overflow: 'hidden' }}>
              <div style={{
                width: `${passRate || 0}%`, height: '100%',
                background: 'linear-gradient(90deg, #4ade80, #22c55e)',
                transition: 'width 1s ease',
              }} />
            </div>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '8px' }}>
              {passRate || 0}% of {jsonReport.summary?.totalTests || 0} tests passed
            </p>
          </div>

          {/* Executions Table */}
          {jsonReport.executions && jsonReport.executions.length > 0 && (
            <div style={{ background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden', marginBottom: '20px' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #334155' }}>
                <h3 style={{ margin: 0, fontSize: '16px' }}>Test Executions ({jsonReport.executions.length})</h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#0f172a' }}>
                      {['ID', 'Name', 'Status', 'Total', 'Passed', 'Failed', 'Duration', 'Environment'].map((h) => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {jsonReport.executions.map((e) => (
                      <tr key={e.id} style={{ borderTop: '1px solid #334155' }}>
                        <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{e.id}</td>
                        <td style={{ padding: '10px 12px', color: '#e2e8f0' }}>{e.name}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{
                            padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600,
                            background: e.status === 'completed' ? '#166534' : e.status === 'failed' ? '#7f1d1d' : '#374151',
                            color: e.status === 'completed' ? '#4ade80' : e.status === 'failed' ? '#f87171' : '#9ca3af',
                          }}>{e.status}</span>
                        </td>
                        <td style={{ padding: '10px 12px', color: '#e2e8f0' }}>{e.totalTests}</td>
                        <td style={{ padding: '10px 12px', color: '#4ade80' }}>{e.passed}</td>
                        <td style={{ padding: '10px 12px', color: e.failed > 0 ? '#f87171' : '#e2e8f0' }}>{e.failed}</td>
                        <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{e.duration ? `${e.duration}s` : '-'}</td>
                        <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{e.environment || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Report Metadata */}
          <div style={{ background: '#1e293b', borderRadius: '12px', padding: '16px', border: '1px solid #334155', fontSize: '13px', color: '#64748b' }}>
            <strong style={{ color: '#94a3b8' }}>Report:</strong> {jsonReport.report?.name} &mdash;
            <strong style={{ color: '#94a3b8', marginLeft: '8px' }}>Project:</strong> {jsonReport.report?.projectName || 'All'} &mdash;
            <strong style={{ color: '#94a3b8', marginLeft: '8px' }}>Generated:</strong> {new Date(jsonReport.report?.generatedAt).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}
