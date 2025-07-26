const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Test the project image upload endpoint
async function testProjectImageUpload() {
  try {
    // First, let's check if the endpoint exists by making a simple request
    const testUrl = 'http://localhost:5000/api/projects/admin/projects/1/image';
    
    console.log('Testing endpoint:', testUrl);
    
    // Create a simple test request without file to see if endpoint exists
    const response = await fetch(testUrl, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());
    
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testProjectImageUpload();