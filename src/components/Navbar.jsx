import { NavLink, useNavigate } from 'react-router-dom';

function Navbar({ username, role, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="flag">
          <span className="flag-saffron"></span>
          <span className="flag-white"></span>
          <span className="flag-green"></span>
        </div>
        OVS 2026
      </div>

      <div className="navbar-links">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          🗳️ Vote
        </NavLink>
        <NavLink to="/results" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          📊 Results
        </NavLink>
        {role === 'ADMIN' && (
          <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            ⚙️ Admin
          </NavLink>
        )}
      </div>

      <div className="navbar-user">
        <div className="user-badge">
          👤 {username}
          <span className={`role-tag ${role === 'ADMIN' ? 'admin' : 'user'}`}>
            {role}
          </span>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
