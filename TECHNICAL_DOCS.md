# BetterOS Technical Documentation

**Version 1.0 | January 2025**

---

## Table of Contents

1. [Tech Stack Overview](#tech-stack-overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [AI Integration](#ai-integration)
5. [RevenueCat Implementation](#revenuecat-implementation)
6. [Authentication & Security](#authentication--security)
7. [Deployment](#deployment)

---

## Tech Stack Overview

### Frontend (Mobile)

- **Framework**: React Native (Expo SDK 52)
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Context API
- **UI Components**: Custom components with React Native primitives
- **Styling**: StyleSheet API with dynamic theming
- **Icons**: SF Symbols (iOS) / Material Icons (Android)

### Backend

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **API Architecture**: RESTful

### Database & Storage

- **Primary Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage (for avatars)
- **Vector Database**: Supabase pgvector (for RAG/embeddings)

### AI & ML

- **LLM Provider**: Google Gemini 2.0 Flash
- **Voice AI**: ElevenLabs (planned)
- **Observability**: Opik (LLM tracing & monitoring)
- **Embeddings**: text-embedding-004 (Google)

### Monetization

- **Subscription Management**: RevenueCat
- **Payment Processing**: Apple App Store / Google Play Store

### Development Tools

- **Package Manager**: npm
- **Version Control**: Git
- **Environment Management**: dotenv
- **Build Tool**: Expo EAS (Expo Application Services)

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Mobile App (React Native)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Onboarding  │  │  Crew Chat   │  │  Goal Track  │      │
│  │  Interview   │  │  Interface   │  │  Dashboard   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                   ┌────────▼────────┐                        │
│                   │  Context Layer  │                        │
│                   │  (React Context)│                        │
│                   └────────┬────────┘                        │
│                            │                                 │
│         ┌──────────────────┼──────────────────┐             │
│         │                  │                  │             │
│    ┌────▼────┐      ┌──────▼──────┐    ┌─────▼─────┐      │
│    │ Orbit   │      │ Subscription│    │  Theme    │      │
│    │ Context │      │  Context    │    │  Context  │      │
│    └────┬────┘      └──────┬──────┘    └─────┬─────┘      │
│         │                  │                  │             │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼─────────────┐
│                      Service Layer                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Database │  │ Backend  │  │RevenueCat│  │  Auth    │   │
│  │ Service  │  │ Service  │  │ Service  │  │ Service  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
└───────┼─────────────┼─────────────┼─────────────┼───────────┘
        │             │             │             │
        │             │             │             │
┌───────▼─────────────▼─────────────▼─────────────▼───────────┐
│                    External Services                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Supabase │  │  Gemini  │  │RevenueCat│  │ElevenLabs│   │
│  │PostgreSQL│  │   API    │  │   API    │  │   API    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

#### 1. Onboarding Flow

```
User Opens App
    ↓
Check isOnboarded (OrbitContext)
    ↓
[Not Onboarded] → OnboardingInterview Component
    ↓
9-Step Interview (values, work style, energy, etc.)
    ↓
Save to Supabase (user_profiles table)
    ↓
Show Paywall (RevenueCat)
    ↓
[Onboarded] → Main Dashboard
```

#### 2. AI Chat Flow

```
User Selects Crew Member (Boss/Creative/Stoic)
    ↓
Load Shared Session (crewService.getCrewMemberMessages)
    ↓
Build Context (Orbit + Other Crew Conversations)
    ↓
Send Message to Backend (/api/crew-chat)
    ↓
Backend → Gemini API (with full context)
    ↓
Stream Response Back to Client
    ↓
Save to Shared Session (crew_messages table)
    ↓
Update UI
```

#### 3. Goal Tracking Flow

```
User Completes Daily Check-In
    ↓
Create Tasks (goalsService.createTask)
    ↓
Save to Supabase (tasks table)
    ↓
Update Check-In Timestamp (user_profiles.last_daily_checkin)
    ↓
Reload Dashboard Data
    ↓
Show Progress Bars & Completion Stats
```

---

## Database Schema

### Core Tables

#### `user_profiles`

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  core_values TEXT[],
  current_anxieties TEXT[],
  five_year_goal TEXT,
  one_year_goal TEXT,
  ten_year_goal TEXT,
  work_style TEXT,
  motivation_type TEXT,
  metadata JSONB,
  last_daily_checkin TIMESTAMP,
  last_weekly_checkin TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `goals`

```sql
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  goal_type TEXT CHECK (goal_type IN ('long_term', 'weekly')),
  deadline_days INTEGER,
  progress INTEGER DEFAULT 0,
  milestones JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `tasks`

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  time TEXT,
  reminder_time TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
```

#### `habits`

```sql
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  completed_today BOOLEAN DEFAULT FALSE,
  streak INTEGER DEFAULT 0,
  last_completed TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `crew_messages`

```sql
CREATE TABLE crew_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_date DATE DEFAULT CURRENT_DATE,
  crew_member TEXT CHECK (crew_member IN ('boss', 'creative', 'stoic')),
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `coaches`

```sql
CREATE TABLE coaches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tagline TEXT,
  personality TEXT,
  expertise TEXT,
  system_prompt TEXT,
  color TEXT,
  avatar_url TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `knowledge_base`

```sql
CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID REFERENCES coaches(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding VECTOR(768),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Row-Level Security (RLS)

All tables have RLS enabled with policies:

```sql
-- Example for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);
```

---

## AI Integration

### Gemini Configuration

**File**: `backend/src/services/ai.ts`

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const aiService = {
  async chat(messages: Message[], systemPrompt: string) {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      systemInstruction: systemPrompt,
    });

    const chat = model.startChat({
      history: messages.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      })),
    });

    const result = await chat.sendMessage(
      messages[messages.length - 1].content,
    );
    return result.response.text();
  },
};
```

### Crew Context Building

**File**: `services/crew.ts`

```typescript
export const crewService = {
  async buildCrewContext(currentMember: "boss" | "creative" | "stoic") {
    const userId = await authService.getUserId();

    // Get user's Orbit profile
    const profile = await databaseService.getUserProfile();

    // Get today's messages from OTHER crew members
    const { data: otherMessages } = await databaseService.supabase
      .from("crew_messages")
      .select("*")
      .eq("user_id", userId)
      .eq("session_date", new Date().toISOString().split("T")[0])
      .neq("crew_member", currentMember)
      .order("created_at", { ascending: true });

    // Build context string
    let context = `# User Profile\n`;
    context += `Core Values: ${profile.coreValues.join(", ")}\n`;
    context += `Work Style: ${profile.metadata?.work_style}\n\n`;

    if (otherMessages && otherMessages.length > 0) {
      context += `# What the crew discussed today:\n`;
      otherMessages.forEach((msg) => {
        context += `[${msg.crew_member}] ${msg.role}: ${msg.content}\n`;
      });
    }

    return context;
  },
};
```

### Opik Observability

**File**: `backend/src/services/ai.ts`

```typescript
import { Opik } from "opik";

