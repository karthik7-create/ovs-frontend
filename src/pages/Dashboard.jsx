import { useState, useEffect } from 'react';
import { getCandidates, castVote, getResultsStatus } from '../api';

function Dashboard() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedFor, setVotedFor] = useState(null);
  const [votingClosed, setVotingClosed] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [candidatesRes, statusRes] = await Promise.all([
        getCandidates(),
        getResultsStatus().catch(() => ({ data: { published: false } })),
      ]);
      setCandidates(candidatesRes.data);
      setVotingClosed(statusRes.data.published);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load candidates' });
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (candidateId, candidateName) => {
    if (hasVoted || votingClosed) return;

    const confirmed = window.confirm(
      `Are you sure you want to vote for "${candidateName}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setVoting(candidateId);
    setMessage({ type: '', text: '' });

    try {
      await castVote(candidateId);
      setHasVoted(true);
      setVotedFor(candidateId);
      setMessage({ type: 'success', text: `Your vote for "${candidateName}" has been cast successfully! 🎉` });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cast vote';
      if (msg === 'User already voted') {
        setHasVoted(true);
        setMessage({ type: 'info', text: 'You have already cast your vote.' });
      } else if (msg === 'Voting is closed') {
        setVotingClosed(true);
        setMessage({ type: 'info', text: 'Voting is closed. Results have been published.' });
      } else {
        setMessage({ type: 'error', text: msg });
      }
    } finally {
      setVoting(null);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading candidates...
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🗳️ Cast Your Vote</h1>
        <p>Select your candidate for Tamil Nadu Election 2026</p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      {votingClosed && (
        <div className="already-voted-banner" style={{ borderColor: 'rgba(210, 153, 34, 0.3)', background: 'rgba(210, 153, 34, 0.08)', color: '#d29922' }}>
          🔒 Voting is closed — Results have been published. Visit the Results page to see the outcome.
        </div>
      )}

      {hasVoted && !votingClosed && (
        <div className="already-voted-banner">
          ✅ Your vote has been recorded. Thank you for participating in democracy!
        </div>
      )}

      {candidates.length === 0 ? (
        <div className="results-not-released">
          <div className="icon">📋</div>
          <h2>No Candidates Yet</h2>
          <p>Candidates have not been added to the election. Please check back later.</p>
        </div>
      ) : (
        <div className="candidates-grid">
          {candidates.map((candidate) => (
            <div
              key={candidate.id}
              className={`candidate-card ${votedFor === candidate.id ? 'voted' : ''}`}
            >
              <div className="candidate-avatar">
                {candidate.name.charAt(0).toUpperCase()}
              </div>
              <div className="candidate-name">{candidate.name}</div>
              <div className="candidate-party">
                <span className="party-dot"></span>
                {candidate.party}
              </div>

              {votingClosed ? (
                <button className="btn-vote" disabled>
                  🔒 Voting Closed
                </button>
              ) : hasVoted ? (
                votedFor === candidate.id ? (
                  <div className="voted-badge">✅ Your Vote</div>
                ) : (
                  <button className="btn-vote" disabled>
                    Vote Closed
                  </button>
                )
              ) : (
                <button
                  className="btn-vote"
                  disabled={voting !== null}
                  onClick={() => handleVote(candidate.id, candidate.name)}
                >
                  {voting === candidate.id ? (
                    <>
                      <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2, display: 'inline-block', verticalAlign: 'middle', marginRight: 6 }}></span>
                      Voting...
                    </>
                  ) : (
                    'Vote for ' + candidate.name
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
