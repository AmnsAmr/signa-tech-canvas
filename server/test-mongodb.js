require('dotenv').config();
const mongoose = require('mongoose');
const MenuCategory = require('./models/MenuCategory');

async function testMongoDB() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    const dbName = process.env.MONGODB_DB_NAME || 'signatech';
    await mongoose.connect(`${mongoUri}/${dbName}`);
    console.log('✅ Connected to MongoDB');

    // Test fetching categories
    const categories = await MenuCategory.find({ isActive: true }).sort({ displayOrder: 1 });
    console.log(`✅ Found ${categories.length} active categories`);

    // Build hierarchical structure (same as in controller)
    const topLevel = categories.filter(cat => !cat.parentId);
    const menuData = topLevel.map(parent => ({
      id: parent._id,
      name: parent.name,
      imageUrl: parent.imageUrl,
      description: parent.description,
      customFields: parent.customFields,
      subcategories: categories
        .filter(cat => cat.parentId && cat.parentId.toString() === parent._id.toString())
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map(sub => ({
          id: sub._id,
          name: sub.name,
          imageUrl: sub.imageUrl,
          description: sub.description,
          customFields: sub.customFields,
          type: sub.type
        }))
    }));

    console.log('✅ Menu structure built successfully:');
    console.log(JSON.stringify(menuData, null, 2));

    console.log('\n✅ MongoDB test completed successfully!');
  } catch (error) {
    console.error('❌ MongoDB test failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testMongoDB();