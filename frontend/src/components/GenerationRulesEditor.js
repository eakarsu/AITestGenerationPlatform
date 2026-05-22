// NON-VIZ — Test generation rules CRUD editor.
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const emptyForm = {
  framework: '', language: '', depth: 'unit',
  description: '', coverage_target: 80, enabled: true,
};

export default function GenerationRulesEditor() {
  const [rules, setRules] = useState([]);
  const [meta, setMeta] = useState({ depths: [], frameworks: [], languages: [] });
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/custom-views/generation-rules');
      setRules(res.data.rules || []);
      setMeta(res.data.meta || {});
      if (!form.framework && res.data.meta?.frameworks?.length) {
        setForm(f => ({ ...f, framework: res.data.meta.frameworks[0], language: res.data.meta.languages[0] }));
      }
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed to load rules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (editingId) {
        await api.put(`/custom-views/generation-rules/${editingId}`, form);
        toast.success('Rule updated');
      } else {
        await api.post('/custom-views/generation-rules', form);
        toast.success('Rule created');
      }
      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Save failed');
    } finally { setBusy(false); }
  };

  const startEdit = (r) => {
    setEditingId(r.id);
    setForm({
      framework: r.framework, language: r.language, depth: r.depth,
      description: r.description, coverage_target: r.coverage_target, enabled: r.enabled,
    });
  };

  const cancelEdit = () => { setEditingId(null); setForm(emptyForm); };

  const remove = async (id) => {
    if (!window.confirm('Delete this rule?')) return;
    try {
      await api.delete(`/custom-views/generation-rules/${id}`);
      toast.success('Deleted');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Delete failed');
    }
  };

  const inp = { background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0', padding: '8px 10px', borderRadius: 6, fontSize: 13, width: '100%' };
  const lbl = { display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 4 };

  return (
    <div data-testid="rules-editor" style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 20 }}>
      <h3 style={{ color: '#f1f5f9', marginTop: 0, marginBottom: 12 }}>Test Generation Rules</h3>

      <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        <div>
          <label style={lbl}>Framework</label>
          <select style={inp} value={form.framework} onChange={e => setForm({ ...form, framework: e.target.value })}>
            <option value="">--</option>
            {meta.frameworks?.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>Language</label>
          <select style={inp} value={form.language} onChange={e => setForm({ ...form, language: e.target.value })}>
            <option value="">--</option>
            {meta.languages?.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>Depth</label>
          <select style={inp} value={form.depth} onChange={e => setForm({ ...form, depth: e.target.value })}>
            {meta.depths?.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>Coverage target (%)</label>
          <input style={inp} type="number" min="0" max="100"
            value={form.coverage_target}
            onChange={e => setForm({ ...form, coverage_target: e.target.value })} />
        </div>
        <div style={{ gridColumn: '1 / span 3' }}>
          <label style={lbl}>Description</label>
          <input style={inp} type="text" value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Optional description" />
        </div>
        <div style={{ display: 'flex', alignItems: 'end', gap: 8 }}>
          <label style={{ color: '#cbd5e1', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" checked={form.enabled} onChange={e => setForm({ ...form, enabled: e.target.checked })} />
            Enabled
          </label>
        </div>
        <div style={{ gridColumn: '1 / span 4', display: 'flex', gap: 8 }}>
          <button type="submit" disabled={busy} style={{
            background: '#2563eb', color: '#fff', border: 'none',
            padding: '8px 18px', borderRadius: 6, cursor: 'pointer', fontWeight: 600,
          }}>
            {editingId ? 'Update Rule' : 'Add Rule'}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} style={{
              background: '#475569', color: '#fff', border: 'none',
              padding: '8px 18px', borderRadius: 6, cursor: 'pointer',
            }}>Cancel</button>
          )}
        </div>
      </form>

      {loading ? (
        <div style={{ color: '#94a3b8' }}>Loading rules...</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Framework', 'Language', 'Depth', 'Target', 'Enabled', 'Actions'].map(h => (
                <th key={h} style={{ textAlign: 'left', color: '#94a3b8', borderBottom: '1px solid #334155', padding: '6px 8px', fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rules.map(r => (
              <tr key={r.id}>
                <td style={{ color: '#e2e8f0', padding: '6px 8px', fontFamily: 'monospace', fontSize: 13 }}>{r.framework}</td>
                <td style={{ color: '#e2e8f0', padding: '6px 8px', fontFamily: 'monospace', fontSize: 13 }}>{r.language}</td>
                <td style={{ color: '#cbd5e1', padding: '6px 8px', fontSize: 13 }}>{r.depth}</td>
                <td style={{ color: '#cbd5e1', padding: '6px 8px', fontSize: 13 }}>{r.coverage_target}%</td>
                <td style={{ padding: '6px 8px', fontSize: 13 }}>
                  <span style={{ color: r.enabled ? '#10b981' : '#94a3b8' }}>{r.enabled ? 'Yes' : 'No'}</span>
                </td>
                <td style={{ padding: '6px 8px' }}>
                  <button onClick={() => startEdit(r)} style={{ background: 'transparent', border: '1px solid #475569', color: '#e2e8f0', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', marginRight: 6, fontSize: 12 }}>Edit</button>
                  <button onClick={() => remove(r.id)} style={{ background: 'transparent', border: '1px solid #b91c1c', color: '#fca5a5', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
