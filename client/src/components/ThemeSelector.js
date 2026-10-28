import React from 'react';

function ThemeSelector({ theme, setTheme, themes }) {
  return (
    <div className="theme-selector" style={{ margin: '20px 0' }}>
      <h3 style={{ 
        color: themes[theme].accent, 
        fontFamily: 'Press Start 2P, cursive',
        fontSize: '1rem'
      }}>
        THEME
      </h3>
      
      <div className="theme-options">
        {Object.keys(themes).map(themeId => (
          <button
            key={themeId}
            onClick={() => setTheme(themeId)}
            style={{ 
              backgroundColor: theme === themeId ? themes[themeId].accent : themes[themeId].primary,
              color: theme === themeId ? themes[themeId].bg : themes[themeId].text,
              border: `2px solid ${themes[themeId].border}`
            }}
            className={theme === themeId ? 'active' : ''}
          >
            {themes[themeId].name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ThemeSelector;
