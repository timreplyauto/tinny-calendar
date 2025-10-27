# 🚀 TINNY Quick Start Card

## ⚡ 5-Minute Start Guide

### 1. Install Dependencies (1 min)
```bash
cd tinny-app
npm install
```

### 2. Setup Supabase (2 min)
1. Create project at [supabase.com](https://supabase.com)
2. Run SQL from `DATABASE_SCHEMA.md` in SQL Editor
3. Copy API keys from Settings → API

### 3. Configure Environment (1 min)
```bash
cp .env.local.example .env.local
# Edit .env.local with your keys
```

### 4. Start Development (1 min)
```bash
npm run dev
# Open http://localhost:3000
```

---

## 📝 Key Files Reference

| File | Purpose |
|------|---------|
| `README.md` | Project overview, features, tech stack |
| `SETUP_GUIDE.md` | Detailed setup instructions (30 min) |
| `DATABASE_SCHEMA.md` | Complete database structure |
| `PHASE_1_COMPLETE.md` | What's built, what's next |
| `.env.local.example` | Environment variables template |

---

## 🔑 Required API Keys

1. **Supabase** (Free): [supabase.com](https://supabase.com)
   - Project URL
   - Anon Key
   - Service Role Key

2. **Anthropic** (Free tier): [console.anthropic.com](https://console.anthropic.com)
   - API Key

3. **Google OAuth** (Optional): [console.cloud.google.com](https://console.cloud.google.com)
   - Client ID
   - Client Secret

4. **Apple Sign-In** (Optional): [developer.apple.com](https://developer.apple.com)
   - Service ID
   - Team ID
   - Key ID

---

## 🏗️ Build Phases

- ✅ **Phase 1**: Foundation (COMPLETE!)
- ⬜ **Phase 2**: Authentication
- ⬜ **Phase 3**: Calendar
- ⬜ **Phase 4**: Friends
- ⬜ **Phase 5**: Privacy & Sharing
- ⬜ **Phase 6**: Groups
- ⬜ **Phase 7**: AI Features
- ⬜ **Phase 8**: Notifications

---

## 🎯 Core Features

✅ Multi-provider auth (Google, Apple, Email, Phone)
✅ Calendar CRUD operations
✅ Friend system with privacy controls
✅ Group calendar sharing
✅ External calendar sync (Google, Apple, Outlook)
✅ AI event creation (natural language)
✅ Smart scheduling assistant
✅ Time zone handling
✅ Email & push notifications

---

## 💻 Quick Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Run production build
npm run lint             # Lint code

# Git
git add .
git commit -m "message"
git push

# Deployment (after pushing to GitHub)
# → Auto-deploys via Vercel
```

---

## 🐛 Common Issues

**"Cannot find module"**
→ Run `npm install`

**"Supabase error"**
→ Check `.env.local` keys
→ Restart dev server

**"Auth not working"**
→ Enable providers in Supabase
→ Check redirect URLs

---

## 📞 Help Resources

- **This Project**: Read `SETUP_GUIDE.md` for detailed help
- **Supabase**: https://supabase.com/docs
- **Next.js**: https://nextjs.org/docs
- **Claude AI**: https://docs.anthropic.com

---

## ✨ What's Built

✅ Complete project structure
✅ Database schema (8 tables)
✅ TypeScript types
✅ Supabase integration
✅ Auth configuration
✅ AI integration setup
✅ Full documentation

**Ready to code!** Say "Let's build Phase 2" when ready.
