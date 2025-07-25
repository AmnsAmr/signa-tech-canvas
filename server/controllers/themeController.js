const db = require('../config/database');

const getTheme = async (req, res) => {
  try {
    const theme = db.prepare('SELECT * FROM theme_settings ORDER BY id DESC LIMIT 1').get();
    
    if (!theme) {
      // Return default theme
      const defaultTheme = {
        colors: {
          primary: '270 85% 60%',
          accent: '320 85% 65%',
          background: '0 0% 99%',
          foreground: '260 20% 15%',
          card: '0 0% 100%',
          border: '260 10% 90%'
        },
        darkMode: false
      };
      return res.json(defaultTheme);
    }

    res.json({
      colors: JSON.parse(theme.colors),
      darkMode: theme.dark_mode === 1
    });
  } catch (error) {
    console.error('Error fetching theme:', error);
    res.status(500).json({ message: 'Failed to fetch theme settings' });
  }
};

const updateTheme = async (req, res) => {
  try {
    const { colors, darkMode } = req.body;

    if (!colors) {
      return res.status(400).json({ message: 'Colors are required' });
    }

    // Create table if it doesn't exist
    db.prepare(`
      CREATE TABLE IF NOT EXISTS theme_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        colors TEXT NOT NULL,
        dark_mode INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    // Insert or update theme settings
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO theme_settings (id, colors, dark_mode, updated_at)
      VALUES (1, ?, ?, CURRENT_TIMESTAMP)
    `);

    stmt.run(JSON.stringify(colors), darkMode ? 1 : 0);

    res.json({ 
      message: 'Theme updated successfully',
      theme: { colors, darkMode }
    });
  } catch (error) {
    console.error('Error updating theme:', error);
    res.status(500).json({ message: 'Failed to update theme settings' });
  }
};

module.exports = {
  getTheme,
  updateTheme
};