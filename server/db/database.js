const Database = require('better-sqlite3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'coding_ideas.db');
const db = new Database(dbPath);

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_score INTEGER DEFAULT 0,
    ideas_generated INTEGER DEFAULT 0,
    ideas_matched INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS ai_suggestions (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    category TEXT,
    prompt TEXT,
    ideas_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS user_ideas (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    idea_text TEXT,
    category TEXT,
    score INTEGER DEFAULT 0,
    is_exact_match BOOLEAN DEFAULT false,
    matched_ai_suggestion_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (matched_ai_suggestion_id) REFERENCES ai_suggestions(id)
  );

  CREATE TABLE IF NOT EXISTS idea_history (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    action_type TEXT, -- 'generated', 'matched', 'viewed'
    ai_suggestion_id TEXT,
    user_idea_id TEXT,
    score INTEGER,
    metadata_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (ai_suggestion_id) REFERENCES ai_suggestions(id),
    FOREIGN KEY (user_idea_id) REFERENCES user_ideas(id)
  );

  CREATE INDEX IF NOT EXISTS idx_ai_suggestions_user ON ai_suggestions(user_id);
  CREATE INDEX IF NOT EXISTS idx_ai_suggestions_category ON ai_suggestions(category);
  CREATE INDEX IF NOT EXISTS idx_user_ideas_user ON user_ideas(user_id);
  CREATE INDEX IF NOT EXISTS idx_idea_history_user ON idea_history(user_id);
`);

// User operations
const createUser = db.prepare(`
  INSERT INTO users (id, username) VALUES (?, ?)
`);

const getUserByUsername = db.prepare(`
  SELECT * FROM users WHERE username = ?
`);

const getUserById = db.prepare(`
  SELECT * FROM users WHERE id = ?
`);

const updateUserScore = db.prepare(`
  UPDATE users SET total_score = total_score + ?, ideas_generated = ideas_generated + ?, ideas_matched = ideas_matched + ? WHERE id = ?
`);

// AI Suggestions operations
const saveAISuggestion = db.prepare(`
  INSERT INTO ai_suggestions (id, user_id, category, prompt, ideas_json) VALUES (?, ?, ?, ?, ?)
`);

const getAISuggestionsByUser = db.prepare(`
  SELECT * FROM ai_suggestions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?
`);

const getAISuggestionsByCategory = db.prepare(`
  SELECT * FROM ai_suggestions WHERE category = ? ORDER BY created_at DESC LIMIT ?
`);

const getAISuggestionById = db.prepare(`
  SELECT * FROM ai_suggestions WHERE id = ?
`);

const getAllAISuggestions = db.prepare(`
  SELECT * FROM ai_suggestions ORDER BY created_at DESC LIMIT ?
`);

// User Ideas operations
const saveUserIdea = db.prepare(`
  INSERT INTO user_ideas (id, user_id, idea_text, category, score, is_exact_match, matched_ai_suggestion_id) 
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const getUserIdeas = db.prepare(`
  SELECT * FROM user_ideas WHERE user_id = ? ORDER BY created_at DESC LIMIT ?
`);

const getUserIdeaById = db.prepare(`
  SELECT * FROM user_ideas WHERE id = ?
`);

const getUserIdeasByCategory = db.prepare(`
  SELECT * FROM user_ideas WHERE user_id = ? AND category = ? ORDER BY created_at DESC LIMIT ?
`);

// History operations
const saveHistory = db.prepare(`
  INSERT INTO idea_history (id, user_id, action_type, ai_suggestion_id, user_idea_id, score, metadata_json) 
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const getUserHistory = db.prepare(`
  SELECT * FROM idea_history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?
`);

// Analytics
const getUserStats = db.prepare(`
  SELECT 
    u.total_score,
    u.ideas_generated,
    u.ideas_matched,
    COUNT(DISTINCT ai.id) as total_suggestions,
    COUNT(DISTINCT ui.id) as total_user_ideas,
    AVG(ui.score) as avg_score
  FROM users u
  LEFT JOIN ai_suggestions ai ON ai.user_id = u.id
  LEFT JOIN user_ideas ui ON ui.user_id = u.id
  WHERE u.id = ?
  GROUP BY u.id
`);

const getPopularCategories = db.prepare(`
  SELECT category, COUNT(*) as count FROM ai_suggestions GROUP BY category ORDER BY count DESC LIMIT 5
`);

const getRecentMatches = db.prepare(`
  SELECT ui.*, ai.category as ai_category FROM user_ideas ui
  JOIN ai_suggestions ai ON ui.matched_ai_suggestion_id = ai.id
  WHERE ui.user_id = ? AND ui.is_exact_match = true
  ORDER BY ui.created_at DESC LIMIT 10
`);

const checkIdeaExists = db.prepare(`
  SELECT * FROM user_ideas WHERE user_id = ? AND idea_text = ?
`);

const checkSuggestionExists = db.prepare(`
  SELECT * FROM ai_suggestions WHERE user_id = ? AND ideas_json LIKE ?
`);

module.exports = {
  db,
  createUser,
  getUserByUsername,
  getUserById,
  updateUserScore,
  saveAISuggestion,
  getAISuggestionsByUser,
  getAISuggestionsByCategory,
  getAISuggestionById,
  getAllAISuggestions,
  saveUserIdea,
  getUserIdeas,
  getUserIdeaById,
  getUserIdeasByCategory,
  saveHistory,
  getUserHistory,
  getUserStats,
  getPopularCategories,
  getRecentMatches,
  checkIdeaExists,
  checkSuggestionExists,
  generateId: () => uuidv4()
};
