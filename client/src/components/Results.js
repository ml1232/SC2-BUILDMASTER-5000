import React, { useState, useEffect } from 'react';

function Results() {
  const [results, setResults] = useState([]);
  const [newResult, setNewResult] = useState({
    build_id: '',
    opp_division: '',
    win_loss: '',
  });
  const [buildId, setBuildId] = useState('');
  const [resultsByBuildId, setResultsByBuildId] = useState([]);
  const [buildStats, setBuildStats] = useState(null);

  const handleGetResults = () => {
    // Make a GET request to retrieve the user's results
    fetch(`/api/results?user_id=${sessionStorage.getItem('user_id')}`)
      .then((response) => response.json())
      .then((data) => {
        setResults(data);
      })
      .catch((error) => {
        console.error('Failed to retrieve results:', error);
      });
  };

  const handleAddResult = () => {
    // Make a POST request to add a new result
    const user_id = sessionStorage.getItem('user_id');
    const build_id = newResult.build_id;
    const opp_division = newResult.opp_division;
    const win_loss = newResult.win_loss;

    const resultData = {
      build_id,
      opp_division,
      win_loss,
      user_id,
    };

    fetch('/api/results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resultData),
    })
      .then((response) => response.json())
      .then(() => {
        setNewResult({
          build_id: '',
          opp_division: '',
          win_loss: '',
        });
        handleGetResults();
      })
      .catch((error) => {
        console.error('Failed to add a result:', error);
      });
  };

  const handleGetResultsByBuildId = () => {
    // Make a GET request to retrieve results by Build ID
    fetch(`/api/results/by-build-id?build_id=${buildId}&user_id=${sessionStorage.getItem('user_id')}`)
      .then((response) => response.json())
      .then((data) => {
        setResultsByBuildId(data);
      })
      .catch((error) => {
        console.error('Failed to retrieve results by Build ID:', error);
      });
  };

  const calculateBuildStats = () => {
    const totalMatches = resultsByBuildId.length;
    const totalWins = resultsByBuildId.filter((result) => result.win_loss === 'W').length;
    const totalLosses = resultsByBuildId.filter((result) => result.win_loss === 'L').length;
    const winPercentage = totalMatches === 0 ? 0 : (totalWins / totalMatches) * 100;

    setBuildStats({
      totalMatches,
      totalWins,
      totalLosses,
      winPercentage,
    });
  };

  useEffect(() => {
    handleGetResults();
  }, []);

  useEffect(() => {
    calculateBuildStats();
  }, [resultsByBuildId]);

  return (
    <div>
      <h1>Results</h1>
      <p>This is where you can add, look up, and edit results.</p>

      <div>
        <h2>Add New Result Here</h2>
        <label>Build ID:</label>
        <input type="text" value={newResult.build_id} onChange={(e) => setNewResult({ ...newResult, build_id: e.target.value })} />
        <label>Opponent Division:</label>
        <input type="text" value={newResult.opp_division} onChange={(e) => setNewResult({ ...newResult, opp_division: e.target.value })} />
        <label>Win/Loss:</label>
        <input type="text" value={newResult.win_loss} onChange={(e) => setNewResult({ ...newResult, win_loss: e.target.value })} />
        <button onClick={handleAddResult}>Submit Result</button>
      </div>

      <div>
        <h2>Get Results by Build ID</h2>
        <label>Build ID:</label>
        <input type="text" value={buildId} onChange={(e) => setBuildId(e.target.value)} />
        <button onClick={handleGetResultsByBuildId}>Get Results by Build ID</button>
      </div>

      {resultsByBuildId.length > 0 && (
        <div>
          <h2>Results List</h2>
          <ul>
            {resultsByBuildId.map((result) => (
              <li key={result.result_id}>
                Result ID: {result.result_id}, Build ID: {result.build_id}, Opponent Division: {result.opp_division}, Win/Loss: {result.win_loss}
              </li>
            ))}
          </ul>
        </div>
      )}

      {buildStats && (
        <div>
          <h2>Build Statistics</h2>
          <p>
            Build ID: {buildId}, Total Matches: {buildStats.totalMatches}, Total Wins: {buildStats.totalWins}, Total Losses: {buildStats.totalLosses}, Win Percentage: {buildStats.winPercentage.toFixed(2)}%
          </p>
        </div>
      )}
    </div>
  );
}

export default Results;
