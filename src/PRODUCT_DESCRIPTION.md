# Audibler Product Description

## Brand Identity

**Audibler** — Breathing new life into timeless stories.

### Tagline

"Classic Literature, Modern Voice"

### Brand Colors

- **Primary Gradient**: Purple (#9333EA) to Pink (#EC4899)
- **Secondary**: Emerald (#10B981), Neutral Grays
- **Dark Mode Base**: Neutral-900 (#171717) to Neutral-800 (#262626)
- **Accent**: Glassmorphic whites with backdrop blur

### Design Philosophy

Audibler employs a sophisticated 2025 aesthetic featuring:

- **Dark Mode First**: Immersive dark backgrounds with high contrast for extended use
- **Glassmorphism**: Translucent surfaces with backdrop blur effects
- **Ambient Gradients**: Subtle purple/pink gradient overlays and glows
- **Modern Typography**: Clean, readable fonts with thoughtful hierarchy
- **Immersive Interactions**: Smooth animations and intuitive controls
- **Vignette Effects**: Subtle edge burning for focus and depth

---

## Product Overview

**Audibler** is a revolutionary web application that transforms public-domain literary classics into modern, accessible audiobooks. By combining AI-powered language modernization with high-quality text-to-speech synthesis, Audibler makes timeless literature engaging for contemporary audiences while preserving the original meaning, tone, and artistic intent.

Unlike traditional audiobook platforms, Audibler is a **full social platform** where creators can publish Editions, share Clips, discover content in the Public Library, and engage with a community through a dynamic Feed.

### The Problem We Solve

Classic literature contains profound wisdom and compelling narratives, but archaic language creates barriers for modern readers:

- **Accessibility**: Complex Victorian prose alienates contemporary audiences
- **Engagement**: Outdated terminology disrupts narrative flow
- **Comprehension**: Historical context and references require extensive background knowledge
- **Time**: Creating quality audiobooks manually is expensive and time-consuming

### Our Solution

Audibler provides a complete workflow for transforming classic texts into modern audiobooks:

1. **Upload** — Import public-domain books (auto-forwards to setup)
2. **Configure** — Set title, optional author, select content range with page numbers
3. **Chunk** — Intelligently segment text at natural paragraph boundaries (~2000 chars/chunk)
4. **Modernize** — AI updates language using customizable instructions
5. **Review** — Granular control over every chunk with side-by-side comparison
6. **Generate Audio** — High-quality TTS synthesis with voice & reading settings
7. **Build Segments** — Organize chunks into audio files with playlist management
8. **Publish** — Create Editions with metadata, cover art, and descriptions
9. **Share** — Extract Clips and distribute across the platform's social Feed

---

## Information Architecture

### Primary Navigation Structure

```
Audibler
├── Upload (Entry Point)
│   └── Auto-forwards to Project Setup
├── Project Setup
│   ├── Book Metadata (Title, Author)
│   ├── Content Range Selection (with page estimates)
│   ├── Modernization Instructions
│   └── Processing Preview (stats, costs, duration)
├── Text Transformation (ChunkReview)
│   ├── Header Controls
│   │   ├── Back Navigation
│   │   ├── Progress Stats
│   │   └── Continue to Audio
│   ├── Duration Controls
│   │   ├── Target Segment Length
│   │   ├── Voice & Reading Settings (Collapsible)
│   │   │   ├── Speaking Rate (wpm)
│   │   │   ├── Voice Selection (alloy, echo, nova)
│   │   │   ├── Pitch Adjustment
│   │   │   ├── Stability Control
│   │   │   └── Pause Length
│   │   └── Audio Output Summary
│   ├── Chunk List (Left Sidebar)
│   │   ├── Chunk Navigation
│   │   ├── Status Indicators
│   │   └── Quick Actions
│   └── Main Content Area
│       ├── Original Text Panel
│       ├── Modernized Text Panel (editable)
│       └── Chunk Actions
├── Segment Builder (Audio Playlist)
│   ├── Playlist Header
│   ├── Audio Track List
│   │   ├── Track Controls (Play/Pause)
│   │   ├── Waveform Visualization
│   │   ├── Track Metadata
│   │   └── Batch Operations
│   └── Export Options
├── Library (Personal Projects)
│   ├── Project Cards
│   ├── Filter/Search
│   └── Create New Project
├── Public Library
│   ├── Featured Editions
│   ├── Categories & Filters
│   ├── Search
│   └── Edition Details
├── Editions (Creator View)
│   ├── My Editions List
│   ├── Edition Creator
│   └── Edition Analytics
├── Feed (Social Stream)
│   ├── Activity Timeline
│   ├── Clip Players
│   ├── Engagement Actions
│   └── Creator Profiles
└── Settings
    ├── Account Settings
    ├── Voice Preferences
    └── Privacy Controls
```

### Data Model

```
Project
├── id: string
├── title: string
├── author: string (optional, defaults to "Unknown Author")
├── fileName: string
├── fileContent: string
├── instructions: string (modernization guidelines)
├── startPosition: number (0-100%)
├── endPosition: number (0-100%)
├── chunks: Chunk[]
├── createdAt: timestamp
└── updatedAt: timestamp

Chunk
├── id: number
├── originalText: string
├── modernizedText: string
├── charCount: number
├── tokenCount: number
├── wordCount: number
├── estimatedCost: number
├── edited: boolean
├── flagged: boolean
├── batchId?: number
├── status: "pending" | "processing" | "completed" | "failed"
└── modernizationInstructions?: string

AudioSegment
├── id: string
├── chunks: Chunk[]
├── audioUrl: string
├── duration: number
├── waveform: number[]
├── metadata: {
│   ├── title: string
│   ├── artist: string
│   ├── album: string
│   └── track: number
├── voiceSettings: VoiceSettings
└── status: "pending" | "generating" | "completed" | "failed"

VoiceSettings
├── voice: "alloy" | "echo" | "nova"
├── wordsPerMinute: number (120-180)
├── pitch: number (0.8-1.2)
├── stability: number (0.5-1.0)
└── pauseLength: number (0.5-2.0)

Edition
├── id: string
├── projectId: string
├── title: string
├── author: string
├── description: string
├── coverImage: string
├── tags: string[]
├── audioSegments: AudioSegment[]
├── public: boolean
├── publishedAt: timestamp
├── stats: {
│   ├── plays: number
│   ├── likes: number
│   ├── shares: number
│   └── comments: number
└── creator: User

Clip
├── id: string
├── editionId: string
├── audioSegmentId: string
├── startTime: number
├── endTime: number
├── title: string
├── description: string
├── tags: string[]
└── createdAt: timestamp
```

---

## User Flows

### Flow 1: First-Time Creator - Upload to Published Edition

**Goal**: Transform a classic book into a published audiobook Edition

**Steps**:

1. **Landing** → Click "Upload Book" CTA
2. **Upload Screen**
   - Drag and drop .txt file OR click "Choose File"
   - File automatically processes → forwards to Project Setup
3. **Project Setup**
   - Title auto-filled from filename (editable)
   - Author optional (can leave blank or add manually)
   - View content statistics (pages, words, characters)
   - Adjust content range with sliders (shows % and page numbers)
   - Review cost estimates
   - Click "Start Processing"
4. **Text Transformation**
   - View chunks in left sidebar
   - See original vs. modernized text side-by-side
   - Configure Target Segment Length (5-60 min)
   - Expand "Voice & Reading Settings" if desired
     - Adjust speaking rate, voice, pitch, stability, pause length
   - Review/edit individual chunks as needed
   - Click "Continue to Audio"
5. **Segment Builder**
   - View audio playlist with waveforms
   - Play/pause individual tracks
   - Rename tracks if needed
   - Review total duration
   - Click "Export" or "Publish Edition"
6. **Edition Creator**
   - Upload cover image
   - Write description
   - Add tags
   - Set visibility (public/private)
   - Click "Publish Edition"
7. **Success** → Edition appears in Personal Library and optionally Public Library

**Decision Points**:
- File format selection (currently .txt only)
- Content range (full book vs. specific chapters)
- Modernization instructions (default vs. custom)
- Voice settings (use defaults vs. customize)
- Edition visibility (public vs. private)

### Flow 2: Casual Listener - Discovery to Playback

**Goal**: Find and listen to a modernized audiobook

**Steps**:

1. **Landing** → Click "Explore Library"
2. **Public Library**
   - Browse featured Editions
   - Filter by category, author, era
   - Read descriptions and reviews
   - Click Edition card
3. **Edition Detail**
   - View cover, description, metadata
   - See audio segments list
   - Click "Play Edition" or play individual segment
4. **Audio Player**
   - Standard playback controls (play/pause, skip, scrub)
   - View waveform
   - See synchronized text (optional)
   - Save to personal library
   - Share to Feed
5. **Clip Creation** (Optional)
   - Select portion of audio
   - Add title/description
   - Share to Feed
6. **Feed Engagement**
   - Like, comment, share Clip
   - Follow creator
   - Discover similar content

### Flow 3: Iterative Editing - Refinement Workflow

**Goal**: Improve specific chunks after initial processing

**Steps**:

1. **Library** → Open existing project
2. **Text Transformation**
   - Navigate to flagged/edited chunks
   - Review modernized text
   - Edit directly in right panel
   - Mark as "Edited" (visual indicator)
   - Reprocess if needed
   - Click "Save Changes"
3. **Audio Regeneration**
   - Navigate to Segment Builder
   - Select affected audio segments
   - Click "Regenerate Audio"
   - Review updated tracks
   - Export updated Edition

### Flow 4: Social Sharing - Clip to Community

**Goal**: Share favorite moment from an Edition

**Steps**:

1. **Edition Playback** → Find compelling moment
2. **Clip Creator**
   - Click "Create Clip" button
   - Drag handles to select 15-60 second segment
   - Add compelling title
   - Write description/context
   - Add relevant tags
   - Preview audio
   - Click "Share to Feed"
3. **Feed**
   - Clip appears in follower feeds
   - Receive engagement (likes, comments)
   - Respond to comments
   - View analytics

---

## Mental Models

### Creator Mental Model: "Audio Production Studio"

**Metaphor**: Audibler as a professional recording studio with AI assistants

**Expectations**:
- **Control**: Precise control over every aspect of output
- **Quality**: Professional-grade results with manual override capability
- **Workflow**: Sequential stages (record → edit → mix → master → publish)
- **Tools**: Specialized tools for each stage
- **Preview**: Ability to audition before committing

**Interface Alignment**:
- Chunking = Recording sessions (capture raw material)
- Modernization = Script editing (refine content)
- Text Review = Director's review (quality control)
- Voice Settings = Sound engineering (audio characteristics)
- Segment Builder = Audio mixing (arrange tracks)
- Edition Creator = Album mastering (final product)

### Consumer Mental Model: "Streaming Service"

**Metaphor**: Audibler as Spotify/Netflix for modernized classics

**Expectations**:
- **Discovery**: Curated recommendations and search
- **Instant Playback**: Click and listen immediately
- **Social Sharing**: Share favorite moments with friends
- **Personalization**: Tailored to preferences over time
- **Quality**: Consistent, professional audio

**Interface Alignment**:
- Public Library = Content catalog
- Edition cards = Album/Show tiles
- Audio Player = Standard media player
- Feed = Social timeline
- Clips = Shareable moments (like TikTok/Instagram Reels)

### Platform Mental Model: "Social Creation Platform"

**Metaphor**: Audibler as YouTube/SoundCloud for literary audio

**Expectations**:
- **Creation Tools**: Accessible to non-professionals
- **Publishing**: Direct-to-audience distribution
- **Community**: Followers, engagement, comments
- **Discoverability**: Algorithm + search + trends
- **Iteration**: Versioning and improvements over time

**Interface Alignment**:
- Upload → Create workflow
- Editions = Published content (like videos/tracks)
- Clips = Shareable excerpts
- Feed = Community timeline
- Analytics = Creator dashboard

---

## Cognitive Walkthrough

### Scenario 1: First Upload Experience

**User**: Sarah, a literature professor with no technical background

**Goal**: Upload _Pride and Prejudice_ and create first audiobook

**Walkthrough**:

**Step 1: Landing Page**
- **Action**: Click "Upload Book"
- **Visibility**: Large, prominent CTA with gradient styling
- **Feedback**: Button hover state confirms clickability
- **Mental Model Match**: ✅ Matches "start new project" expectation
- **Potential Issues**: None - clear primary action

**Step 2: Upload Screen**
- **Action**: Drag .txt file onto upload zone
- **Visibility**: Large drop zone with clear visual boundaries
- **Feedback**: Zone highlights on drag-over, shows "Reading file..." animation
- **Mental Model Match**: ✅ Familiar drag-and-drop pattern
- **Potential Issues**: ⚠️ User might not know file should be .txt format
- **Solution**: Helper text states "Supports .txt files only • Public domain works"

**Step 3: Auto-Forward to Project Setup**
- **Action**: System automatically advances after file loads
- **Visibility**: Smooth transition with file name carried forward
- **Feedback**: Loading animation → new screen with populated data
- **Mental Model Match**: ✅ Streamlined workflow feels efficient
- **Potential Issues**: ⚠️ User might expect confirmation step
- **Solution**: Title is pre-filled but editable, giving user control

**Step 4: Project Setup - Metadata**
- **Action**: Review auto-filled title, decide whether to add author
- **Visibility**: Title field pre-filled, author labeled "(optional)"
- **Feedback**: Fields have clear labels and placeholders
- **Mental Model Match**: ✅ Form-filling is familiar pattern
- **Potential Issues**: None - minimal required fields reduce friction

**Step 5: Project Setup - Content Range**
- **Action**: Adjust sliders to select chapters 1-10 (first 30%)
- **Visibility**: Dual sliders with percentage AND page numbers
- **Feedback**: Real-time updates to stats (pages, words, cost, duration)
- **Mental Model Match**: ✅ Visual sliders are intuitive
- **Potential Issues**: ⚠️ User might not understand why range selection matters
- **Solution**: Live preview shows "Selected Content" stats and cost estimates

**Step 6: Click "Start Processing"**
- **Action**: Click gradient button
- **Visibility**: Large, prominent button with icon
- **Feedback**: Button hover effect, loading state on click
- **Mental Model Match**: ✅ Confirms "let's go" action
- **Potential Issues**: ⚠️ User might worry about cost commitment
- **Solution**: Cost estimates are clearly displayed before this step

**Step 7: Text Transformation - Initial View**
- **Action**: Observe chunked text and controls
- **Visibility**: Three-panel layout (chunks list, original, modernized)
- **Feedback**: Chunk count, progress indicators, status badges
- **Mental Model Match**: ✅ Resembles document editor / code diff tool
- **Potential Issues**: ⚠️ Information density might overwhelm
- **Solution**: Visual hierarchy with collapsible Voice Settings reduces initial cognitive load

**Step 8: Voice Settings Exploration**
- **Action**: Click to expand "Voice & Reading Settings"
- **Visibility**: Collapsible panel with clear toggle indicator
- **Feedback**: Smooth accordion animation reveals controls
- **Mental Model Match**: ✅ Progressive disclosure pattern
- **Potential Issues**: ⚠️ User might not discover advanced settings
- **Solution**: Summary text in collapsed state hints at options: "(150 wpm, alloy voice)"

**Step 9: Review First Chunks**
- **Action**: Click through first few chunks to compare original vs. modernized
- **Visibility**: Side-by-side panels with clear labels
- **Feedback**: Active chunk highlighted in list
- **Mental Model Match**: ✅ Comparison view is intuitive
- **Potential Issues**: None - diff view is widely understood

**Step 10: Continue to Audio**
- **Action**: Click "Continue to Audio" button
- **Visibility**: Prominent button in header, always visible
- **Feedback**: Output summary shows "X audio files" will be created
- **Mental Model Match**: ✅ Workflow progression is clear
- **Potential Issues**: ⚠️ User might not understand what happens next
- **Solution**: Button text "Continue to Audio" sets clear expectation

**Overall Assessment**:
- **Learnability**: High - familiar patterns (file upload, forms, sliders)
- **Efficiency**: High - auto-forwarding eliminates unnecessary steps
- **Error Prevention**: Good - optional fields, live previews, clear costs
- **Satisfaction**: High - visual polish and smooth transitions feel premium

### Scenario 2: Refining Voice Settings

**User**: Marcus, an audiobook producer optimizing for specific voice quality

**Goal**: Achieve consistent, slightly faster narration with lower pitch

**Walkthrough**:

**Step 1: Text Transformation Screen**
- **Action**: Scroll to duration controls section
- **Visibility**: Controls are in fixed header area, always visible
- **Feedback**: Section has distinct dark background
- **Mental Model Match**: ✅ Audio controls near top suggests priority
- **Potential Issues**: None

**Step 2: Notice Voice Settings**
- **Action**: See collapsed "Voice & Reading Settings" panel
- **Visibility**: Panel shows current settings: "(150 wpm, alloy voice)"
- **Feedback**: Hover state indicates clickability
- **Mental Model Match**: ✅ Collapsed accordion is familiar
- **Potential Issues**: ⚠️ User might not realize settings exist if not actively looking
- **Solution**: Icon (Mic2) and preview text provide discoverability

**Step 3: Expand Voice Settings**
- **Action**: Click to expand panel
- **Visibility**: Chevron icon indicates expandable state
- **Feedback**: Smooth animation reveals 2-column grid of controls
- **Mental Model Match**: ✅ Accordion/disclosure pattern
- **Potential Issues**: None

**Step 4: Adjust Speaking Rate**
- **Action**: Drag "Speaking Rate" slider from 150 to 165 wpm
- **Visibility**: Slider with real-time value display
- **Feedback**: Tabular-nums ensure value doesn't shift layout
- **Mental Model Match**: ✅ Slider is standard control
- **Potential Issues**: ⚠️ User might not know impact of change
- **Solution**: Helper text: "Standard audiobook: 150-160 wpm" provides context

**Step 5: Adjust Pitch**
- **Action**: Drag "Pitch" slider from 1.0 to 0.9x
- **Visibility**: Slider shows value with 2 decimal precision
- **Feedback**: Real-time value updates
- **Mental Model Match**: ✅ Pitch adjustment is familiar to audio users
- **Potential Issues**: ⚠️ No audio preview of changes
- **Solution**: Future enhancement - add preview button

**Step 6: Save and Process**
- **Action**: Click "Continue to Audio" to apply settings
- **Visibility**: Settings remain visible until navigation
- **Feedback**: Settings persist in collapsed summary
- **Mental Model Match**: ✅ Settings apply to entire project
- **Potential Issues**: ⚠️ User might expect per-chunk voice settings
- **Solution**: Document that settings are project-level

**Overall Assessment**:
- **Learnability**: Medium - requires understanding of audio concepts
- **Efficiency**: High - all settings in one collapsible panel
- **Error Prevention**: Good - sliders have constraints, reasonable defaults
- **Satisfaction**: High for power users - granular control available

### Scenario 3: Casual Discovery

**User**: Emma, a commuter looking for something new to listen to

**Goal**: Find and start listening to a classic novel in under 2 minutes

**Walkthrough**:

**Step 1: Public Library Landing**
- **Action**: Navigate to Public Library from header
- **Visibility**: Clear navigation link, featured Editions visible immediately
- **Feedback**: Edition cards with cover art, titles, metadata
- **Mental Model Match**: ✅ Resembles Netflix/Spotify browse experience
- **Potential Issues**: None

**Step 2: Browse Featured**
- **Action**: Scroll through featured Editions
- **Visibility**: Large cover images, clear titles, author names
- **Feedback**: Hover states on cards
- **Mental Model Match**: ✅ Card-based browsing is familiar
- **Potential Issues**: ⚠️ User might not know what makes each Edition unique
- **Solution**: Description snippet on cards, badge for "Modernized" status

**Step 3: Select Edition**
- **Action**: Click Edition card for modernized _Pride and Prejudice_
- **Visibility**: Card is clearly clickable
- **Feedback**: Transitions to Edition detail page
- **Mental Model Match**: ✅ Expected navigation pattern
- **Potential Issues**: None

**Step 4: Edition Detail Page**
- **Action**: Read description, see audio segments list
- **Visibility**: Cover image, description, metadata, track list
- **Feedback**: Clear "Play" button on each segment
- **Mental Model Match**: ✅ Resembles album/playlist view
- **Potential Issues**: ⚠️ User might not know which segment to start with
- **Solution**: Default to first segment, show progress if partially played

**Step 5: Start Playback**
- **Action**: Click "Play" on first audio segment
- **Visibility**: Large play button icon
- **Feedback**: Player appears with waveform, controls
- **Mental Model Match**: ✅ Standard media player
- **Potential Issues**: None - universal playback controls

**Overall Assessment**:
- **Learnability**: Very High - zero learning curve
- **Efficiency**: Very High - 3 clicks to playback
- **Error Prevention**: N/A - browse/play has no destructive actions
- **Satisfaction**: Very High - instant gratification

---

## Core Features

### 📚 Project Management

#### Upload System
- **Smart Upload**: Auto-detects .txt files, processes immediately
- **Auto-Forwarding**: Eliminates "Continue" button - streamlined workflow
- **File Name Parsing**: Automatically populates project title from filename
- **Format Support**: Currently .txt (future: PDF, EPUB)

#### Project Setup
- **Metadata Configuration**:
  - Title (required, auto-filled from filename)
  - Author (optional, defaults to "Unknown Author" if blank)
  - Custom modernization instructions
- **Content Range Selection**:
  - Dual sliders for start/end position (0-100%)
  - **Page Number Estimates**: Shows approximate page numbers alongside percentages
  - Live preview of selected content (pages, words, characters, paragraphs, chunks)
  - Real-time cost and duration calculations
- **Statistics Dashboard**:
  - Total pages (~1500 chars/page)
  - Total words and characters
  - Estimated chunks (~2000 chars/chunk)
  - Processing cost (AI + TTS)
  - Estimated audio duration

#### Intelligent Chunking
- **Boundary Detection**: Paragraph-based segmentation preserving narrative flow
- **Chunk Size**: ~2000 characters per chunk (optimized for AI context window)
- **Metadata Tracking**: Word count, character count, token count per chunk
- **Status Management**: pending → processing → completed → failed states

### ✨ AI-Powered Modernization

#### Customizable Instructions
- **Default Template**: Balanced modernization preserving voice
- **Full Control**: Edit instructions to match specific goals
- **Examples Provided**: Academic, casual, simplified, etc.

#### Batch Processing
- **Sequential Processing**: One chunk at a time with progress tracking
- **Pause/Resume**: Interrupt and continue processing anytime
- **Error Handling**: Failed chunks can be retried or edited manually
- **Cost Tracking**: Running total of processing costs

#### Side-by-Side Comparison
- **Three-Panel Layout**:
  - Left: Chunk list with status indicators
  - Middle: Original text (read-only)
  - Right: Modernized text (editable)
- **Visual Diff**: Easy comparison of changes
- **Manual Editing**: Direct text editing with "edited" flag
- **Flagging System**: Mark chunks for review

### 🎧 Audio Generation & Management

#### Voice & Reading Settings (NEW)
- **Organized Structure**: Collapsible panel reduces visual clutter
- **Speaking Rate**: 120-180 wpm (standard audiobook: 150-160 wpm)
- **Voice Selection**: Choose from alloy, echo, nova voices
- **Pitch Adjustment**: 0.8-1.2x for voice character control
- **Stability Control**: 50-100% for consistency vs. emotion range
- **Pause Length**: 0.5-2.0x for pacing between sentences/paragraphs
- **Preview Summary**: Collapsed state shows current settings

#### Segment Builder (Audio Playlist)
- **Playlist View**: Chronological list of audio tracks
- **Waveform Visualization**: Visual representation of audio
- **Individual Track Control**:
  - Play/pause each track
  - Skip forward/backward
  - Scrub through audio
  - Rename tracks
- **Batch Operations**:
  - Generate all audio
  - Download multiple tracks
  - Delete/regenerate segments
- **Duration Controls**:
  - Target segment length (5-60 minutes)
  - Automatic calculation of segments needed
  - Words per segment preview

#### Audio Player
- **Standard Controls**: Play, pause, skip, scrub
- **Progress Bar**: Visual and time-based
- **Playback Speed**: Variable speed control
- **Volume**: Individual track volume
- **Track Metadata**: Title, artist, album info

### 🎨 Editions System

#### Edition Creator
- **Rich Metadata**:
  - Title and author
  - Description (long-form)
  - Cover image upload
  - Tags and categories
  - Language and era
- **Privacy Controls**: Public or private visibility
- **Version Control**: Multiple Editions of same work
- **Publication Date**: Timestamp tracking

#### Edition Management
- **My Editions**: Personal library of published works
- **Edit/Update**: Modify metadata post-publication
- **Unpublish**: Remove from public library
- **Analytics**: View plays, likes, shares (future)

### ✂️ Clips & Sharing

#### Clip Creation
- **Time Selection**: Drag handles to select 15-60 second segment
- **Metadata**:
  - Compelling title
  - Description/context
  - Tags for discovery
- **Preview**: Audition clip before sharing
- **Source Attribution**: Automatic link to parent Edition

#### Social Distribution
- **Share to Feed**: Publish to follower timelines
- **Embed Options**: Share outside platform (future)
- **Engagement Tracking**: Likes, comments, shares
- **Discovery**: Trending clips, recommendations

### 🌐 Public Library

#### Browse & Discovery
- **Featured Editions**: Curated selections
- **Category Navigation**: Genre, era, author
- **Search**: Full-text search across titles, authors, descriptions
- **Filter Options**: Language, length, publication date
- **Sort Options**: Newest, most popular, trending

#### Edition Detail Pages
- **Cover Art**: Large, immersive presentation
- **Description**: Full edition description
- **Audio Segments**: Track listing with durations
- **Creator Info**: Link to creator profile
- **Engagement Metrics**: Play count, likes, comments
- **Related Editions**: Similar works

### 📱 Social Feed

#### Activity Stream
- **Following Feed**: Updates from creators you follow
- **Discover Feed**: Algorithm-driven recommendations
- **Trending**: Popular clips and editions
- **Chronological**: Time-based ordering

#### Engagement
- **Like**: Heart/favorite clips
- **Comment**: Discuss and provide feedback
- **Share**: Repost to followers
- **Save**: Bookmark for later

#### Creator Profiles
- **Profile Page**: Bio, stats, editions, clips
- **Follow System**: Build audience
- **Verification**: Badges for notable creators (future)

---

## Technical Specifications

### Frontend Architecture

**Framework**: React 18+ with TypeScript
**Styling**: Tailwind CSS v4.0 with custom design tokens
**Component Library**: shadcn/ui with custom dark mode theming
**State Management**: React hooks (useState, useEffect, useMemo) and Context API
**Icons**: lucide-react
**Charts**: recharts (for waveforms, analytics)

### Design System

**Color Palette**:
```css
/* Dark Mode Base */
--bg-primary: #171717 (neutral-900)
--bg-secondary: #262626 (neutral-800)
--bg-tertiary: #404040 (neutral-700)

/* Gradients */
--gradient-primary: linear-gradient(to right, #9333EA, #EC4899)
--gradient-ambient-purple: #9333EA/10
--gradient-ambient-pink: #EC4899/10

/* Text */
--text-primary: #FFFFFF
--text-secondary: #D4D4D4 (neutral-300)
--text-tertiary: #A3A3A3 (neutral-400)
--text-muted: #737373 (neutral-500)

/* Borders */
--border-subtle: rgba(255, 255, 255, 0.1)
--border-medium: rgba(255, 255, 255, 0.2)
```

**Typography** (from globals.css):
- Headings: Optimized line-height and letter-spacing
- Body: Readable font sizes, appropriate line-height
- Tabular nums: Used for all numeric displays
- No manual font-size/weight classes (handled by semantic HTML)

**Effects**:
- Glassmorphism: `backdrop-blur-xl` with `bg-opacity`
- Vignette: Radial gradients on edges for depth
- Ambient glows: Blurred gradient overlays
- Hover states: Scale transforms, opacity changes
- Transitions: 200ms duration for smooth interactions

### AI Modernization

**Model**: GPT-4 Turbo (or compatible LLM)
**Token Processing**: ~4 characters per token
**Pricing**: ~$0.04 per 1,000 tokens (input + output combined)
**Context Window**: Up to 128k tokens (supports large context)
**Customization**: User-defined system prompts guide transformation
**Error Handling**: Retry logic, fallback to manual editing

### Text-to-Speech

**Engine**: OpenAI TTS API (or compatible)
**Voices**: alloy, echo, nova (neural voices)
**Quality**: HD quality, natural intonation
**Pricing**: ~$15 per 1 million characters
**Format**: MP3 audio files
**Metadata**: ID3 tags for title, artist, album
**SSML Support**: Future enhancement for pronunciation control

### Processing Workflow

**Chunking Algorithm**:
1. Split on paragraph boundaries (`\n\n+`)
2. Target ~2000 characters per chunk
3. Preserve sentence boundaries
4. Track metadata (words, chars, tokens)

**Modernization Pipeline**:
1. Load chunk original text
2. Apply custom instructions via LLM API
3. Validate output length/quality
4. Store modernized text
5. Update chunk status
6. Calculate cost

**Audio Generation**:
1. Combine modernized chunks into segments (based on target duration)
2. Apply voice settings (voice, rate, pitch, stability, pauses)
3. Call TTS API with text + settings
4. Generate waveform data from audio
5. Store audio file URL
6. Create playable track with metadata

### Data Flow

```
File Upload
↓
Parse & Analyze (client-side)
↓
Chunking Algorithm (client-side)
↓
Store Project Data (state/context)
↓
Modernization (API calls, sequential)
↓
Manual Review & Editing (client-side)
↓
Audio Segment Planning (client-side)
↓
TTS Generation (API calls, batch)
↓
Audio Storage & Metadata
↓
Edition Creation & Publishing
↓
Social Distribution (Feed, Library)
```

### Performance Considerations

- **Lazy Loading**: Chunk list virtualizes for large projects
- **Optimistic Updates**: UI updates before API confirmation
- **Debouncing**: Text editing debounced to reduce re-renders
- **Memoization**: Heavy calculations memoized with useMemo
- **Code Splitting**: Route-based code splitting for faster initial load
- **Image Optimization**: Cover art compressed, lazy-loaded

---

## User Experience Patterns

### Progressive Disclosure

**Pattern**: Hide complexity until needed

**Implementation**:
- Voice & Reading Settings collapsed by default
- Advanced options in collapsible sections
- Chunk details expand on selection
- Settings modal for global preferences

**Benefits**:
- Reduces initial cognitive load
- Focuses user on primary task
- Power features available when needed
- Cleaner, less overwhelming interface

### Immediate Feedback

**Pattern**: Instant visual response to every action

**Implementation**:
- Hover states on all interactive elements
- Loading states during processing
- Progress bars for long operations
- Toast notifications for confirmations
- Real-time stat updates as sliders move

**Benefits**:
- Confirms user actions registered
- Reduces uncertainty
- Maintains engagement during waits
- Prevents duplicate submissions

### Consistent Navigation

**Pattern**: Predictable movement through app

**Implementation**:
- Breadcrumb trail shows current location
- Back buttons return to previous screen
- Header navigation always visible
- Clear "Continue" / "Next" progression
- Persistent save state

**Benefits**:
- Users never feel lost
- Easy to explore without fear
- Undo/back is always available
- Work is never lost

### Visual Hierarchy

**Pattern**: Guide attention to important elements

**Implementation**:
- Gradient buttons for primary actions
- Larger text for headings
- Color coding for status (purple = active, green = complete, red = error)
- Whitespace to group related items
- Icons to aid scanning

**Benefits**:
- Faster comprehension
- Reduced decision time
- Clear action priorities
- Accessible to scanners

---

## Edge Cases & Error Handling

### File Upload Errors

**Case**: Invalid file format (not .txt)
**Handling**: Reject file, show toast: "Please upload a .txt file"

**Case**: File too large (>10MB)
**Handling**: Show warning, ask to confirm, suggest range selection

**Case**: Empty or corrupted file
**Handling**: Parse error message, suggest re-export or different format

### Modernization Failures

**Case**: API timeout or rate limit
**Handling**: Mark chunk as "failed", offer retry button, queue for later

**Case**: Inappropriate content in output
**Handling**: Flag for review, allow manual override

**Case**: Output significantly shorter/longer than input
**Handling**: Warning message, suggest review before accepting

### Audio Generation Issues

**Case**: TTS API failure
**Handling**: Retry logic (3 attempts), then mark as failed, allow re-queue

**Case**: Audio file too large
**Handling**: Suggest splitting into smaller segments

**Case**: Voice setting incompatibility
**Handling**: Reset to defaults, show notification

### Network Interruptions

**Case**: Connection lost during processing
**Handling**: Pause processing, save state, offer resume when online

**Case**: Partial upload
**Handling**: Resume from last successful chunk

### User Errors

**Case**: Navigate away during processing
**Handling**: Confirm dialog: "Processing in progress. Are you sure?"

**Case**: Delete project with published Edition
**Handling**: Warning: "This project has published Editions. Deleting will unpublish them."

**Case**: Duplicate project name
**Handling**: Auto-append number: "Pride and Prejudice (2)"

---

## Accessibility

### WCAG 2.1 AA Compliance

**Color Contrast**:
- Text on dark backgrounds: minimum 4.5:1 ratio
- Purple/pink gradients used for decorative elements, not critical info
- Status colors distinguishable in colorblind modes

**Keyboard Navigation**:
- All interactive elements focusable
- Logical tab order through forms and controls
- Skip links to main content
- Keyboard shortcuts for common actions

**Screen Reader Support**:
- Semantic HTML (headings, landmarks, lists)
- ARIA labels for icon buttons
- Live regions for status updates
- Alt text for cover images

**Motion & Animation**:
- Respect `prefers-reduced-motion`
- Disable auto-play for users who request
- Provide pause buttons for animations

### Inclusive Design

**Language Options**: (Future) Multi-language UI
**Text Sizing**: Respects browser/OS text size preferences
**Focus Indicators**: High-contrast focus rings
**Error Messages**: Clear, actionable, polite
**Form Labels**: Explicit labels, no placeholder-only

---

## Target Audience

### Primary Users

**Content Creators & Literary Enthusiasts**
- Audiobook producers seeking efficient workflows
- Literature professors making texts accessible to students
- Independent publishers revitalizing public-domain catalogs
- Hobbyists passionate about classic literature

**Learners & Students**
- Students studying classic literature in modern context
- Language learners using familiar stories in accessible English
- Lifelong learners exploring historical works
- Book clubs modernizing their reading selections

**Accessibility Advocates**
- Organizations making literature accessible to broader audiences
- Librarians curating modern interpretations of classics
- Educational institutions democratizing literary access

### Secondary Users

**Casual Listeners**
- Commuters seeking engaging audiobook content
- Readers intimidated by archaic language
- Audiobook enthusiasts discovering classic literature
- Social media users engaging with literary Clips

---

## Value Proposition

### For Creators

- **Time Efficiency**: Automate language modernization that would take weeks manually
- **Cost Effective**: AI-powered processing at fraction of human editor costs
- **Quality Control**: Granular review and editing capabilities ensure precision
- **Distribution**: Built-in social platform for immediate audience reach
- **Analytics**: Track engagement, plays, and community response
- **Flexibility**: Complete control over modernization approach and voice settings

### For Consumers

- **Accessible Classics**: Enjoy timeless stories without language barriers
- **Quality Audio**: Professional-grade TTS with natural voices and customization
- **Curated Discovery**: Find Editions aligned with your interests
- **Social Experience**: Engage with community, share favorite moments
- **Free Access**: Public-domain works available at no cost
- **Convenience**: Stream anywhere, anytime, any device

### For Institutions

- **Educational Tool**: Make curriculum materials more accessible
- **Preservation**: Archive classic literature in modern, engaging formats
- **Community Building**: Foster discussion around timeless themes
- **Customization**: Tailor modernization approach to pedagogical goals
- **Scalability**: Process entire catalogs efficiently

---

## Use Cases

### Academic Use

**Scenario**: A university professor teaching Victorian literature wants students to engage with original works without archaic language barriers.

**Solution**: Upload _Pride and Prejudice_, customize modernization to preserve Austen's wit while updating dated expressions, generate audiobook Edition for class listening, create Clips of key scenes for discussion prompts.

**Benefits**: Students read/listen to authentic Austen with modern accessibility, professor controls exact modernization approach, Clips facilitate classroom discussion.

### Independent Publishing

**Scenario**: A small publisher wants to revitalize their public-domain catalog with modern audiobook versions.

**Solution**: Batch process multiple titles, maintain brand consistency through standardized instructions, publish Editions with professional cover art and descriptions, distribute Clips for marketing.

**Benefits**: Rapid catalog expansion, professional output quality, built-in distribution channel, marketing materials (Clips) generated automatically.

### Personal Enjoyment

**Scenario**: A commuter wants to enjoy classic literature but finds archaic prose difficult to follow while driving.

**Solution**: Browse Public Library for modernized Editions, play directly from playlist, save favorite Clips for later sharing, discover similar works through Feed recommendations.

**Benefits**: Accessible classics during commute, no learning curve (standard player), social sharing extends enjoyment.

### Language Learning

**Scenario**: An ESL student wants to improve English by reading familiar stories from their culture in accessible modern language.

**Solution**: Select specific chapters or passages, modernize with simplified sentence structures, listen while reading along with text, engage with community for discussion.

**Benefits**: Familiar content in approachable language, dual-mode learning (audio + text), community support.

### Accessibility Projects

**Scenario**: A library system wants to make classic literature available to patrons with reading difficulties.

**Solution**: Systematically modernize catalog of public-domain works, generate high-quality audio versions, publish in Public Library with accessibility tags, track usage analytics.

**Benefits**: Expanded accessible collection, professional quality, measurable impact, sustainable workflow.

---

## Competitive Advantages

### vs. Traditional Audiobook Platforms (Audible, Libro.fm)

- **Customization**: Control exact modernization approach, not limited to professional narrator interpretation
- **Cost**: AI-powered workflow dramatically reduces production costs
- **Speed**: Complete projects in hours instead of weeks/months
- **Iteration**: Easily create multiple versions with different styles
- **Social Features**: Built-in community and sharing (vs. passive consumption)

### vs. AI Audio Tools (Play.ht, Descript)

- **Social Platform**: Built-in distribution and community engagement
- **Quality Control**: Granular review and editing at chunk level
- **Workflow Integration**: End-to-end pipeline from upload to publication
- **Preservation**: Maintains original meaning and author intent through AI instructions
- **Literary Focus**: Specialized for books, not generic TTS

### vs. Manual Modernization

- **Efficiency**: 100x faster than human-only approach
- **Consistency**: AI applies instructions uniformly across entire work
- **Scalability**: Process multiple books simultaneously
- **Affordability**: Accessible to individuals, not just institutions
- **Reversibility**: Original text always preserved, can re-modernize with different approach

---

## Product Roadmap Vision

### Recently Completed

✅ **Dark Mode Conversion**: Entire app now uses sophisticated dark theme with glassmorphism
✅ **Auto-Upload Flow**: File selection automatically forwards to Project Setup
✅ **Page Number Estimates**: Content range shows page numbers alongside percentages
✅ **Voice & Reading Settings**: Collapsible panel organizes TTS controls
✅ **Time Expansion Feature**: NEW badge updated to highlight latest capability

### Near-Term Enhancements

- **SSML Annotation Support**: Toggle pronunciation controls, emphasis, pauses
- **Audio Sidebars**: Contextual spoken notes about characters, historical context
- **Multiple Voice Options**: Expanded voice library (gendered, accented, character-specific)
- **Collaborative Editing**: Multiple users on same project
- **Mobile-Responsive Optimization**: Touch-friendly controls, vertical layouts
- **Export Formats**: M4B audiobook format, podcast RSS

### Mid-Term Goals

- **Integrated Audio Players**: Play audio below each chunk during review
- **Character Voice Assignment**: Different voices per character dialog
- **Analytics Dashboard**: Edition creator insights (plays, completion rates, demographics)
- **Integration with Distribution Platforms**: Publish to Spotify, Apple Podcasts
- **Advanced Search**: Full-text search within Editions
- **Recommendation Engine**: ML-powered content discovery

### Long-Term Vision

- **Multi-Language Support**: Modernization and translation
- **Custom Voice Cloning**: Brand-consistent narrator voices
- **AI-Generated Cover Art**: Automatic visual creation from text
- **Podcast-Style Structuring**: Episode-based releases with intros/outros
- **Educational Curriculum Tools**: Assignment creation, quiz generation
- **AR/VR Experiences**: Immersive literary environments
- **Blockchain Provenance**: NFT-based Edition authentication

---

## Success Metrics

### Creator Metrics

- **Projects Created**: Total uploads
- **Completion Rate**: % projects that reach publication
- **Average Processing Time**: Upload to published Edition
- **Chunks Processed**: Total volume of text modernized
- **Editions Published**: Public and private
- **Retention**: DAU/MAU, weekly return rate
- **Quality Indicators**: % chunks manually edited, re-processing rate

### Consumer Metrics

- **Edition Plays**: Total and unique
- **Completion Rates**: % listeners who finish Editions
- **Session Duration**: Average listening time
- **Clip Engagement**: Shares, likes, comments
- **Discovery Success**: Click-through from recommendations
- **Platform Time**: Total time spent in app
- **Growth**: New users from social sharing

### Platform Health

- **Processing Accuracy**: LLM output quality (human review score)
- **Audio Quality**: TTS naturalness ratings
- **Uptime**: API availability and response times
- **Cost Efficiency**: AI/TTS cost per Edition vs. revenue
- **Community Moderation**: Flagged content, response time
- **Search Relevance**: Click-through rate on search results
- **Technical Performance**: Page load times, error rates

### Business Metrics (Future)

- **Revenue**: Subscriptions, premium features, ads
- **CAC**: Cost to acquire creator
- **LTV**: Lifetime value per user
- **Churn**: Monthly user attrition
- **Viral Coefficient**: Invites sent, accepted
- **Market Share**: Position in audiobook/literary tech space

---

## Brand Voice & Tone

### Voice Characteristics

- **Intelligent**: We respect literary heritage and user expertise
- **Accessible**: We demystify classic literature for modern audiences
- **Empowering**: We provide tools, users create masterpieces
- **Community-Focused**: We celebrate shared love of stories
- **Innovative**: We embrace technology to serve timeless art

### Communication Style

- **Professional yet Approachable**: Technical capability without jargon
- **Respectful of Source Material**: Honor original authors and works
- **User-Centric**: Features serve creator needs and artistic vision
- **Encouraging**: Support experimentation and creative interpretation
- **Educational**: Share knowledge about literature and process

### Example Messaging

**Feature Announcement**:

> "Introducing Voice & Reading Settings: Fine-tune narration speed, pitch, and pacing. Your audiobook, your way."

**Onboarding**:

> "Welcome to Audibler! Let's transform a classic into something your audience will love. Upload your public-domain book—we'll handle the rest together."

**Error State**:

> "This chunk couldn't be processed right now. No worries—just click retry or edit it manually. Your progress is saved."

**Success Confirmation**:

> "Edition published! Your modernized audiobook is now live in the Public Library. Share a Clip to spread the word."

**Empty State**:

> "Ready to bring a classic to life? Upload your first book to get started."

---

## Conclusion

**Audibler** bridges the gap between timeless literature and modern audiences through a sophisticated, user-centric platform that combines:

- **AI-Powered Efficiency**: Automated modernization with human oversight
- **Professional Quality**: TTS voices with extensive customization
- **Social Discovery**: Built-in community for sharing and engagement
- **Creator Control**: Granular tools for precision and artistry
- **Accessible Design**: Dark mode, glassmorphism, intuitive workflows

Our platform doesn't just convert text to speech—it transforms how society interacts with literary heritage, making the wisdom of centuries available to anyone with an internet connection and a love of great stories.

By providing maximum control over text quality and audio generation in a simple, convenient interface, Audibler empowers creators to publish professional audiobooks while maintaining their artistic vision. The collapsible Voice & Reading Settings, automatic page number estimates, and streamlined upload flow demonstrate our commitment to reducing friction without sacrificing capability.

The recent shift to dark mode reflects our understanding that creators spend extended time in the app, often in focused work sessions. The vignette effects, ambient gradients, and glassmorphic elements create an immersive workspace that feels premium and professional.

---

**Audibler** — Classic Literature, Modern Voice.

_Bringing the past into conversation with the present, one audiobook at a time._

---

## Appendix: Component Reference

### Core Components

**App.tsx** - Main application wrapper, routing, global state
**Header.tsx** - Navigation, user menu, branding
**UploadScreen.tsx** - File upload interface with auto-forward
**ProjectSetup.tsx** - Configuration: metadata, range, instructions
**ChunkReview.tsx** - Text transformation workspace with side-by-side view
**SegmentBuilder.tsx** - Audio playlist manager
**AudioPlayerView.tsx** - Audio playback interface
**EditionCreator.tsx** - Publication interface
**EditionsView.tsx** - My editions list
**LibraryView.tsx** - Personal project library
**PublicLibraryView.tsx** - Browse public editions
**FeedView.tsx** - Social activity stream
**ClipCreator.tsx** - Clip extraction tool
**BookCard.tsx** - Edition card component (used in libraries)
**BatchBuilder.tsx** - Batch processing interface
**BatchOrganizer.tsx** - Organize chunks into batches

### Specialized Components

**ChunkList.tsx** - Sidebar chunk navigation
**ChunkDetailPanel.tsx** - Chunk metadata and actions
**ChunkContextPanel.tsx** - Context information display
**DocumentNavigator.tsx** - Document structure navigation
**DocumentOverview.tsx** - High-level document stats
**EditorView.tsx** - Text editing interface
**ProgressRing.tsx** - Circular progress indicator

### UI Components (shadcn/ui)

All components in `/components/ui/` are from shadcn/ui library with dark mode theming applied. See component file list for complete inventory.

---

**Last Updated**: 2025-11-09
**Version**: 2.0 (Dark Mode Release)
**Status**: Active Development
