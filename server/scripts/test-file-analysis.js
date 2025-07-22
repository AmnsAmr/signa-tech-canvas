/**
 * Test script for file vector analysis
 * 
 * Usage: node scripts/test-file-analysis.js <submission-id>
 */

const fs = require('fs');
const path = require('path');
const database = require('../config/database');
const vectorService = require('../utils/vectorService');

const db = database.getDb();

async function testFileAnalysis() {
  try {
    // Get submission ID from command line arguments
    const submissionId = process.argv[2];
    
    if (!submissionId) {
      console.error('Please provide a submission ID');
      console.log('Usage: node scripts/test-file-analysis.js <submission-id>');
      process.exit(1);
    }
    
    console.log(`Testing file analysis for submission ID: ${submissionId}`);
    
    // Get file details
    const file = await new Promise((resolve, reject) => {
      db.get(
        "SELECT file_path, file_name, user_id FROM contact_submissions WHERE id = ?", 
        [submissionId], 
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    
    if (!file) {
      console.error('File not found');
      process.exit(1);
    }
    
    console.log('File details:', file);
    
    // Check if file exists
    if (!file.file_path || !fs.existsSync(file.file_path)) {
      console.error('File not found on server');
      process.exit(1);
    }
    
    // Get vector analysis
    const ext = path.extname(file.file_name).toLowerCase();
    const supportedExtensions = ['.svg', '.dxf', '.ai', '.pdf', '.eps', '.gcode', '.nc'];
    
    if (!supportedExtensions.includes(ext)) {
      console.error('Not a supported vector file format');
      process.exit(1);
    }
    
    console.log('Processing vector file:', file.file_path);
    const vectorAnalysis = await vectorService.processVectorFile(
      submissionId,
      file.file_path,
      file.file_name
    );
    
    console.log('\nVector Analysis Results:');
    console.log('------------------------');
    console.log(`File: ${file.file_name}`);
    console.log(`Paper Area: ${vectorAnalysis.paperArea}`);
    console.log(`Letter Area: ${vectorAnalysis.letterArea}`);
    console.log(`Path Length: ${vectorAnalysis.pathLength}`);
    console.log(`\nShapes (${vectorAnalysis.shapes.length}):`);
    
    vectorAnalysis.shapes.forEach((shape, index) => {
      console.log(`\n  Shape ${index + 1}:`);
      console.log(`    Name: ${shape.name}`);
      console.log(`    Length: ${shape.length}`);
      console.log(`    Area: ${shape.area}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testFileAnalysis();