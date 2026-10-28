require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

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

app.post('/api/ideas', async (req, res) => {
  try {
    const { type = 'general', details = '', count = 5 } = req.body;
    
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
    
    try {
      const ideas = JSON.parse(content);
      res.json({ ideas, timestamp: Date.now() });
    } catch (e) {
      res.json({ ideas: [{ name: content, description: "AI generated idea", category: type, difficulty: "medium" }], timestamp: Date.now() });
    }
  } catch (error) {
    console.error('Error generating ideas:', error.message);
    res.status(500).json({ error: 'Failed to generate ideas' });
  }
});

app.post('/api/match', async (req, res) => {
  try {
    const { userIdea, category = 'general' } = req.body;
    
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
    res.json(JSON.parse(content));
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
