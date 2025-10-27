# 🎯 TINNY Setup Guide - Complete Walkthrough

This guide will walk you through setting up TINNY from scratch to deployment.

## ⏱️ Estimated Time: 30-45 minutes

---

## Step 1: Local Environment Setup (5 minutes)

### 1.1 Install Node.js
- Download from [nodejs.org](https://nodejs.org) (v18 or higher)
- Verify: `node --version` and `npm --version`

### 1.2 Clone and Install Dependencies
```bash
cd tinny-app
npm install
```

---

## Step 2: Supabase Setup (15 minutes)

### 2.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub
4. Click "New Project"
5. Choose organization (create one if needed)
6. Set project name: `tinny-calendar`
7. Set database password (save this!)
8. Choose region (closest to you)
9. Click "Create new project" (takes 2-3 minutes)

### 2.2 Create Database Schema
1. Once project is ready, click "SQL Editor" in sidebar
2. Click "New query"
3. Copy the entire contents of `DATABASE_SCHEMA.md`
4. Paste into SQL editor
5. Click "Run" (bottom right)
6. You should see success messages for all tables

### 2.3 Enable Row Level Security (RLS)
The schema already includes RLS policies, but let's verify:
1. Go to "Database" → "Tables" in sidebar
2. For each table, verify "RLS enabled" is checked
3. If not, click the table → "RLS policies" → Enable RLS

### 2.4 Configure Authentication Providers

#### Enable Email Authentication (Already enabled by default)
1. Go to "Authentication" → "Providers"
2. Email should be enabled

#### Enable Phone Authentication
1. In "Providers", find "Phone"
2. Enable it
3. Choose a provider (Twilio recommended)
4. Add your Twilio credentials

#### Enable Google Sign-In
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Choose "Web application"
6. Add authorized JavaScript origins: `http://localhost:3000`
7. Add authorized redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`
   - Find your project ref in Supabase: Settings → API → Project URL
8. Copy Client ID and Client Secret
9. In Supabase, go to Authentication → Providers → Google
10. Enable Google
11. Paste Client ID and Client Secret
12. Save

#### Enable Apple Sign-In
1. Go to [Apple Developer](https://developer.apple.com)
2. Sign in with Apple ID
3. Go to "Certificates, Identifiers & Profiles"
4. Create new App ID:
   - Description: TINNY Calendar
   - Bundle ID: com.yourname.tinny
   - Enable "Sign in with Apple"
5. Create Service ID:
   - Description: TINNY Calendar Web
   - Identifier: com.yourname.tinny.web
   - Configure "Sign in with Apple"
   - Add domain: `<your-project-ref>.supabase.co`
   - Add return URL: `https://<your-project-ref>.supabase.co/auth/v1/callback`
6. Create Key:
   - Key Name: TINNY Auth Key
   - Enable "Sign in with Apple"
   - Download the key file (save it!)
7. In Supabase, go to Authentication → Providers → Apple
8. Enable Apple
9. Add Service ID, Team ID, Key ID, and paste private key
10. Save

### 2.5 Get API Keys
1. Go to "Settings" → "API" in Supabase
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public** key
   - **service_role** key (keep this secret!)

---

## Step 3: Anthropic API Setup (5 minutes)

### 3.1 Get API Key
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Go to "API Keys"
4. Click "Create Key"
5. Name it "TINNY Calendar"
6. Copy the key (you won't see it again!)

---

## Step 4: Environment Variables (2 minutes)

### 4.1 Create .env.local
```bash
cp .env.local.example .env.local
```

### 4.2 Fill in Values
Open `.env.local` and add your keys:

```env
# From Supabase Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# From Anthropic Console
ANTHROPIC_API_KEY=sk-ant-xxxxx

# For local development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Step 5: Run the Application (2 minutes)

### 5.1 Start Development Server
```bash
npm run dev
```

### 5.2 Open Browser
Go to [http://localhost:3000](http://localhost:3000)

You should see the TINNY login page! 🎉

---

## Step 6: Test Authentication

### 6.1 Create Test Account
1. Click "Sign Up"
2. Enter email and password
3. Check your email for verification
4. Click verification link
5. You should be logged in!

### 6.2 Test Google Sign-In
1. Click "Sign in with Google"
2. Choose your Google account
3. You should be logged in!

---

## Step 7: Deploy to Production (10 minutes)

### 7.1 Push to GitHub
```bash
git init
git add .
git commit -m "Initial TINNY setup"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 7.2 Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Configure project:
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: ./
   - Build Command: `npm run build`
6. Add Environment Variables:
   - Copy all from `.env.local`
   - Click "Add" for each one
7. Click "Deploy"
8. Wait 2-3 minutes
9. You're live! 🚀

### 7.3 Update Supabase URLs
1. In Supabase, go to Authentication → URL Configuration
2. Add your Vercel URL to:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/**`

### 7.4 Update OAuth Redirect URLs
Update Google and Apple OAuth settings with your production URL:
- `https://your-app.vercel.app/auth/callback`

---

## Step 8: External Calendar Integration (Optional)

### 8.1 Google Calendar API
1. In Google Cloud Console:
   - Enable "Google Calendar API"
   - Add OAuth scopes: `calendar.readonly`, `calendar.events`
   - Update redirect URIs with production URL

### 8.2 Microsoft Outlook
1. Go to [Azure Portal](https://portal.azure.com)
2. Register new app
3. Add Microsoft Graph permissions
4. Configure OAuth

### 8.3 Apple Calendar (iCloud)
Uses CalDAV protocol - implement in Phase 5

---

## Troubleshooting

### "Supabase client error"
- Verify `.env.local` has correct keys
- Restart dev server: `npm run dev`

### "Authentication not working"
- Check Supabase Auth providers are enabled
- Verify redirect URLs match exactly
- Check browser console for errors

### "Database error"
- Verify all SQL ran successfully in Supabase
- Check RLS policies are enabled
- Review Supabase logs: Logs → Database

### "AI not working"
- Verify Anthropic API key is correct
- Check you have API credits
- Review API logs in Anthropic console

---

## Next Steps

Now that setup is complete, we'll build:
- ✅ Phase 1: Foundation (Complete!)
- 🔨 Phase 2: Authentication UI
- 🔨 Phase 3: Calendar Interface
- 🔨 Phase 4: Friend System
- 🔨 Phase 5: Privacy Controls
- 🔨 Phase 6: Groups
- 🔨 Phase 7: AI Features
- 🔨 Phase 8: Notifications

Ready to build Phase 2? Let me know!

---

## Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Anthropic Docs**: https://docs.anthropic.com
- **Tailwind CSS**: https://tailwindcss.com/docs

Happy building! 🚀
