const database = require('./config/database');
const db = database.getDb();

console.log('Testing Image Management Functionality...\n');

// Test 1: Check if site_images table exists and has correct structure
console.log('1. Checking site_images table structure:');
db.all("PRAGMA table_info(site_images)", (err, rows) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  console.log('Columns:', rows.map(r => `${r.name} (${r.type})`).join(', '));
});

// Test 2: Check current images in database
console.log('\n2. Current images in database:');
db.all("SELECT category, COUNT(*) as count FROM site_images GROUP BY category", (err, rows) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  console.log('Image counts by category:');
  rows.forEach(row => {
    console.log(`  ${row.category}: ${row.count} images`);
  });
});

// Test 3: Check if project tables exist
console.log('\n3. Checking project tables:');
db.all("SELECT name FROM sqlite_master WHERE type='table' AND (name='project_sections' OR name='projects')", (err, rows) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  console.log('Project tables found:', rows.map(r => r.name).join(', '));
  
  if (rows.some(r => r.name === 'project_sections')) {
    db.all("SELECT * FROM project_sections", (err, sections) => {
      if (err) {
        console.error('Error fetching sections:', err);
        return;
      }
      console.log(`Found ${sections.length} project sections`);
    });
  }
  
  if (rows.some(r => r.name === 'projects')) {
    db.all("SELECT COUNT(*) as count FROM projects", (err, result) => {
      if (err) {
        console.error('Error counting projects:', err);
        return;
      }
      console.log(`Found ${result[0].count} projects`);
    });
  }
});

// Test 4: List all images with details
console.log('\n4. All images with details:');
setTimeout(() => {
  db.all("SELECT * FROM site_images ORDER BY category, created_at", (err, rows) => {
    if (err) {
      console.error('Error:', err);
      return;
    }
    console.log('\nDetailed image list:');
    rows.forEach(img => {
      console.log(`  ID: ${img.id}, Category: ${img.category}, File: ${img.filename}, Original: ${img.original_name}`);
    });
    
    console.log('\nTest completed!');
    process.exit(0);
  });
}, 1000);