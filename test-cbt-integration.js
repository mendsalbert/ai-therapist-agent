#!/usr/bin/env node

/**
 * CBT Integration Test Script
 * Tests the complete CBT integration including frontend, backend, and AI features
 */

const fetch = require('node-fetch');

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const BACKEND_URL = process.env.BACKEND_URL || 'https://hope-backend-2.onrender.com';

// Test user credentials (replace with actual test user)
const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword123'
};

let authToken = '';

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-jwt-token-for-testing',
        ...options.headers
      }
    });
    
    const data = await response.json();
    return { response, data };
  } catch (error) {
    console.error(`Request failed for ${url}:`, error.message);
    return { response: null, data: null, error: error.message };
  }
}

async function testAuthentication() {
  console.log('\n🔐 Testing Authentication...');
  
  // Test login
  const { response, data } = await makeRequest(`${BASE_URL}/api/auth/signin`, {
    method: 'POST',
    body: JSON.stringify({
      email: TEST_USER.email,
      password: TEST_USER.password
    })
  });
  
  if (response && response.ok) {
    authToken = data.token;
    console.log('✅ Authentication successful');
    return true;
  } else {
    console.log('❌ Authentication failed:', data?.error || 'Unknown error');
    return false;
  }
}

async function testCBTThoughtRecords() {
  console.log('\n🧠 Testing CBT Thought Records...');
  
  const thoughtRecord = {
    situation: 'Had a disagreement with my boss at work',
    automaticThoughts: 'I always mess up everything. I\'m terrible at my job.',
    emotions: ['Anxious', 'Frustrated'],
    emotionIntensity: 8,
    evidenceFor: 'I made a mistake on the report last week',
    evidenceAgainst: 'I\'ve been praised for my work before, and this is just one incident',
    balancedThought: 'I made a mistake, but that doesn\'t mean I\'m terrible at my job. Everyone makes mistakes sometimes.',
    cognitiveDistortions: ['All-or-nothing thinking', 'Personalization']
  };
  
  // Test creating thought record
  const { response: createResponse, data: createData } = await makeRequest(`${BASE_URL}/api/cbt/thought-records`, {
    method: 'POST',
    body: JSON.stringify(thoughtRecord)
  });
  
  if (createResponse && createResponse.ok) {
    console.log('✅ Thought record created successfully');
    
    // Test fetching thought records
    const { response: fetchResponse, data: fetchData } = await makeRequest(`${BASE_URL}/api/cbt/thought-records?limit=5`);
    
    if (fetchResponse && fetchResponse.ok) {
      console.log('✅ Thought records fetched successfully');
      return true;
    } else {
      console.log('❌ Failed to fetch thought records:', fetchData?.error);
      return false;
    }
  } else {
    console.log('❌ Failed to create thought record:', createData?.error);
    return false;
  }
}

async function testCBTMoodEntries() {
  console.log('\n😊 Testing CBT-Enhanced Mood Entries...');
  
  const moodEntry = {
    score: 3,
    triggers: ['Work stress', 'Relationship issues'],
    copingStrategies: ['Deep breathing', 'Talking to someone'],
    thoughts: 'I feel overwhelmed and like nothing is going right',
    situation: 'Having a difficult week at work and home',
    cbtInsights: {
      cognitiveDistortions: ['Catastrophizing', 'All-or-nothing thinking'],
      suggestedChallenges: ['What evidence do you have for this?', 'What\'s the worst that could realistically happen?'],
      balancedThoughts: ['This is a challenging time, but I can handle it', 'I\'m doing the best I can with the information I have']
    }
  };
  
  // Test creating mood entry
  const { response: createResponse, data: createData } = await makeRequest(`${BASE_URL}/api/cbt/mood-entries`, {
    method: 'POST',
    body: JSON.stringify(moodEntry)
  });
  
  if (createResponse && createResponse.ok) {
    console.log('✅ CBT mood entry created successfully');
    
    // Test fetching mood entries
    const { response: fetchResponse, data: fetchData } = await makeRequest(`${BASE_URL}/api/cbt/mood-entries?limit=5&period=30days`);
    
    if (fetchResponse && fetchResponse.ok) {
      console.log('✅ CBT mood entries fetched successfully');
      return true;
    } else {
      console.log('❌ Failed to fetch mood entries:', fetchData?.error);
      return false;
    }
  } else {
    console.log('❌ Failed to create mood entry:', createData?.error);
    return false;
  }
}

