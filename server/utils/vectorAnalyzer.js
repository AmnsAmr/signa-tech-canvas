/**
 * Vector File Analyzer - Python Service Client
 * 
 * This utility sends vector files to a Python microservice for analysis
 * Supports: SVG, DXF, PDF, EPS
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

// Get Python service URL from environment with validation
const getPythonServiceUrl = () => {
  const url = process.env.PYTHON_VECTOR_SERVICE_URL;
  
  if (!url) {
    console.warn('PYTHON_VECTOR_SERVICE_URL not configured, using default');
    return 'http://localhost:5001';
  }
  
  // Validate URL format
  try {
    new URL(url);
    return url;
  } catch (error) {
    console.error('Invalid PYTHON_VECTOR_SERVICE_URL format:', url);
    return 'http://localhost:5001';
  }
};

const PYTHON_SERVICE_URL = getPythonServiceUrl();

/**
 * Main function to analyze a vector file using Python microservice
 * @param {string} filePath - Path to the vector file
 * @param {string} units - Output units ('mm' or 'in') - handled by Python service
 * @returns {Object} Analysis results
 */
async function analyzeVectorFile(filePath, units = 'mm') {
  const fileName = path.basename(filePath);
  
  console.log(`Sending vector file to Python service: ${fileName}`);
  
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }
    
    // Create form data
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    
    // Send to Python service
    const response = await axios.post(`${PYTHON_SERVICE_URL}/analyze`, form, {
      headers: {
        ...form.getHeaders(),
      },
      timeout: 30000, // 30 second timeout
    });
    
    console.log(`Python service analysis complete for: ${fileName}`);
    return response.data;
    
  } catch (error) {
    console.error(`Error analyzing ${fileName}:`, error.message);
    
    // Return error response in expected format
    return {
      fileName,
      error: error.response?.data?.error || error.message,
      paperArea: "Unknown",
      letterArea: 0,
      pathLength: 0,
      shapes: []
    };
  }
}

/**
 * Check if Python service is available
 */
async function checkPythonService() {
  try {
    const response = await axios.get(`${PYTHON_SERVICE_URL}/health`, { timeout: 5000 });
    return response.data.status === 'healthy';
  } catch (error) {
    console.error('Python vector service is not available:', error.message);
    return false;
  }
}

module.exports = {
  analyzeVectorFile,
  checkPythonService
};