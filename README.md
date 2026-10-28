# Code Idea AI - Gamified Coding Project Generator

A fun, retro-style web application that helps developers generate and discover coding project ideas using Groq AI. Features gamification elements, multiple aesthetic themes, and AI-powered idea matching.

## Features

- **AI-Powered Idea Generation**: Uses Groq AI to generate unique coding project ideas based on your preferences
- **Gamification**: Earn points by matching your ideas with AI-generated ones
- **Multiple Categories**: Generate ideas for web development, mobile apps, games, AI/ML, and more
- **Retro Aesthetic**: Multiple theme options with a gaming console feel
- **Idea Matching**: Check how your own ideas compare to AI-generated ones

## Screenshots

The app features a retro gaming console aesthetic with multiple color themes including:
- Retro Console (brown/teal/gold)
- Cyberpunk (neon green/purple)
- Arcade (red/black/yellow)
- Synthwave (pink/blue/cyan)
- Monochrome (classic black/white/gray)

## Tech Stack

- **Frontend**: React.js with custom CSS styling
- **Backend**: Node.js with Express
- **AI Integration**: Groq API (using Mixtral-8x7b-32768 model)
- **Styling**: Retro gaming console aesthetic with animated effects

## Installation

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Groq API key

### Setup

1. Clone the repository:
```bash
git clone https://github.com/Sageee-thecoder/coding-idea-ai.git
cd coding-idea-ai
```

2. Install dependencies:
```bash
npm install
cd client
npm install
cd ..
```

3. Create environment variables:
```bash
cp server/.env.example server/.env
```

Edit `server/.env` and add your Groq API key:
```
GROQ_API_KEY=your_api_key_here
PORT=5000
```

4. Start the development servers:
```bash
npm run dev
```

This will start both the backend server (on port 5000) and the React frontend (on port 3000).

## Usage

1. Select a project category (General, Web Development, Mobile App, Game Development, or AI/ML)
2. Optionally add additional details or constraints
3. Click "Generate Ideas" to get 5 unique project ideas
4. Enter your own idea in the "Check Your Idea" section to see how it matches
5. Earn points for good matches!
6. Switch between different visual themes using the theme selector

## API Endpoints

- `POST /api/ideas` - Generate coding project ideas
- `POST /api/match` - Check if a user's idea matches AI-generated ones
- `GET /api/themes` - Get available theme options

## Project Structure

```
coding-idea-ai/
├── server/
│   ├── index.js          # Express backend server
│   └── .env.example      # Environment variables template
├── client/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js        # Main React component
│       ├── App.css       # Main styles
│       ├── index.js      # React entry point
│       ├── index.css     # Global styles
│       └── components/
│           ├── IdeaGenerator.js
│           ├── IdeaDisplay.js
│           ├── ThemeSelector.js
│           ├── MatchResult.js
│           └── index.css  # Component styles
├── package.json
├── README.md
└── .gitignore
```

## Customization

### Adding New Themes

Edit the `THEMES` object in `client/src/App.js` to add new color schemes:

```javascript
const THEMES = {
  myTheme: {
    bg: '#background',
    text: '#text',
    primary: '#primary',
    secondary: '#secondary',
    accent: '#accent',
    border: '#border'
  },
  ...
};
```

### Adding New Categories

Edit the `IDEA_PROMPTS` object in `server/index.js` to add new project categories:

```javascript
const IDEA_PROMPTS = {
  myCategory: "Generate ideas for my specific category...",
  ...
};
```

## License

MIT License - feel free to use, modify, and distribute this project.

## Acknowledgments

- Powered by [Groq AI](https://groq.com/)
- Fonts by [Google Fonts](https://fonts.google.com/) (Press Start 2P, Orbitron)
- Built with React and Node.js
