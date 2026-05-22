// VIZ — Module-level pass/fail heatmap.
import React, { useEffect, useState } from 'react';
import api from '../services/api';

function cellColor(rate) {
  // rate is 0..100
  if (rate >= 95) return '#065f46';
  if (rate >= 85) return '#10b981';
  if (rate >= 70) return '#f59e0b';
  if (rate >= 50) return '#ea580c';
  return '#dc2626';
}

export default function ModulePassFailHeatmap() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.get('/custom-views/module-pass-fail-heatmap')
      .then(res => { if (!cancelled) setData(res.data); })
      .catch(err => { if (!cancelled) setError(err.response?.data?.error || err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div style={{ color: '#94a3b8', padding: 16 }}>Loading heatmap...</div>;
  if (error) return <div style={{ color: '#fca5a5', padding: 12, background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', borderRadius: 8 }}>{error}</div>;
  if (!data) return null;

  const { modules, buckets, cells } = data;
  const get = (m, b) => cells.find(c => c.module === m && c.bucket === b);

  return (
    <div data-testid="heatmap" style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 20 }}>
      <h3 style={{ color: '#f1f5f9', marginTop: 0, marginBottom: 12 }}>Module Pass/Fail Heatmap</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'separate', borderSpacing: 4, minWidth: 600 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', color: '#94a3b8', fontWeight: 600, padding: '4px 8px' }}>Module</th>
              {buckets.map(b => (
                <th key={b} style={{ color: '#94a3b8', fontWeight: 600, fontSize: 12, padding: '4px 8px', textTransform: 'uppercase' }}>{b}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {modules.map(m => (
              <tr key={m}>
                <td style={{ color: '#e2e8f0', fontSize: 13, padding: '4px 8px', fontFamily: 'monospace' }}>{m}</td>
                {buckets.map(b => {
                  const c = get(m, b);
                  if (!c) return <td key={b} />;
                  return (
                    <td key={b}
                      title={`${m}/${b} — ${c.passed}/${c.total} passed (${c.pass_rate}%)`}
                      style={{
                        background: cellColor(c.pass_rate),
                        color: '#fff', textAlign: 'center', padding: '8px 10px',
                        borderRadius: 4, fontSize: 11, fontWeight: 600, minWidth: 40,
                      }}>
                      {c.pass_rate}%
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center', color: '#cbd5e1', fontSize: 12 }}>
        <span>Pass rate:</span>
        {[
          ['≥95', '#065f46'], ['≥85', '#10b981'], ['≥70', '#f59e0b'],
          ['≥50', '#ea580c'], ['<50', '#dc2626'],
        ].map(([l, c]) => (
          <span key={l} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ display: 'inline-block', width: 12, height: 12, background: c, borderRadius: 2 }} />
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}