const opik = new Opik({
  apiKey: process.env.OPIK_API_KEY,
  projectName: "betteros-production",
});

export const aiService = {
  async chat(messages: Message[], systemPrompt: string) {
    const trace = opik.trace({
      name: "crew-chat",
      input: { messages, systemPrompt },
    });

    try {
      const response = await model.sendMessage(/* ... */);

      trace.update({
        output: { response: response.text() },
        metadata: { model: "gemini-2.0-flash-exp" },
      });

      return response.text();
    } catch (error) {
      trace.update({ error: error.message });
      throw error;
    } finally {
      trace.end();
      await opik.flush();
    }
  },
};
```

---

## RevenueCat Implementation

### Setup & Configuration

**File**: `services/revenuecat.ts`

```typescript
import Purchases, {
  PurchasesOffering,
  CustomerInfo,
} from "react-native-purchases";

const REVENUECAT_API_KEY = Platform.select({
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY!,
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY!,
});

export const revenueCatService = {
  async initialize(userId: string) {
    await Purchases.configure({
      apiKey: REVENUECAT_API_KEY,
      appUserID: userId,
    });
  },

  async getOfferings(): Promise<PurchasesOffering | null> {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  },

  async purchasePackage(packageToPurchase: any) {
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    return customerInfo;
  },

  async restorePurchases() {
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo;
  },

  async getCustomerInfo(): Promise<CustomerInfo> {
    return await Purchases.getCustomerInfo();
  },

  isProUser(customerInfo: CustomerInfo): boolean {
    return (
      customerInfo.entitlements.active["pro"] !== undefined ||
      customerInfo.entitlements.active["lifetime"] !== undefined
    );
  },
};
```

### Subscription Context

**File**: `contexts/SubscriptionContext.tsx`

```typescript
import React, { createContext, useContext, useEffect, useState } from "react";
import { revenueCatService } from "@/services/revenuecat";
import { authService } from "@/services/auth";

