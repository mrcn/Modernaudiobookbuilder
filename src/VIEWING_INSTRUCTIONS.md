# Viewing Instructions - Updated Mock Data

## How to See the New Features

### 1. Chunk Review Workspace (50 Chunks)

**The app now loads directly to the Chunk Review page!**

When you open the app, you'll immediately see:

**50 Total Chunks from Pride and Prejudice:**
- ✅ **30 Completed** (Chunks 0-29) - Green badges, modernized text visible
- 🔄 **3 Processing** (Chunks 30-32) - Blue badges, currently being modernized
- ❌ **3 Failed** (Chunks 33-35) - Red badges, flagged with errors
- ⏳ **14 Pending** (Chunks 36-49) - Amber badges, awaiting modernization

**What You'll See:**

```
Chunk Workspace
├── Search bar (search by text)
├── Status filter (All/Pending/Processing/Completed/Failed)
├── Stats panel showing counts
└── Chunk list with all statuses:
    ├── Green completed cards with modernized text
    ├── Blue processing cards with spinners  
    ├── Red failed cards with error messages
    └── Amber pending cards waiting for AI
```

**Scroll through the list** to see all 50 chunks with realistic Pride and Prejudice content!

### 2. Audio Segment Builder (10 Segments)

**To see the Segment Builder:**

1. In the Chunk Review workspace, click **"Create Segments"** button (top right)
2. A dialog appears showing segment configuration
3. Click **"Create X Segments"** 
4. You'll navigate to the **Segment Builder** page

**What You'll See:**

**10 Audio Segments with diverse statuses:**

```
Stats Bar (7 metrics):
┌──────────────────────────────────────┐
│ Total: 10  Completed: 4  Processing: 3│
│ Pending: 1  Failed: 2                 │
│ Duration: 12m 4s  Cost: $0.047       │
└──────────────────────────────────────┘

Progress Bar: ▓▓▓▓▓▓▓░░░░░░░ 40%
```

**Left Panel - Source Chunks:**
- Shows all 30 modernized chunks
- Each with status badge and word count
- Scrollable reference list

**Right Panel - Audio Segments:**

Scroll to see all 10 segments:

1. **Segment 1** (Chunks 0-2) - ✅ Completed
   - Green gradient
   - [▶ Preview] [⬇ Download] buttons
   
2. **Segment 2** (Chunks 3-5) - ✅ Completed
   - Green gradient
   - Audio ready
   
3. **Segment 3** (Chunks 6-8) - ✅ Completed
   - Green gradient
   - Can preview/download
   
4. **Segment 4** (Chunks 9-11) - ✅ Completed
   - Green gradient
   - Fully generated
   
5. **Segment 5** (Chunks 12-14) - 🔄 Processing at 25%
   - Blue gradient
   - Progress bar animating
   
6. **Segment 6** (Chunks 15-17) - 🔄 Processing at 67%
   - Blue gradient  
   - Further along
   
7. **Segment 7** (Chunks 18-20) - 🔄 Processing at 89%
   - Blue gradient
   - Almost complete
   
8. **Segment 8** (Chunks 21-23) - ❌ Failed
   - Red gradient
   - Error: "Rate limit exceeded"
   - [🔄 Retry] button
   
9. **Segment 9** (Chunks 24-26) - ❌ Failed
   - Red gradient
   - Error: "Network timeout"
   - [🔄 Retry] button
   
10. **Segment 10** (Chunks 27-29) - ⏳ Pending
    - White/neutral
    - Waiting to generate

### 3. Interacting with the UI

**In Chunk Review:**

✅ **Select chunks** - Click checkboxes to multi-select  
✅ **Filter by status** - Use dropdown to show only pending/completed/failed  
✅ **Search** - Type to filter chunks by text content  
✅ **Expand chunks** - Click chunk card to see full details  
✅ **Batch modernize** - Select multiple pending chunks and click "Modernize X Chunks"  

**In Segment Builder:**

✅ **Preview audio** - Click [▶ Preview] on completed segments  
✅ **Download segments** - Click [⬇ Download] to save audio  
✅ **Retry failed** - Click [🔄 Retry] on failed segments  
✅ **Generate pending** - Click "Generate X Segments" to start TTS  

### 4. Navigation

**Current Flow:**

```
App Loads → Chunk Review (50 chunks visible)
              ↓
         Click "Create Segments"
              ↓
         Configure dialog appears
              ↓
         Click "Create X Segments"
              ↓
         Segment Builder (10 segments visible)
```

**Navigation Buttons:**

- **[← Back]** - Returns to previous view
- **Header navigation** - Not shown in chunk-review/segment-builder (immersive workflow)

### 5. Visual Elements to Notice

**Glassmorphism:**
- Semi-transparent white backgrounds
- Blur effects throughout
- Purple/pink ambient glows

**Color Coding:**
- 🟢 Green = Completed
- 🔵 Blue = Processing  
- 🔴 Red = Failed
- 🟡 Amber = Pending

**Status Badges:**
- Small colored pills in top-right of cards
- Text clearly states status

**Progress Bars:**
- Animated during processing
- Shows percentage complete

**Error Messages:**
- Red bordered boxes
- Clear error descriptions

### 6. What Data You're Seeing

**All text is from Pride and Prejudice:**
- Opening dialogue between Mr. and Mrs. Bennet
- Discussion about Mr. Bingley
- 50 consecutive paragraphs
- Realistic word counts, character counts
- Accurate cost estimates

**Costs shown are real:**
- GPT-4 Turbo pricing for modernization
- OpenAI TTS pricing for audio
- $0.074 total for all 50 chunks
- $0.047 total for all 10 segments

### 7. Default State

**On First Load:**

- 30 chunks already modernized (green)
- 3 chunks processing (blue)
- 3 chunks failed (red)
- 14 chunks pending (amber)

**This shows:**
- What a mid-workflow state looks like
- All possible statuses simultaneously
- Realistic error scenarios
- Batch processing in action

### 8. Known Limitations (Mock Data)

🔸 **Audio doesn't actually play** - Preview buttons are placeholders  
🔸 **Downloads don't work** - No real audio files generated  
🔸 **Progress bars are static** - Not actually progressing  
🔸 **Modernization is instant** - Would take seconds in production  
🔸 **No real API calls** - All data is hardcoded  

These will be replaced with real functionality when APIs are integrated.

### 9. Viewing Tips

**To see everything:**

1. **Scroll slowly** through chunk list - notice different status colors
2. **Click on chunks** to expand and see full original/modernized text
3. **Use filters** to isolate each status type
4. **Try searching** for text like "Bennet" or "Bingley"
5. **Navigate to Segment Builder** to see audio generation UI
6. **Scroll segments** to see all 10 in different states
7. **Notice the stats** update based on status distribution

**Look for:**
- Edited badges (chunk #1 has this)
- Flagged indicators (failed chunks)
- Cost calculations
- Token/char counts
- Duration estimates

---

## Summary

You now have **comprehensive mock data** showing:

✅ Full book workflow (50 chunks)  
✅ All 4 chunk statuses  
✅ All 4 segment statuses  
✅ Realistic Pride & Prejudice content  
✅ Accurate cost/duration estimates  
✅ Complete UI with all states visible  
✅ No empty screens or placeholder text  

**Everything is populated and ready to demonstrate!** 🎉
