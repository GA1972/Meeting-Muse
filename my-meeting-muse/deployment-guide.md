# 🚀 SECURE DEPLOYMENT GUIDE
## My Meeting Muse - ANR.in Domain Restricted

### ✅ SECURITY CONFIRMED:
- 🔒 **API keys NEVER exposed** to frontend
- 🔒 **Server-side domain validation** (@anr.in only)
- 🔒 **Rate limiting** (10 requests/minute per user)
- 🔒 **Usage tracking** and cost monitoring
- 🔒 **Admin-only analytics** access

---

## 📁 1. PROJECT STRUCTURE

Create this exact folder structure:

```
my-meeting-muse/
├── index.html              (Main app - copy from artifacts)
├── package.json             (Dependencies)
├── vercel.json             (Vercel configuration)
├── .env.example            (Environment template)
├── api/
│   ├── auth.js             (🔒 Domain validation & rate limiting)
│   ├── transcribe.js       (🔒 OpenAI Whisper API)
│   ├── summarize.js        (🔒 GPT-4 AI Summary)
│   ├── calendar.js         (🔒 Google Calendar)
│   └── usage.js            (🔒 Admin analytics)
└── README.md
```

---

## 🔑 2. GET API KEYS

### OpenAI (Required for transcription & AI)
1. Go to [platform.openai.com](https://platform.openai.com/)
2. Create account → API Keys
3. Create new key: `sk-...` 
4. **Cost**: ~$0.006/minute + $0.03/1K tokens

### Google Calendar (Optional)
1. Go to [console.cloud.google.com](https://console.cloud.google.com/)
2. Create project → Enable Calendar API
3. Create credentials (API Key + OAuth Client ID)
4. **Cost**: Free

---

## 🌐 3. VERCEL DEPLOYMENT

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit - My Meeting Muse"
git branch -M main
git remote add origin https://github.com/yourusername/my-meeting-muse.git
git push -u origin main
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. **Import Project** → Connect GitHub
3. Select your `my-meeting-muse` repository
4. **Deploy** (will fail first time - need environment variables)

### Step 3: Add Environment Variables
In Vercel Dashboard → Settings → Environment Variables:

```env
OPENAI_API_KEY=sk-your-openai-key-here
GOOGLE_CLIENT_ID=your-google-client-id  
GOOGLE_API_KEY=your-google-api-key
ADMIN_EMAILS=gieve@anr.in
RATE_LIMIT_REQUESTS=10
RATE_LIMIT_WINDOW=60
```

### Step 4: Redeploy
- Go to Deployments → Click "..." → Redeploy
- Should now work with secure API endpoints!

---

## 🔒 4. SECURITY VERIFICATION

### Test Domain Restriction:
1. Try logging in with `test@gmail.com` ❌ **Should fail**
2. Try logging in with `gieve@anr.in` ✅ **Should work**
3. Check browser dev tools - no API keys visible ✅

### Test Rate Limiting:
1. Make 15+ API calls quickly
2. Should get "Rate limit exceeded" error ✅

### Test Admin Access:
1. Login as `gieve@anr.in` → Should see admin panel ✅
2. Login as other @anr.in user → No admin panel ✅

---

## 💰 5. COST MONITORING

### Expected Monthly Costs (8 users):
- **OpenAI API**: $15-30/month
- **Vercel Hosting**: $0 (free tier)
- **Google Calendar**: $0 (free)
- **Total**: ~$15-30/month

### Cost Controls:
- ✅ Rate limiting prevents abuse
- ✅ Usage tracking per user  
- ✅ Admin dashboard monitors costs
- ✅ Monthly API limits configurable

---

## 🧪 6. TESTING CHECKLIST

Before going live, test:

- [ ] ✅ Domain restriction working (@anr.in only)
- [ ] ✅ Audio recording works in browser
- [ ] ✅ Transcription API responding  
- [ ] ✅ AI summary generation working
- [ ] ✅ Rate limiting active
- [ ] ✅ Admin analytics accessible
- [ ] ✅ Mobile responsive design
- [ ] ✅ Error handling graceful

---

## 🎯 7. GO LIVE!

### Your Secure URLs:
- **Production**: `https://your-app.vercel.app`
- **Admin Panel**: Login as gieve@anr.in
- **API Endpoints**: All secured server-side

### Team Onboarding:
1. Send URL to @anr.in team members
2. They login with their @anr.in email
3. Grant microphone access
4. Start recording meetings!

---

## 🔧 8. MAINTENANCE

### Monitor Usage:
- Check admin analytics weekly
- Set budget alerts on OpenAI dashboard
- Review Vercel usage monthly

### Add New Users:
- They just need @anr.in email
- Auto-approved by domain validation
- No manual approval needed

### Scale Up:
- Vercel automatically scales
- Add rate limit exceptions if needed
- Upgrade OpenAI plan for higher usage

---

## 🚨 TROUBLESHOOTING

### "Access Denied" Error:
- Check email ends with @anr.in
- Verify environment variables set
- Check server logs in Vercel

### "Rate Limit Exceeded":
- Wait 1 minute between requests
- Increase rate limits in environment variables
- Check if user is making too many requests

### "API Error":
- Verify OpenAI API key is valid
- Check OpenAI account has credits
- Review API endpoint logs in Vercel

---

## ✅ DEPLOYMENT COMPLETE!

Your **My Meeting Muse** is now:
- 🔒 **Secure** - Only @anr.in users can access
- 💰 **Cost-controlled** - Rate limits and monitoring
- 📊 **Analytics-enabled** - Admin dashboard
- 🚀 **Production-ready** - Enterprise-grade security

**Ready for your team to start using!** 🎉