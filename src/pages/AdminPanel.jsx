import { useState, useEffect } from 'react';
import {
  getResultsStatus,
  publishResults,
  unpublishResults,
  getCandidates,
  addCandidate,
  removeCandidate,
  startNewElection,
} from '../api';

function AdminPanel() {
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Candidate management
  const [candidates, setCandidates] = useState([]);
  const [newName, setNewName] = useState('');
  const [newParty, setNewParty] = useState('');
  const [addingCandidate, setAddingCandidate] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statusRes, candidatesRes] = await Promise.all([
        getResultsStatus(),
        getCandidates(),
      ]);
      setPublished(statusRes.data.published);
      setCandidates(candidatesRes.data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load admin data' });
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // ===== RESULTS =====
  const handlePublish = async () => {
    if (!window.confirm('Publish results? Voting will be closed for all users.')) return;
    setActionLoading(true);
    try {
      await publishResults();
      setPublished(true);
      showMessage('success', 'Results published! Voting is now closed.');
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to publish');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnpublish = async () => {
    if (!window.confirm('Hide results? Voting will be re-opened for users.')) return;
    setActionLoading(true);
    try {
      await unpublishResults();
      setPublished(false);
      showMessage('success', 'Results hidden. Voting is now open.');
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to unpublish');
    } finally {
      setActionLoading(false);
    }
  };

  // ===== CANDIDATES =====
  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !newParty.trim()) {
      showMessage('error', 'Please enter both candidate name and party');
      return;
    }
    setAddingCandidate(true);
    try {
      const res = await addCandidate(newName.trim(), newParty.trim());
      setCandidates((prev) => [...prev, res.data]);
      setNewName('');
      setNewParty('');
      showMessage('success', `Candidate "${res.data.name}" added successfully!`);
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to add candidate');
    } finally {
      setAddingCandidate(false);
    }
  };

  const handleRemoveCandidate = async (id, name) => {
    if (!window.confirm(`Remove "${name}" from the election? All their votes will be deleted.`)) return;
    setRemovingId(id);
    try {
      await removeCandidate(id);
      setCandidates((prev) => prev.filter((c) => c.id !== id));
      showMessage('success', `"${name}" removed from the election.`);
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to remove candidate');
    } finally {
      setRemovingId(null);
    }
  };

  // ===== NEW ELECTION =====
  const handleNewElection = async () => {
    const confirmed = window.confirm(
      '⚠️ START A NEW ELECTION?\n\nThis will:\n• Delete ALL existing votes\n• Delete ALL candidates\n• Remove ALL voter accounts\n• Reset database IDs\n• Hide the current results\n\nAdmin accounts will be preserved.\n\nThis action CANNOT be undone!'
    );
    if (!confirmed) return;

    // Double confirm
    const doubleConfirm = window.confirm(
      'Are you ABSOLUTELY sure? All election data will be permanently lost.'
    );
    if (!doubleConfirm) return;

    setActionLoading(true);
    try {
      await startNewElection();
      setPublished(false);
      // Clear candidates from the UI since they've been deleted from the database
      setCandidates([]);
      showMessage('success', '🎉 New election started! All data has been reset. Add new candidates to begin.');
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to start new election');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading admin panel...
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: 800 }}>
      <div className="page-header">
        <h1>⚙️ Admin Panel</h1>
        <p>Manage candidates, publish results, and conduct elections</p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      {/* ===== RESULTS STATUS ===== */}
      <div className="admin-section">
        <h3 className="section-title">📊 Results Publication</h3>
        <div className="admin-status">
          <div className={`status-indicator ${published ? 'published' : 'unpublished'}`}>
            <span className={`status-dot ${published ? 'live' : 'offline'}`}></span>
            {published ? 'Results are LIVE — Voting is CLOSED' : 'Results are HIDDEN — Voting is OPEN'}
          </div>

          <div className="admin-actions">
            {published ? (
              <button className="btn btn-danger" onClick={handleUnpublish} disabled={actionLoading}>
                {actionLoading ? 'Processing...' : '🔒 Unpublish Results'}
              </button>
            ) : (
              <button className="btn btn-success" onClick={handlePublish} disabled={actionLoading}>
                {actionLoading ? 'Processing...' : '📢 Publish Results'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ===== CANDIDATE MANAGEMENT ===== */}
      <div className="admin-section">
        <h3 className="section-title">👤 Candidate Management</h3>

        {/* Add Candidate Form */}
        <div className="admin-card">
          <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Add New Candidate
          </h4>
          <form onSubmit={handleAddCandidate} className="add-candidate-form">
            <div className="form-row">
              <input
                type="text"
                className="form-input"
                placeholder="Candidate name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
              <input
                type="text"
                className="form-input"
                placeholder="Party name"
                value={newParty}
                onChange={(e) => setNewParty(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary" disabled={addingCandidate} style={{ minWidth: 120 }}>
                {addingCandidate ? 'Adding...' : '➕ Add'}
              </button>
            </div>
          </form>
        </div>

        {/* Candidate List */}
        <div className="admin-card" style={{ marginTop: '1rem' }}>
          <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Current Candidates ({candidates.length})
          </h4>

          {candidates.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
              No candidates added yet. Add candidates above to start the election.
            </p>
          ) : (
            <div className="candidate-list">
              {candidates.map((c) => (
                <div key={c.id} className="candidate-list-item">
                  <div className="candidate-list-info">
                    <div className="candidate-list-avatar">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="candidate-list-name">{c.name}</div>
                      <div className="candidate-list-party">{c.party}</div>
                    </div>
                  </div>
                  <button
                    className="btn-remove"
                    onClick={() => handleRemoveCandidate(c.id, c.name)}
                    disabled={removingId === c.id}
                  >
                    {removingId === c.id ? '...' : '🗑️ Remove'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ===== NEW ELECTION ===== */}
      <div className="admin-section">
        <h3 className="section-title">🔄 Election Management</h3>
        <div className="admin-card" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Start a fresh election. This will delete all existing votes, candidates, and voter accounts.
            Admin accounts will be preserved. Database IDs will be reset.
          </p>
          <button
            className="btn btn-danger"
            onClick={handleNewElection}
            disabled={actionLoading}
            style={{ minWidth: 250 }}
          >
            {actionLoading ? 'Resetting...' : '🔄 Start New Election'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
