const fetch = require('node-fetch');

// Test different route variations to see which one works
async function testRoutes() {
  const routes = [
    'http://localhost:5000/api/projects/sections',
    'http://localhost:5000/api/projects/admin/sections',
    'http://localhost:5000/api/projects/admin/projects/1/image'
  ];
  
  for (const route of routes) {
    try {
      console.log(`\nTesting: ${route}`);
      const response = await fetch(route, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });
      
      console.log(`Status: ${response.status}`);
      if (response.status !== 404) {
        const text = await response.text();
        console.log(`Response: ${text.substring(0, 200)}...`);
      }
    } catch (error) {
      console.log(`Error: ${error.message}`);
    }
  }
}

testRoutes();