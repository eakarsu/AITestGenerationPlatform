import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { testCasesAPI, mutationAPI } from '../services/api';

function ScoreGauge({ score }) {
  const color = score >= 70 ? '#4ade80' : score >= 40 ? '#fb923c' : '#f87171';
  const label = score >= 70 ? 'Strong' : score >= 40 ? 'Moderate' : 'Weak';
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#334155" strokeWidth="12" />
        <circle
          cx="70" cy="70" r={radius} fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x="70" y="68" textAnchor="middle" fill={color} fontSize="28" fontWeight="700">{score}</text>
        <text x="70" y="88" textAnchor="middle" fill="#94a3b8" fontSize="13">{label}</text>
      </svg>
      <p style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>Mutation Score (%)</p>
    </div>
  );
}

export default function MutationScoring() {
  const [testCases, setTestCases] = useState([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    testCasesAPI.getAll()
      .then((res) => {
        const items = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setTestCases(items.filter((tc) => tc.generatedTest));
      })
      .catch((err) => toast.error('Failed to load test cases'))
      .finally(() => setFetching(false));
  }, []);

  const handleScore = async () => {
    if (!selected) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await mutationAPI.score(selected);
      setResult(res.data);
      toast.success('Mutation analysis complete!');
    } catch (err) {
      toast.error('Analysis failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const analysis = result?.mutationAnalysis;
  const score = analysis?.mutation_score ?? null;

  return (
    <div style={{ maxWidth: '900px' }}>
      <h2 style={{ marginBottom: '4px', fontSize: '24px' }}>Mutation Testing Score</h2>
      <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '14px' }}>
        AI estimates how many bugs your tests would catch (mutation kill rate)
      </p>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <select
          value={selected}
          onChange={(e) => { setSelected(e.target.value); setResult(null); }}
          style={{
            flex: 1, padding: '10px 14px', borderRadius: '8px',
            background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0', fontSize: '14px',
          }}
        >
          <option value="">Select a test case with generated tests...</option>
          {testCases.map((tc) => (
            <option key={tc.id} value={tc.id}>
              [{tc.id}] {tc.title} ({tc.language || 'Unknown'})
            </option>
          ))}
        </select>
        <button
          onClick={handleScore}
          disabled={!selected || loading}
          style={{
            padding: '10px 24px', borderRadius: '8px', border: 'none',
            background: !selected || loading ? '#334155' : '#7c3aed',
            color: '#fff', fontWeight: 600, cursor: !selected || loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>

      {fetching && <p style={{ color: '#64748b' }}>Loading test cases...</p>}
      {testCases.length === 0 && !fetching && (
        <div style={{ background: '#1e293b', borderRadius: '12px', padding: '24px', color: '#64748b', fontSize: '14px' }}>
          No test cases with generated tests found. Generate tests first from the Test Cases page.
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
          AI is analyzing mutation kill rate...
        </div>
      )}

      {result && analysis && !loading && (
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '24px', alignItems: 'start' }}>
          {score !== null && <ScoreGauge score={score} />}

          <div>
            {/* Weak Assertions */}
            {analysis.weak_assertions && analysis.weak_assertions.length > 0 && (
              <div style={{ background: '#1e293b', borderRadius: '12px', padding: '16px', marginBottom: '16px', border: '1px solid #f87171' }}>
                <h4 style={{ color: '#f87171', marginBottom: '10px' }}>Weak Assertions ({analysis.weak_assertions.length})</h4>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {analysis.weak_assertions.map((w, i) => (
                    <li key={i} style={{ color: '#e2e8f0', fontSize: '13px', marginBottom: '4px', lineHeight: '1.5' }}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Missing Edge Cases */}
            {analysis.missing_edge_cases && analysis.missing_edge_cases.length > 0 && (
              <div style={{ background: '#1e293b', borderRadius: '12px', padding: '16px', marginBottom: '16px', border: '1px solid #fb923c' }}>
                <h4 style={{ color: '#fb923c', marginBottom: '10px' }}>Missing Edge Cases</h4>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {analysis.missing_edge_cases.map((e, i) => (
                    <li key={i} style={{ color: '#e2e8f0', fontSize: '13px', marginBottom: '4px', lineHeight: '1.5' }}>{e}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Strong Areas */}
            {analysis.strong_test_areas && analysis.strong_test_areas.length > 0 && (
              <div style={{ background: '#1e293b', borderRadius: '12px', padding: '16px', marginBottom: '16px', border: '1px solid #4ade80' }}>
                <h4 style={{ color: '#4ade80', marginBottom: '10px' }}>Strong Test Areas</h4>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {analysis.strong_test_areas.map((s, i) => (
                    <li key={i} style={{ color: '#e2e8f0', fontSize: '13px', marginBottom: '4px', lineHeight: '1.5' }}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Improvement Suggestions */}
            {analysis.improvement_suggestions && analysis.improvement_suggestions.length > 0 && (
              <div style={{ background: '#1e293b', borderRadius: '12px', padding: '16px', border: '1px solid #a78bfa' }}>
                <h4 style={{ color: '#a78bfa', marginBottom: '10px' }}>Improvement Suggestions</h4>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {analysis.improvement_suggestions.map((s, i) => (
                    <li key={i} style={{ color: '#e2e8f0', fontSize: '13px', marginBottom: '4px', lineHeight: '1.5' }}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Fallback for raw */}
            {analysis.raw && (
              <div style={{ background: '#1e293b', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ color: '#a78bfa', marginBottom: '8px' }}>Analysis</h4>
                <pre style={{ color: '#94a3b8', fontSize: '13px', whiteSpace: 'pre-wrap', margin: 0 }}>{analysis.raw}</pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
