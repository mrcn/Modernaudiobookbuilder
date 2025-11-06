# Audibler - Comprehensive Application Specification

**Version:** 1.0  
**Last Updated:** November 5, 2025  
**Application Type:** Web-based React Application  
**Target Platform:** Desktop & Mobile Responsive

---

## Table of Contents

1. [Overview](#overview)
2. [Information Architecture](#information-architecture)
3. [Design System](#design-system)
4. [Data Models](#data-models)
5. [User Flows](#user-flows)
6. [View Specifications](#view-specifications)
7. [Component Specifications](#component-specifications)
8. [State Management](#state-management)
9. [Technical Implementation](#technical-implementation)
10. [Cost Calculations](#cost-calculations)

---

## Overview

### Product Description

Audibler is a web application that transforms public-domain books into modern, conversational audiobooks by:
1. Updating archaic language and simplifying complex sentences
2. Preserving the original meaning and author's voice
3. Generating text-to-speech audio from modernized text
4. Publishing as shareable Editions in a social platform
5. Creating viral Clips (short excerpts) for discovery

### Core Value Proposition

- **For Readers:** Make classic literature accessible through contemporary language
- **For Listeners:** Enjoy audiobooks without struggling with outdated vocabulary
- **For Creators:** Share your modernized interpretations with a community
- **For Discoverers:** Find and enjoy bite-sized literary excerpts

### Key Features

1. **Upload & Processing System**
   - Upload public domain books (.txt format)
   - Configure modernization parameters
   - AI-powered text transformation (GPT-4)
   - Text-to-speech audio generation (OpenAI TTS)

2. **Personal Library**
   - Manage uploaded books in various processing stages
   - Track status: uploaded → processing → modernized → audio-ready
   - Edit and review modernized text
   - Generate audio in batches

3. **Social Publishing Platform**
   - Create public Editions from your books
   - Browse community Editions in Public Library
   - Discover content through algorithmic Feed
   - Create and share Clips (short audio excerpts)

4. **Engagement Features**
   - Like and share Editions and Clips
   - Track listens and engagement metrics
   - Tag-based discovery system
   - User profiles (@handle system)

---

## Information Architecture

### Navigation Structure

```
Audibler
├── Library (Personal)
│   ├── Upload New Book
│   │   └── Project Setup
│   │       └── Chunk Review
│   │           └── Audio Segment Builder
│   │               └── Audio Player View
│   └── Browse Existing Books
│       ├── Chunk Review (for uploaded/processing/modernized books)
│       └── Audio Player View (for audio-ready books)
│
├── Editions (Personal Published Works)
│   └── Create Edition
│       └── Edition Creator
│
├── Public Library (Community Discovery)
│   └── Browse Public Editions
│
└── Feed (Social Discovery)
    ├── Browse Clips
    └── Create Clip
        └── Clip Creator
```

### View Hierarchy

```
App.tsx (Root)
├── Header (persistent, except during project-setup, chunk-review, batch-builder)
└── Main Content Area
    ├── LibraryView
    ├── UploadScreen
    ├── ProjectSetup
    ├── ChunkReview
    ├── BatchBuilder (Audio Segment Builder)
    ├── AudioPlayerView
    ├── EditionsView
    ├── PublicLibraryView
    ├── FeedView
    ├── EditionCreator
    ├── ClipCreator
    └── EditorView (deprecated - kept for backward compatibility)
```

### User Journey Map

#### Primary Flow: Upload to Audio
```
1. Library → 2. Upload → 3. Project Setup → 4. Chunk Review → 5. Audio Segment Builder → 6. Audio Player
```

#### Publishing Flow
```
Editor → Create Edition → Edition Creator → Editions View
Audio Player → Create Clip → Clip Creator → Feed View
```

#### Discovery Flow
```
Public Library → Browse Editions → Listen
Feed → Browse Clips → Play → View Edition
```

---

## Design System

### Visual Identity

**Design Philosophy:** 2025 sophisticated aesthetic with glassmorphism, gradients, and premium effects

**Primary Characteristics:**
- Clean, modern, minimalist
- High contrast with subtle depth
- Premium feel through materials and effects
- Playful gradients for book covers and accents

### Color System

#### Brand Colors
```css
Purple (Primary): #a855f7 (purple-500)
Pink (Accent): #ec4899 (pink-500)
Gradient: from-purple-600 to-pink-600
```

#### Background System
```css
Base: from-neutral-50 via-purple-50/30 to-pink-50/30
Ambient Blurs: purple-300/20, pink-300/20, blue-300/20
Cards: white/70 with backdrop-blur-xl
Borders: black/5
```

#### Status Colors
```css
Success: emerald-500
Warning: amber-500
Error: red-500
Info: blue-500
Processing: purple-500
```

#### Text Colors
```css
Primary: neutral-900
Secondary: neutral-600
Muted: neutral-500
On-Dark: white
On-Gradient: white
```

### Typography

**Font System:** System defaults (from globals.css)

```css
Base Size: 16px

Headings:
- h1: text-2xl (24px), medium weight
- h2: text-xl (20px), medium weight
- h3: text-lg (18px), medium weight
- h4: text-base (16px), medium weight

Body:
- p: text-base (16px), normal weight
- label: text-base (16px), medium weight
- input: text-base (16px), normal weight
- button: text-base (16px), medium weight

Sizes:
- text-xs: 12px
- text-sm: 14px
- text-base: 16px
- text-lg: 18px
- text-xl: 20px
- text-2xl: 24px
- text-3xl: 30px
- text-4xl: 36px
- text-5xl: 48px
```

**CRITICAL RULE:** Do not use Tailwind font-size, font-weight, or line-height classes unless specifically changing typography. The design system has default typography in globals.css.

### Spacing System

```
Gap Spacing:
- gap-2: 0.5rem (8px)
- gap-3: 0.75rem (12px)
- gap-4: 1rem (16px)
- gap-6: 1.5rem (24px)

Padding:
- p-3: 0.75rem (12px)
- p-4: 1rem (16px)
- p-6: 1.5rem (24px)
- p-8: 2rem (32px)

Margins:
- Use consistent vertical rhythm
- mb-4, mb-6 for section spacing
```

### Border Radius

```css
Buttons/Inputs: rounded-xl (0.75rem)
Cards: rounded-2xl (1rem)
Small Elements: rounded-lg (0.5rem)
Circles: rounded-full
```

### Effects & Materials

#### Glassmorphism
```css
Background: bg-white/70
Backdrop: backdrop-blur-xl
Border: border border-black/5
Shadow: (optional) shadow-xl
```

#### Gradients
```css
Book Covers: Dynamic gradients
- from-rose-400 via-pink-500 to-purple-500
- from-blue-500 via-cyan-500 to-teal-400
- from-amber-400 via-orange-500 to-red-500
- from-violet-500 via-purple-500 to-indigo-600
- from-slate-600 via-gray-700 to-purple-800

Buttons (CTA): 
- from-purple-600 to-pink-600

Accent Elements:
- from-purple-500 to-pink-500
```

#### Shadows
```css
Card Hover: hover:shadow-2xl
Button Glow: shadow-purple-500/25
Depth: shadow-xl
```

#### Hover States
```css
Cards: hover:shadow-2xl transition-shadow
Buttons: hover:scale-105 hover:shadow-xl
Links: hover:bg-black/5
Interactive: transition-all duration-200
```

### Component Patterns

#### Primary Button
```tsx
className="group relative px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 
           text-white rounded-xl flex items-center gap-3 
           transition-all duration-200 hover:shadow-xl 
           hover:shadow-purple-500/25 hover:scale-105"
```

#### Card
```tsx
className="bg-white/70 backdrop-blur-xl rounded-2xl 
           border border-black/5 p-6 shadow-sm"
```

#### Input
```tsx
className="border-2 border-neutral-300 focus:border-purple-500 
           rounded-xl px-4 py-3"
```

#### Badge
```tsx
className="px-3 py-1 rounded-full bg-purple-100 
           text-purple-700 text-sm"
```

### Icons

**Library:** Lucide React (`lucide-react`)

**Icon Size Standards:**
- Default: w-5 h-5 (20px)
- Small: w-4 h-4 (16px)
- Large: w-6 h-6 (24px)
- Stroke: strokeWidth={2.5} for consistency

**Common Icons:**
```
Book, Upload, Save, Play, Pause, Share2, Heart, 
MessageCircle, Sparkles, Zap, DollarSign, Mic2,
ChevronDown, Plus, X, Settings, User, Library, 
Globe, TrendingUp, Home, Edit, Trash, Copy
```

### Responsive Breakpoints

```css
Mobile: < 640px (sm)
Tablet: 640px - 1024px (md)
Desktop: > 1024px (lg)

Patterns:
- Stack on mobile: flex-col sm:flex-row
- Grid responsive: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
- Padding responsive: p-4 sm:p-6
- Text responsive: text-sm sm:text-base
- Hidden on mobile: hidden sm:block
```

---

## Data Models

### Book

Represents a book in the user's personal library, tracking its processing status.

```typescript
type Book = {
  id: string;                    // Unique identifier
  title: string;                 // Book title
  author: string;                // Author name
  coverColor: string;            // HSL color for cover
  coverGradient: string;         // Tailwind gradient classes
  uploadedAt: Date;              // Upload timestamp
  status: BookStatus;            // Processing status
  originalText?: string;         // Original text (preview/sample)
  modernizedText?: string;       // AI-modernized text
  audioSegments?: AudioSegment[]; // Generated audio chunks
};

type BookStatus = 
  | "uploaded"      // File uploaded, not processed
  | "processing"    // Currently being modernized
  | "modernized"    // Text modernization complete
  | "audio-ready";  // Audio generation complete
```

### AudioSegment

Represents a chunk of generated audio for a book.

```typescript
type AudioSegment = {
  id: string;          // Unique segment ID
  chunkIndex: number;  // Index in the book sequence
  audioUrl: string;    // URL/path to audio file
  duration: number;    // Duration in seconds
};
```

### Edition

Represents a published, shareable version of a modernized book.

```typescript
type Edition = {
  id: string;                    // Unique edition ID
  bookId: string;                // Reference to source book
  userId: string;                // Creator user ID
  userHandle: string;            // Creator @handle
  userAvatar?: string;           // Creator avatar emoji/url
  title: string;                 // Edition title
  author: string;                // Original author
  summary: string;               // Edition description
  tags: string[];                // Discovery tags
  coverGradient: string;         // Tailwind gradient classes
  visibility: "public" | "private"; // Publishing status
  listens: number;               // Total listen count
  likes: number;                 // Total likes
  createdAt: Date;               // Publication timestamp
  modernizedText?: string;       // Full modernized text
  audioSegments?: AudioSegment[]; // Audio content
};
```

### Clip

Represents a shareable excerpt from an Edition.

```typescript
type Clip = {
  id: string;           // Unique clip ID
  editionId: string;    // Source edition ID
  userId: string;       // Creator user ID
  userHandle: string;   // Creator @handle
  userAvatar?: string;  // Creator avatar
  title: string;        // Clip title
  bookTitle: string;    // Source book title
  quoteText: string;    // Text excerpt
  audioUrl: string;     // Audio file URL
  startTime: number;    // Start position (seconds)
  endTime: number;      // End position (seconds)
  duration: number;     // Total duration (seconds)
  tags: string[];       // Discovery tags
  likes: number;        // Total likes
  shares: number;       // Total shares
  coverGradient: string; // Visual gradient
  createdAt: Date;      // Creation timestamp
};
```

### ProjectConfig

Configuration for processing an uploaded book.

```typescript
type ProjectConfig = {
  title: string;         // Project title
  author: string;        // Author name
  instructions: string;  // Modernization instructions for AI
  startPosition: number; // Start percentage (0-100)
  endPosition: number;   // End percentage (0-100)
};
```

---

## User Flows

### Flow 1: Upload & Process Book

**Goal:** Upload a public domain book and transform it into a modern audiobook

**Steps:**
1. User clicks "Upload New Book" in Library
2. User drops/selects .txt file
3. File validation (size, format)
4. Navigate to Project Setup
5. User configures:
   - Project title (pre-filled from filename)
   - Author name
   - Modernization instructions (pre-filled with defaults)
   - Content range selection (slider 0-100%)
   - Review cost estimate
6. User clicks "Configure Project"
7. Book added to Library with "processing" status
8. Navigate to Chunk Review
9. System simulates AI modernization (2 seconds)
10. Book status updates to "modernized"
11. User reviews modernized chunks:
    - See metrics at top (total chunks, words, batches, failures)
    - Browse chunk list (center panel)
    - Select chunks to review/edit (right detail panel)
    - Edit modernized text if needed
12. User clicks "Build Audio Segments"
13. Navigate to Audio Segment Builder (BatchBuilder)
14. User configures batch settings and clicks "Submit X Batches"
15. Audio generation completes
16. Book status updates to "audio-ready"
17. Navigate to Audio Player View
18. User can now listen to audiobook

**Success Criteria:**
- Book appears in Library
- Status progresses through states
- Chunks are reviewable and editable
- Batch configuration is accurate
- Audio is playable

**Error Handling:**
- Invalid file format → Show error message
- File too large → Show size limit warning
- Processing failure → Retry option
- Batch exceeds limits → Warning in preview

---

### Flow 2: Review & Edit Modernized Text

**Goal:** Review AI-generated modernizations and make manual edits

**Steps:**
1. User opens a "modernized" or "audio-ready" book from Library
2. Navigate to Editor View
3. User sees Document Navigator with:
   - Document Overview (minimap)
   - Chunk List (paginated segments)
4. User clicks a chunk to select
5. Chunk Detail Panel shows:
   - Original text (reference)
   - Modernized text (editable)
   - Side-by-side comparison
6. User makes edits to modernized text
7. Changes auto-save (simulated)
8. User navigates between chunks
9. User reviews entire document via overview
10. User clicks "Generate Audio" when satisfied
11. Navigate to batch configuration

**Success Criteria:**
- All chunks are accessible
- Edits persist
- Clear visual diff between original/modern
- Smooth navigation

---

### Flow 3: Generate Audio (Batch Process)

**Goal:** Generate audio segments based on desired duration and selected batches

**Steps:**
1. User in Chunk Review clicks "Build Audio Segments"
2. Navigate to Audio Segment Builder (BatchBuilder)
3. User sets target audio duration:
   - Slider: 5-120 minutes
   - Example: User selects "20 minutes"
   - System calculates: 20 min × 150 wpm = 3,000 words needed
   - System determines: 6 chunks needed (500 words each)
   - System creates optimized batches (~45s each)
4. System auto-selects all generated batches
5. User reviews statistics:
   - Selected batches count
   - Total audio duration
   - Total words
   - Total cost
   - Average duration per batch
   - Duration range
6. User reviews batch list:
   - Each batch shows chunk range, words, duration, cost
   - All batches initially selected
7. User can deselect specific batches (optional):
   - Click to toggle selection
   - Shift-click for range selection
   - Use "Select All" or "Clear" buttons
8. Statistics update live based on selection
9. User clicks "Generate X Batches" (X = selected count)
10. System processes selected batches (simulated)
11. Book status updates to "audio-ready"
12. Navigate to Audio Player View

**Success Criteria:**
- Duration-based calculation is accurate
- All batches are optimal size (~45s audio each)
- Cost estimation matches selection
- Only selected batches are processed
- Audio segments are playable

**Calculations:**
- Reading speed: 150 words per minute = 2.5 words per second
- Target duration (minutes) → Total words needed = minutes × 150
- Chunks needed = words / 500 (each chunk ≈ 500 words)
- Batch optimization: ~45s audio per batch (sweet spot for TTS)
- Each chunk: 500 words ≈ 2000 characters
- Duration = words / 2.5 seconds
- Cost = (characters / 1,000,000) × $15

**Example:**
- User wants 20 minutes of audio
- 20 × 150 = 3,000 words needed
- 3,000 / 500 = 6 chunks needed
- Creates ~3 batches (2 chunks each, ~200s audio per batch)
- User can deselect batches to generate less if desired

---

### Flow 4: Listen to Audiobook

**Goal:** Play generated audio and enjoy the modernized audiobook

**Steps:**
1. User opens "audio-ready" book from Library
2. Navigate to Audio Player View
3. User sees:
   - Audio player controls (play/pause, progress, speed)
   - Current segment info
   - Text following (synchronized text display)
   - Chapter navigation
4. User clicks Play
5. Audio begins playing
6. Text highlights sync with audio
7. User can:
   - Pause/resume
   - Seek to position
   - Adjust playback speed (0.5x - 2.0x)
   - Skip to next/previous segment
8. User can create Clip from current position
9. User can return to Library

**Success Criteria:**
- Smooth playback
- Accurate text synchronization
- Responsive controls
- Clear visual feedback

---

### Flow 5: Publish Edition

**Goal:** Share modernized book as a public Edition

**Steps:**
1. User in Editor View clicks "Create Edition"
2. Navigate to Edition Creator
3. User configures:
   - Edition title (pre-filled)
   - Author (pre-filled)
   - Summary/description
   - Tags (add multiple)
   - Visibility (public/private)
4. User reviews metadata
5. User clicks "Publish Edition"
6. Edition created with initial metrics (0 listens, 0 likes)
7. Navigate to Editions View
8. New Edition appears at top
9. Edition is now discoverable in Public Library (if public)

**Success Criteria:**
- Edition metadata is complete
- Edition appears in user's Editions
- Public editions appear in Public Library
- Metrics initialize correctly

---

### Flow 6: Create Clip

**Goal:** Extract and share a short excerpt from audiobook

**Steps:**
1. User in Audio Player View clicks "Create Clip"
2. Navigate to Clip Creator
3. User sees:
   - Audio waveform visualization
   - Text content
   - Timeline with markers
4. User selects clip range:
   - Drag start/end markers
   - Or manually input timestamps
5. User configures:
   - Clip title
   - Tags
6. User previews clip
7. User clicks "Create Clip"
8. Clip created with initial metrics (0 likes, 0 shares)
9. Navigate to Feed View
10. New Clip appears at top

**Success Criteria:**
- Audio range is selectable
- Preview is accurate
- Clip appears in Feed
- Clip is shareable

---

### Flow 7: Discover Content (Public Library)

**Goal:** Browse and discover community-created Editions

**Steps:**
1. User clicks "Public Library" in Header
2. Navigate to Public Library View
3. User sees grid of Edition cards
4. Each card shows:
   - Cover gradient
   - Title & Author
   - Creator @handle and avatar
   - Summary
   - Tags
   - Metrics (listens, likes)
   - Created date
5. User can:
   - Click tag to filter
   - Search (future)
   - Sort by popularity/date (future)
6. User clicks an Edition card
7. Edition selected (would navigate to playback view)

**Success Criteria:**
- All public editions are visible
- Cards are visually appealing
- Metrics are accurate
- Navigation is smooth

---

### Flow 8: Browse Feed (Clips)

**Goal:** Discover and engage with short audio Clips

**Steps:**
1. User clicks "Feed" in Header
2. Navigate to Feed View
3. User sees:
   - Top section: Trending Editions carousel
   - Bottom section: Clips vertical feed
4. User scrolls through Clips
5. Each Clip card shows:
   - Cover gradient
   - Quote text
   - Book title & creator
   - Audio player with waveform
   - Tags
   - Metrics (likes, shares)
   - Duration
6. User clicks Play on a Clip
7. Audio plays inline
8. User can:
   - Like the Clip
   - Share the Clip
   - Click through to Edition
9. User browses more Clips

**Success Criteria:**
- Clips load smoothly
- Playback is inline
- Engagement actions work
- Discovery is enjoyable

---

## View Specifications

### 1. LibraryView

**Purpose:** Personal dashboard for managing uploaded books

**Layout:**
- Header with title "Your Library"
- Primary CTA: "Upload New Book" button (large, gradient)
- Grid of book cards (responsive: 1/2/3/4 columns)
- Empty state when no books

**Book Card Components:**
- Cover with gradient background
- Title & Author
- Status badge (uploaded/processing/modernized/audio-ready)
- Upload date
- Hover: Shadow lift effect
- Click: Opens appropriate view based on status

**States:**
- Empty (shows welcome message + upload prompt)
- Populated (shows grid of books)
- Loading (skeleton cards)

**Responsive:**
- Mobile: 1 column, full-width cards
- Tablet: 2 columns
- Desktop: 3-4 columns

---

### 2. UploadScreen

**Purpose:** File upload interface for adding new books

**Layout:**
- Large dropzone area (dashed border)
- Drag & drop icon + text
- "Or click to browse" secondary text
- File requirements info
- Back button to Library

**Interactions:**
- Drag over: Highlight dropzone
- Drop: Validate and process file
- Click: Open file picker
- Selected: Show file info, navigate to ProjectSetup

**Validation:**
- File type: .txt only
- File size: Display limit (e.g., 10MB)
- Content: Non-empty

**Visual:**
- Centered layout
- Large interactive area
- Clear instructions
- Purple/pink accent colors

---

### 3. ProjectSetup

**Purpose:** Configure book processing parameters

**Layout:**
- Full-screen, no Header
- Back button to Upload
- Save button (CTA) at top right
- Two-column layout (desktop) / stacked (mobile)

**Left Column: Configuration**
1. File Info Card
   - Filename, size, word count
   
2. Project Details Card
   - Title input (pre-filled)
   - Author input
   
3. Modernization Instructions Card
   - Large textarea
   - Default instructions pre-filled
   - Character count

4. Content Range Selector Card
   - Dual-thumb slider (0-100%)
   - Visual book representation
   - Start/End position labels
   - Statistics (selected words, characters, tokens)

**Right Column: Summary**
1. Cost Estimate Banner (gradient, prominent)
   - Total cost (large)
   - Breakdown: AI Modernization + TTS
   - Token counts and character counts
   - Duration estimate
   
2. Statistics Cards
   - Total Book Stats
   - Selected Range Stats

**Interactions:**
- All fields editable
- Range slider updates statistics live
- Cost recalculates on range change
- "Configure Project" creates book, navigates to Editor

**Validation:**
- Required: title, author
- Range: 1-100% (at least 1% selected)
- Instructions: Non-empty

---

### 4. ChunkReview

**Purpose:** Overview and review of all modernized text chunks before audio generation

**Layout:**
- Full-screen, no Header
- Back button to Library (top left)
- "Build Audio Segments" CTA button (top right, gradient)
- Metrics section (top, below header)
- Two-panel layout: Chunk List + Detail Panel

**Metrics Section:**
- Grid of metric cards (responsive: 2/3/6 columns)
  * Total Chunks
  * Total Words
  * Total Tokens
  * Est. Cost
  * Batches (completed/total)
  * Edited chunks count
  
- Status breakdown badges (horizontal scrollable)
  * Completed (green)
  * Processing (blue)
  * Pending (gray)
  * Failed (red, if any)
  * Edited (purple, if any)

**Main Content:**

**Center Panel: Chunk List (full-width)**
- Scrollable list of all chunks
- Each chunk card shows:
  * Chunk ID
  * First line of text preview
  * Status badge
  * Word/character count
  * Batch assignment (if any)
- Click to select (supports multi-select)
- Shift-click for range selection

**Right Panel: Chunk Detail (appears when chunks selected)**
- Selected chunk(s) info
- Tabs: Modernized / Original / Side-by-Side
- Editable text area
- Word count, character count
- Save/Close actions

**Interactions:**
- Click chunk: Select/deselect
- Shift-click: Range select
- Edit text: Update chunk, mark as edited
- Build Audio Segments: Navigate to BatchBuilder

**States:**
- No selection: Only chunk list visible
- Selection: Detail panel slides in from right
- Loading: Skeleton cards

**Removed from Original Design:**
- Left sidebar filters (moved to top metrics)
- Search functionality (simplified for v1)
- Batch Organizer toggle (integrated into flow)

**Responsive:**
- Mobile: Stacked layout, detail panel as modal
- Tablet/Desktop: Side-by-side panels

---

### 5. EditorView (DEPRECATED)

**Purpose:** Review and edit modernized text

**Status:** This view has been deprecated and replaced by ChunkReview. It is kept in the codebase for backward compatibility but is no longer used in the primary flow. All editing now happens in ChunkReview.

**Layout:**
- Header with book title
- Back to Library button
- Three-panel layout (responsive collapse on mobile)

**Left Panel: Document Navigator (25%)**
- Document Overview (minimap)
- Chunk List (scrollable)
- Chunk cards show first line of text
- Active chunk highlighted

**Center Panel: Chunk Detail (50%)**
- Chunk navigation (prev/next)
- Tabs: "Modernized" / "Original" / "Side-by-Side"
- Large text editing area
- Word count, character count
- Auto-save indicator

**Right Panel: Actions (25%)**
- Book metadata summary
- Status indicator
- "Generate Audio" button (CTA)
- "Create Edition" button
- Export options (future)

**Mobile:**
- Tabs for Navigator / Detail / Actions
- Stacked layout
- Bottom nav for chunk prev/next

**Interactions:**
- Click chunk: Load in detail panel
- Edit text: Auto-save simulation
- Switch tabs: Smooth transition
- Generate Audio: Navigate to BatchBuilder

---

### 6. BatchBuilder (Audio Segment Builder)

**Purpose:** Configure audio generation by selecting target duration and specific batches to process

**Note:** This is called "Audio Segment Builder" in the UI flow, but the component is named BatchBuilder.

**Layout:**
- Full-screen, no Header
- Back button to Chunk Review (top left)
- "Generate X Batches" CTA button (top right, gradient)
- Target Duration Control section
- Statistics section
- Selectable batch list (main content)

**Sections:**

1. **Header**
   - Title: "Audio Segment Builder"
   - Subtitle: "Select target duration and batches to generate"
   - Back button → Chunk Review
   - Generate button (shows count of selected batches)

2. **Target Duration Control**
   - Large slider: 5-120 minutes
   - Large display: Current minutes selection
   - Helper text: "How much audio do you want to generate?"
   - Shows chunks needed for target duration
   - Auto-calculates batches based on target

3. **Statistics Grid** (6 metrics)
   - Selected batches (X/Total)
   - Total Audio duration
   - Total Words
   - Total Cost
   - Avg Duration per batch
   - Duration Range (min—max)

4. **Batch Selection List**
   - Header with "Select All" and "Clear" buttons
   - Scrollable list of all batches
   - Each batch row shows:
     * Checkbox (selectable)
     * Batch ID
     * Chunk range (e.g., "Chunks 0—4")
     * Word count badge
     * Duration badge
     * Cost (right side)
     * Character count (right side, desktop only)
   - Multi-select support:
     * Click to toggle
     * Shift-click for range selection
   - Selected batches highlighted (purple background, left border)

**Behavior:**

**Duration-Based Calculation:**
- User sets target minutes (e.g., 20 minutes)
- System calculates: 20 min × 150 words/min = 3,000 words needed
- System determines chunks needed: 3,000 ÷ 500 words/chunk = 6 chunks
- System creates optimal batches (45s audio each, ~112 words/batch)
- All batches auto-selected initially

**Batch Selection:**
- Click batch: Toggle selection
- Shift-click: Range select
- Select All: Select all generated batches
- Clear: Deselect all
- Stats update live based on selection

**Interactions:**
- Change target duration → Recalculates batches → Auto-selects all new batches
- Select/deselect batches → Updates statistics
- Generate → Submits only selected batches → Navigates to player

**Responsive:**
- Stats grid: 2 cols (mobile) → 3 cols (tablet) → 6 cols (desktop)
- Batch list: Full-width items, simplified on mobile (hide some metadata)
- Duration slider: Full-width, large touch target

---

### 7. AudioPlayerView

**Purpose:** Listen to generated audiobook

**Layout:**
- Header with book info
- Back button
- Main player area (centered)
- Bottom controls

**Components:**

1. **Cover Display**
   - Large gradient cover
   - Animated glow on play
   - Book title & author

2. **Player Controls**
   - Large play/pause button (center)
   - Progress bar (seekable)
   - Current time / total time
   - Speed control dropdown (0.5x - 2.0x)
   - Volume slider
   - Previous/next segment buttons

3. **Text Display**
   - Currently playing text
   - Synchronized highlighting
   - Scrolls with audio

4. **Chapter/Segment Navigation**
   - List of segments
   - Click to jump
   - Current segment highlighted

5. **Actions**
   - Create Clip button
   - Share button
   - Download (future)

**Interactions:**
- Click play: Audio starts
- Drag progress: Seek to position
- Click segment: Jump to start
- Create Clip: Navigate to ClipCreator

**States:**
- Loading
- Playing (animated indicators)
- Paused
- Ended (show replay/next options)

---

### 8. EditionsView

**Purpose:** Manage user's published Editions

**Layout:**
- Header "Your Editions"
- Grid of Edition cards (same as Public Library)
- Empty state: "No editions yet. Create your first!"

**Edition Card:**
- Gradient cover
- Title & Author
- Summary (truncated)
- Tags (scrollable)
- Metrics (listens, likes)
- Created date
- Visibility badge (public/private)
- Actions menu (edit, delete, share)

**Interactions:**
- Click card: View/play Edition
- Edit: Modify metadata
- Delete: Confirm dialog
- Share: Copy link

**Responsive:**
- Grid: 1/2/3 columns responsive

---

### 9. PublicLibraryView

**Purpose:** Discover community Editions

**Layout:**
- Header "Public Library"
- Filter bar (future: search, tags, sort)
- Grid of Edition cards

**Edition Card (Public):**
- Gradient cover
- Title & Author
- Creator @handle + avatar
- Summary (truncated, expandable)
- Tags (clickable)
- Metrics (listens, likes)
- Created date
- Listen button

**Interactions:**
- Click card: Open Edition player
- Click tag: Filter by tag
- Like: Increment counter (auth required)
- Listen: Start playback

**States:**
- Loading (skeleton cards)
- Empty (no public editions)
- Filtered (show active filters)

**Responsive:**
- Grid: 1/2/3 columns

---

### 10. FeedView

**Purpose:** Social feed for discovering Clips

**Layout:**
- Two sections: Trending Editions + Clips Feed

**Section 1: Trending Editions Carousel**
- Horizontal scrollable carousel
- Large Edition cards (featured style)
- Auto-scroll (optional)
- Metrics prominently displayed

**Section 2: Clips Feed**
- Vertical scrolling feed
- Clip cards (full-width on mobile, centered on desktop)

**Clip Card:**
- Gradient header
- Quote text (large, readable)
- Book title & creator info
- Inline audio player with waveform visualization
- Tags
- Actions: Like, Share, View Edition
- Metrics (likes, shares)
- Duration badge
- Timestamp

**Interactions:**
- Play audio: Inline playback
- Like: Increment counter
- Share: Copy link
- View Edition: Navigate to Edition
- Click tag: Filter feed

**Feed Behavior:**
- Infinite scroll (or paginated)
- Active clip pauses when new clip plays
- Smooth scrolling

**Responsive:**
- Carousel: Snap scroll on mobile
- Clips: Full-width on mobile, max-width on desktop

---

### 11. EditionCreator

**Purpose:** Publish a book as an Edition

**Layout:**
- Modal or full-screen form
- Back/Cancel button
- Save/Publish button (CTA)

**Form Fields:**
1. Title (pre-filled from book)
2. Author (pre-filled from book)
3. Summary (textarea, 2-3 sentences)
4. Tags (multi-input, add/remove)
5. Cover preview (gradient from book)
6. Visibility toggle (public/private)

**Sections:**
- Metadata inputs
- Preview card (shows how Edition will appear)
- Publishing options

**Interactions:**
- Add tag: Press Enter or click Add
- Remove tag: Click X on tag
- Toggle visibility: Switch component
- Publish: Validate, create Edition, navigate to EditionsView

**Validation:**
- Required: title, author, summary
- Summary: Min 50 chars
- Tags: At least 1, max 10

---

### 12. ClipCreator

**Purpose:** Create shareable audio excerpt

**Layout:**
- Full-screen interface
- Cancel button (top left)
- Save button (top right, CTA)

**Components:**

1. **Audio Timeline**
   - Waveform visualization
   - Playhead scrubber
   - Start/end markers (draggable)
   - Duration indicator
   - Zoom controls

2. **Text View**
   - Full text with highlighted selected range
   - Scrolls to selected portion

3. **Configuration Panel**
   - Clip title input
   - Tags input (multi)
   - Start time input (manual)
   - End time input (manual)
   - Duration display (auto-calculated)
   - Preview button

4. **Preview Player**
   - Mini player for selected clip
   - Play preview audio

**Interactions:**
- Drag markers: Update range
- Type timestamps: Update markers
- Play preview: Hear clip
- Add tags: Multi-input
- Save: Create Clip, navigate to Feed

**Constraints:**
- Min duration: 3 seconds
- Max duration: 60 seconds
- Range must be within book audio

**Validation:**
- Title required
- Valid time range
- At least 1 tag

---

## Component Specifications

### Shared/Utility Components

#### Header

**Purpose:** Global navigation bar

**Layout:**
- Logo (left): "Audibler" text or icon
- Navigation items (center/left):
  * Library
  * Editions
  * Public Library
  * Feed
- User actions (right):
  * Upload button (icon)
  * Profile (future)
  * Settings (future)

**Behavior:**
- Active view highlighted
- Click nav item: Change view
- Sticky/fixed position (optional)
- Responsive: Hamburger menu on mobile

**Visual:**
- Glassmorphism background
- Border bottom
- Purple/pink accent for active item

---

#### BookCard

**Purpose:** Display book in library grid

**Props:**
```typescript
{
  book: Book;
  onClick: () => void;
}
```

**Layout:**
- Gradient cover (aspect-ratio: 2/3)
- Title (truncated)
- Author
- Status badge
- Upload date
- Metrics (if audio-ready)

**States:**
- Default
- Hover (shadow lift)
- Loading (skeleton)

**Visual:**
- Rounded corners
- Gradient background
- White text overlay
- Status-specific badge colors

---

#### ProgressRing

**Purpose:** Circular progress indicator

**Props:**
```typescript
{
  progress: number; // 0-100
  size?: number;    // diameter in px
  strokeWidth?: number;
  color?: string;
}
```

**Rendering:**
- SVG circle
- Animated stroke-dasharray
- Center text (percentage)

**Usage:**
- Upload progress
- Processing status
- Audio generation

---

#### ChunkList

**Purpose:** List of document chunks for navigation

**Props:**
```typescript
{
  chunks: Chunk[];
  activeChunk: number;
  onChunkClick: (index: number) => void;
}
```

**Layout:**
- Scrollable list
- Chunk cards with preview text
- Active chunk highlighted
- Index numbers

**Interactions:**
- Click chunk: Emit onChunkClick
- Keyboard nav: Arrow keys
- Scroll active into view

---

#### ChunkDetailPanel

**Purpose:** Display and edit chunk content

**Props:**
```typescript
{
  chunk: Chunk;
  onUpdate: (text: string) => void;
}
```

**Layout:**
- Tab navigation (Modernized / Original / Side-by-Side)
- Text editing area
- Metadata footer (word count, etc.)

**Interactions:**
- Edit text: onChange with debounce
- Switch tabs: Update view
- Auto-save indicator

---

#### ClipCard

**Purpose:** Display clip in feed

**Props:**
```typescript
{
  clip: Clip;
  onLike: () => void;
  onShare: () => void;
  onPlay: () => void;
}
```

**Layout:**
- Gradient header bar
- Quote text (emphasized)
- Audio player controls
- User info (@handle, avatar)
- Tags
- Action buttons (like, share)
- Metrics

**States:**
- Idle
- Playing (animated)
- Liked (filled heart)

---

### Complex Components

#### DocumentNavigator

**Purpose:** Visual overview + chunk navigation

**Components:**
- DocumentOverview (minimap)
- ChunkList

**Layout:**
- Vertical split
- Overview on top (20%)
- List below (80%)

**Interactions:**
- Click chunk in list: Navigate
- Click position in overview: Navigate to approximate chunk
- Scroll indicator in overview

---

#### DocumentOverview

**Purpose:** Minimap visualization of entire document

**Rendering:**
- Vertical bar representing full document
- Chunks as segments (different shades)
- Current position indicator
- Viewport indicator (visible portion)

**Interactions:**
- Click: Jump to approximate position
- Hover: Show chunk preview tooltip

**Visual:**
- Gradient or color-coded by status
- Smooth scroll animation

---

#### BatchOrganizer

**Purpose:** Alternative batch configuration interface (possibly deprecated)

**Note:** May be replaced by BatchBuilder. Check if still in use.

---

### ShadCN UI Components

The app uses ShadCN components from `/components/ui/`. Key components:

**Form Inputs:**
- Input, Textarea, Label
- Select, Checkbox, Switch, Slider
- RadioGroup

**Layout:**
- Card, Separator, Tabs, Accordion
- Sheet, Dialog, Drawer
- Popover, Tooltip, HoverCard

**Feedback:**
- Alert, Badge, Progress
- Skeleton, Sonner (toast)

**Navigation:**
- Button, DropdownMenu, NavigationMenu
- Breadcrumb, Pagination

**Data Display:**
- Table, Avatar, AspectRatio
- Calendar, Chart

**Usage Pattern:**
```typescript
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
```

All ShadCN components follow the design system tokens and can be customized via Tailwind classes.

---

## State Management

### App-Level State (App.tsx)

**State Variables:**

```typescript
const [currentView, setCurrentView] = useState<View>("library");
const [uploadedFile, setUploadedFile] = useState<{file: File; content: string} | null>(null);
const [books, setBooks] = useState<Book[]>([...mockBooks]);
const [myEditions, setMyEditions] = useState<Edition[]>([...mockEditions]);
const [publicEditions, setPublicEditions] = useState<Edition[]>([...mockPublicEditions]);
const [feedClips, setFeedClips] = useState<Clip[]>([...mockClips]);
const [selectedBook, setSelectedBook] = useState<Book | null>(null);
const [selectedEdition, setSelectedEdition] = useState<Edition | null>(null);
```

**State Transitions:**

View Navigation:
```
library → upload → project-setup → editor → player
library → editor (for existing books)
editor → create-edition → editions
player → create-clip → feed
Any → public-library, feed (via header nav)
```

Book Status Progression:
```
uploaded → processing → modernized → audio-ready
```

**State Update Patterns:**

1. Add Book:
```typescript
setBooks(prev => [newBook, ...prev]);
```

2. Update Book Status:
```typescript
setBooks(prev => prev.map(b => 
  b.id === targetId ? { ...b, status: newStatus } : b
));
```

3. Create Edition:
```typescript
setMyEditions(prev => [newEdition, ...prev]);
```

4. Like Clip:
```typescript
setFeedClips(prev => prev.map(c =>
  c.id === clipId ? { ...c, likes: c.likes + 1 } : c
));
```

### Component-Level State

**ProjectSetup:**
```typescript
const [title, setTitle] = useState(fileName);
const [author, setAuthor] = useState("");
const [instructions, setInstructions] = useState(DEFAULT_INSTRUCTIONS);
const [rangeStart, setRangeStart] = useState(0);
const [rangeEnd, setRangeEnd] = useState(100);
```

**EditorView:**
```typescript
const [activeChunk, setActiveChunk] = useState(0);
const [editedText, setEditedText] = useState("");
const [activeTab, setActiveTab] = useState<"modern" | "original" | "compare">("modern");
```

**BatchBuilder:**
```typescript
const [targetDuration, setTargetDuration] = useState(30);
const [maxDuration, setMaxDuration] = useState(60);
const [mode, setMode] = useState<"sentence" | "char-window">("char-window");
const [keepRangesTogether, setKeepRangesTogether] = useState(true);
```

**AudioPlayerView:**
```typescript
const [isPlaying, setIsPlaying] = useState(false);
const [currentTime, setCurrentTime] = useState(0);
const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
const [currentSegment, setCurrentSegment] = useState(0);
```

### Computed State (useMemo)

**ProjectSetup - Statistics:**
```typescript
const stats = useMemo(() => {
  const totalWords = fileContent.trim().split(/\s+/).length;
  const totalChars = fileContent.length;
  const startIndex = Math.floor((totalChars * rangeStart) / 100);
  const endIndex = Math.floor((totalChars * rangeEnd) / 100);
  const selectedChars = endIndex - startIndex;
  const selectedWords = fileContent.slice(startIndex, endIndex).trim().split(/\s+/).length;
  
  const inputTokens = Math.ceil(selectedChars / 4);
  const outputTokens = Math.ceil(selectedChars / 4);
  const totalTokens = inputTokens + outputTokens;
  
  const inputCost = (inputTokens / 1000) * 0.01;
  const outputCost = (outputTokens / 1000) * 0.03;
  const modernizationCost = inputCost + outputCost;
  
  const ttsChars = selectedChars;
  const ttsCost = (ttsChars / 1000000) * 15;
  
  const totalCost = modernizationCost + ttsCost;
  
  const durationMinutes = Math.ceil(selectedWords / 150);
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  
  return {
    totalWords, totalChars, selectedWords, selectedChars,
    inputTokens, outputTokens, totalTokens, ttsChars,
    modernizationCost, ttsCost, totalCost,
    duration: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  };
}, [fileContent, rangeStart, rangeEnd]);
```

**BatchBuilder - Batch Calculation:**
```typescript
const batches = useMemo(() => {
  const result: Batch[] = [];
  let currentChunk = 0;
  let batchId = 0;

  while (currentChunk < totalChunks) {
    const wordsPerChunk = 500;
    const charsPerChunk = 2000;
    const wordsPerSecond = 2.5;
    const targetWords = targetDuration * wordsPerSecond;
    const chunksInBatch = Math.max(1, Math.floor(targetWords / wordsPerChunk));
    
    const actualBatchSize = Math.min(chunksInBatch, totalChunks - currentChunk);
    const wordCount = actualBatchSize * wordsPerChunk;
    const charCount = actualBatchSize * charsPerChunk;
    const estimatedSeconds = Math.ceil(wordCount / wordsPerSecond);
    const estimatedCost = (charCount / 1000000) * 15;
    
    result.push({
      id: batchId++,
      firstChunk: currentChunk,
      lastChunk: currentChunk + actualBatchSize - 1,
      charCount, wordCount, estimatedSeconds, estimatedCost
    });

    currentChunk += actualBatchSize;
  }

  return result;
}, [totalChunks, targetDuration]);
```

---

## Technical Implementation

### Technology Stack

**Core:**
- React 18+ (Hooks, Functional Components)
- TypeScript (strict mode)
- Tailwind CSS v4.0

**UI Components:**
- ShadCN UI (Radix UI primitives)
- Lucide React (icons)

**Build Tool:**
- Vite (assumed based on modern React setup)

**Styling:**
- Tailwind CSS with custom design tokens
- CSS Variables for theming
- Responsive utilities

### File Structure

```
/
├── App.tsx                    # Root component, routing, state
├── styles/
│   └── globals.css           # Design system, Tailwind config
├── components/
│   ├── Header.tsx            # Global navigation
│   ├── LibraryView.tsx       # Personal library
│   ├── UploadScreen.tsx      # File upload
│   ├── ProjectSetup.tsx      # Book configuration
│   ├── EditorView.tsx        # Text editor
│   ├── AudioPlayerView.tsx   # Audio playback
│   ├── EditionsView.tsx      # Personal editions
│   ├── PublicLibraryView.tsx # Community editions
│   ├── FeedView.tsx          # Clips feed
│   ├── EditionCreator.tsx    # Create edition form
│   ├── ClipCreator.tsx       # Create clip form
│   ├── BatchBuilder.tsx      # TTS batch config
│   ├── DocumentNavigator.tsx # Editor navigation
│   ├── DocumentOverview.tsx  # Minimap
│   ├── ChunkList.tsx         # Chunk navigation
│   ├── ChunkDetailPanel.tsx  # Chunk editor
│   ├── ChunkReview.tsx       # Review UI
│   ├── BatchOrganizer.tsx    # Batch management
│   ├── BookCard.tsx          # Book display card
│   ├── ProgressRing.tsx      # Progress indicator
│   ├── figma/
│   │   └── ImageWithFallback.tsx # Image component
│   └── ui/                   # ShadCN components
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       └── ...
└── guidelines/
    └── Guidelines.md         # Development guidelines
```

### Routing Strategy

**Client-Side View Switching:**
- No URL routing (single-page app)
- State-based view management via `currentView`
- Views rendered conditionally in App.tsx

```typescript
{currentView === "library" && <LibraryView ... />}
{currentView === "upload" && <UploadScreen ... />}
{currentView === "project-setup" && <ProjectSetup ... />}
// etc.
```

**Future Enhancement:** Add react-router for URL-based routing

### Data Flow Patterns

**Parent-to-Child (Props):**
```typescript
<EditorView 
  book={selectedBook}
  onBack={() => setCurrentView("library")}
  onGenerateAudio={handleGenerateAudio}
/>
```

**Child-to-Parent (Callbacks):**
```typescript
const handleFileSelected = (file: File, content: string) => {
  setUploadedFile({ file, content });
  setCurrentView("project-setup");
};

<UploadScreen onFileSelected={handleFileSelected} />
```

**State Lifting:**
- All major state lives in App.tsx
- Views are mostly presentational
- Events bubble up, data flows down

### Mock Data & Simulation

**Current Implementation:**
- All data is in-memory mock data
- No backend API calls
- Simulated processing delays using setTimeout

**Simulation Examples:**

1. Book Processing:
```typescript
setTimeout(() => {
  setBooks(prev => prev.map(b =>
    b.id === newBook.id
      ? { ...b, status: "modernized", modernizedText: modernizeText(text) }
      : b
  ));
}, 2000);
```

2. Text Modernization:
```typescript
const modernizeText = (text: string): string => {
  return text
    .replace(/whilst/gi, "while")
    .replace(/thou /gi, "you ")
    .replace(/thee/gi, "you")
    .replace(/hath/gi, "has")
    .replace(/doth/gi, "does");
};
```

**Future Backend Integration:**
- Replace mock data with API calls
- Implement real GPT-4 text modernization
- Implement real OpenAI TTS audio generation
- Add authentication & user accounts
- Add database for persistence (Supabase suggested)

### Performance Considerations

**Optimizations:**
- useMemo for expensive calculations (stats, batches)
- Lazy loading for large text content
- Pagination for chunk lists
- Virtual scrolling for long feeds (future)

**Responsive Design:**
- Mobile-first approach
- Breakpoint-based layouts (sm, md, lg)
- Touch-friendly interactive elements
- Reduced motion for accessibility (future)

### Accessibility

**Current:**
- Semantic HTML elements
- ARIA labels on interactive elements (ShadCN components)
- Keyboard navigation support (ShadCN)
- Focus management

**Future Enhancements:**
- Screen reader testing
- Keyboard shortcuts
- High contrast mode
- Reduced motion preferences

---

## Cost Calculations

### Text Modernization (GPT-4 Turbo)

**Model:** GPT-4 Turbo  
**Pricing (as of spec date):**
- Input: $0.01 per 1,000 tokens
- Output: $0.03 per 1,000 tokens

**Token Estimation:**
- 1 token ≈ 4 characters (English text)
- Input tokens = original text characters / 4
- Output tokens = modernized text characters / 4 (similar length)

**Formula:**
```typescript
const inputTokens = Math.ceil(selectedChars / 4);
const outputTokens = Math.ceil(selectedChars / 4);
const inputCost = (inputTokens / 1000) * 0.01;
const outputCost = (outputTokens / 1000) * 0.03;
const modernizationCost = inputCost + outputCost;
```

**Example:**
- 10,000 characters selected
- Input: 2,500 tokens × $0.01 = $0.025
- Output: 2,500 tokens × $0.03 = $0.075
- Total: $0.10 per 10k characters

---

### Text-to-Speech (OpenAI TTS)

**Model:** OpenAI TTS (tts-1 or tts-1-hd)  
**Pricing:**
- $15.00 per 1 million characters

**Character Estimation:**
- Uses modernized text character count
- Includes punctuation and spaces

**Formula:**
```typescript
const ttsChars = selectedChars;
const ttsCost = (ttsChars / 1000000) * 15;
```

**Example:**
- 100,000 characters modernized text
- Cost: (100,000 / 1,000,000) × $15 = $1.50

---

### Audio Duration Estimation

**Reading Speed:** 150 words per minute (audiobook standard)

**Formula:**
```typescript
const wordsPerMinute = 150;
const durationMinutes = Math.ceil(selectedWords / wordsPerMinute);
const hours = Math.floor(durationMinutes / 60);
const minutes = durationMinutes % 60;
```

**Example:**
- 30,000 words
- Duration: 30,000 / 150 = 200 minutes = 3h 20m

---

### Batch Audio Estimation (BatchBuilder)

**Assumptions:**
- 1 chunk ≈ 2,000 characters ≈ 500 words
- Reading speed: 150 words/min = 2.5 words/second
- Provider limit: ~60 seconds per TTS request (4,096 chars)

**Batch Calculation:**
```typescript
const wordsPerChunk = 500;
const charsPerChunk = 2000;
const wordsPerSecond = 2.5;

// How many chunks fit in target duration?
const targetWords = targetDuration * wordsPerSecond;
const chunksInBatch = Math.max(1, Math.floor(targetWords / wordsPerChunk));

// Calculate batch metrics
const wordCount = chunksInBatch * wordsPerChunk;
const charCount = chunksInBatch * charsPerChunk;
const estimatedSeconds = Math.ceil(wordCount / wordsPerSecond);
const estimatedCost = (charCount / 1000000) * 15;
```

**Example (30 second target):**
- Target words: 30s × 2.5 = 75 words
- Chunks: 75 / 500 = 0.15 → rounds to 1 chunk
- Duration: 500 words / 2.5 = 200 seconds
- Cost: (2,000 chars / 1,000,000) × $15 = $0.03

**Distribution Logic:**
- Green: duration < 70% of max
- Yellow: duration 70-90% of max
- Red: duration > 90% of max (warning)

---

### Combined Cost Example

**Full Book Processing:**
- Book: "Pride and Prejudice" (~120,000 words, ~600,000 chars)
- User selects: 50% (60,000 words, 300,000 chars)

**Modernization:**
- Input: 75,000 tokens × $0.01 = $0.75
- Output: 75,000 tokens × $0.03 = $2.25
- Subtotal: $3.00

**TTS:**
- 300,000 chars × ($15 / 1M) = $4.50

**Total:** $7.50

**Audio Duration:**
- 60,000 words / 150 wpm = 400 minutes = 6h 40m

---

## Future Enhancements

### Phase 2: Backend Integration

1. **Authentication**
   - User accounts (email/password, OAuth)
   - Profile management
   - Avatar upload

2. **Database (Supabase)**
   - Books table
   - Editions table
   - Clips table
   - Users table
   - Likes/Shares tables

3. **Real AI Processing**
   - GPT-4 API integration
   - OpenAI TTS API integration
   - Job queue for batch processing
   - Webhook for completion notifications

4. **Storage**
   - S3/Cloud storage for audio files
   - CDN for audio delivery

### Phase 3: Advanced Features

1. **Search & Discovery**
   - Full-text search
   - Tag filtering
   - Sort by popularity/date/trending
   - Recommendations algorithm

2. **Social Features**
   - Follow users
   - Comments on Editions/Clips
   - Share to social media
   - Embed clips on websites

3. **Analytics**
   - Listen tracking
   - Engagement metrics dashboard
   - Creator insights

4. **Monetization**
   - Premium subscriptions
   - Pay-per-book processing
   - Creator revenue sharing

### Phase 4: Platform Expansion

1. **Mobile Apps**
   - iOS app (React Native / Swift)
   - Android app (React Native / Kotlin)
   - Offline playback

2. **Advanced Audio**
   - Multiple voice options
   - Voice cloning
   - Background music
   - Sound effects

3. **Collaboration**
   - Shared editing
   - Version control
   - Review/approval workflow
   - Community voting on modernizations

4. **Export & Distribution**
   - Export to standard audiobook formats
   - Podcast RSS feeds
   - Distribution to platforms (Spotify, Apple Podcasts)

---

## Development Guidelines

### Code Style

**TypeScript:**
- Strict mode enabled
- Explicit types for props and state
- Avoid `any` type
- Use type aliases for complex types

**React:**
- Functional components only
- Hooks for state and effects
- Props destructuring
- Named exports for components

**Naming Conventions:**
- Components: PascalCase (`BookCard`, `EditorView`)
- Functions: camelCase (`handleFileSelected`, `modernizeText`)
- Constants: UPPER_SNAKE_CASE (`DEFAULT_INSTRUCTIONS`, `VOICES`)
- Props interfaces: `ComponentNameProps`

**File Organization:**
- One component per file
- File name matches component name
- Related components in subdirectories
- Shared utilities in separate files

### Tailwind Best Practices

1. **Do NOT use:**
   - Font size classes (`text-xl`, `text-2xl`)
   - Font weight classes (`font-bold`, `font-semibold`)
   - Line height classes (`leading-tight`, `leading-none`)
   - (Unless specifically changing typography)

2. **DO use:**
   - Spacing utilities (`p-6`, `gap-4`, `mb-8`)
   - Color utilities (`text-purple-600`, `bg-white/70`)
   - Layout utilities (`flex`, `grid`, `grid-cols-3`)
   - Responsive modifiers (`sm:`, `md:`, `lg:`)

3. **Component patterns:**
   - Extract repeated class strings to constants
   - Use template literals for dynamic classes
   - Prefer utility classes over custom CSS

### Component Development

**Structure:**
```typescript
import { useState } from "react";
import { Icon } from "lucide-react";
import { Button } from "./ui/button";

type ComponentProps = {
  prop1: string;
  prop2: number;
  onAction: () => void;
};

export function Component({ prop1, prop2, onAction }: ComponentProps) {
  const [state, setState] = useState(initialValue);
  
  const handleEvent = () => {
    // Logic
    onAction();
  };
  
  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
}
```

**Best Practices:**
- Keep components focused (single responsibility)
- Extract complex logic to custom hooks
- Use composition over inheritance
- Prefer controlled components
- Handle loading and error states

### Testing Checklist

**Manual Testing:**
- [ ] Desktop layout (1920×1080)
- [ ] Tablet layout (768×1024)
- [ ] Mobile layout (375×667)
- [ ] All user flows complete successfully
- [ ] No console errors
- [ ] Responsive images load
- [ ] Hover states work
- [ ] Keyboard navigation works
- [ ] Focus management is correct

**Browser Testing:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome (Android)

---

## Appendix

### Mock Data Templates

**Book:**
```typescript
{
  id: "1",
  title: "Pride and Prejudice",
  author: "Jane Austen",
  coverColor: "#8B7355",
  coverGradient: "from-rose-400 via-pink-500 to-purple-500",
  uploadedAt: new Date("2024-11-01"),
  status: "audio-ready",
  originalText: "It is a truth universally acknowledged...",
  modernizedText: "Everyone knows that a wealthy single man...",
  audioSegments: [
    { id: "seg-1", chunkIndex: 0, audioUrl: "mock.mp3", duration: 4.2 }
  ]
}
```

**Edition:**
```typescript
{
  id: "e1",
  bookId: "1",
  userId: "me",
  userHandle: "@you",
  title: "Pride and Prejudice",
  author: "Jane Austen",
  summary: "A fresh, modern take on Austen's timeless classic...",
  tags: ["romance", "classic", "witty"],
  coverGradient: "from-rose-400 via-pink-500 to-purple-500",
  visibility: "public",
  listens: 1247,
  likes: 89,
  createdAt: new Date("2024-11-02")
}
```

**Clip:**
```typescript
{
  id: "c1",
  editionId: "e1",
  userId: "u1",
  userHandle: "@user",
  title: "Opening Line",
  bookTitle: "Pride and Prejudice",
  quoteText: "Everyone knows that a wealthy single man...",
  audioUrl: "mock-clip.mp3",
  startTime: 0,
  endTime: 5,
  duration: 5,
  tags: ["quote", "opening"],
  likes: 456,
  shares: 89,
  coverGradient: "from-rose-400 via-pink-500 to-purple-500",
  createdAt: new Date("2024-11-03")
}
```

### Gradient Library

```typescript
const GRADIENTS = [
  "from-violet-500 via-purple-500 to-pink-500",
  "from-emerald-400 via-teal-500 to-cyan-500",
  "from-yellow-400 via-orange-500 to-red-500",
  "from-indigo-500 via-blue-500 to-cyan-500",
  "from-rose-400 via-pink-500 to-purple-500",
  "from-blue-500 via-cyan-500 to-teal-400",
  "from-amber-400 via-orange-500 to-red-500",
  "from-slate-600 via-gray-700 to-purple-800",
  "from-red-500 via-rose-600 to-purple-700",
];
```

### Icon Reference

Common icons used throughout the app:

```typescript
import {
  Book, Upload, Save, Play, Pause, Heart, Share2,
  MessageCircle, Sparkles, Zap, DollarSign, Mic2,
  ChevronDown, ChevronLeft, ChevronRight, Plus, X,
  Settings, User, Library, Globe, TrendingUp, Home,
  Edit, Trash, Copy, Download, Search, Filter,
  Volume2, SkipForward, SkipBack, Maximize, Minimize,
  Clock, Calendar, Eye, EyeOff, Lock, Unlock,
  AlertCircle, Info, CheckCircle, ArrowLeft, ArrowRight
} from "lucide-react";
```

---

**End of Specification**

This document provides a complete blueprint for recreating the Audibler application. For implementation questions or clarifications, refer to the actual component code in the repository.
