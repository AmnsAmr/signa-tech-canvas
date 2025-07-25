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

const ensureThemeFile = () => {
  try {
    if (!fs.existsSync(THEME_FILE)) {
      console.log('Creating default theme.json file...');
      fs.writeFileSync(THEME_FILE, JSON.stringify(defaultTheme, null, 2));
      console.log('Default theme.json created successfully');
    } else {
      // Validate existing theme file
      const themeData = fs.readFileSync(THEME_FILE, 'utf8');
      JSON.parse(themeData); // This will throw if invalid JSON
      console.log('Theme file loaded successfully');
    }
  } catch (error) {
    console.error('Error with theme file, creating default:', error.message);
    fs.writeFileSync(THEME_FILE, JSON.stringify(defaultTheme, null, 2));
  }
};

module.exports = { ensureThemeFile };