interface SubscriptionContextType {
  isProUser: boolean;
  loading: boolean;
  offerings: any;
  purchasePackage: (pkg: any) => Promise<void>;
  restorePurchases: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined,
);

export function SubscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isProUser, setIsProUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [offerings, setOfferings] = useState(null);

  useEffect(() => {
    initializeRevenueCat();
  }, []);

  const initializeRevenueCat = async () => {
    try {
      const userId = await authService.getUserId();
      await revenueCatService.initialize(userId);

      const customerInfo = await revenueCatService.getCustomerInfo();
      setIsProUser(revenueCatService.isProUser(customerInfo));

      const offerings = await revenueCatService.getOfferings();
      setOfferings(offerings);
    } catch (error) {
      console.error("RevenueCat initialization error:", error);
    } finally {
      setLoading(false);
    }
  };

  const purchasePackage = async (pkg: any) => {
    const customerInfo = await revenueCatService.purchasePackage(pkg);
    setIsProUser(revenueCatService.isProUser(customerInfo));
  };

  const restorePurchases = async () => {
    const customerInfo = await revenueCatService.restorePurchases();
    setIsProUser(revenueCatService.isProUser(customerInfo));
  };

  return (
    <SubscriptionContext.Provider
      value={{
        isProUser,
        loading,
        offerings,
        purchasePackage,
        restorePurchases,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context)
    throw new Error("useSubscription must be used within SubscriptionProvider");
  return context;
};
```

### Paywall Component

**File**: `components/Paywall.tsx`

```typescript
import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { useSubscription } from "@/contexts/SubscriptionContext";

export default function Paywall({ visible, onClose }: PaywallProps) {
  const { offerings, purchasePackage, restorePurchases } = useSubscription();

  const handlePurchase = async (pkg: any) => {
    try {
      await purchasePackage(pkg);
      onClose();
    } catch (error) {
      if (!error.userCancelled) {
        console.error("Purchase error:", error);
      }
    }
  };

  if (!offerings) return null;

  const monthlyPackage = offerings.availablePackages.find(
    (p: any) => p.identifier === "$rc_monthly",
  );
  const annualPackage = offerings.availablePackages.find(
    (p: any) => p.identifier === "$rc_annual",
  );

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <Text style={styles.title}>Upgrade to Pro</Text>

        {/* Monthly Package */}
        <TouchableOpacity onPress={() => handlePurchase(monthlyPackage)}>
          <Text>{monthlyPackage?.product.priceString}/month</Text>
        </TouchableOpacity>

        {/* Annual Package */}
        <TouchableOpacity onPress={() => handlePurchase(annualPackage)}>
          <Text>{annualPackage?.product.priceString}/year</Text>
          <Text>Save 33%</Text>
        </TouchableOpacity>

        {/* Restore Purchases */}
        <TouchableOpacity onPress={restorePurchases}>
          <Text>Restore Purchases</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
```

### Subscription Gate Hook

**File**: `components/SubscriptionGate.tsx`

```typescript
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useState } from "react";
import Paywall from "./Paywall";

export function useSubscriptionGate() {
  const { isProUser } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);

  const checkAccess = () => {
    if (!isProUser) {
      setShowPaywall(true);
      return false;
    }
    return true;
  };

  const PaywallComponent = () => (
    <Paywall visible={showPaywall} onClose={() => setShowPaywall(false)} />
  );

  return { isProUser, checkAccess, PaywallComponent };
}
```

### Usage Example

```typescript
// In any component
import { useSubscriptionGate } from "@/components/SubscriptionGate";

