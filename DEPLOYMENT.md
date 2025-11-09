# 🚀 Complete GitHub & Deployment Guide

## 📋 Step 1: Install Dependencies

```cmd
npm install
```

This will install:
- React 18
- Vite
- Tailwind CSS
- Lucide React (icons)
- All dev dependencies

## 📋 Step 2: Test Locally

```cmd
npm run dev
```

Open http://localhost:5173 in your browser. You should see BrutalOS running!

## 📋 Step 3: Initialize Git

```cmd
git init
git add .
git commit -m "Initial commit: BrutalOS learning management system"
```

## 📋 Step 4: Create GitHub Repository

### Option A: Via GitHub Website

1. Go to https://github.com/new
2. Repository name: `brutal-learning-os`
3. Description: `Personal learning management system with exam tracking, resource management, and GRE prep`
4. Make it **Private** (your personal data!)
5. Don't initialize with README
6. Click "Create repository"

### Option B: Via GitHub CLI

```cmd
gh repo create brutal-learning-os --private --source=. --remote=origin
```

## 📋 Step 5: Push to GitHub

Replace `YOUR_USERNAME` with your actual GitHub username:

```cmd
git remote add origin https://github.com/YOUR_USERNAME/brutal-learning-os.git
git branch -M main
git push -u origin main
```

## 📋 Step 6: Deploy to Vercel (FREE!)

### Method 1: Via Vercel Website (Easiest)

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Add New Project"
4. Select `brutal-learning-os` repository
5. Vercel auto-detects Vite setup ✅
6. Click "Deploy"
7. Wait 2 minutes ⏱️
8. Get your live URL: `https://brutal-learning-os.vercel.app` 🎉

### Method 2: Via Vercel CLI

```cmd
npm i -g vercel
vercel login
vercel
```

Follow the prompts (all defaults are fine).

## 📋 Alternative: Deploy to Netlify

```cmd
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

Choose "Create new site" and follow prompts.

## 🎉 You're Live!

Now you have:
- ✅ Code on GitHub (private repo)
- ✅ Live website (Vercel/Netlify)
- ✅ Auto-deploys on every git push
- ✅ Free forever

## 🔄 Future Updates Workflow

```cmd
# Make changes to src/App.jsx
# Test locally
npm run dev

# When happy, commit and push
git add .
git commit -m "Added new feature"
git push

# Vercel/Netlify auto-deploys in 2 minutes!
```

## 📱 Mobile Access

The app is fully responsive! Bookmark your Vercel URL on your phone for quick access.

## 💾 Data Backup

Your data is stored in browser localStorage. To backup:
1. Open browser DevTools (F12)
2. Go to Application > Local Storage
3. Export the data (copy JSON)
4. Save to a file

## 🔧 Troubleshooting

### Build Errors

```cmd
# Clear cache and reinstall
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Git Issues

```cmd
# Reset git if needed
rmdir /s /q .git
git init
git add .
git commit -m "Fresh start"
```

## 🎯 What's Next?

Want to add:
- ✨ AI Study Recommendations
- 📊 Advanced Analytics
- 🔔 Exam Reminders
- 📱 PWA (Install as App)
- ☁️ Cloud Sync

Let me know what you'd like to add next!

---

**Not average. Disgustingly educated.** 🔥
