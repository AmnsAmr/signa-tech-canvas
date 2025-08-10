const sqlite3 = require('sqlite3').verbose();
const mongoose = require('mongoose');
const MenuCategory = require('../models/MenuCategory');

async function migrateToMongoDB() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    const dbName = process.env.MONGODB_DB_NAME || 'signatech';
    await mongoose.connect(`${mongoUri}/${dbName}`);
    console.log('Connected to MongoDB');

    // Connect to SQLite
    const db = new sqlite3.Database('signatech.db');
    console.log('Connected to SQLite');

    // Check if categories table exists in SQLite
    const tableExists = await new Promise((resolve) => {
      db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='categories'", (err, row) => {
        resolve(!!row);
      });
    });

    if (!tableExists) {
      console.log('No categories table found in SQLite. Creating sample data in MongoDB...');
      await createSampleData();
      return;
    }

    // Migrate categories from SQLite to MongoDB
    const categories = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM categories ORDER BY display_order ASC', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    if (categories.length === 0) {
      console.log('No categories found in SQLite. Creating sample data in MongoDB...');
      await createSampleData();
      return;
    }

    console.log(`Found ${categories.length} categories to migrate`);

    // Clear existing MongoDB data
    await MenuCategory.deleteMany({});

    // Migrate each category
    for (const category of categories) {
      const mongoCategory = new MenuCategory({
        name: category.name,
        parentId: category.parent_id || null,
        displayOrder: category.display_order || 0,
        imageUrl: category.image_url || '',
        description: category.description || '',
        customFields: {},
        type: 'category',
        isActive: category.is_active !== 0
      });

      await mongoCategory.save();
      console.log(`Migrated category: ${category.name}`);
    }

    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

async function createSampleData() {
  try {
    // Clear existing data
    await MenuCategory.deleteMany({});

    // Create sample categories
    const sampleCategories = [
      {
        name: 'Signalétique',
        displayOrder: 1,
        description: 'Solutions de signalétique professionnelle',
        type: 'category'
      },
      {
        name: 'PLV',
        displayOrder: 2,
        description: 'Publicité sur lieu de vente',
        type: 'category'
      },
      {
        name: 'Impression',
        displayOrder: 3,
        description: 'Services d\'impression grand format',
        type: 'category'
      }
    ];

    const createdCategories = [];
    for (const categoryData of sampleCategories) {
      const category = new MenuCategory(categoryData);
      await category.save();
      createdCategories.push(category);
      console.log(`Created sample category: ${category.name}`);
    }

    // Create subcategories
    const subcategories = [
      {
        name: 'Panneaux extérieurs',
        parentId: createdCategories[0]._id,
        displayOrder: 1,
        description: 'Panneaux pour l\'extérieur',
        type: 'category'
      },
      {
        name: 'Panneaux intérieurs',
        parentId: createdCategories[0]._id,
        displayOrder: 2,
        description: 'Panneaux pour l\'intérieur',
        type: 'category'
      },
      {
        name: 'Présentoirs',
        parentId: createdCategories[1]._id,
        displayOrder: 1,
        description: 'Présentoirs et displays',
        type: 'product'
      },
      {
        name: 'Kakémonos',
        parentId: createdCategories[1]._id,
        displayOrder: 2,
        description: 'Kakémonos et roll-up',
        type: 'product'
      }
    ];

    for (const subData of subcategories) {
      const subcategory = new MenuCategory(subData);
      await subcategory.save();
      console.log(`Created sample subcategory: ${subcategory.name}`);
    }

    console.log('Sample data created successfully!');
  } catch (error) {
    console.error('Failed to create sample data:', error);
  }
}

// Run migration
require('dotenv').config();
migrateToMongoDB();