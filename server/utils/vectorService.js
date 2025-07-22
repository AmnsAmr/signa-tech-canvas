/**
 * Vector Service
 * 
 * Handles vector file analysis and database operations
 */

const database = require('../config/database');
const { analyzeVectorFile } = require('./vectorAnalyzer');
const path = require('path');

const db = database.getDb();

/**
 * Process a vector file and store analysis results
 * @param {number} submissionId - ID of the contact submission
 * @param {string} filePath - Path to the uploaded file
 * @param {string} fileName - Original file name
 * @param {string} units - Units for measurements ('mm' or 'in')
 * @returns {Object} Analysis results
 */
async function processVectorFile(submissionId, filePath, fileName, units = 'mm') {
  try {
    console.log(`Processing vector file for submission ${submissionId}: ${fileName}`);
    
    // Analyze the vector file
    const analysisResult = await analyzeVectorFile(filePath, units);
    
    // Store results in database
    await storeAnalysisResults(submissionId, fileName, analysisResult);
    
    return analysisResult;
  } catch (error) {
    console.error(`Error processing vector file ${fileName}:`, error);
    throw error;
  }
}

/**
 * Store vector analysis results in the database
 */
async function storeAnalysisResults(submissionId, fileName, results) {
  return new Promise((resolve, reject) => {
    const shapesData = JSON.stringify(results.shapes || []);
    
    db.run(`
      INSERT INTO vector_analysis (
        submission_id, file_name, paper_area, letter_area, path_length, shapes_data
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      submissionId,
      fileName,
      results.paperArea || 'Unknown',
      results.letterArea || 'Unknown',
      results.pathLength || 'Unknown',
      shapesData
    ], function(err) {
      if (err) {
        console.error('Error storing vector analysis results:', err);
        reject(err);
        return;
      }
      
      console.log(`Vector analysis results stored for submission ${submissionId}`);
      resolve(this.lastID);
    });
  });
}

/**
 * Get vector analysis results for a submission
 */
async function getAnalysisResults(submissionId) {
  return new Promise((resolve, reject) => {
    db.get(`
      SELECT * FROM vector_analysis WHERE submission_id = ?
    `, [submissionId], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (!row) {
        resolve(null);
        return;
      }
      
      // Parse shapes data
      try {
        row.shapes_data = JSON.parse(row.shapes_data || '[]');
      } catch (e) {
        row.shapes_data = [];
      }
      
      resolve(row);
    });
  });
}

module.exports = {
  processVectorFile,
  getAnalysisResults
};