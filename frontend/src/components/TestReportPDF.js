// NON-VIZ — Test report PDF download trigger.
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

export default function TestReportPDF() {
  const [busy, setBusy] = useState(false);
  const [lastDownload, setLastDownload] = useState(null);

  const download = async () => {
    setBusy(true);
    try {
      const res = await api.get('/custom-views/test-report-pdf', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `test-report-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setLastDownload(new Date().toLocaleTimeString());
      toast.success('Report downloaded');
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed to generate PDF');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-testid="report-pdf" style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 20 }}>
      <h3 style={{ color: '#f1f5f9', marginTop: 0, marginBottom: 6 }}>Test Report PDF</h3>
      <p style={{ color: '#94a3b8', marginTop: 0, marginBottom: 16, fontSize: 14 }}>
        Export a one-page PDF summarising current generation rules and recent test activity.
      </p>
      <button
        onClick={download}
        disabled={busy}
        style={{
          background: busy ? '#475569' : '#2563eb',
          color: '#fff',
          border: 'none',
          padding: '10px 18px',
          borderRadius: 8,
          cursor: busy ? 'not-allowed' : 'pointer',
          fontSize: 14,
          fontWeight: 600,
        }}>
        {busy ? 'Generating...' : 'Download PDF Report'}
      </button>
      {lastDownload && (
        <div style={{ marginTop: 12, color: '#94a3b8', fontSize: 13 }}>
          Last downloaded at {lastDownload}
        </div>
      )}
    </div>
  );
}
