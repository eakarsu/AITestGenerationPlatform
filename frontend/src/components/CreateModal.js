import React, { useState } from 'react';
import { FaTimes, FaPlus } from 'react-icons/fa';
import '../styles/Modal.css';

function CreateModal({ fields, onClose, onCreate, title }) {
  const [form, setForm] = useState(() => {
    const initial = {};
    fields.forEach(f => { initial[f.key] = f.default || ''; });
    return initial;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(form);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container create-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title || 'Create New Item'}</h2>
          <button className="btn btn-close" onClick={onClose}><FaTimes /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="create-grid">
            {fields.filter(f => !f.readOnly).map((field) => (
              <div key={field.key} className={`form-group ${field.wide ? 'wide' : ''}`}>
                <label>{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={form[field.key] || ''}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    rows={field.key === 'code' || field.key === 'templateCode' ? 8 : 3}
                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                    required={field.required}
                  />
                ) : field.type === 'select' ? (
                  <select
                    value={form[field.key] || ''}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    required={field.required}
                  >
                    <option value="">Select {field.label}</option>
                    {field.options?.map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type || 'text'}
                    value={form[field.key] || ''}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                    required={field.required}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-create">
              <FaPlus /> Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateModal;
