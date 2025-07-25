const db = require('../config/database');

const fs = require('fs');
const path = require('path');

const THEME_FILE = path.join(__dirname, '../theme.json');

const defaultTheme = {
  primary: '270 85% 60%',
  accent: '320 85% 65%',
  background: '0 0% 99%',
  foreground: '260 20% 15%',
  card: '0 0% 100%',
  border: '260 10% 90%',
  secondary: '260 10% 95%',
  muted: '260 15% 50%',
  success: '150 60% 50%',
  destructive: '0 84% 60%',
  gradientStart: '270 85% 60%',
  gradientEnd: '320 85% 65%',
  gradientDirection: '135deg'
};

const getTheme = async (req, res) => {
  try {
    if (fs.existsSync(THEME_FILE)) {
      const themeData = fs.readFileSync(THEME_FILE, 'utf8');
      const theme = JSON.parse(themeData);
      return res.json(theme);
    }
    res.json(defaultTheme);
  } catch (error) {
    console.error('Error reading theme file:', error);
    res.json(defaultTheme);
  }
};

const updateTheme = async (req, res) => {
  try {
    const theme = req.body;

    if (!theme || typeof theme !== 'object') {
      return res.status(400).json({ message: 'Valid theme object required' });
    }

    fs.writeFileSync(THEME_FILE, JSON.stringify(theme, null, 2));

    res.json({ 
      message: 'Theme updated successfully',
      theme
    });
  } catch (error) {
    console.error('Error updating theme:', error);
    res.status(500).json({ message: 'Failed to update theme' });
  }
};

module.exports = {
  getTheme,
  updateTheme
};