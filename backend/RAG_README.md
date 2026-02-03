# RAG Implementation for YouTube Coach Knowledge

## Overview

This RAG (Retrieval-Augmented Generation) system allows coaches to have **actual knowledge** from YouTube channels, not just personality/style mimicry.

## How It Works

```
┌─────────────────┐
│ YouTube Video   │
│   Transcripts   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Chunk Text     │ (200 words/30s)
│  (~50 chunks)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Generate        │
│ Embeddings      │ (384-dim vectors)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Store in        │
│ Supabase        │ (pgvector)
│ Vector DB       │
└─────────────────┘

USER QUERY → Embed → Similarity Search → Top 3 Chunks → Gemini + Context
```

## Setup

### 1. Run Supabase Migration

```bash
# In Supabase SQL Editor, run:
cat backend/supabase_rag_migration.sql
```

This creates:
- `coach_knowledge` table with vector embeddings
- Similarity search function
- Optimized indexes

### 2. Ingest YouTube Content

**Single Video:**
```bash
POST /api/knowledge/ingest/video
{
  "coachId": "coach-123",
  "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

**Entire Channel (up to 50 videos):**
```bash
POST /api/knowledge/ingest/channel
{
  "coachId": "coach-123",
  "channelUrl": "https://www.youtube.com/@channelname",
  "maxVideos": 50
}
```

**Multiple Videos (Batch):**
```bash
POST /api/knowledge/ingest/batch
{
  "coachId": "coach-123",
  "videoUrls": [
    "https://www.youtube.com/watch?v=VIDEO_1",
    "https://www.youtube.com/watch?v=VIDEO_2",
    "https://www.youtube.com/watch?v=VIDEO_3"
  ]
}
```

### 3. Chat with Knowledge-Aware Coach

The chat endpoint automatically retrieves relevant context:

```bash
POST /api/chat/message
{
  "coachId": "coach-123",
  "message": "What's your advice on productivity?",
  "sessionId": "session-456"
}
```

**Behind the scenes:**
1. User query → Embedded
2. Top 3 similar chunks retrieved from coach's knowledge base
3. Chunks + System Prompt + Query → Gemini
4. Response grounded in actual content

## Example: Creating a "Simon Sinek Coach"

```typescript
// 1. Create the coach (personality/style)
POST /api/coaches
{
  "name": "Simon Sinek",
  "tagline": "Start with Why",
  "personality": ["Inspirational", "Thoughtful", "Storyteller"],
  "expertise": ["Leadership", "Purpose", "Team Building"],
  "background": "Author of Start With Why, leadership expert",
  "conversationStyle": "Uses stories and metaphors. Asks deep questions.",
  "color": "#FF6B35"
}

// 2. Ingest his entire YouTube channel (auto-fetches up to 50 videos)
POST /api/knowledge/ingest/channel
{
  "coachId": "simon-sinek-id",
  "channelUrl": "https://www.youtube.com/@SimonSinek",
  "maxVideos": 50
}

// 3. Chat with knowledge-aware Simon
POST /api/chat/message
{
  "coachId": "simon-sinek-id",
  "message": "How do I inspire my team?"
}

// Response will reference actual concepts from his videos:
// "Let me share something from the Golden Circle framework.
//  People don't buy what you do, they buy WHY you do it..."
```

## Key Differences: Style vs Knowledge

| Aspect | Without RAG | With RAG |
|--------|-------------|----------|
| **Personality** | ✅ Mimics tone/style | ✅ Mimics tone/style |
| **Knowledge** | ❌ Generic AI knowledge | ✅ Actual video content |
| **Accuracy** | ❌ May hallucinate | ✅ Grounded in transcripts |
| **Specificity** | ❌ Vague advice | ✅ References specific concepts |

## Performance

- **Embedding Model**: Gemini `text-embedding-004` (768 dimensions)
- **Speed**: ~100ms for retrieval + 1-2s for Gemini
- **Storage**: ~1KB per chunk (50 chunks/video = 50KB)
- **Similarity Threshold**: 0.5 (adjustable)

## Future Enhancements

1. ~~**Channel Ingestion**: Auto-fetch all videos from a channel~~ ✅ Implemented
2. **Timestamp Links**: Return video timestamps with responses
3. **Multi-Source**: Combine YouTube + PDFs + Blog posts
4. **Reranking**: Use cross-encoder for better relevance

## Troubleshooting

**"No relevant context found"**
- Lower `match_threshold` in `rag.ts` (default: 0.5)
- Ingest more videos

**"Embedding dimension mismatch"**
- Ensure Supabase table uses `vector(768)`
- Check model is Gemini `text-embedding-004`

**"Slow responses"**
- Add more pgvector index lists (default: 100)
- Cache embeddings for common queries
