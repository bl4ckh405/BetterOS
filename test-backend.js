// Test backend connectivity
// Run this in your browser console or use curl

// Test 1: Health check
fetch('http://192.168.0.104:3000/health')
  .then(r => r.json())
  .then(d => console.log('Health check:', d))
  .catch(e => console.error('Health check failed:', e));

// Test 2: Send message
fetch('http://192.168.0.104:3000/api/chat/message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Hello',
    coach: {
      id: 'test-123',
      name: 'Test Coach',
      tagline: 'A test coach',
      personality: ['Helpful'],
      expertise: ['Testing'],
      background: 'Test background',
      conversationStyle: 'Friendly',
      systemPrompt: 'You are a test coach'
    }
  })
})
  .then(r => r.json())
  .then(d => console.log('Message response:', d))
  .catch(e => console.error('Message failed:', e));
