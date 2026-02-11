# Database Migration: Anonymous User Management

## Overview
This migration adds device-specific user tracking to enable data isolation across devices without requiring login.

## What Changed
- Added `user_id` column to `user_profiles`, `coaches`, and `chat_sessions` tables
- Created indexes for performance
- Enabled Row Level Security (RLS) with open policies for anonymous access

## How to Apply

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `add_user_id_columns.sql`
4. Click **Run**

### Option 2: Supabase CLI
```bash
supabase db push
```

## How It Works
- Each device generates a unique UUID on first launch
- This UUID is stored locally and used as `user_id` for all database operations
- Data is automatically filtered by `user_id` in all queries
- Each device maintains its own isolated data set

## Testing
After applying the migration:
1. Clear app data on one device
2. Create a coach on that device
3. Verify it doesn't appear on other devices
4. Each device should maintain separate coaches, profiles, and sessions
