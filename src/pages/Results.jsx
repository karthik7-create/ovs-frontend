import { useState, useEffect } from 'react';
import { getResults, getResultsStatus } from '../api';

function Results() {
  const [results, setResults] = useState([]);
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    setError('');

    try {
      // First check if results are published
      const statusRes = await getResultsStatus();
      const isPublished = statusRes.data.published;
      setPublished(isPublished);

      if (isPublished) {
        const res = await getResults();
        setResults(res.data);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load results';
      if (msg === 'Results not yet released') {
        setPublished(false);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading results...
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="message error">{error}</div>
      </div>
    );
  }

  if (!published) {
    return (
      <div className="page-container">
        <div className="results-not-released">
          <div className="icon">🔒</div>
          <h2>Results Not Yet Released</h2>
          <p>
            The election results have not been published by the Election Commission yet.
            Please check back after the official announcement.
          </p>
        </div>
      </div>
    );
  }

  const totalVotes = results.reduce((sum, r) => sum + r.voteCount, 0);
  const winner = results.length > 0 ? results[0] : null;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📊 Election Results</h1>
        <p>Tamil Nadu Election 2026 — Official Results</p>
      </div>

      {/* Summary Cards */}
      <div className="results-summary">
        <div className="summary-card">
          <div className="value">{totalVotes}</div>
          <div className="label">Total Votes Cast</div>
        </div>
        <div className="summary-card">
          <div className="value">{results.length}</div>
          <div className="label">Total Candidates</div>
        </div>
        <div className="summary-card">
          <div className="value" style={{ fontSize: '1.4rem' }}>
            🏆 {winner ? winner.candidateName : '-'}
          </div>
          <div className="label">Winner</div>
        </div>
      </div>

      {/* Results Table */}
      <div className="results-table">
        <table>
          <thead>
            <tr>
              <th>Pos</th>
              <th>Candidate</th>
              <th>Party</th>
              <th>Votes</th>
              <th>Vote %</th>
              <th>Margin</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result.candidateId}>
                <td>
                  <span className={`position-badge position-${result.position <= 3 ? result.position : 'other'}`}>
                    {result.position}
                  </span>
                </td>
                <td>
                  <strong>{result.candidateName}</strong>
                </td>
                <td>{result.party}</td>
                <td>
                  <strong>{result.voteCount.toLocaleString()}</strong>
                </td>
                <td>
                  <div className="percentage-bar-container">
                    <div className="percentage-bar">
                      <div
                        className="percentage-bar-fill"
                        style={{ width: `${result.votingPercentage}%` }}
                      ></div>
                    </div>
                    <span className="percentage-text">{result.votingPercentage}%</span>
                  </div>
                </td>
                <td>
                  <span className={`vote-diff ${result.position === 1 ? 'lead' : ''}`}>
                    {result.position === 1 ? (
                      result.voteDifference > 0 ? `+${result.voteDifference.toLocaleString()} lead` : '—'
                    ) : (
                      result.voteDifference > 0 ? `-${result.voteDifference.toLocaleString()}` : 'Tied'
                    )}
                  </span>
                </td>
                <td>
                  {result.status === 'Winner' ? (
                    <span className="status-winner">🏆 Winner</span>
                  ) : result.status === 'Runner-up' ? (
                    <span className="status-runner">🥈 Runner-up</span>
                  ) : (
                    <span className="status-other">{result.status}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Results;
