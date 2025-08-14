const mongoose = require('mongoose');
const MenuCategory = require('../models/MenuCategory');

async function fixVariablesArrays() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/signatech');
    console.log('Connected to MongoDB');
    
    console.log('Starting variables array migration...');
    
    const categories = await MenuCategory.find({
      'customFields.variables': { $exists: true }
    });
    
    let fixedCount = 0;
    
    for (const category of categories) {
      let needsUpdate = false;
      const customFields = { ...category.customFields };
      
      if (customFields.variables && !Array.isArray(customFields.variables)) {
        console.log(`Fixing variables for category: ${category.name}`);
        
        // Convert object with numeric keys to array
        const keys = Object.keys(customFields.variables).filter(k => !isNaN(k)).sort((a, b) => parseInt(a) - parseInt(b));
        if (keys.length > 0) {
          customFields.variables = keys.map(k => {
            const variable = customFields.variables[k];
            
            // Fix options array too
            if (variable.options && !Array.isArray(variable.options)) {
              const optionKeys = Object.keys(variable.options).filter(k => !isNaN(k)).sort((a, b) => parseInt(a) - parseInt(b));
              if (optionKeys.length > 0) {
                variable.options = optionKeys.map(k => variable.options[k]);
              }
            }
            
            return variable;
          });
          needsUpdate = true;
        }
      }
      
      if (needsUpdate) {
        await MenuCategory.findByIdAndUpdate(category._id, { customFields });
        fixedCount++;
        console.log(`Fixed category: ${category.name}`);
      }
    }
    
    console.log(`Migration completed. Fixed ${fixedCount} categories.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

fixVariablesArrays();