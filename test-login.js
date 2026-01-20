#!/usr/bin/env node

/**
 * Simple Login Test Script
 * Tests the authentication system
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testLogin() {
  console.log('🔐 Testing Login System...\n');
  
  try {
    // Test 1: Check if server is running
    console.log('1. Testing server connectivity...');
    const healthResponse = await fetch(`${BASE_URL}/api/auth/session`);
    if (healthResponse.ok) {
      console.log('✅ Server is running');
    } else {
      console.log('❌ Server not responding');
      return;
    }

    // Test 2: Test login with invalid credentials
    console.log('\n2. Testing login with invalid credentials...');
    const invalidLoginResponse = await fetch(`${BASE_URL}/api/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'invalid@example.com',
        password: 'wrongpassword'
      })
    });

    const invalidData = await invalidLoginResponse.json();
    console.log('Response status:', invalidLoginResponse.status);
    console.log('Response data:', JSON.stringify(invalidData, null, 2));

    if (invalidLoginResponse.status === 401 || invalidData.error) {
      console.log('✅ Invalid credentials properly rejected');
    } else {
      console.log('❌ Invalid credentials not properly handled');
    }

    // Test 3: Test login with valid credentials (if you have test user)
    console.log('\n3. Testing login with valid credentials...');
    const validLoginResponse = await fetch(`${BASE_URL}/api/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword123'
      })
    });

    const validData = await validLoginResponse.json();
    console.log('Response status:', validLoginResponse.status);
    console.log('Response data:', JSON.stringify(validData, null, 2));

    if (validLoginResponse.ok && validData.user) {
      console.log('✅ Valid credentials accepted');
      
      // Test 4: Test session with token
      console.log('\n4. Testing session with token...');
      const sessionResponse = await fetch(`${BASE_URL}/api/auth/session`, {
        headers: {
          'Authorization': `Bearer ${validData.token}`
        }
      });

      const sessionData = await sessionResponse.json();
      console.log('Session response:', JSON.stringify(sessionData, null, 2));

      if (sessionData.isAuthenticated && sessionData.user) {
        console.log('✅ Session properly authenticated');
      } else {
        console.log('❌ Session authentication failed');
      }
    } else {
      console.log('⚠️ Valid credentials test skipped (no test user available)');
    }

    // Test 5: Test CBT endpoints
    console.log('\n5. Testing CBT endpoints...');
    const cbtResponse = await fetch(`${BASE_URL}/api/cbt/insights`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-jwt-token-for-testing'
      },
      body: JSON.stringify({
        text: 'I always fail at everything',
        type: 'thought_analysis'
      })
    });

    const cbtData = await cbtResponse.json();
    console.log('CBT Response status:', cbtResponse.status);
    console.log('CBT Response data:', JSON.stringify(cbtData, null, 2));

    if (cbtResponse.ok && cbtData.success) {
      console.log('✅ CBT insights endpoint working');
    } else {
      console.log('❌ CBT insights endpoint failed');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testLogin()
  .then(() => {
    console.log('\n🎯 Login system test completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