export default function CreateCoachScreen() {
  const { checkAccess, PaywallComponent } = useSubscriptionGate();

  const handleCreateCoach = () => {
    if (!checkAccess()) return; // Shows paywall if not Pro

    // Pro user logic here
    createCustomCoach();
  };

  return (
    <>
      <TouchableOpacity onPress={handleCreateCoach}>
        <Text>Create Custom Coach</Text>
      </TouchableOpacity>
      <PaywallComponent />
    </>
  );
}
```

### RevenueCat Dashboard Configuration

**Products Setup**:

- **Product ID**: `pro_monthly` (iOS), `pro_monthly` (Android)
- **Price**: $9.99/month
- **Product ID**: `pro_annual` (iOS), `pro_annual` (Android)
- **Price**: $79.99/year

**Entitlements**:

- **Entitlement ID**: `pro`
- **Products**: `pro_monthly`, `pro_annual`

**Offerings**:

- **Offering ID**: `default`
- **Packages**:
  - `$rc_monthly` → `pro_monthly`
  - `$rc_annual` → `pro_annual`

---

## Authentication & Security

### Supabase Auth Setup

**File**: `services/auth.ts`

```typescript
import { supabase } from "./supabase";

export const authService = {
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getUserId(): Promise<string> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    return user.id;
  },

  async getSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  },
};
```

### Environment Variables

**File**: `.env`

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# RevenueCat
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxxxx
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_xxxxx

# Backend
EXPO_PUBLIC_BACKEND_URL=http://localhost:3000

# Backend .env
GEMINI_API_KEY=your-gemini-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
OPIK_API_KEY=your-opik-key
ELEVENLABS_API_KEY=your-elevenlabs-key
```

---

## Deployment

### Mobile App (Expo EAS)

**File**: `eas.json`

```json
{
  "build": {
    "production": {
      "ios": {
        "bundleIdentifier": "com.betteros.app",
        "buildConfiguration": "Release"
      },
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890"
      },
      "android": {
        "serviceAccountKeyPath": "./google-play-key.json",
        "track": "production"
      }
    }
  }
}
```

**Build Commands**:

```bash
# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

### Backend Deployment

**Recommended**: Railway, Render, or Fly.io

**Dockerfile**:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

**Deploy to Railway**:

```bash
railway login
railway init
railway up
```

---

## Performance Optimizations

### 1. Lazy Loading

```typescript
// Lazy load heavy components
const CreateCoachModal = lazy(() => import("@/components/CreateCoachModal"));
```

### 2. Memoization

```typescript
const MemoizedCrewCard = React.memo(CrewCard);
```

### 3. Optimistic Updates

```typescript
// Update UI immediately, sync with backend
setTasks((prev) =>
  prev.map((t) => (t.id === taskId ? { ...t, completed: true } : t)),
);
await goalsService.toggleTask(taskId);
```

### 4. Batch API Calls

```typescript
const [goals, tasks, habits] = await Promise.all([
  goalsService.getGoals("long_term"),
  goalsService.getTodaysTasks(),
  goalsService.getHabits(),
]);
```

---

## Monitoring & Analytics

### Opik Dashboard

- Track AI response times
- Monitor token usage
- Debug conversation flows
- A/B test prompts

### RevenueCat Dashboard

- Track MRR/ARR
- Monitor churn rate
- Analyze conversion funnels
- View cohort retention

### Supabase Dashboard

- Database performance
- API usage
- Storage metrics
- Auth analytics

---

## Future Enhancements

1. **Voice Mode**: ElevenLabs integration for walking conversations
2. **Push Notifications**: Daily/weekly check-in reminders
3. **Analytics Dashboard**: Productivity patterns and insights
4. **Creator Marketplace**: Deep link sharing for custom coaches
5. **Team Features**: Shared Orbit for organizations
6. **Integrations**: Notion, Todoist, Google Calendar sync

---

## Support & Resources

- **Documentation**: [GitHub Wiki](https://github.com/bl4ckh405/betteros/)
- **RevenueCat Docs**: https://docs.revenuecat.com
- **Supabase Docs**: https://supabase.com/docs
- **Expo Docs**: https://docs.expo.dev

---

**Last Updated**: January 2025  
**Maintained By**: BetterOS Team
