import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../api'

export default function EditClass() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ class_name: '', advisor: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/classes/${id}`)
      .then(res => setForm({ class_name: res.data.class_name, advisor: res.data.advisor }))
      .catch(() => setError('Class not found'))
      .finally(() => setLoading(false))
  }, [id])

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = e => {
    e.preventDefault()
    setSaving(true); setError('')
    api.put(`/classes/${id}`, form)
      .then(() => navigate('/classes'))
      .catch(err => { setError(err.response?.data?.detail || 'An error occurred'); setSaving(false) })
  }

  if (loading) return (
    <div className="form-container"><div className="card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px' }}></i>
    </div></div>
  )

  return (
    <div className="form-container" style={{ paddingTop: '8px' }}>
      <div className="card">
        <div className="header-title" style={{ fontSize: '20px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
          <i className="fa-solid fa-school" style={{ color: 'var(--warning)' }}></i> Edit Class: {id}
        </div>
        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px' }}>
            <i className="fa-solid fa-circle-exclamation"></i> {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Class Name</label>
            <input name="class_name" value={form.class_name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Advisor</label>
            <input name="advisor" value={form.advisor} onChange={handleChange} required />
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
            <button type="submit" className="btn" style={{ background: 'var(--warning)', color: 'white', flex: 1, justifyContent: 'center' }} disabled={saving}>
              <i className="fa-solid fa-floppy-disk"></i> {saving ? 'Saving...' : 'Save Changes'}
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
