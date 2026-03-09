import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

function ConfirmModal({ cls, onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', borderRadius: '16px', padding: '32px', maxWidth: '420px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ color: '#ef4444', fontSize: '20px' }}></i>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Delete Class</h3>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>Students in this class will not be deleted</p>
          </div>
        </div>
        <p style={{ margin: '0 0 24px', fontSize: '14px', color: 'var(--text-muted)' }}>
          Are you sure you want to delete <strong style={{ color: 'var(--text-dark)' }}>{cls.class_name}</strong> ({cls.class_id})?
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

export default function ClassList() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchClasses = () => {
    setLoading(true)
    api.get('/classes').then(res => setClasses(res.data)).finally(() => setLoading(false))
  }

  useEffect(() => { fetchClasses() }, [])

  const handleDeleteConfirm = () => {
    api.delete(`/classes/${deleteTarget.class_id}`)
      .then(() => { setDeleteTarget(null); fetchClasses() })
  }

  return (
    <>
      {deleteTarget && <ConfirmModal cls={deleteTarget} onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)} />}
      <div className="card">
        <div className="toolbar">
          <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Class List</h2>
          <Link to="/classes/add" className="btn btn-primary">
            <i className="fa-solid fa-plus"></i> Add Class
          </Link>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Class ID</th>
                <th>Class Name</th>
                <th>Advisor</th>
                <th style={{ textAlign: 'center' }}>Students</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '28px', marginBottom: '10px', display: 'block' }}></i>Loading...
                </td></tr>
              ) : classes.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  <i className="fa-solid fa-folder-open" style={{ fontSize: '28px', marginBottom: '10px', display: 'block' }}></i>No classes found.
                </td></tr>
              ) : classes.map(c => (
                <tr key={c.class_id}>
                  <td><strong>{c.class_id}</strong></td>
                  <td style={{ fontWeight: 500 }}>{c.class_name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{c.advisor}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="gpa-badge" style={{ background: '#e0e7ff', color: '#3730a3' }}>{c.student_count}</span>
                  </td>
                  <td>
                    <div className="action-btns" style={{ justifyContent: 'flex-end', gap: '8px' }}>
                      <Link to={`/classes/edit/${c.class_id}`} className="btn btn-outline" style={{ padding: '5px 10px', fontSize: '12px', height: 'auto' }}>
                        <i className="fa-solid fa-pen-to-square"></i> Edit
                      </Link>
                      <button type="button" onClick={() => setDeleteTarget(c)} className="btn btn-outline"
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
