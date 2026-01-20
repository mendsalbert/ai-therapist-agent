// Test script to check if AI backend is working
const https = require('https');

const testData = JSON.stringify({
  message: "Hello, how are you?",
  sessionId: "test-session",
  userId: "test-user"
});

const options = {
  hostname: 'hope-backend-2.onrender.com',
  port: 443,
  path: '/chat/memory-enhanced',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(testData)
  }
};

console.log('Testing AI backend...');

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('Response:', JSON.stringify(response, null, 2));
      console.log('Is Fallback:', response.isFailover);
      console.log('Response Content:', response.response);
    } catch (e) {
      console.log('Raw Response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(testData);
req.end();
