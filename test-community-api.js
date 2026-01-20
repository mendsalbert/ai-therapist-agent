// Test the community API endpoints
const testCommunityAPI = async () => {
  try {
    console.log('Testing community API...');
    
    // Test getting spaces
    const spacesResponse = await fetch('/api/community/spaces');
    const spacesData = await spacesResponse.json();
    console.log('Spaces API:', spacesData);
    
    // Test getting stats
    const statsResponse = await fetch('/api/community/stats');
    const statsData = await statsResponse.json();
    console.log('Stats API:', statsData);
    
  } catch (error) {
    console.error('Community API test error:', error);
  }
};

// Run the test
testCommunityAPI();
