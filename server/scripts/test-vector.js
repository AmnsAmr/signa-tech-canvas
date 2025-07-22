/**
 * Test script for vector file analysis
 * 
 * Usage: node scripts/test-vector.js <path-to-vector-file>
 */

const { analyzeVectorFile } = require('../utils/vectorAnalyzer');
const path = require('path');

async function testVectorAnalysis() {
  // Get file path from command line arguments
  const filePath = process.argv[2];
  
  if (!filePath) {
    console.error('Please provide a path to a vector file');
    console.log('Usage: node scripts/test-vector.js <path-to-vector-file>');
    process.exit(1);
  }
  
  console.log(`Analyzing vector file: ${filePath}`);
  
  try {
    // Analyze the file
    const result = await analyzeVectorFile(filePath);
    
    // Print results
    console.log('\nAnalysis Results:');
    console.log('----------------');
    console.log(`File: ${result.fileName}`);
    console.log(`Paper Area: ${result.paperArea}`);
    console.log(`Letter Area: ${result.letterArea}`);
    console.log(`Path Length: ${result.pathLength}`);
    console.log(`\nShapes (${result.shapes.length}):`);
    
    result.shapes.forEach((shape, index) => {
      console.log(`\n  Shape ${index + 1}:`);
      console.log(`    Name: ${shape.name}`);
      console.log(`    Length: ${shape.length}`);
      console.log(`    Area: ${shape.area}`);
    });
    
    if (result.error) {
      console.log(`\nWarning: ${result.error}`);
    }
    
  } catch (error) {
    console.error('Error analyzing vector file:', error);
    process.exit(1);
  }
}

testVectorAnalysis();