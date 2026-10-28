require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const db = require('./db/database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/v1/chat/completions';

const IDEA_PROMPTS = {
  web: "Generate 5 unique coding project ideas for a web developer. Each idea should be creative, practical, and include a brief description. Format as JSON array with {name, description, difficulty} fields.",
  mobile: "Generate 5 unique mobile app ideas. Each should solve a real problem and be implementable. Format as JSON array with {name, description, platform, difficulty} fields.",
  game: "Generate 5 unique game ideas. Include genre, mechanics, and what makes them fun. Format as JSON array with {name, description, genre, difficulty} fields.",
  ai: "Generate 5 unique AI/ML project ideas. Focus on practical applications. Format as JSON array with {name, description, tech, difficulty} fields.",
  general: "Generate 5 unique coding project ideas across different domains. Make them creative and varied. Format as JSON array with {name, description, category, difficulty} fields."
};

const DIFFICULTY_SCORES = {
  'beginner': 1,
  'easy': 1,
  'intermediate': 2,
  'medium': 2,
  'advanced': 3,
  'hard': 3,
  'expert': 4
};

// Middleware to handle user session (simple username-based for now)
const withUser = (req, res, next) => {
  const username = req.headers['x-username'] || 'anonymous';
  
  let user = db.getUserByUsername.run(username);
  if (!user) {
    const userId = db.generateId();
    db.createUser.run(userId, username);
    user = { id: userId, username, total_score: 0, ideas_generated: 0, ideas_matched: 0 };
  }
  
  req.user = user;
  next();
};

// Helper to check if idea already exists for user
const checkDuplicateIdea = (userId, ideaText) => {
  return db.checkIdeaExists.get(userId, ideaText);
};

// Helper to check if suggestion already exists
const checkDuplicateSuggestion = (userId, ideasJson) => {
  return db.checkSuggestionExists.get(userId, `%${ideasJson}%`);
};

app.post('/api/ideas', withUser, async (req, res) => {
  try {
    const { type = 'general', details = '', count = 5 } = req.body;
    const userId = req.user.id;
    
    const prompt = IDEA_PROMPTS[type] || IDEA_PROMPTS.general;
    const userPrompt = details ? `${prompt} Additional constraints: ${details}` : prompt;
    
    const response = await axios.post(GROQ_API_URL, {
      model: "mixtral-8x7b-32768",
      messages: [
        {
          role: "user",
          content: userPrompt
        }
      ],
      temperature: 0.8,
      max_tokens: 2000
    }, {
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const content = response.data.choices[0].message.content;
    
    let ideas;
    try {
      ideas = JSON.parse(content);
    } catch (e) {
      ideas = [{ name: content, description: "AI generated idea", category: type, difficulty: "medium" }];
    }
    
    // Save to database
    const suggestionId = db.generateId();
    const ideasJson = JSON.stringify(ideas);
    
    // Check for duplicates before saving
    const existing = db.checkSuggestionExists.get(userId, `%${ideasJson}%`);
    if (!existing) {
      db.saveAISuggestion.run(
        suggestionId,
        userId,
        type,
        userPrompt,
        ideasJson
      );
      
      // Save to history
      db.saveHistory.run(
        db.generateId(),
        userId,
        'generated',
        suggestionId,
        null,
        0,
        JSON.stringify({ type, details, count })
      );
      
      // Update user stats
      db.updateUserScore.run(0, 1, 0, userId);
    }
    
    res.json({ 
      ideas, 
      timestamp: Date.now(),
      suggestionId,
      isNew: !existing
    });
  } catch (error) {
    console.error('Error generating ideas:', error.message);
    res.status(500).json({ error: 'Failed to generate ideas' });
  }
});

app.post('/api/match', withUser, async (req, res) => {
  try {
    const { userIdea, category = 'general' } = req.body;
    const userId = req.user.id;
    
    // Check if user already submitted this idea
    const existingIdea = db.checkIdeaExists.get(userId, userIdea);
    
    const response = await axios.post(GROQ_API_URL, {
      model: "mixtral-8x7b-32768",
      messages: [
        {
          role: "user",
          content: `Analyze if this coding idea matches any common patterns: "${userIdea}". Respond with JSON: {matches: ["idea1", "idea2"], score: 0-100, isExactMatch: boolean, similarIdeas: ["idea1", "idea2"]}`
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    }, {
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const content = response.data.choices[0].message.content;
    const result = JSON.parse(content);
    
    // Save user idea to database
    let userIdeaId = existingIdea?.id;
    if (!userIdeaId) {
      userIdeaId = db.generateId();
      db.saveUserIdea.run(
        userIdeaId,
        userId,
        userIdea,
        category,
        result.score,
        result.isExactMatch,
        null
      );
      
      // Update user stats
      db.updateUserScore.run(0, 0, 1, userId);
    }
    
    // Save to history
    db.saveHistory.run(
      db.generateId(),
      userId,
      'matched',
      null,
      userIdeaId,
      result.score,
      JSON.stringify({ userIdea, category })
    );
    
    // If exact match, find the matching AI suggestion
    if (result.isExactMatch) {
      const suggestions = db.getAISuggestionsByUser.all(userId, 50);
      for (const suggestion of suggestions) {
        const suggestionsIdeas = JSON.parse(suggestion.ideas_json);
        const match = suggestionsIdeas.find(idea => idea.name === userIdea);
        if (match) {
          // Update the user idea with the matched suggestion
          db.saveUserIdea.run(
            userIdeaId,
            userId,
            userIdea,
            category,
            100,
            true,
            suggestion.id
          );
          
          db.updateUserScore.run(result.score, 0, 0, userId);
          result.matchedSuggestionId = suggestion.id;
          break;
        }
      }
    }
    
    res.json({ ...result, userIdeaId, isNew: !existingIdea });
  } catch (error) {
    console.error('Error matching idea:', error.message);
    res.status(500).json({ error: 'Failed to match idea' });
  }
});

app.get('/api/themes', (req, res) => {
  const themes = [
    { id: 'retro', name: 'Retro Console', colors: { primary: '#8B4513', secondary: '#2F4F4F', accent: '#FFD700' } },
    { id: 'cyberpunk', name: 'Cyberpunk', colors: { primary: '#00FF88', secondary: '#001A33', accent: '#FF00AA' } },
    { id: 'arcade', name: 'Arcade', colors: { primary: '#FF0000', secondary: '#000000', accent: '#FFFF00' } },
    { id: 'synthwave', name: 'Synthwave', colors: { primary: '#FF00FF', secondary: '#000080', accent: '#00FFFF' } },
    { id: 'monochrome', name: 'Monochrome', colors: { primary: '#FFFFFF', secondary: '#000000', accent: '#808080' } }
  ];
  res.json(themes);
});

// New endpoints for history and tracking

// Get user's AI suggestion history
app.get('/api/history/suggestions', withUser, (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const suggestions = db.getAISuggestionsByUser.all(req.user.id, parseInt(limit));
    res.json(suggestions.map(s => ({
      ...s,
      ideas: JSON.parse(s.ideas_json)
    })));
  } catch (error) {
    console.error('Error fetching suggestions:', error.message);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

// Get user's idea submissions
app.get('/api/history/user-ideas', withUser, (req, res) => {
  try {
    const { limit = 20, category } = req.query;
    let ideas;
    if (category) {
      ideas = db.getUserIdeasByCategory.all(req.user.id, category, parseInt(limit));
    } else {
      ideas = db.getUserIdeas.all(req.user.id, parseInt(limit));
    }
    res.json(ideas);
  } catch (error) {
    console.error('Error fetching user ideas:', error.message);
    res.status(500).json({ error: 'Failed to fetch user ideas' });
  }
});

// Get full history
app.get('/api/history', withUser, (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const history = db.getUserHistory.all(req.user.id, parseInt(limit));
    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error.message);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Get user stats
app.get('/api/stats', withUser, (req, res) => {
  try {
    const stats = db.getUserStats.get(req.user.id) || {
      total_score: 0,
      ideas_generated: 0,
      ideas_matched: 0,
      total_suggestions: 0,
      total_user_ideas: 0,
      avg_score: 0
    };
    
    const recentMatches = db.getRecentMatches.all(req.user.id);
    const popularCategories = db.getPopularCategories.all();
    
    res.json({
      user: req.user,
      stats,
      recentMatches,
      popularCategories
    });
  } catch (error) {
    console.error('Error fetching stats:', error.message);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get unique suggestions (not yet seen by user)
app.get('/api/suggestions/unique', withUser, (req, res) => {
  try {
    const { category, limit = 10 } = req.query;
    
    let suggestions;
    if (category) {
      suggestions = db.getAISuggestionsByCategory.all(category, parseInt(limit) * 2);
    } else {
      suggestions = db.getAllAISuggestions.all(parseInt(limit) * 2);
    }
    
    // Filter out suggestions the user has already seen
    const userHistory = db.getUserHistory.all(req.user.id, 1000);
    const seenSuggestionIds = new Set(userHistory.filter(h => h.ai_suggestion_id).map(h => h.ai_suggestion_id));
    
    const uniqueSuggestions = suggestions.filter(s => !seenSuggestionIds.has(s.id)).slice(0, parseInt(limit));
    
    res.json(uniqueSuggestions.map(s => ({
      ...s,
      ideas: JSON.parse(s.ideas_json)
    })));
  } catch (error) {
    console.error('Error fetching unique suggestions:', error.message);
    res.status(500).json({ error: 'Failed to fetch unique suggestions' });
  }
});

// Delete a user idea
app.delete('/api/history/user-ideas/:id', withUser, (req, res) => {
  try {
    const { id } = req.params;
    const idea = db.getUserIdeaById.get(id);
    
    if (!idea || idea.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Idea not found' });
    }
    
    db.saveUserIdea.run(id, req.user.id, `[DELETED] ${idea.idea_text}`, idea.category, 0, false, null);
    
    res.json({ success: true, message: 'Idea deleted' });
  } catch (error) {
    console.error('Error deleting idea:', error.message);
    res.status(500).json({ error: 'Failed to delete idea' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
