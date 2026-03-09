import { NavLink, Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <>
      <div className="container">
        <h1 className="header-title">
          <i className="fa-solid fa-graduation-cap"></i> Student Manager
        </h1>
        <nav className="tab-bar">
          <NavLink to="/" end className={({ isActive }) => 'tab-item' + (isActive ? ' active' : '')}>
            <i className="fa-solid fa-users"></i> Students
          </NavLink>
          <NavLink to="/classes" className={({ isActive }) => 'tab-item' + (isActive ? ' active' : '')}>
            <i className="fa-solid fa-school"></i> Classes
          </NavLink>
          <NavLink to="/statistics" className={({ isActive }) => 'tab-item' + (isActive ? ' active' : '')}>
            <i className="fa-solid fa-chart-bar"></i> Statistics
          </NavLink>
        </nav>
      </div>
      <div className="container">
        <Outlet />
      </div>
    </>
  )
}