async function testCBTInsights() {
  console.log('\n💡 Testing CBT Insights Generation...');
  
  const insightRequest = {
    text: 'I always fail at everything I try. Nothing ever works out for me.',
    type: 'thought_analysis'
  };
  
  const { response, data } = await makeRequest(`${BASE_URL}/api/cbt/insights`, {
    method: 'POST',
    body: JSON.stringify(insightRequest)
  });
  
  if (response && response.ok) {
    console.log('✅ CBT insights generated successfully');
    console.log('   Cognitive distortions detected:', data.data?.cognitiveDistortions?.length || 0);
    console.log('   Challenging questions generated:', data.data?.challengingQuestions?.length || 0);
    return true;
  } else {
    console.log('❌ Failed to generate CBT insights:', data?.error);
    return false;
  }
}

async function testCBTAnalytics() {
  console.log('\n📊 Testing CBT Analytics...');
  
  const { response, data } = await makeRequest(`${BASE_URL}/api/cbt/analytics?period=30days`);
  
  if (response && response.ok) {
    console.log('✅ CBT analytics retrieved successfully');
    console.log('   Progress data available:', !!data.data?.progress);
    console.log('   Insights data available:', !!data.data?.insights);
    return true;
  } else {
    console.log('❌ Failed to retrieve CBT analytics:', data?.error);
    return false;
  }
}

async function testCBTActivities() {
  console.log('\n🎯 Testing CBT Activities...');
  
  const activity = {
    type: 'thought_record',
    data: {
      situation: 'Test situation',
      automaticThoughts: 'Test thoughts'
    },
    effectiveness: 8,
    moodBefore: 3,
    moodAfter: 6
  };
  
  const { response, data } = await makeRequest(`${BASE_URL}/api/cbt/activities`, {
    method: 'POST',
    body: JSON.stringify(activity)
  });
  
  if (response && response.ok) {
    console.log('✅ CBT activity tracked successfully');
    return true;
  } else {
    console.log('❌ Failed to track CBT activity:', data?.error);
    return false;
  }
}

async function testFrontendIntegration() {
  console.log('\n🖥️ Testing Frontend CBT Integration...');
  
  // Test that frontend pages are accessible (they should return HTML, not JSON)
  try {
    const journalResponse = await fetch(`${BASE_URL}/journaling`);
    if (journalResponse.ok) {
      console.log('✅ Journaling page accessible');
    } else {
      console.log('❌ Journaling page not accessible');
    }
    
    const moodResponse = await fetch(`${BASE_URL}/mood`);
    if (moodResponse.ok) {
      console.log('✅ Mood tracking page accessible');
    } else {
      console.log('❌ Mood tracking page not accessible');
    }
    
    const profileResponse = await fetch(`${BASE_URL}/profile`);
    if (profileResponse.ok) {
      console.log('✅ Profile analytics page accessible');
    } else {
      console.log('❌ Profile analytics page not accessible');
    }
    
    return true;
  } catch (error) {
    console.log('❌ Frontend pages not accessible:', error.message);
    return false;
  }
}

async function testBackendConnectivity() {
  console.log('\n🔗 Testing Backend Connectivity...');
  
  // Test backend health
  const { response, data } = await makeRequest(`${BACKEND_URL}/health`);
  
  if (response && response.ok) {
    console.log('✅ Backend is accessible');
    return true;
  } else {
    console.log('❌ Backend is not accessible:', data?.error || 'Unknown error');
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting CBT Integration Tests...\n');
  
  const tests = [
    { name: 'Backend Connectivity', fn: testBackendConnectivity },
    { name: 'Authentication', fn: testAuthentication },
    { name: 'CBT Thought Records', fn: testCBTThoughtRecords },
    { name: 'CBT Mood Entries', fn: testCBTMoodEntries },
    { name: 'CBT Insights', fn: testCBTInsights },
    { name: 'CBT Analytics', fn: testCBTAnalytics },
    { name: 'CBT Activities', fn: testCBTActivities },
    { name: 'Frontend Integration', fn: testFrontendIntegration }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: result });
    } catch (error) {
      console.log(`❌ ${test.name} failed with error:`, error.message);
      results.push({ name: test.name, passed: false, error: error.message });
    }
  }
  
  // Summary
  console.log('\n📋 Test Results Summary:');
  console.log('========================');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All CBT integration tests passed!');
  } else {
    console.log('⚠️ Some tests failed. Please check the implementation.');
  }
  
  return passed === total;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = {
  runAllTests,
  testAuthentication,
  testCBTThoughtRecords,
  testCBTMoodEntries,
  testCBTInsights,
  testCBTAnalytics,
  testCBTActivities,
  testFrontendIntegration,
  testBackendConnectivity
};
