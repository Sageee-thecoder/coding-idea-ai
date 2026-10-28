import React from 'react';

function MatchResult({ result, theme }) {
  const getScoreColor = () => {
    if (result.score > 80) return theme.accent;
    if (result.score > 50) return '#00FF88';
    return theme.text;
  };

  return (
    <div className="match-result" style={{ 
      borderColor: getScoreColor(),
      backgroundColor: theme.primary,
      marginTop: '15px',
      padding: '15px',
      borderRadius: '8px'
    }}>
      <h4 style={{ color: theme.accent, margin: '0 0 10px 0' }}>
        MATCH RESULT
      </h4>
      
      <div className="match-score" style={{ 
        fontSize: '2rem',
        color: getScoreColor(),
        fontFamily: 'Press Start 2P, cursive'
      }}>
        {result.score}%
      </div>
      
      {result.isExactMatch && (
        <p style={{ color: theme.text, margin: '10px 0' }}>
          <strong>EXACT MATCH!</strong> Your idea perfectly matches an AI-generated idea!
        </p>
      )}
      
      {result.matches && result.matches.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <p style={{ color: theme.text, margin: '5px 0' }}>
            <strong>Matches:</strong>
          </p>
          <ul style={{ color: theme.text, margin: '5px 0', paddingLeft: '20px' }}>
            {result.matches.map((match, index) => (
              <li key={index}>{match}</li>
            ))}
          </ul>
        </div>
      )}
      
      {result.similarIdeas && result.similarIdeas.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <p style={{ color: theme.text, margin: '5px 0' }}>
            <strong>Similar Ideas:</strong>
          </p>
          <ul style={{ color: theme.text, margin: '5px 0', paddingLeft: '20px' }}>
            {result.similarIdeas.map((idea, index) => (
              <li key={index}>{idea}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default MatchResult;
