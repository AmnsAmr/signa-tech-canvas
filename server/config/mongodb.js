const mongoose = require('mongoose');

class MongoDB {
  constructor() {
    this.connection = null;
    this.init();
  }

  async init() {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
      const dbName = process.env.MONGODB_DB_NAME || 'signatech';
      
      this.connection = await mongoose.connect(`${mongoUri}/${dbName}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      
      console.log('Connected to MongoDB database');
      await this.seedDefaultData();
    } catch (error) {
      console.error('MongoDB connection error:', error);
    }
  }

  async seedDefaultData() {
    const User = require('../models/User');
    const ContactSettings = require('../models/ContactSettings');
    const SiteImage = require('../models/SiteImage');
    const bcrypt = require('bcryptjs');

    // Create admin user
    const adminExists = await User.findOne({ email: 'contact@signatech.ma' });
    if (!adminExists) {
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      await User.create({
        name: 'Admin',
        email: 'contact@signatech.ma',
        password: hashedPassword,
        role: 'admin'
      });
    }

    // Insert default contact settings
    const settingsCount = await ContactSettings.countDocuments();
    if (settingsCount === 0) {
      const defaultSettings = [
        { setting_key: 'company_name', setting_value: 'Signa Tech' },
        { setting_key: 'company_tagline', setting_value: 'Solutions PLV & Signalétique' },
        { setting_key: 'email', setting_value: 'contact@signatech.ma' },
        { setting_key: 'phone', setting_value: '+212 5 39 40 31 33' },
        { setting_key: 'whatsapp', setting_value: '+212623537445' },
        { setting_key: 'address_fr', setting_value: 'Zone Industrielle Gzenaya, lot 376, Tanger, Morocco' },
        { setting_key: 'address_en', setting_value: 'Industrial Zone Gzenaya, lot 376, Tangier, Morocco' },
        { setting_key: 'hours_fr', setting_value: 'Lun-Ven: 8h-18h | Sam: 8h-13h' },
        { setting_key: 'hours_en', setting_value: 'Mon-Fri: 8am-6pm | Sat: 8am-1pm' },
        { setting_key: 'hours_detailed_fr', setting_value: 'Lun - Ven: 8h00 - 18h00|Samedi: 8h00 - 13h00|Dimanche: Fermé' },
        { setting_key: 'hours_detailed_en', setting_value: 'Mon - Fri: 8:00 AM - 6:00 PM|Saturday: 8:00 AM - 1:00 PM|Sunday: Closed' }
      ];
      
      await ContactSettings.insertMany(defaultSettings);
      console.log('Default contact settings inserted');
    }

    // Initialize default images
    const imageCount = await SiteImage.countDocuments();
    if (imageCount === 0) {
      const defaultImages = [
        { category: 'logo', filename: 'Logo.png', original_name: 'Logo.png', path: '/uploads/Logo.png' },
        { category: 'hero', filename: 'main_pic.jpg', original_name: 'main_pic.jpg', path: '/uploads/main_pic.jpg' },
        { category: 'about', filename: 'hero-workshop.jpg', original_name: 'hero-workshop.jpg', path: '/uploads/hero-workshop.jpg' },
        { category: 'about', filename: 'team-work.jpg', original_name: 'team-work.jpg', path: '/uploads/team-work.jpg' },
        { category: 'services', filename: 'facade-project.jpg', original_name: 'facade-project.jpg', path: '/uploads/facade-project.jpg' },
        { category: 'services', filename: 'plv-displays.jpg', original_name: 'plv-displays.jpg', path: '/uploads/plv-displays.jpg' }
      ];
      
      for (let i = 1; i <= 16; i++) {
        defaultImages.push({
          category: 'portfolio',
          filename: `${i}.jpg`,
          original_name: `${i}.jpg`,
          path: `/uploads/${i}.jpg`
        });
      }
      
      await SiteImage.insertMany(defaultImages);
    }
  }

  getConnection() {
    return this.connection;
  }
}

module.exports = new MongoDB();