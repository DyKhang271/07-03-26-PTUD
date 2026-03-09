import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../api'

export default function EditStudent() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    birth_year: '',
    major: '',
    gpa: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/students/${id}`)
      .then(res => {
        const s = res.data
        setForm({
          name: s.name,
          birth_year: s.birth_year,
          major: s.major,
          gpa: s.gpa,
        })
      })
      .catch(() => setError('Student not found'))
      .finally(() => setLoading(false))
  }, [id])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    api.put(`/students/${id}`, {
      name: form.name,
      birth_year: parseInt(form.birth_year),
      major: form.major,
      gpa: parseFloat(form.gpa),
    })
      .then(() => navigate('/'))
      .catch(err => {
        setError(err.response?.data?.detail || 'An error occurred')
        setSaving(false)
      })
  }

  if (loading) {
    return (
      <div className="container form-container">
        <div className="card" style={{ marginTop: '40px', textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px' }}></i>
        </div>
      </div>
    )
  }

  return (
    <div className="container form-container">
      <div className="card" style={{ marginTop: '40px' }}>
        <div className="header-title" style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
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

          <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label>Birth Year</label>
              <input type="number" name="birth_year" value={form.birth_year} onChange={handleChange} required />
            </div>
            <div>
              <label>GPA</label>
              <input type="number" step="0.01" min="0" max="10" name="gpa" value={form.gpa} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label>Major</label>
            <input name="major" value={form.major} onChange={handleChange} required />
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
            <button
              type="submit"
              className="btn"
              style={{ background: 'var(--warning)', color: 'white', flex: 1, justifyContent: 'center' }}
              disabled={saving}
            >
              <i className="fa-solid fa-floppy-disk"></i> {saving ? 'Saving...' : 'Save Student'}
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
