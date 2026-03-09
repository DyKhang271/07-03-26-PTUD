import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../api'

export default function EditStudent() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', birth_year: '', major: '', gpa: '', class_id: '' })
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      api.get(`/students/${id}`),
      api.get('/classes'),
    ])
      .then(([studentRes, classRes]) => {
        const s = studentRes.data
        setForm({ name: s.name, birth_year: s.birth_year, major: s.major, gpa: s.gpa, class_id: s.class_id || '' })
        setClasses(classRes.data)
      })
      .catch(() => setError('Student not found'))
      .finally(() => setLoading(false))
  }, [id])

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = e => {
    e.preventDefault()
    setSaving(true); setError('')
    api.put(`/students/${id}`, {
      name: form.name,
      birth_year: parseInt(form.birth_year),
      major: form.major,
      gpa: parseFloat(form.gpa),
      class_id: form.class_id || null,
    })
      .then(() => navigate('/'))
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
          <i className="fa-solid fa-user-pen" style={{ color: 'var(--warning)' }}></i> Edit Student: {id}
        </div>
        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px' }}>
            <i className="fa-solid fa-circle-exclamation"></i> {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label>Birth Year</label>
              <input type="number" name="birth_year" value={form.birth_year} onChange={handleChange} required />
            </div>
            <div>
              <label>GPA</label>
              <input type="number" step="0.01" min="0" max="10" name="gpa" value={form.gpa} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label>Major</label>
              <input name="major" value={form.major} onChange={handleChange} required />
            </div>
            <div>
              <label>Class</label>
              <select name="class_id" value={form.class_id} onChange={handleChange}>
                <option value="">— No class —</option>
                {classes.map(c => (
                  <option key={c.class_id} value={c.class_id}>{c.class_id} — {c.class_name}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
            <button type="submit" className="btn" style={{ background: 'var(--warning)', color: 'white', flex: 1, justifyContent: 'center' }} disabled={saving}>
              <i className="fa-solid fa-floppy-disk"></i> {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link to="/" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>
              <i className="fa-solid fa-arrow-left"></i> Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
