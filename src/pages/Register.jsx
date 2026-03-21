import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, registerAdmin } from '../api';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminSecret, setAdminSecret] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (password.length < 4) {
      setMessage({ type: 'error', text: 'Password must be at least 4 characters' });
      return;
    }

    if (isAdminMode && !adminSecret.trim()) {
      setMessage({ type: 'error', text: 'Admin secret key is required for admin registration' });
      return;
    }

    setLoading(true);

    try {
      if (isAdminMode) {
        await registerAdmin(username, password, adminSecret.trim());
        setMessage({ type: 'success', text: 'Admin registered successfully! Redirecting to login...' });
      } else {
        await registerUser(username, password);
        setMessage({ type: 'success', text: 'Registration successful! Redirecting to login...' });
      }
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setMessage({ type: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="form-header">
          <h2>{isAdminMode ? '🔑 Admin Registration' : 'Create Account'}</h2>
          <p>{isAdminMode ? 'Register as an election administrator' : 'Register to participate in Tamil Nadu Election 2026'}</p>
        </div>

        {/* Toggle between User and Admin registration */}
        <div className="register-mode-toggle">
          <button
            type="button"
            className={`mode-btn ${!isAdminMode ? 'active' : ''}`}
            onClick={() => setIsAdminMode(false)}
          >
            👤 Voter
          </button>
          <button
            type="button"
            className={`mode-btn ${isAdminMode ? 'active' : ''}`}
            onClick={() => setIsAdminMode(true)}
          >
            🔑 Admin
          </button>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>{message.text}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              className="form-input"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {isAdminMode && (
            <div className="form-group">
              <label>🔑 Admin Secret Key</label>
              <input
                type="password"
                className="form-input admin-secret-input"
                placeholder="Enter the admin secret key"
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                required
              />
              <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                Contact the Election Commission to obtain the admin secret key
              </small>
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span>
                Creating account...
              </>
            ) : isAdminMode ? (
              '🔑 Register as Admin'
            ) : (
              '📝 Register'
            )}
          </button>
        </form>

        <div className="form-footer">
          Already have an account? <Link to="/">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
