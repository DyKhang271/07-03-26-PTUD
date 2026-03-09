import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

function ConfirmModal({ student, onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', borderRadius: '16px', padding: '32px', maxWidth: '420px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ color: '#ef4444', fontSize: '20px' }}></i>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Delete Student</h3>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>This action cannot be undone</p>
          </div>
        </div>
        <p style={{ margin: '0 0 24px', fontSize: '14px', color: 'var(--text-muted)' }}>
          Are you sure you want to delete <strong style={{ color: 'var(--text-dark)' }}>{student.name}</strong> ({student.student_id})?
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onCancel} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
          <button onClick={onConfirm} className="btn" style={{ flex: 1, justifyContent: 'center', background: 'var(--danger)', color: 'white' }}>
            <i className="fa-solid fa-trash-can"></i> Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default function StudentList() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchStudents = useCallback((q = '') => {
    setLoading(true)
    api.get('/students', { params: q ? { search: q } : {} })
      .then(res => setStudents(res.data))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => fetchStudents(search), 300)
    return () => clearTimeout(timer)
  }, [search, fetchStudents])

  const handleDeleteConfirm = () => {
    api.delete(`/students/${deleteTarget.student_id}`)
      .then(() => { setDeleteTarget(null); fetchStudents(search) })
  }

  const handleExport = () => {
    window.open('http://localhost:8000/students/export', '_blank')
  }

  const getGpaBadge = (gpa) => {
    if (gpa >= 8.0) return 'gpa-badge gpa-high'
    if (gpa >= 5.0) return 'gpa-badge gpa-mid'
    return 'gpa-badge gpa-low'
  }

  return (
    <>
      {deleteTarget && (
        <ConfirmModal student={deleteTarget} onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)} />
      )}
      <div className="card">
        <div className="toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Student List</h2>
            <div className="search-input-wrap">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input
                placeholder="Search by name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleExport} className="btn btn-outline" title="Export CSV">
              <i className="fa-solid fa-file-csv"></i> Export CSV
            </button>
            <Link to="/add" className="btn btn-primary">
              <i className="fa-solid fa-plus"></i> Add Student
            </Link>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Class</th>
                <th>Major</th>
                <th>GPA</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '28px', marginBottom: '10px', display: 'block' }}></i>Loading...
                </td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  <i className="fa-solid fa-folder-open" style={{ fontSize: '28px', marginBottom: '10px', display: 'block' }}></i>No students found.
                </td></tr>
              ) : students.map(s => (
                <tr key={s.student_id}>
                  <td><strong>{s.student_id}</strong></td>
                  <td style={{ fontWeight: 500 }}>{s.name}</td>
                  <td>
                    {s.class_id
                      ? <span className="tag" style={{ display: 'inline-flex', padding: '3px 10px', fontSize: '12px' }}>
                          <i className="fa-solid fa-school" style={{ fontSize: '11px' }}></i> {s.class_id}
                        </span>
                      : <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>
                    }
                  </td>
                  <td>{s.major}</td>
                  <td><span className={getGpaBadge(s.gpa)}>{s.gpa}</span></td>
                  <td>
                    <div className="action-btns" style={{ justifyContent: 'flex-end', gap: '8px' }}>
                      <Link to={`/edit/${s.student_id}`} className="btn btn-outline" style={{ padding: '5px 10px', fontSize: '12px', height: 'auto' }}>
                        <i className="fa-solid fa-pen-to-square"></i> Edit
                      </Link>
                      <button type="button" onClick={() => setDeleteTarget(s)} className="btn btn-outline"
                        style={{ padding: '5px 10px', fontSize: '12px', height: 'auto', color: 'var(--danger)', borderColor: 'var(--danger)', background: 'white', cursor: 'pointer' }}>
                        <i className="fa-solid fa-trash-can"></i> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
