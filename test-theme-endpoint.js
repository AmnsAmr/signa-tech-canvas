// Using built-in fetch (Node.js 18+)

async function testThemeEndpoint() {
  try {
    console.log('Testing theme endpoints...\n');

    // Test 1: Get CSRF token
    console.log('1. Getting CSRF token...');
    const csrfResponse = await fetch('http://localhost:5000/api/csrf-token', {
      method: 'GET',
      headers: {
        'Cookie': 'connect.sid=test'
      }
    });
    
    if (!csrfResponse.ok) {
      console.log('❌ CSRF token request failed:', csrfResponse.status);
      return;
    }
    
    const { csrfToken } = await csrfResponse.json();
    console.log('✅ CSRF token obtained:', csrfToken.substring(0, 20) + '...');

    // Test 2: Get current theme
    console.log('\n2. Getting current theme...');
    const themeResponse = await fetch('http://localhost:5000/api/theme', {
      method: 'GET'
    });
    
    if (!themeResponse.ok) {
      console.log('❌ Theme GET request failed:', themeResponse.status);
      return;
    }
    
    const currentTheme = await themeResponse.json();
    console.log('✅ Current theme retrieved');

    // Test 3: Try to update theme without auth (should fail)
    console.log('\n3. Testing theme update without auth (should fail)...');
    const noAuthResponse = await fetch('http://localhost:5000/api/admin/theme', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify(currentTheme)
    });
    
    console.log('Status:', noAuthResponse.status);
    if (noAuthResponse.status === 401) {
      console.log('✅ Correctly rejected request without auth token');
    } else {
      console.log('❌ Unexpected response for no-auth request');
    }

    // Test 4: Try with fake token (should fail)
    console.log('\n4. Testing theme update with fake token (should fail)...');
    const fakeTokenResponse = await fetch('http://localhost:5000/api/admin/theme', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fake-token',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify(currentTheme)
    });
    
    console.log('Status:', fakeTokenResponse.status);
    if (fakeTokenResponse.status === 403) {
      console.log('✅ Correctly rejected request with fake token');
    } else {
      console.log('❌ Unexpected response for fake token request');
    }

    console.log('\n✅ Theme endpoint tests completed');
    console.log('\nTo test with real auth token:');
    console.log('1. Login to the app as admin');
    console.log('2. Check localStorage for the token');
    console.log('3. Use that token in the Authorization header');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testThemeEndpoint();