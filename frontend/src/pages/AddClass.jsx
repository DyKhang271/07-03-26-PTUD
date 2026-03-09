import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'

export default function AddClass() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ class_id: '', class_name: '', advisor: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = e => {
    e.preventDefault()
    setLoading(true); setError('')
    api.post('/classes', form)
      .then(() => navigate('/classes'))
      .catch(err => { setError(err.response?.data?.detail || 'An error occurred'); setLoading(false) })
  }

  return (
    <div className="form-container" style={{ paddingTop: '8px' }}>
      <div className="card">
        <div className="header-title" style={{ fontSize: '20px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
          <i className="fa-solid fa-school" style={{ color: 'var(--primary)' }}></i> Add New Class
        </div>
        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px' }}>
            <i className="fa-solid fa-circle-exclamation"></i> {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Class ID</label>
            <input name="class_id" value={form.class_id} onChange={handleChange} required placeholder="e.g. C06" />
          </div>
          <div className="form-group">
            <label>Class Name</label>
            <input name="class_name" value={form.class_name} onChange={handleChange} required placeholder="e.g. Computer Science 2" />
          </div>
          <div className="form-group">
            <label>Advisor</label>
            <input name="advisor" value={form.advisor} onChange={handleChange} required placeholder="e.g. Nguyen Van A" />
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={loading}>
              <i className="fa-solid fa-check"></i> {loading ? 'Adding...' : 'Add Class'}
            </button>
            <Link to="/classes" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>
              <i className="fa-solid fa-arrow-left"></i> Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
