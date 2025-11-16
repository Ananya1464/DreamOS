# Configuration

Configure DreamOS with API keys to unlock all features. This guide covers getting keys for Google Gemini AI, Wolfram Alpha, and YouTube Data API.

## Overview

DreamOS requires three API keys for full functionality:

| API | Purpose | Required? | Free Tier |
|-----|---------|-----------|-----------|
| **Google Gemini AI** | Luna AI chat, topic extraction | ⚠️ Recommended | 60 requests/minute |
| **Wolfram Alpha** | Knowledge validation, homework help | Optional | 2,000 queries/month |
| **YouTube Data API** | Playlist import, video metadata | Optional | 10,000 units/day |

{% hint style="info" %}
**Start without APIs**: DreamOS works offline with demo data. Add APIs later to unlock YouTube import and Luna AI features.
{% endhint %}

## Quick Setup

### 1. Create `.env` File

In your DreamOS project root:

```bash
# Copy example file
cp .env.example .env
```

### 2. Add Your Keys

Open `.env` in a text editor and add:

```env
# Google Gemini AI
VITE_GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Wolfram Alpha
VITE_WOLFRAM_APP_ID=XXXXXX-XXXXXXXXXX

# YouTube Data API v3
VITE_YOUTUBE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_YOUTUBE_CLIENT_ID=XXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXX.apps.googleusercontent.com
```

### 3. Restart Development Server

```bash
# Press Ctrl+C to stop
npm run dev
```

**That's it!** DreamOS will now use your API keys.

---

## Detailed API Setup

### Google Gemini AI (Luna AI + Topic Extraction)

**What you get:**
- Conversational Luna AI assistant
- Automatic topic extraction from YouTube videos
- Study plan generation
- Quiz generation

#### Step 1: Get API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click **"Get API Key"**
3. Click **"Create API Key"**
4. Copy the key (starts with `AIzaSy...`)

{% hint style="success" %}
**Free Tier**: 60 requests per minute, no credit card required!
{% endhint %}

#### Step 2: Add to `.env`

```env
VITE_GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

#### Step 3: Test

1. Go to **Luna AI** page
2. Type: "Hello Luna!"
3. You should get a response ✅

**Not working?** Check:
- Key is copied correctly (no spaces)
- Dev server was restarted
- Check browser console for errors

---

### Wolfram Alpha (Knowledge Validation)

**What you get:**
- Validate manually added topics
- Homework helper with step-by-step solutions
- Scientific/mathematical computations

#### Step 1: Create Account

1. Go to [Wolfram Alpha Developer Portal](https://developer.wolframalpha.com/)
2. Click **"Get an AppID"**
3. Sign up (free account)
4. Verify your email

#### Step 2: Create App

1. Go to **"My Apps"**
2. Click **"Get an AppID"**
3. Fill in:
   - **Application name**: DreamOS
   - **Application description**: Personal learning assistant
4. Click **"Get AppID"**
5. Copy the AppID (looks like `XXXXXX-XXXXXXXXXX`)

{% hint style="success" %}
**Free Tier**: 2,000 queries per month (about 65 per day)
{% endhint %}

#### Step 3: Add to `.env`

```env
VITE_WOLFRAM_APP_ID=XXXXXX-XXXXXXXXXX
```

#### Step 4: Test

1. Go to **Birdseye View**
2. Click **"Add Topic Manually"**
3. Enter: "Quantum Computing"
4. Should show "✓ Validated by Wolfram" ✅

---

### YouTube Data API v3 (Playlist Import)

**What you get:**
- Import Watch Later playlist
- Import custom playlists
- Video thumbnails and metadata
- Automatic topic extraction from videos

#### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Create Project"**
3. Name: **DreamOS** (or anything)
4. Click **"Create"**

#### Step 2: Enable YouTube Data API

1. In your project, go to **"APIs & Services"** → **"Library"**
2. Search: **"YouTube Data API v3"**
3. Click on it → Click **"Enable"**

#### Step 3: Create API Key

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"API Key"**
3. Copy the key (starts with `AIzaSy...`)
4. **Optional**: Click **"Restrict Key"** → Select **"YouTube Data API v3"**

#### Step 4: Create OAuth Client ID

1. Still in **"Credentials"**, click **"Create Credentials"** → **"OAuth client ID"**
2. If prompted, configure **OAuth consent screen**:
   - User Type: **External**
   - App name: **DreamOS**
   - User support email: Your email
   - Developer contact: Your email
   - Save and Continue (skip scopes)
3. Back to **"Credentials"**, create OAuth client:
   - Application type: **Web application**
   - Name: **DreamOS Web**
   - Authorized JavaScript origins: `http://localhost:5173`
   - Authorized redirect URIs: `http://localhost:5173`
4. Click **"Create"**
5. Copy **Client ID** (ends with `.apps.googleusercontent.com`)

{% hint style="warning" %}
**Production**: For deployed apps, add your production URL to authorized origins!
{% endhint %}

#### Step 5: Add to `.env`

```env
VITE_YOUTUBE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_YOUTUBE_CLIENT_ID=XXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXX.apps.googleusercontent.com
```

#### Step 6: Test

1. Go to **SavedContent** page
2. Click **"Import from YouTube"**
3. Sign in with Google
4. Grant permissions
5. Videos should import with thumbnails ✅

{% hint style="success" %}
**Free Tier**: 10,000 quota units per day (enough for ~200 video imports)
{% endhint %}

