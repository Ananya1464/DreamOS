# Quick Start

Get DreamOS running in **under 10 minutes**! This guide gets you to a working demo fast.

## Prerequisites Checklist

Before you begin, make sure you have:

- [ ] **Node.js** 18+ installed ([download](https://nodejs.org/))
- [ ] **Git** installed ([download](https://git-scm.com/))
- [ ] A **Google account** (for YouTube integration)
- [ ] **5-10 minutes** of your time

{% hint style="info" %}
**Don't have API keys yet?** No problem! DreamOS works offline-first with demo data. You can add APIs later.
{% endhint %}

## Step 1: Clone & Install (2 minutes)

```bash
# Clone the repository
git clone https://github.com/Ananya1464/DreamOS.git
cd DreamOS

# Install dependencies
npm install
```

**What's happening?** This downloads the code and installs React, Framer Motion, Tailwind CSS, and other dependencies.

## Step 2: Start Development Server (30 seconds)

```bash
npm run dev
```

You should see:

```
VITE v7.2.2  ready in 342 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Open your browser** to `http://localhost:5173/`

## Step 3: Explore Demo Data (3 minutes)

DreamOS ships with pre-loaded demo data so you can explore immediately:

### 🏠 Dashboard
- See your **5-day streak** 🔥
- Check your **XP progress** (Level 3, 847 XP)
- View **AI-generated schedule** for today

### 📅 Schedule
- Look for the **red "YOU ARE HERE" line**
- Click on a block to mark it complete
- Earn **+50 XP** for completing tasks

### 🧠 Birdseye View
- Watch the **force-directed graph** animate
- **Drag nodes** around to see physics simulation
- Click **filter buttons** to show specific subjects
- Try **"Add Topic Manually"** (enter "Quantum Computing")

### 💬 Luna AI
- Type: "Explain neural networks in simple terms"
- Switch between **Chat**, **Study Buddy**, and **Quiz Master** modes
- Ask: "Create a 5-day study plan for VLSI exam"

### 📺 SavedContent
- See demo videos with thumbnails
- Notice **"Shame Stats"** section
- Click **"Mark Watched"** to earn XP

## Step 4: (Optional) Add API Keys (5 minutes)

To unlock full features, add your API keys:

### Create `.env` file:

```bash
# Copy the example file
cp .env.example .env
```

### Add Your Keys:

```env
# Google Gemini AI (for Luna AI & topic extraction)
VITE_GEMINI_API_KEY=your_gemini_key_here

# Wolfram Alpha (for knowledge validation)
VITE_WOLFRAM_APP_ID=your_wolfram_id_here

# YouTube Data API v3 (for playlist import)
VITE_YOUTUBE_API_KEY=your_youtube_key_here
VITE_YOUTUBE_CLIENT_ID=your_client_id_here
```

### How to Get Keys:

{% content-ref url="configuration.md" %}
[configuration.md](configuration.md)
{% endcontent-ref %}

**After adding keys**, restart the dev server:
```bash
# Press Ctrl+C to stop
npm run dev
```

## Step 5: Import Your YouTube Videos (2 minutes)

1. Go to **SavedContent** page
2. Click **"Import from YouTube"**
3. Sign in with Google account
4. Wait for import (shows progress)
5. See your videos with **thumbnails** and **durations**
6. Check your **"Shame Stats"** (unwatched videos)

The AI will analyze your videos and add topics to Birdseye!

## What's Next?

### Explore Features

<table>
  <tr>
    <td><strong>🎮 Try the Gamification</strong></td>
    <td>Complete tasks, earn XP, unlock achievements</td>
  </tr>
  <tr>
    <td><strong>🤖 Test AI Scheduling</strong></td>
    <td>Let Luna create your study plan</td>
  </tr>
  <tr>
    <td><strong>📊 Build Your Graph</strong></td>
    <td>Import content and watch your knowledge grow</td>
  </tr>
</table>

### Read Documentation

- [Dashboard Overview](../features/dashboard.md) - Understand your stats
- [Gamification System](../features/gamification.md) - How XP works
- [AI Scheduling](../features/scheduling.md) - Smart schedule generation
- [Birdseye View](../features/birdseye.md) - Knowledge graphs explained

### Customize Your Experience

- [Configuration Guide](configuration.md) - Tweak settings
- [Best Practices](../guides/best-practices.md) - Get the most out of DreamOS

## Common Issues

<details>
<summary><strong>Port 5173 already in use?</strong></summary>

```bash
# Kill the process using port 5173
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5173 | xargs kill -9
```

Then restart: `npm run dev`

</details>

<details>
<summary><strong>API keys not working?</strong></summary>

1. Check `.env` file has no spaces around `=`
2. Restart dev server after adding keys
3. Verify keys are active in respective consoles
4. Check browser console for specific error messages

</details>

<details>
<summary><strong>YouTube import not showing?</strong></summary>

1. Make sure you have videos in Watch Later
2. Check YouTube API key is valid
3. Enable YouTube Data API v3 in Google Cloud Console
4. Verify OAuth consent screen is configured

</details>

## Quick Commands Reference

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Maintenance
npm install          # Install dependencies
npm run lint         # Check code quality
```

## Video Walkthrough

{% embed url="https://youtu.be/your-demo-video" %}
3-minute video showing DreamOS features
{% endembed %}

## Join the Community

- **GitHub Discussions**: Ask questions, share tips
- **GitHub Issues**: Report bugs, request features
- **Star the repo**: Help others discover DreamOS ⭐

---

**Congratulations!** 🎉 You're now running DreamOS. Let's dive deeper into the features!

{% content-ref url="../features/dashboard.md" %}
[dashboard.md](../features/dashboard.md)
{% endcontent-ref %}
