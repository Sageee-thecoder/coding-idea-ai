import React from 'react';

function IdeaGenerator({ userInput, setUserInput, onGenerate, loading, theme }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate();
  };

  return (
    <div className="idea-generator" style={{ borderColor: theme.border }}>
      <h2 style={{ color: theme.accent, fontFamily: 'Press Start 2P, cursive' }}>
        GENERATE IDEAS
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="type" style={{ color: theme.text }}>
            Project Type:
          </label>
          <select
            id="type"
            value={userInput.type}
            onChange={(e) => setUserInput({...userInput, type: e.target.value})}
            style={{ 
              backgroundColor: theme.primary,
              color: theme.text,
              borderColor: theme.border
            }}
          >
            <option value="general">General</option>
            <option value="web">Web Development</option>
            <option value="mobile">Mobile App</option>
            <option value="game">Game Development</option>
            <option value="ai">AI/ML</option>
          </select>
        </div>

        <div className="input-group">
          <label htmlFor="details" style={{ color: theme.text }}>
            Additional Details (optional):
          </label>
          <textarea
            id="details"
            value={userInput.details}
            onChange={(e) => setUserInput({...userInput, details: e.target.value})}
            placeholder="e.g., Must use React, Should be a multiplayer game..."
            style={{ 
              backgroundColor: theme.primary,
              color: theme.text,
              borderColor: theme.border
            }}
            rows={3}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ 
            backgroundColor: theme.accent,
            color: theme.bg,
            fontFamily: 'Press Start 2P, cursive'
          }}
        >
          {loading ? 'GENERATING...' : 'GENERATE IDEAS'}
        </button>
      </form>
    </div>
  );
}

export default IdeaGenerator;
