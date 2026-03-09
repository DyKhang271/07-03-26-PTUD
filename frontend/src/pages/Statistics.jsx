import { useEffect, useState } from 'react'
import api from '../api'

const MAJOR_COLORS = [
  '#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1',
]

export default function Statistics() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/statistics').then(res => setStats(res.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', display: 'block', marginBottom: '12px' }}></i>
      Loading statistics...
    </div>
  )

  if (!stats) return null

  const maxMajorCount = Math.max(...stats.by_major.map(m => m.count), 1)

  return (
    <>
      {/* Stat Cards */}
      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-card-icon icon-purple">
            <i className="fa-solid fa-users"></i>
          </div>
          <div className="stat-card-info">
            <label>Total Students</label>
            <p>{stats.total_students}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon icon-yellow">
            <i className="fa-solid fa-star"></i>
          </div>
          <div className="stat-card-info">
            <label>Average GPA</label>
            <p>{stats.avg_gpa}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon icon-teal">
            <i className="fa-solid fa-school"></i>
          </div>
          <div className="stat-card-info">
            <label>Total Classes</label>
            <p>{stats.total_classes}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Students by Major */}
        <div className="card">
          <h3 style={{ margin: '0 0 20px', fontSize: '15px', fontWeight: 700, color: 'var(--text-dark)' }}>
            <i className="fa-solid fa-chart-bar" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>
            Students by Major
          </h3>
          {stats.by_major.map((m, i) => (
            <div key={m.major} className="major-row">
              <div className="major-row-label" title={m.major}>{m.major}</div>
              <div className="major-bar-wrap">
                <div
                  className="major-bar"
                  style={{ width: `${(m.count / maxMajorCount) * 100}%`, background: MAJOR_COLORS[i % MAJOR_COLORS.length] }}
                ></div>
              </div>
              <div className="major-count">{m.count}</div>
            </div>
          ))}
        </div>

        {/* Students by Class */}
        <div className="card">
          <h3 style={{ margin: '0 0 20px', fontSize: '15px', fontWeight: 700, color: 'var(--text-dark)' }}>
            <i className="fa-solid fa-school" style={{ color: 'var(--success)', marginRight: '8px' }}></i>
            Students by Class
          </h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Class Name</th>
                  <th style={{ textAlign: 'right' }}>Students</th>
                </tr>
              </thead>
              <tbody>
                {stats.by_class.map(c => (
                  <tr key={c.class_name}>
                    <td style={{ fontWeight: 500 }}>{c.class_name}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="gpa-badge" style={{ background: '#e0e7ff', color: '#3730a3' }}>{c.count}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* GPA by Major detail */}
      <div className="card" style={{ marginTop: '4px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 700, color: 'var(--text-dark)' }}>
          <i className="fa-solid fa-table" style={{ color: 'var(--warning)', marginRight: '8px' }}></i>
          GPA by Major
        </h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Major</th>
                <th style={{ textAlign: 'center' }}>Students</th>
                <th style={{ textAlign: 'right' }}>Avg GPA</th>
              </tr>
            </thead>
            <tbody>
              {stats.by_major.map((m, i) => (
                <tr key={m.major}>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: MAJOR_COLORS[i % MAJOR_COLORS.length], display: 'inline-block', flexShrink: 0 }}></span>
                      {m.major}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>{m.count}</td>
                  <td style={{ textAlign: 'right' }}>
                    <span className={m.avg_gpa >= 8 ? 'gpa-badge gpa-high' : m.avg_gpa >= 5 ? 'gpa-badge gpa-mid' : 'gpa-badge gpa-low'}>
                      {m.avg_gpa}
                    </span>
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
