import React, { useState } from 'react';
import { FaTimes, FaEdit, FaTrash, FaSave, FaRobot } from 'react-icons/fa';
import AIResponseDisplay from './AIResponseDisplay';
import '../styles/Modal.css';

function DetailModal({ item, fields, onClose, onSave, onDelete, aiResult, aiLoading, onAiAction, aiActionLabel }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...item });

  if (!item) return null;

  const handleSave = () => {
    onSave(form);
    setEditing(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editing ? 'Edit Item' : 'Item Details'}</h2>
          <div className="modal-actions">
            {onAiAction && !editing && (
              <button className="btn btn-ai" onClick={() => onAiAction(item.id)} disabled={aiLoading}>
                <FaRobot /> {aiActionLabel || 'Run AI'}
              </button>
            )}
            {!editing && (
              <button className="btn btn-edit" onClick={() => setEditing(true)}>
                <FaEdit /> Edit
              </button>
            )}
            {editing && (
              <button className="btn btn-save" onClick={handleSave}>
                <FaSave /> Save
              </button>
            )}
            <button className="btn btn-delete" onClick={() => onDelete(item.id)}>
              <FaTrash /> Delete
            </button>
            <button className="btn btn-close" onClick={onClose}>
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="modal-body">
          <div className="detail-grid">
            {fields.map((field) => (
              <div key={field.key} className={`detail-field ${field.wide ? 'wide' : ''}`}>
                <label>{field.label}</label>
                {editing ? (
                  field.type === 'textarea' ? (
                    <textarea
                      value={form[field.key] || ''}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                      rows={field.key === 'code' ? 10 : 4}
                      className="edit-textarea"
                    />
                  ) : field.type === 'select' ? (
                    <select
                      value={form[field.key] || ''}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                      className="edit-select"
                    >
                      {field.options?.map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type || 'text'}
                      value={form[field.key] || ''}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                      className="edit-input"
                    />
                  )
                ) : (
                  <div className={`detail-value ${field.type === 'textarea' ? 'pre' : ''}`}>
                    {field.key === 'status' ? (
                      <span className={`status-badge status-${item[field.key]}`}>{item[field.key]}</span>
                    ) : field.key === 'priority' || field.key === 'severity' || field.key === 'riskLevel' ? (
                      <span className={`priority-badge priority-${item[field.key]}`}>{item[field.key]}</span>
                    ) : field.type === 'textarea' && item[field.key] ? (
                      <pre className="code-display">{item[field.key]}</pre>
                    ) : (
                      String(item[field.key] ?? 'N/A')
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Show saved AI response if available */}
          {item.aiResponse && !aiResult && (
            <AIResponseDisplay result={JSON.parse(item.aiResponse)} />
          )}
          {item.aiAnalysis && !aiResult && !item.aiResponse && (
            <div className="ai-saved-response">
              <div className="ai-response-header">
                <div className="ai-response-title"><FaRobot className="ai-icon" /><h3>Previous AI Analysis</h3></div>
              </div>
              <div className="ai-response-body">
                <div className="ai-content"><pre style={{ whiteSpace: 'pre-wrap' }}>{item.aiAnalysis}</pre></div>
              </div>
            </div>
          )}
          {item.aiGeneratedTests && !aiResult && !item.aiResponse && !item.aiAnalysis && (
            <div className="ai-saved-response">
              <div className="ai-response-header">
                <div className="ai-response-title"><FaRobot className="ai-icon" /><h3>AI Generated Tests</h3></div>
              </div>
              <div className="ai-response-body">
                <div className="ai-content"><pre style={{ whiteSpace: 'pre-wrap' }}>{item.aiGeneratedTests}</pre></div>
              </div>
            </div>
          )}
          {item.generatedTest && !aiResult && !item.aiResponse && (
            <div className="ai-saved-response">
              <div className="ai-response-header">
                <div className="ai-response-title"><FaRobot className="ai-icon" /><h3>Generated Test</h3></div>
              </div>
              <div className="ai-response-body">
                <div className="ai-content"><pre style={{ whiteSpace: 'pre-wrap' }}>{item.generatedTest}</pre></div>
              </div>
            </div>
          )}

          <AIResponseDisplay result={aiResult} loading={aiLoading} />
        </div>
      </div>
    </div>
  );
}

export default DetailModal;
