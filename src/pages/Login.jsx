import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../api';

const quotes = [
  {
    text: "The vote is the most powerful instrument ever devised by man for breaking down injustice.",
    author: "Lyndon B. Johnson"
  },
  {
    text: "In a democracy, the well-being, individuality, and happiness of every citizen is important for the overall prosperity of the nation.",
    author: "Dr. A.P.J. Abdul Kalam"
  },
  {
    text: "Democracy is not merely a form of government. It is primarily a mode of associated living.",
    author: "Dr. B.R. Ambedkar"
  },
  {
    text: "Every election is determined by the people who show up.",
    author: "Larry J. Sabato"
  },
  {
    text: "The ballot is stronger than the bullet.",
    author: "Abraham Lincoln"
  }
];

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginUser(username, password);
      const token = res.data.token;

      // Decode JWT to get role
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = payload.role || 'USER';

      onLogin(token, role, username);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left Hero Section */}
      <div className="login-hero">
        <div className="hero-content">
          <div className="hero-tagline">🇮🇳 Make Your Voice Count</div>
          <h1 className="hero-title">
            Tamil Nadu<br />
            Election <span className="highlight">2026</span>
          </h1>
          <div className="hero-divider"></div>

          <p className="hero-quote">"{quotes[quoteIndex].text}"</p>
          <p className="hero-quote-author">— {quotes[quoteIndex].author}</p>

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value">6.2 Cr+</div>
              <div className="hero-stat-label">Eligible Voters</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">234</div>
              <div className="hero-stat-label">Constituencies</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">2026</div>
              <div className="hero-stat-label">Election Year</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="login-form-section">
        <div className="form-container">
          <div className="form-header">
            <h2>Welcome Back</h2>
            <p>Sign in to cast your vote securely</p>
          </div>

          {error && <div className="message error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter your username"
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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span>
                  Signing in...
                </>
              ) : (
                '🗳️ Sign In to Vote'
              )}
            </button>
          </form>

          <div className="form-footer">
            Don't have an account? <Link to="/register">Register here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
