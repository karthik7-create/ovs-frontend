import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Results from './pages/Results.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import Navbar from './components/Navbar.jsx';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [username, setUsername] = useState(localStorage.getItem('username'));

  const handleLogin = (tokenVal, roleVal, usernameVal) => {
    localStorage.setItem('token', tokenVal);
    localStorage.setItem('role', roleVal);
    localStorage.setItem('username', usernameVal);
    setToken(tokenVal);
    setRole(roleVal);
    setUsername(usernameVal);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    setToken(null);
    setRole(null);
    setUsername(null);
  };

  const isLoggedIn = !!token;
  const isAdmin = role === 'ADMIN';

  return (
    <BrowserRouter>
      {isLoggedIn && <Navbar username={username} role={role} onLogout={handleLogout} />}
      <Routes>
        <Route
          path="/"
          element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />}
        />
        <Route
          path="/register"
          element={isLoggedIn ? <Navigate to="/dashboard" /> : <Register />}
        />
        <Route
          path="/dashboard"
          element={isLoggedIn ? <Dashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/results"
          element={isLoggedIn ? <Results /> : <Navigate to="/" />}
        />
        <Route
          path="/admin"
          element={isLoggedIn && isAdmin ? <AdminPanel /> : <Navigate to="/" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
