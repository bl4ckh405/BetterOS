/**
 * Example: Creating a Knowledge-Aware Coach
 * 
 * This demonstrates the difference between:
 * 1. Style-only coach (personality mimicry)
 * 2. Knowledge-aware coach (RAG-powered with actual content)
 */

import { ragService } from '../services/rag';
import { aiService } from '../services/ai';
import { CoachData } from '../types';

async function createSimonSinekCoach() {
  // Step 1: Define the coach's STYLE/PERSONALITY
  const simonCoach: CoachData = {
    id: 'simon-sinek-coach',
    name: 'Simon Sinek',
    tagline: 'Start with Why - Find Your Purpose',
    personality: ['Inspirational', 'Thoughtful', 'Storyteller', 'Empathetic'],
    expertise: ['Leadership', 'Purpose', 'Team Building', 'Organizational Culture'],
    background: 'Author of Start With Why and The Infinite Game. Leadership expert who helps organizations inspire action.',
    conversationStyle: 'Uses powerful stories and metaphors. Asks deep "why" questions. Speaks in a calm, measured tone.',
    color: '#FF6B35',
    systemPrompt: '', // Generated automatically
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Step 2: Ingest KNOWLEDGE from YouTube videos
  console.log('📥 Ingesting Simon Sinek\'s YouTube content...');
  
  const videos = [
    'https://www.youtube.com/watch?v=u4ZoJKF_VuA', // Start With Why TED Talk
    'https://www.youtube.com/watch?v=ReRcHdeUG9Y', // Golden Circle
    'https://www.youtube.com/watch?v=qp0HIF3SfI4', // Infinite Game
  ];

  for (const video of videos) {
    try {
      await ragService.ingestYouTubeVideo(video, simonCoach.id);
      console.log(`✅ Ingested: ${video}`);
    } catch (error) {
      console.error(`❌ Failed: ${video}`, error);
    }
  }

  console.log('\n✨ Coach created with knowledge base!\n');

  // Step 3: Compare responses
  await compareResponses(simonCoach);
}

async function compareResponses(coach: CoachData) {
  const query = "How do I inspire my team to work harder?";

  console.log(`🤔 User Question: "${query}"\n`);

  // WITHOUT RAG (style only)
  console.log('❌ WITHOUT RAG (Generic AI + Style):');
  const styleOnlyResponse = await aiService.generateResponse(coach, query, []);
  console.log(styleOnlyResponse);
  console.log('\n---\n');

  // WITH RAG (style + actual knowledge)
  console.log('✅ WITH RAG (Actual YouTube Content + Style):');
  const knowledgeResponse = await aiService.generateResponse(coach, query, []);
  console.log(knowledgeResponse);
  console.log('\n---\n');

  console.log('💡 Notice the difference:');
  console.log('- Style-only: Generic leadership advice in Simon\'s tone');
  console.log('- RAG-powered: References actual concepts like "Golden Circle", "Start With Why"');
}

// Run example
createSimonSinekCoach().catch(console.error);

/**
 * EXPECTED OUTPUT:
 * 
 * ❌ WITHOUT RAG:
 * "To inspire your team, start by understanding their individual motivations.
 *  People work harder when they feel connected to a larger purpose..."
 * 
 * ✅ WITH RAG:
 * "Let me share the Golden Circle framework. People don't buy what you do,
 *  they buy WHY you do it. Instead of asking your team to work harder,
 *  help them understand the WHY behind their work. When people know their
 *  purpose, inspiration becomes intrinsic..."
 * 
 * The RAG version references ACTUAL content from Simon's videos!
 */
