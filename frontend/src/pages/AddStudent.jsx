import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'

export default function AddStudent() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ student_id: '', name: '', birth_year: '', major: '', gpa: '', class_id: '' })
  const [classes, setClasses] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/classes').then(res => setClasses(res.data))
  }, [])

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = e => {
    e.preventDefault()
    setLoading(true); setError('')
    api.post('/students', {
      student_id: form.student_id,
      name: form.name,
      birth_year: parseInt(form.birth_year),
      major: form.major,
      gpa: parseFloat(form.gpa),
      class_id: form.class_id || null,
    })
      .then(() => navigate('/'))
      .catch(err => { setError(err.response?.data?.detail || 'An error occurred'); setLoading(false) })
  }

  return (
    <div className="form-container" style={{ paddingTop: '8px' }}>
      <div className="card">
        <div className="header-title" style={{ fontSize: '20px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
          <i className="fa-solid fa-user-plus"></i> Add New Student
        </div>
        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px' }}>
            <i className="fa-solid fa-circle-exclamation"></i> {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Student ID</label>
            <input name="student_id" value={form.student_id} onChange={handleChange} required placeholder="e.g. S011" />
          </div>
          <div className="form-group">
            <label>Name</label>
            <input name="name" value={form.name} onChange={handleChange} required placeholder="Full name" />
          </div>
          <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label>Birth Year</label>
              <input type="number" name="birth_year" value={form.birth_year} onChange={handleChange} required placeholder="2003" />
            </div>
            <div>
              <label>GPA</label>
              <input type="number" step="0.01" min="0" max="10" name="gpa" value={form.gpa} onChange={handleChange} required placeholder="3.5" />
            </div>
          </div>
          <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label>Major</label>
              <input name="major" value={form.major} onChange={handleChange} required placeholder="e.g. Computer Science" />
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
            <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={loading}>
              <i className="fa-solid fa-check"></i> {loading ? 'Adding...' : 'Add Student'}
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
