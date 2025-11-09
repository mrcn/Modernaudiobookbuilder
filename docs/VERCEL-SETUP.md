# Vercel Setup Guide - Audibler v0.01

This guide will help you deploy your Modern Audiobook Builder (Audibler) to Vercel in under 10 minutes.

---

## Why Vercel?

- ✅ **Simplest deployment** - Git push = automatic deploy
- ✅ **Built-in API routes** - No separate backend needed
- ✅ **Zero configuration** - Works out of the box with Vite
- ✅ **Free tier** - 100GB bandwidth, 100K function invocations/month
- ✅ **Best DX** - Preview deployments, logs, environment variables

---

## Prerequisites

- GitHub account (your repo is already at https://github.com/mrcn/audibler-v0.01)
- Vercel account (free) - https://vercel.com/signup
- OpenAI API key - https://platform.openai.com/api-keys
- Groq API key - https://console.groq.com/keys

---

## Step 1: Install Vercel CLI (Optional)

```bash
npm i -g vercel
```

Or use the web dashboard (recommended for first time).

---

## Step 2: Deploy to Vercel (2 methods)

### Method A: Via Dashboard (Easiest)

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub account
4. Choose `audibler-v0.01` repository
5. Configure project:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
6. Click "Deploy"

### Method B: Via CLI

```bash
cd /workspace/Modernaudiobookbuilder
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? **Your account**
- Link to existing project? **N**
- Project name? **audibler** (or whatever you prefer)
- Directory? **./** (current directory)
- Override settings? **N**

---

## Step 3: Add Environment Variables

### Via Dashboard:

1. Go to your project on Vercel
2. Click **Settings** → **Environment Variables**
3. Add the following:

```
OPENAI_API_KEY=sk-...your-key...
GROQ_API_KEY=gsk_...your-key...
```

4. Click **Save**
5. Redeploy to apply changes

### Via CLI:

```bash
vercel env add OPENAI_API_KEY
# Paste your key when prompted

vercel env add GROQ_API_KEY
# Paste your key when prompted

# Redeploy
vercel --prod
```

---

## Step 4: Verify Deployment

Your app should now be live at:
```
https://audibler-...vercel.app
```

Check:
- ✅ UI loads correctly
- ✅ No console errors
- ✅ Can upload a file
- ⚠️ API routes don't exist yet (we'll add them next)

---

## Step 5: Add API Routes (Next Steps)

Vercel supports API routes in the `/api` directory. We'll create:

1. `/api/tts.ts` - Text-to-speech proxy
2. `/api/modernize.ts` - Text modernization proxy

See `API-ROUTES.md` for implementation details.

---

## Project Structure for Vercel

```
audibler-v0.01/
├── src/                    # Your React app
│   ├── App.tsx
│   ├── components/
│   └── ...
├── api/                    # ⬅ NEW: Vercel serverless functions
│   ├── tts.ts             # TTS endpoint
│   └── modernize.ts       # Text modernization endpoint
├── public/                 # Static assets
├── package.json
├── vite.config.ts
└── vercel.json            # Optional: Vercel configuration
```

---

## Vercel Configuration (Optional)

Create `vercel.json` if you need custom routing or headers:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

---

## Common Issues & Solutions

### Issue: Build fails with "Cannot find module"
**Solution**: Make sure all dependencies are in `package.json`, run `npm install` locally first

### Issue: Environment variables not working
**Solution**: Redeploy after adding env vars. They only apply to new deployments.

### Issue: API routes return 404
**Solution**: API routes must be in the `/api` directory at project root (not `/src/api`)

### Issue: Functions timeout
**Solution**: Vercel functions have 10s timeout on free tier. Keep TTS calls under this limit.

---

## Next Steps

1. ✅ Deploy app to Vercel
2. ⏳ Add API routes (see `API-ROUTES.md`)
3. ⏳ Connect frontend to APIs
4. ⏳ Test end-to-end flow
5. ⏳ Add authentication (optional for MVP)

---

## Useful Commands

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# View logs
vercel logs

# List deployments
vercel ls

# Remove project
vercel remove audibler
```

---

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Vite on Vercel](https://vercel.com/docs/frameworks/vite)
- [API Routes](https://vercel.com/docs/functions/serverless-functions)
