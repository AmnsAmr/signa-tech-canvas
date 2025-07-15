const database = require('../config/database');

const db = database.getDb();

class ContactSettingsController {
  async getSettings(req, res) {
    try {
      const settings = await new Promise((resolve, reject) => {
        db.all("SELECT * FROM contact_settings ORDER BY setting_key", (err, rows) => {
          if (err) {
            console.error('Database error in getSettings:', err);
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });

      // Convert to key-value object
      const settingsObj = {};
      settings.forEach(setting => {
        settingsObj[setting.setting_key] = setting.setting_value;
      });

      res.json(settingsObj);
    } catch (error) {
      console.error('Get settings error:', error);
      res.status(500).json({ message: 'Failed to fetch settings' });
    }
  }

  async updateSettings(req, res) {
    try {
      const settings = req.body;
      const promises = [];

      // Update each setting
      for (const [key, value] of Object.entries(settings)) {
        promises.push(
          new Promise((resolve, reject) => {
            db.run(
              `INSERT OR REPLACE INTO contact_settings (setting_key, setting_value, updated_at) 
               VALUES (?, ?, datetime('now'))`,
              [key, value],
              function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
              }
            );
          })
        );
      }

      await Promise.all(promises);

      res.json({ message: 'Settings updated successfully' });
    } catch (error) {
      console.error('Update settings error:', error);
      res.status(500).json({ message: 'Failed to update settings' });
    }
  }
}

module.exports = new ContactSettingsController();