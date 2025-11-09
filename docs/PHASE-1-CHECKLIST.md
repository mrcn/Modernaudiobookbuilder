# Phase 1 Implementation Checklist

Complete user flow: Upload text → Modernize → Generate audio → Download

---

## ✅ Prerequisites

- [ ] Vercel account created
- [ ] OpenAI API key obtained
- [ ] Groq API key obtained
- [ ] Git repository ready (✓ Already done: https://github.com/mrcn/audibler-v0.01)

---

## 📦 Setup & Deployment

### 1. Deploy to Vercel
- [ ] Connect GitHub repo to Vercel
- [ ] Configure build settings (Framework: Vite)
- [ ] Add environment variables:
  - [ ] `OPENAI_API_KEY`
  - [ ] `GROQ_API_KEY`
- [ ] First deployment successful
- [ ] Verify app loads at https://your-app.vercel.app

### 2. Install Dependencies
- [ ] Add `@vercel/node` for API types
  ```bash
  npm install @vercel/node
  ```
- [ ] Add to devDependencies:
  ```bash
  npm install -D @vercel/node
  ```

---

## 🔌 Backend API Implementation

### 3. Text-to-Speech API
- [ ] Create `/api/tts.ts` (✓ Already created)
- [ ] Test endpoint locally
  ```bash
  curl -X POST http://localhost:3000/api/tts \
    -H "Content-Type: application/json" \
    -d '{"text":"Hello world","voice":"alloy"}'
  ```
- [ ] Deploy and test on Vercel
- [ ] Verify audio file downloads correctly
- [ ] Check error handling (empty text, too long, invalid voice)

### 4. Text Modernization API
- [ ] Create `/api/modernize.ts` (✓ Already created)
- [ ] Test endpoint locally
  ```bash
  curl -X POST http://localhost:3000/api/modernize \
    -H "Content-Type: application/json" \
    -d '{"text":"Whilst thou art here..."}'
  ```
- [ ] Deploy and test on Vercel
- [ ] Verify modernized text returned
- [ ] Check diff generation (if enabled)

---

## 🎨 Frontend Integration

### 5. Connect Upload Flow
- [ ] Update `UploadScreen.tsx` to keep existing file reading
- [ ] Store uploaded text in state
- [ ] Navigate to modernization view

### 6. Add Modernization UI
- [ ] Create API call function:
  ```typescript
  async function modernizeText(text: string) {
    const res = await fetch('/api/modernize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, returnDiff: true })
    });
    return res.json();
  }
  ```
- [ ] Add "Modernize" button to EditorView
- [ ] Show loading state during API call
- [ ] Display side-by-side comparison (original vs modernized)
- [ ] Add error handling UI

### 7. Add TTS Generation UI
- [ ] Create API call function:
  ```typescript
  async function generateAudio(text: string, voice = 'alloy') {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice })
    });
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  }
  ```
- [ ] Add "Generate Audio" button to AudioPlayerView
- [ ] Add voice selector dropdown (alloy, echo, fable, onyx, nova, shimmer)
- [ ] Show loading state with progress indicator
- [ ] Play generated audio in AudioPlayerView
- [ ] Add download button
- [ ] Add error handling UI

---

## 🧪 Testing

### 8. Manual Testing
- [ ] Test complete flow end-to-end:
  1. [ ] Upload a .txt file (use sample book excerpt)
  2. [ ] Click "Modernize" → verify text changes
  3. [ ] Click "Generate Audio" → verify audio plays
  4. [ ] Click "Download" → verify file downloads
- [ ] Test with different voices
- [ ] Test with long text (10,000+ characters)
- [ ] Test with very short text (1 sentence)
- [ ] Test error cases:
  - [ ] No text provided
  - [ ] Text too long (>50,000 chars)
  - [ ] Invalid voice selected
  - [ ] API key missing/invalid

### 9. Performance Testing
- [ ] Check API response times (<10s for TTS)
- [ ] Verify no memory leaks (audio blob cleanup)
- [ ] Test on mobile device
- [ ] Check browser console for errors

---

## 📊 Monitoring & Optimization

### 10. Vercel Dashboard
- [ ] Check function logs for errors
- [ ] Monitor function execution time
- [ ] Check bandwidth usage
- [ ] Set up alerts for failures

### 11. Cost Monitoring
- [ ] Track OpenAI API usage
- [ ] Track Groq API usage
- [ ] Estimate monthly costs based on testing
- [ ] Set up budget alerts

---

## 🚀 Launch Preparation

### 12. Documentation
- [ ] Update README.md with:
  - [ ] How to get API keys
  - [ ] How to set up locally
  - [ ] How to deploy to Vercel
- [ ] Create user guide (how to use the app)
- [ ] Document known limitations

### 13. Polish
- [ ] Add loading spinners
- [ ] Add success/error toasts
- [ ] Improve error messages
- [ ] Add help text/tooltips
- [ ] Test accessibility (keyboard navigation)

### 14. Optional Enhancements (Nice to Have)
- [ ] Add character count estimator (for cost calculation)
- [ ] Add audio preview before full generation
- [ ] Add ability to regenerate with different voice
- [ ] Save generated audio to browser storage (for replay)
- [ ] Add "Try Example" button with sample text

---

## ✅ Definition of Done

Phase 1 is complete when:

- ✅ User can upload a .txt file
- ✅ User can modernize the text via Groq API
- ✅ User can generate audio via OpenAI TTS
- ✅ User can play and download the audio
- ✅ All error cases handled gracefully
- ✅ App deployed to Vercel and working
- ✅ No console errors in browser
- ✅ Mobile-responsive
- ✅ Documentation complete

---

## 🎯 Success Metrics

After Phase 1 completion, track:
- Number of successful text modernizations
- Number of audio files generated
- Average API response times
- Error rate (<5%)
- Monthly API costs

---

## Next Steps (Phase 2)

After Phase 1 is solid:
- User authentication (save books, history)
- Database integration (Neon Postgres)
- Social features (editions, clips, feed)
- Background processing (for long books)
- Payment integration (for API costs)
