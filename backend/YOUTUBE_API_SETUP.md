# YouTube API Setup Guide

## Get Your YouTube Data API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **YouTube Data API v3**:
   - Go to "APIs & Services" > "Library"
   - Search for "YouTube Data API v3"
   - Click "Enable"
4. Create credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the API key
5. Add to `.env`:
   ```
   YOUTUBE_API_KEY=YOUR_API_KEY_HERE
   ```

## Supported Channel URL Formats

```
https://www.youtube.com/@channelname
https://www.youtube.com/channel/UC...
https://www.youtube.com/c/channelname
```

## Usage

```bash
POST /api/knowledge/ingest/channel
{
  "coachId": "coach-123",
  "channelUrl": "https://www.youtube.com/@SimonSinek",
  "maxVideos": 50
}
```

This will:
1. Fetch up to 50 most recent videos from the channel
2. Download transcripts for each video
3. Chunk and embed the content using Gemini
4. Store in Supabase vector database

## Quota Limits

YouTube Data API has daily quotas:
- **Free tier**: 10,000 units/day
- **Channel search**: ~100 units
- **Video list**: ~1 unit per video

Fetching 50 videos ≈ 150 units (well within free tier)
