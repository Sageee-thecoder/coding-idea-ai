import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function HistoryPanel({ theme, onClose, tab, setTab, username }) {
  const [suggestions, setSuggestions] = useState([]);
  const [userIdeas, setUserIdeas] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    if (tab === 'suggestions') {
      loadSuggestions();
    } else if (tab === 'ideas') {
      loadUserIdeas();
    } else if (tab === 'history') {
      loadHistory();
    }
  }, [tab, username]);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/history/suggestions?limit=50`, {
        headers: { 'x-username': username || 'anonymous' }
      });
      setSuggestions(response.data);
    } catch (err) {
      console.error('Failed to load suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserIdeas = async () => {
    setLoading(true);
    try {
      const url = categoryFilter 
        ? `${API_BASE}/history/user-ideas?limit=50&category=${categoryFilter}`
        : `${API_BASE}/history/user-ideas?limit=50`;
      const response = await axios.get(url, {
        headers: { 'x-username': username || 'anonymous' }
      });
      setUserIdeas(response.data);
    } catch (err) {
      console.error('Failed to load user ideas:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/history?limit=100`, {
        headers: { 'x-username': username || 'anonymous' }
      });
      setHistory(response.data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteIdea = async (id) => {
    try {
      await axios.delete(`${API_BASE}/history/user-ideas/${id}`, {
        headers: { 'x-username': username || 'anonymous' }
      });
      loadUserIdeas();
    } catch (err) {
      console.error('Failed to delete idea:', err);
    }
  };

  return (
    <div className="history-panel" style={{ 
      backgroundColor: theme.primary,
      borderColor: theme.border,
      color: theme.text
    }}>
      <div className="panel-header" style={{ borderColor: theme.border }}>
        <h2 style={{ color: theme.accent }}>HISTORY</h2>
        <button onClick={onClose} className="close-button" style={{ color: theme.text }}>
          &times;
        </button>
      </div>

      <div className="panel-tabs">
        <button
          onClick={() => setTab('suggestions')}
          style={{ 
            backgroundColor: tab === 'suggestions' ? theme.accent : theme.primary,
            color: tab === 'suggestions' ? theme.bg : theme.text,
            borderColor: theme.border
          }}
        >
          AI Suggestions
        </button>
        <button
          onClick={() => setTab('ideas')}
          style={{ 
            backgroundColor: tab === 'ideas' ? theme.accent : theme.primary,
            color: tab === 'ideas' ? theme.bg : theme.text,
            borderColor: theme.border
          }}
        >
          My Ideas
        </button>
        <button
          onClick={() => setTab('history')}
          style={{ 
            backgroundColor: tab === 'history' ? theme.accent : theme.primary,
            color: tab === 'history' ? theme.bg : theme.text,
            borderColor: theme.border
          }}
        >
          Full History
        </button>
      </div>

      {tab === 'suggestions' && (
        <div className="suggestions-list">
          {loading ? (
            <p>Loading...</p>
          ) : suggestions.length === 0 ? (
            <p>No AI suggestions yet. Generate some ideas!</p>
          ) : (
            suggestions.map(suggestion => (
              <div key={suggestion.id} className="suggestion-item" style={{ borderColor: theme.border }}>
                <div className="suggestion-header">
                  <span className="suggestion-category" style={{ color: theme.accent }}>
                    {suggestion.category}
                  </span>
                  <span className="suggestion-date">
                    {new Date(suggestion.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="suggestion-ideas">
                  {suggestion.ideas.map((idea, index) => (
                    <div key={index} className="suggestion-idea" style={{ color: theme.text }}>
                      <strong>{idea.name}</strong>: {idea.description}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'ideas' && (
        <div className="ideas-list">
          <div className="category-filter">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ 
                backgroundColor: theme.primary,
                color: theme.text,
                borderColor: theme.border
              }}
            >
              <option value="">All Categories</option>
              <option value="web">Web Development</option>
              <option value="mobile">Mobile</option>
              <option value="game">Game</option>
              <option value="ai">AI/ML</option>
              <option value="general">General</option>
            </select>
          </div>
          
          {loading ? (
            <p>Loading...</p>
          ) : userIdeas.length === 0 ? (
            <p>No ideas submitted yet. Check your ideas against AI!</p>
          ) : (
            userIdeas.map(idea => (
              <div key={idea.id} className="idea-item" style={{ borderColor: theme.border }}>
                <div className="idea-header">
                  <span className="idea-score" style={{ 
                    backgroundColor: idea.score > 80 ? theme.accent : theme.secondary,
                    color: idea.score > 80 ? theme.bg : theme.text
                  }}>
                    Score: {idea.score}
                  </span>
                  <span className="idea-category" style={{ color: theme.accent }}>
                    {idea.category}
                  </span>
                  <button onClick={() => deleteIdea(idea.id)} className="delete-button" style={{ color: theme.text }}>
                    &times;
                  </button>
                </div>
                <div className="idea-text" style={{ color: theme.text }}>
                  {idea.idea_text}
                </div>
                {idea.is_exact_match && (
                  <div className="exact-match-badge" style={{ 
                    backgroundColor: theme.accent,
                    color: theme.bg
                  }}>
                    EXACT MATCH!
                  </div>
                )}
                <div className="idea-date">
                  {new Date(idea.created_at).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'history' && (
        <div className="history-list">
          {loading ? (
            <p>Loading...</p>
          ) : history.length === 0 ? (
            <p>No history yet. Start generating and matching ideas!</p>
          ) : (
            history.map(item => (
              <div key={item.id} className="history-item" style={{ borderColor: theme.border }}>
                <div className="history-header">
                  <span className="history-action" style={{ color: theme.accent }}>
                    {item.action_type}
                  </span>
                  <span className="history-date">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                {item.score > 0 && (
                  <div className="history-score" style={{ color: theme.text }}>
                    Score: {item.score}
                  </div>
                )}
                <div className="history-meta" style={{ color: theme.text, fontSize: '0.8rem' }}>
                  {item.metadata_json && JSON.parse(item.metadata_json).userIdea && (
                    <p>Idea: {JSON.parse(item.metadata_json).userIdea}</p>
                  )}
                  {item.metadata_json && JSON.parse(item.metadata_json).type && (
                    <p>Type: {JSON.parse(item.metadata_json).type}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default HistoryPanel;