---

## Environment Variables Reference

### Complete `.env` File

```env
# ═══════════════════════════════════════════════════════════
# DREAMOS CONFIGURATION
# ═══════════════════════════════════════════════════════════

# ─────────────────────────────────────────────────────────
# Google Gemini AI (Required for Luna AI)
# ─────────────────────────────────────────────────────────
# Get key: https://makersuite.google.com/app/apikey
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# ─────────────────────────────────────────────────────────
# Wolfram Alpha (Optional - for homework help)
# ─────────────────────────────────────────────────────────
# Get AppID: https://developer.wolframalpha.com/
VITE_WOLFRAM_APP_ID=your_wolfram_app_id_here

# ─────────────────────────────────────────────────────────
# YouTube Data API v3 (Optional - for playlist import)
# ─────────────────────────────────────────────────────────
# Setup: https://console.cloud.google.com/
VITE_YOUTUBE_API_KEY=your_youtube_api_key_here
VITE_YOUTUBE_CLIENT_ID=your_youtube_client_id_here.apps.googleusercontent.com

# ─────────────────────────────────────────────────────────
# Firebase (Optional - for cloud sync)
# ─────────────────────────────────────────────────────────
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# ─────────────────────────────────────────────────────────
# Application Settings (Optional)
# ─────────────────────────────────────────────────────────
VITE_APP_NAME=DreamOS
VITE_APP_VERSION=1.0.0
VITE_ENV=development
```

### Variable Descriptions

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_GEMINI_API_KEY` | Google Gemini AI for chat and analysis | None (demo mode) |
| `VITE_WOLFRAM_APP_ID` | Wolfram Alpha for computations | None (disabled) |
| `VITE_YOUTUBE_API_KEY` | YouTube API for video metadata | None (disabled) |
| `VITE_YOUTUBE_CLIENT_ID` | OAuth for YouTube sign-in | None (disabled) |
| `VITE_APP_NAME` | Application display name | "DreamOS" |
| `VITE_ENV` | Environment mode | "development" |

## Security Best Practices

### ⚠️ Never Commit `.env` to Git

The `.gitignore` already excludes `.env`, but verify:

```bash
cat .gitignore | grep .env
# Should show: .env
```

### 🔒 Restrict API Keys

**For Gemini AI:**
- Set HTTP referrer restrictions in Google AI Studio
- Limit to your domain only

**For YouTube API:**
- Restrict to YouTube Data API v3 only
- Set application restrictions (HTTP referrers)

**For Wolfram Alpha:**
- No restrictions needed (has built-in rate limiting)

### 🌐 Production Deployment

When deploying to Vercel/Netlify/etc:

1. **Don't** include `.env` in repository
2. **Do** add environment variables in platform dashboard
3. **Update** OAuth redirect URIs to production domain
4. **Enable** HTTPS only

**Example: Vercel**
```bash
vercel env add VITE_GEMINI_API_KEY
# Paste your key when prompted
```

## Testing Your Configuration

### Verify All APIs

Run this test script:

```bash
# Create test file
touch test-apis.js
```

```javascript
// test-apis.js
console.log('🔍 Checking API Configuration...\n');

const checks = {
  'Gemini AI': import.meta.env.VITE_GEMINI_API_KEY,
  'Wolfram Alpha': import.meta.env.VITE_WOLFRAM_APP_ID,
  'YouTube API': import.meta.env.VITE_YOUTUBE_API_KEY,
  'YouTube OAuth': import.meta.env.VITE_YOUTUBE_CLIENT_ID,
};

Object.entries(checks).forEach(([name, value]) => {
  const status = value ? '✅ Configured' : '❌ Missing';
  console.log(`${status} - ${name}`);
});

console.log('\n✨ Configuration check complete!');
```

```bash
node test-apis.js
```

## Troubleshooting

### Issue: API key not recognized

**Symptoms**: Features not working, errors in console

**Solutions**:
1. Restart dev server after adding keys
2. Check for typos or extra spaces in `.env`
3. Verify variable names start with `VITE_`
4. Check file is named exactly `.env` (not `.env.txt`)

### Issue: YouTube OAuth not working

**Symptoms**: Sign-in popup fails, redirect errors

**Solutions**:
1. Verify OAuth consent screen is configured
2. Add `http://localhost:5173` to authorized origins
3. Check client ID is correct (ends with `.apps.googleusercontent.com`)
4. Enable YouTube Data API v3 in Cloud Console

### Issue: Gemini API quota exceeded

**Symptoms**: "429 Too Many Requests" errors

**Solutions**:
1. Free tier: Wait 1 minute (60 requests/minute limit)
2. Implement request batching in code
3. Consider upgrading to paid tier for higher limits

### Issue: Wolfram Alpha timeout

**Symptoms**: Queries take >30 seconds or fail

**Solutions**:
1. Check AppID is correct
2. Verify you haven't exceeded 2,000 queries/month
3. Try simpler queries (complex computations take longer)

## Next Steps

✅ APIs configured! Now learn the basics:

{% content-ref url="first-steps.md" %}
[first-steps.md](first-steps.md)
{% endcontent-ref %}

Or dive into specific features:

{% content-ref url="../features/luna-ai.md" %}
[luna-ai.md](../features/luna-ai.md)
{% endcontent-ref %}

{% content-ref url="../features/youtube.md" %}
[youtube.md](../features/youtube.md)
{% endcontent-ref %}
