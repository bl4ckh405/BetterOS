require('dotenv').config();

async function testEmbedding() {
  console.log('Testing Gemini embedding via REST API...');
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: {
            parts: [{ text: 'Hello world' }]
          }
        })
      }
    );
    
    const result = await response.json();
    
    if (result.error) {
      console.error('❌ API Error:', result.error);
      return;
    }
    
    console.log('✅ Embedding successful!');
    console.log('Dimensions:', result.embedding.values.length);
    console.log('First 5 values:', result.embedding.values.slice(0, 5));
  } catch (error) {
    console.error('❌ Embedding failed:', error.message);
  }
}

testEmbedding();
