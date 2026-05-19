import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { executionsAPI, testExecutionsRunAPI } from '../services/api';

const STATUS_COLORS = {
  completed: '#4ade80',
  failed: '#f87171',
  running: '#fb923c',
  queued: '#94a3b8',
  cancelled: '#64748b',
};

export default function TestRunner() {
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runningIds, setRunningIds] = useState(new Set());
  const [results, setResults] = useState({});

  const load = async () => {
    try {
      const res = await executionsAPI.getAll();
      setExecutions(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (err) {
      toast.error('Failed to load executions: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRun = async (execution) => {
    setRunningIds((prev) => new Set([...prev, execution.id]));
    try {
      const res = await testExecutionsRunAPI.run(execution.id);
      setResults((prev) => ({ ...prev, [execution.id]: res.data.results }));
      toast.success(`Execution "${execution.name}" completed: ${res.data.results.passed} passed, ${res.data.results.failed} failed`);
      await load();
    } catch (err) {
      toast.error('Run failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setRunningIds((prev) => { const next = new Set(prev); next.delete(execution.id); return next; });
    }
  };

  const passRate = (e) => {
    const total = e.totalTests || 0;
    if (!total) return null;
    return ((e.passed || 0) / total * 100).toFixed(0);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h2 style={{ marginBottom: '4px', fontSize: '24px' }}>Test Runner</h2>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Run test executions and see live mock results</p>
        </div>
        <button onClick={load} style={{ padding: '8px 16px', borderRadius: '8px', background: '#334155', color: '#e2e8f0', border: 'none', cursor: 'pointer', fontSize: '13px' }}>
          Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>Loading executions...</div>
      ) : executions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', background: '#1e293b', borderRadius: '12px', color: '#64748b' }}>
          No test executions found. Create some in Test Executions.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {executions.map((e) => {
            const isRunning = runningIds.has(e.id);
            const result = results[e.id];
            const rate = passRate(e);

            return (
              <div key={e.id} style={{
                background: '#1e293b', borderRadius: '12px', padding: '20px',
                border: `1px solid ${isRunning ? '#7c3aed' : '#334155'}`,
                transition: 'border-color 0.2s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ color: '#e2e8f0', marginBottom: '4px', fontSize: '16px' }}>{e.name}</h3>
                    <span style={{ color: '#64748b', fontSize: '13px' }}>
                      {e.suiteName ? `Suite: ${e.suiteName} · ` : ''}{e.environment || 'test'} environment
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 600,
                      background: (STATUS_COLORS[e.status] || '#888') + '22',
                      color: STATUS_COLORS[e.status] || '#888',
                    }}>
                      {isRunning ? 'Running...' : e.status}
                    </span>
                    <button
                      onClick={() => handleRun(e)}
                      disabled={isRunning}
                      style={{
                        padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: isRunning ? 'not-allowed' : 'pointer',
                        background: isRunning ? '#334155' : '#7c3aed', color: '#fff', fontSize: '13px', fontWeight: 600,
                      }}
                    >
                      {isRunning ? 'Running...' : 'Run'}
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                {(e.totalTests > 0 || result) && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ background: '#334155', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${rate || 0}%`, height: '100%',
                        background: e.failed > 0 ? 'linear-gradient(90deg, #4ade80, #fb923c)' : 'linear-gradient(90deg, #4ade80, #22c55e)',
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '12px' }}>
                      <span style={{ color: '#4ade80' }}>✓ {e.passed || 0} passed</span>
                      <span style={{ color: '#f87171' }}>✗ {e.failed || 0} failed</span>
                      <span style={{ color: '#94a3b8' }}>{e.totalTests || 0} total</span>
                      {e.duration > 0 && <span style={{ color: '#94a3b8' }}>{e.duration}s</span>}
                      {rate && <span style={{ color: '#a78bfa', marginLeft: 'auto' }}>{rate}% pass rate</span>}
                    </div>
                  </div>
                )}

                {/* Live result after run */}
                {result && (
                  <div style={{
                    background: '#0f172a', borderRadius: '8px', padding: '12px',
                    borderLeft: `3px solid ${result.failed > 0 ? '#f87171' : '#4ade80'}`,
                  }}>
                    <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>
                      Last run: {result.passed} passed · {result.failed} failed · {result.duration}s · Pass rate: {result.passRate}
                    </p>
                  </div>
                )}

                {/* Logs */}
                {e.logs && (
                  <details style={{ marginTop: '12px' }}>
                    <summary style={{ cursor: 'pointer', color: '#64748b', fontSize: '13px', userSelect: 'none' }}>View Logs</summary>
                    <pre style={{
                      background: '#0f172a', color: '#94a3b8', fontSize: '11px', padding: '10px',
                      borderRadius: '6px', marginTop: '8px', overflowX: 'auto', whiteSpace: 'pre-wrap',
                    }}>
                      {e.logs}
                    </pre>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
