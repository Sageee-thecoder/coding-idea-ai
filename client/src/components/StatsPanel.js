import React from 'react';

function StatsPanel({ stats, theme }) {
  const { user, stats: userStats, recentMatches, popularCategories } = stats;

  return (
    <div className="stats-panel" style={{ 
      backgroundColor: theme.primary,
      borderColor: theme.border,
      color: theme.text
    }}>
      <h3 style={{ color: theme.accent, fontFamily: 'Press Start 2P, cursive' }}>
        YOUR STATS
      </h3>

      <div className="stats-grid">
        <div className="stat-item" style={{ borderColor: theme.border }}>
          <div className="stat-label">Total Score</div>
          <div className="stat-value" style={{ color: theme.accent }}>
            {userStats?.total_score || 0}
          </div>
        </div>

        <div className="stat-item" style={{ borderColor: theme.border }}>
          <div className="stat-label">Ideas Generated</div>
          <div className="stat-value" style={{ color: theme.accent }}>
            {userStats?.ideas_generated || 0}
          </div>
        </div>

        <div className="stat-item" style={{ borderColor: theme.border }}>
          <div className="stat-label">Ideas Matched</div>
          <div className="stat-value" style={{ color: theme.accent }}>
            {userStats?.ideas_matched || 0}
          </div>
        </div>

        <div className="stat-item" style={{ borderColor: theme.border }}>
          <div className="stat-label">Avg Score</div>
          <div className="stat-value" style={{ color: theme.accent }}>
            {userStats?.avg_score ? Math.round(userStats.avg_score) : 0}%
          </div>
        </div>
      </div>

      {recentMatches && recentMatches.length > 0 && (
        <div className="recent-matches">
          <h4 style={{ color: theme.accent, marginTop: '15px' }}>
            Recent Perfect Matches
          </h4>
          <ul>
            {recentMatches.map((match, index) => (
              <li key={index} style={{ color: theme.text, fontSize: '0.9rem' }}>
                {match.idea_text}
              </li>
            ))}
          </ul>
        </div>
      )}

      {popularCategories && popularCategories.length > 0 && (
        <div className="popular-categories">
          <h4 style={{ color: theme.accent, marginTop: '15px' }}>
            Popular Categories
          </h4>
          <div className="category-badges">
            {popularCategories.map((cat, index) => (
              <span 
                key={index} 
                className="category-badge"
                style={{ 
                  backgroundColor: theme.secondary,
                  color: theme.text,
                  borderColor: theme.border
                }}
              >
                {cat.category} ({cat.count})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default StatsPanel;
