# EAS Updates & iOS Production Build Guide

## ✅ EAS Updates Setup Complete

### What Was Configured

1. **expo-updates Package** - Installed for OTA updates
2. **Runtime Version** - Set to `appVersion` policy in app.json
3. **Update Channels** - Configured for development, preview, and production
4. **Auto-Update Check** - Added to app/_layout.tsx (runs on app start in production)

### Configuration Files

#### app.json
```json
{
  "runtimeVersion": {
    "policy": "appVersion"
  },
  "updates": {
    "url": "https://u.expo.dev/62b88a18-b3d3-4b72-9b25-d9dfe168f7f7"
  },
  "ios": {
    "bundleIdentifier": "com.betteros.app"
  }
}
```

#### eas.json
```json
{
  "build": {
    "development": {
      "channel": "development"
    },
    "preview": {
      "channel": "preview"
    },
    "production": {
      "channel": "production"
    }
  }
}
```

## 📱 iOS Production Build Steps

### 1. Prerequisites
```bash
# Install EAS CLI globally (if not already installed)
npm install -g eas-cli

# Login to Expo account
eas login
```

### 2. Configure iOS Credentials
```bash
# Generate iOS credentials (certificates & provisioning profiles)
eas credentials
```

### 3. Build for Production
```bash
# Build iOS production app
eas build --platform ios --profile production

# This will:
# - Create a production build
# - Auto-increment build number
# - Use production channel for updates
# - Generate .ipa file for App Store
```

### 4. Submit to App Store
```bash
# Submit directly to App Store
eas submit --platform ios --latest

# Or download .ipa and upload via Xcode/Transporter
```

## 🔄 Publishing OTA Updates

### After Initial App Store Release

```bash
# Publish update to production channel
eas update --branch production --message "Bug fixes and improvements"

# Users will receive update automatically on next app launch
```

### Update Workflow

1. **Make code changes** (bug fixes, UI updates, etc.)
2. **Test locally** with `npx expo start`
3. **Publish update**: `eas update --branch production --message "Your message"`
4. **Users get update** automatically (no App Store review needed!)

### Important Notes

- ✅ **OTA updates work for**: JS code, assets, styling
- ❌ **Requires new build for**: Native code changes, new permissions, app.json changes
- 🔄 **Update timing**: Users get updates on next app launch
- 📊 **Monitor updates**: Check dashboard at https://expo.dev

## 🚀 Quick Commands Reference

```bash
# Development build
eas build --platform ios --profile development

# Preview build (internal testing)
eas build --platform ios --profile preview

# Production build (App Store)
eas build --platform ios --profile production

# Publish OTA update
eas update --branch production --message "Update description"

# Check update status
eas update:list --branch production

# View build status
eas build:list
```

## 📋 Pre-Launch Checklist

- [ ] Bundle identifier set: `com.betteros.app`
- [ ] App icon configured (1024x1024)
- [ ] Splash screen configured
- [ ] All permissions descriptions added
- [ ] RevenueCat iOS API key configured
- [ ] Supabase credentials in .env
- [ ] Test on physical iOS device
- [ ] Privacy policy URL ready
- [ ] App Store screenshots prepared
- [ ] App Store description written

## 🔐 Environment Variables

Make sure these are set in your .env file:
```bash
EXPO_PUBLIC_SUPABASE_URL=your_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=your_key
EXPO_PUBLIC_GEMINI_API_KEY=your_key
```

## 📱 Testing Production Build

```bash
# Build for internal testing
eas build --platform ios --profile preview

# Install on device via TestFlight or direct download
# Test all features before App Store submission
```

## 🎯 Next Steps

1. Run: `eas build --platform ios --profile production`
2. Wait for build to complete (~15-20 minutes)
3. Download .ipa or submit directly to App Store
4. After approval, publish updates with: `eas update --branch production`

## 💡 Tips

- **Version bumping**: Handled automatically with `autoIncrement: true`
- **Update frequency**: Can publish updates multiple times per day
- **Rollback**: Use `eas update:republish` to rollback to previous version
- **Channels**: Keep development/preview/production separate for testing
