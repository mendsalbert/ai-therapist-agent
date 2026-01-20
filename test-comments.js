// Test comment functionality
const testCommentAPI = async () => {
  try {
    // Test getting comments
    const response = await fetch('/api/community/posts/test-post-id/comments');
    const data = await response.json();
    console.log('Comments API test:', data);
  } catch (error) {
    console.error('Comment API test error:', error);
  }
};

// Test creating a comment
const testCreateComment = async () => {
  try {
    const response = await fetch('/api/community/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer test-token`
      },
      body: JSON.stringify({
        postId: 'test-post-id',
        content: 'Test comment',
        isAnonymous: false
      })
    });
    const data = await response.json();
    console.log('Create comment test:', data);
  } catch (error) {
    console.error('Create comment test error:', error);
  }
};
