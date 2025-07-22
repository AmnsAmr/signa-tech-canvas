/**
 * Vector Analysis Test Utility
 * 
 * This script helps test the vector analysis functionality
 * by directly calling the vector analyzer with a file path.
 * 
 * Usage: node test-vector-analysis.js <file-path>
 */

require('dotenv').config();
const path = require('path');
const { analyzeVectorFile } = require('./utils/vectorAnalyzer');

async function testVectorAnalysis() {
  try {
    // Get file path from command line arguments
    const filePath = process.argv[2];
    
    if (!filePath) {
      console.error('Please provide a file path as an argument');
      console.log('Usage: node test-vector-analysis.js <file-path>');
      process.exit(1);
    }
    
    console.log(`Testing vector analysis for file: ${filePath}`);
    
    // Analyze the file
    const result = await analyzeVectorFile(filePath, 'mm');
    
    console.log('\nAnalysis Results:');
    console.log('----------------');
    console.log(`File: ${path.basename(filePath)}`);
    console.log(`Paper Area: ${result.paperArea}`);
    console.log(`Letter Area: ${result.letterArea}`);
    console.log(`Path Length: ${result.pathLength}`);
    console.log(`\nShapes (${result.shapes.length}):`);
    
    result.shapes.forEach((shape, index) => {
      console.log(`\n  Shape #${index + 1}:`);
      console.log(`  - Name: ${shape.name}`);
      console.log(`  - Length: ${shape.length}`);
      console.log(`  - Area: ${shape.area}`);
    });
    
  } catch (error) {
    console.error('Error analyzing vector file:', error);
  }
}

testVectorAnalysis();