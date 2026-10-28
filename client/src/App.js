import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import IdeaGenerator from './components/IdeaGenerator';
import IdeaDisplay from './components/IdeaDisplay';
import ThemeSelector from './components/ThemeSelector';
import MatchResult from './components/MatchResult';
import HistoryPanel from './components/HistoryPanel';
import StatsPanel from './components/StatsPanel';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const THEMES = {
  retro: {
    bg: '#0a0a0a',
    text: '#ffd700',
    primary: '#8B4513',
    secondary: '#2F4F4F',
    accent: '#FFD700',
    border: '#FF8C00'
  },
  cyberpunk: {
    bg: '#001122',
    text: '#00FF88',
    primary: '#001A33',
    secondary: '#003366',
    accent: '#FF00AA',
    border: '#00FFFF'
  },
  arcade: {
    bg: '#000000',
    text: '#FFFF00',
    primary: '#FF0000',
    secondary: '#000000',
    accent: '#FF00FF',
    border: '#FFFFFF'
  },
  synthwave: {
    bg: '#000022',
    text: '#00FFFF',
    primary: '#FF00FF',
    secondary: '#000080',
    accent: '#00FF00',
    border: '#FF00AA'
  },
  monochrome: {
    bg: '#111111',
    text: '#FFFFFF',
    primary: '#333333',
    secondary: '#222222',
    accent: '#888888',
    border: '#AAAAAA'
  }
};

function App() {
  const [theme, setTheme] = useState('retro');
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userInput, setUserInput] = useState({ type: 'general', details: '' });
  const [matchResult, setMatchResult] = useState(null);
  const [userIdea, setUserIdea] = useState('');
  const [score, setScore] = useState(0);
  const [bestIdea, setBestIdea] = useState(null);
  const [username, setUsername] = useState('');
  const [historyTab, setHistoryTab] = useState('ideas');
  const [stats, setStats] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    document.body.style.backgroundColor = THEMES[theme].bg;
    document.body.style.color = THEMES[theme].text;
  }, [theme]);

  useEffect(() => {
    // Load user stats on mount
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/stats`, {
        headers: { 'x-username': username || 'anonymous' }
      });
      setStats(response.data);
      setScore(response.data.stats?.total_score || 0);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const generateIdeas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE}/ideas`, userInput, {
        headers: { 'x-username': username || 'anonymous' }
      });
      setIdeas(response.data.ideas);
      setBestIdea(null);
      
      if (response.data.ideas.length === 1) {
        setBestIdea(response.data.ideas[0]);
      }
      
      // Reload stats
      await loadStats();
    } catch (err) {
      setError('Failed to generate ideas. Please check your API key.');
    } finally {
      setLoading(false);
    }
  };

  const checkMatch = async () => {
    if (!userIdea.trim()) return;
    
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/match`, {
        userIdea,
        category: userInput.type
      }, {
        headers: { 'x-username': username || 'anonymous' }
      });
      
      const result = response.data;
      setMatchResult(result);
      
      if (result.isExactMatch) {
        setScore(prev => prev + 100);
        setBestIdea({ name: userIdea, description: 'Perfect match! This is the best idea!', isPerfect: true });
      } else if (result.score > 70) {
        setScore(prev => prev + 50);
      } else {
        setScore(prev => prev + 10);
      }
      
      // Clear the input
      setUserIdea('');
      
      // Reload stats
      await loadStats();
    } catch (err) {
      setError('Failed to check match.');
    } finally {
      setLoading(false);
    }
  };

  const currentTheme = THEMES[theme];

  return (
    <div className="app" style={{ 
      backgroundColor: currentTheme.bg,
      color: currentTheme.text,
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div className="retro-overlay"></div>
      
      <header className="header" style={{ borderColor: currentTheme.border }}>
        <div className="header-content">
          <h1 style={{ color: currentTheme.accent }}>CODE IDEA AI</h1>
          <div className="user-section">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username..."
              style={{ 
                backgroundColor: currentTheme.primary,
                color: currentTheme.text,
                borderColor: currentTheme.border,
                padding: '5px 10px',
                fontSize: '0.9rem'
              }}
            />
            <div className="score-display" style={{ color: currentTheme.accent }}>
              Score: {score}
            </div>
          </div>
        </div>
      </header>

      <div className="main-layout">
        <main className="main-content" style={{ borderColor: currentTheme.border }}>
          <ThemeSelector theme={theme} setTheme={setTheme} themes={THEMES} />

          <IdeaGenerator
            userInput={userInput}
            setUserInput={setUserInput}
            onGenerate={generateIdeas}
            loading={loading}
            theme={currentTheme}
          />

          {error && <div className="error" style={{ color: '#ff4444' }}>{error}</div>}

          {bestIdea && (
            <div className="best-idea-display" style={{ 
              borderColor: currentTheme.accent,
              backgroundColor: currentTheme.primary
            }}>
              <h2 style={{ color: currentTheme.accent }}>PERFECT MATCH!</h2>
              <p style={{ color: currentTheme.text }}><strong>{bestIdea.name}</strong></p>
              <p style={{ color: currentTheme.text }}>{bestIdea.description}</p>
              {bestIdea.isPerfect && (
                <div className="perfect-badge" style={{ 
                  backgroundColor: currentTheme.accent,
                  color: currentTheme.bg
                }}>
                  PERFECT IDEA!
                </div>
              )}
            </div>
          )}

          <IdeaDisplay ideas={ideas} theme={currentTheme} />

          <div className="match-section" style={{ borderColor: currentTheme.border }}>
            <h3 style={{ color: currentTheme.accent }}>Check Your Idea</h3>
            <div className="match-input-group">
              <input
                type="text"
                value={userIdea}
                onChange={(e) => setUserIdea(e.target.value)}
                placeholder="Enter your coding idea..."
                style={{ 
                  backgroundColor: currentTheme.primary,
                  color: currentTheme.text,
                  borderColor: currentTheme.border
                }}
              />
              <button onClick={checkMatch} disabled={loading} style={{ 
                backgroundColor: currentTheme.accent,
                color: currentTheme.bg
              }}>
                {loading ? 'Checking...' : 'Check Match'}
              </button>
            </div>
            
            {matchResult && (
              <MatchResult result={matchResult} theme={currentTheme} />
            )}
          </div>

          {stats && (
            <StatsPanel stats={stats} theme={currentTheme} />
          )}
        </main>

        {showHistory && (
          <HistoryPanel
            theme={currentTheme}
            onClose={() => setShowHistory(false)}
            tab={historyTab}
            setTab={setHistoryTab}
            username={username}
          />
        )}

        <button
          onClick={() => setShowHistory(true)}
          className="history-toggle"
          style={{ 
            backgroundColor: currentTheme.accent,
            color: currentTheme.bg,
            borderColor: currentTheme.border
          }}
        >
          {showHistory ? 'Hide History' : 'Show History'}
        </button>
      </div>

      <footer className="footer" style={{ borderColor: currentTheme.border }}>
        <p>Powered by Groq AI | Track your coding journey</p>
      </footer>
    </div>
  );
}

export default App;
