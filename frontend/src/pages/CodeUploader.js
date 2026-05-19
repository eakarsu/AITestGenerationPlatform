import React, { useState, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import { uploadCodeAPI } from '../services/api';

const ALLOWED = ['.js', '.ts', '.py', '.java', '.go', '.rb', '.cs', '.cpp', '.c'];

export default function CodeUploader() {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const inputRef = useRef();

  const handleFile = useCallback((f) => {
    if (!f) return;
    const ext = '.' + f.name.split('.').pop().toLowerCase();
    if (!ALLOWED.includes(ext)) {
      toast.error(`File type ${ext} not allowed. Allowed: ${ALLOWED.join(', ')}`);
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      toast.error('File too large. Max 2MB.');
      return;
    }
    setFile(f);
    setResult(null);
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadCodeAPI.upload(formData);
      setResult(res.data);
      toast.success('File uploaded and tests generated successfully!');
      setFile(null);
    } catch (err) {
      toast.error('Upload failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score) => {
    if (score >= 70) return '#4ade80';
    if (score >= 40) return '#fb923c';
    return '#f87171';
  };

  return (
    <div style={{ maxWidth: '900px' }}>
      <h2 style={{ marginBottom: '4px', fontSize: '24px' }}>Code File Upload</h2>
      <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '14px' }}>
        Upload source code files to automatically generate AI test cases
      </p>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
        style={{
          border: `2px dashed ${dragging ? '#7c3aed' : file ? '#4ade80' : '#334155'}`,
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragging ? 'rgba(124,58,237,0.08)' : 'rgba(30,41,59,0.5)',
          transition: 'all 0.2s',
          marginBottom: '20px',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED.join(',')}
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])}
        />
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>{file ? '✅' : '📂'}</div>
        {file ? (
          <>
            <p style={{ color: '#4ade80', fontWeight: 600, fontSize: '16px' }}>{file.name}</p>
            <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>
              {(file.size / 1024).toFixed(1)} KB — Click to change
            </p>
          </>
        ) : (
          <>
            <p style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '16px' }}>Drop your code file here</p>
            <p style={{ color: '#64748b', fontSize: '13px', marginTop: '8px' }}>
              or click to browse — Supported: {ALLOWED.join(', ')}
            </p>
          </>
        )}
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        style={{
          width: '100%', padding: '12px', borderRadius: '8px',
          background: !file || loading ? '#334155' : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
          color: '#fff', border: 'none', fontSize: '15px', fontWeight: 600,
          cursor: !file || loading ? 'not-allowed' : 'pointer', marginBottom: '24px',
        }}
      >
        {loading ? 'Uploading & Generating Tests...' : 'Upload & Generate Tests'}
      </button>

      {/* Result */}
      {result && (
        <div>
          <div style={{
            background: 'rgba(74,222,128,0.08)', border: '1px solid #4ade80',
            borderRadius: '12px', padding: '20px', marginBottom: '20px',
          }}>
            <h3 style={{ color: '#4ade80', marginBottom: '12px' }}>Test Case Created Successfully</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
              {[
                { label: 'Title', val: result.testCase?.title },
                { label: 'Language', val: result.testCase?.language },
                { label: 'Framework', val: result.testCase?.framework },
                { label: 'Status', val: result.testCase?.status },
              ].map(({ label, val }) => (
                <div key={label} style={{ background: 'rgba(15,23,42,0.5)', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
                  <div style={{ color: '#e2e8f0', fontWeight: 600 }}>{val || '-'}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Structured AI result */}
          {result.structured && (
            <div style={{ background: '#1e293b', borderRadius: '12px', padding: '20px', border: '1px solid #334155' }}>
              <h3 style={{ marginBottom: '16px', color: '#a78bfa' }}>AI Analysis Results</h3>

              {/* Scores */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                {['testability_score', 'complexity_score', 'coverage_estimate'].map((k) => (
                  result.structured[k] != null && (
                    <div key={k} style={{ textAlign: 'center', padding: '12px', background: '#0f172a', borderRadius: '8px' }}>
                      <div style={{ fontSize: '28px', fontWeight: 700, color: scoreColor(result.structured[k]) }}>
                        {result.structured[k]}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', marginTop: '4px' }}>
                        {k.replace(/_/g, ' ')}
                      </div>
                    </div>
                  )
                ))}
              </div>

              {/* Generated Test Cases */}
              {result.structured.test_cases && result.structured.test_cases.length > 0 && (
                <div>
                  <h4 style={{ color: '#94a3b8', marginBottom: '12px' }}>Generated Test Cases ({result.structured.test_cases.length})</h4>
                  {result.structured.test_cases.map((tc, i) => (
                    <div key={i} style={{ background: '#0f172a', borderRadius: '8px', padding: '12px', marginBottom: '8px', borderLeft: '3px solid #7c3aed' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <strong style={{ color: '#e2e8f0' }}>{tc.name}</strong>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '11px', background: '#1e293b', color: '#94a3b8' }}>{tc.type}</span>
                          <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '11px', background: '#1e293b', color: '#94a3b8' }}>{tc.priority}</span>
                        </div>
                      </div>
                      <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '8px' }}>{tc.description}</p>
                      {tc.code && (
                        <pre style={{ background: '#0f172a', color: '#a78bfa', fontSize: '12px', padding: '8px', borderRadius: '4px', overflowX: 'auto', whiteSpace: 'pre-wrap', margin: 0 }}>
                          {tc.code}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
