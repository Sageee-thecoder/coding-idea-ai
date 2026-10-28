import React from 'react';

function IdeaDisplay({ ideas, theme }) {
  if (!ideas || ideas.length === 0) {
    return (
      <div className="idea-display-empty" style={{ color: theme.text }}>
        <p>No ideas generated yet. Create some above!</p>
      </div>
    );
  }

  return (
    <div className="idea-display" style={{ borderColor: theme.border }}>
      <h3 style={{ color: theme.accent, fontFamily: 'Press Start 2P, cursive' }}>
        YOUR IDEAS
      </h3>
      
      <div className="ideas-grid">
        {ideas.map((idea, index) => (
          <div 
            key={index} 
            className="idea-card"
            style={{ 
              backgroundColor: theme.primary,
              borderColor: theme.border,
              color: theme.text
            }}
          >
            <div className="idea-header">
              <span className="idea-number" style={{ color: theme.accent }}>
                #{index + 1}
              </span>
              <span className="idea-difficulty" style={{ 
                backgroundColor: theme.accent,
                color: theme.bg
              }}>
                {idea.difficulty || 'Medium'}
              </span>
            </div>
            
            <h4 style={{ color: theme.text, margin: '10px 0' }}>
              {idea.name}
            </h4>
            
            <p style={{ color: theme.text, fontSize: '0.9rem' }}>
              {idea.description}
            </p>
            
            {idea.category && (
              <div className="idea-category" style={{ color: theme.secondary }}>
                Category: {idea.category}
              </div>
            )}
            
            {idea.genre && (
              <div className="idea-genre" style={{ color: theme.secondary }}>
                Genre: {idea.genre}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default IdeaDisplay;
