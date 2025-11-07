# Audibler - Technical Documentation

**Version:** 1.0  
**Last Updated:** November 7, 2025  
**Status:** Active Development

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Data Models](#data-models)
4. [Core Workflows](#core-workflows)
5. [Component Library](#component-library)
6. [Design System](#design-system)
7. [State Management](#state-management)
8. [Integration Requirements](#integration-requirements)
9. [Implementation Guide](#implementation-guide)

---

## Overview

### Product Vision

Audibler is a social audiobook platform that transforms public-domain books into modern, conversational audiobooks by:

1. **Modernizing Language**: Using AI to update archaic language while preserving original meaning
2. **Generating Audio**: Converting modernized text to high-quality TTS audio
3. **Social Sharing**: Enabling users to create, share, and discover Editions and Clips
4. **Community Building**: Fostering a social platform around reimagined classic literature

### Core Philosophy

**Maximum Control over Simplicity**: The app prioritizes giving users complete control over text quality and audio generation, making sophisticated tools simply and conveniently accessible rather than minimizing clicks.

### Technology Stack

- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS v4.0
- **UI Components**: shadcn/ui component library
- **Icons**: Lucide React
- **Design Aesthetic**: 2025 glassmorphism with purple/pink gradients

---

## Architecture

### Application Structure

```
Audibler/
├── Core Upload Workflow
│   ├── Project Setup (2-step configuration)
│   ├── Chunk Review (modernization workspace)
│   └── Segment Builder (audio generation)
├── Social Platform
│   ├── Feed (social discovery)
│   ├── Editions (published audiobooks)
│   ├── Clips (shareable snippets)
│   └── Public Library (community content)
└── Playback & Editing
    ├── Audio Player
    └── Editor View
```

### View Hierarchy

```typescript
App (Root Container)
├── Header (Global Navigation)
└── Main Content (View Router)
    ├── upload-setup → ProjectSetup
    ├── chunk-review → ChunkReview
    ├── segment-builder → SegmentBuilder
    ├── feed → FeedView
    ├── editions → EditionsView
    ├── library → LibraryView
    ├── public-library → PublicLibraryView
    ├── clips → ClipCreator
    ├── audio-player → AudioPlayerView
    └── editor → EditorView
```

---

## Data Models

### Core Entities

#### 1. Book

```typescript
interface Book {
  id: string;
  title: string;
  author: string;
  publicationYear: number;
  genre: string[];
  coverUrl?: string;
  description?: string;
  sourceUrl?: string; // Gutenberg, etc.
  totalPages?: number;
  wordCount?: number;
  language: string;
}
```

#### 2. Project

```typescript
interface Project {
  id: string;
  bookId: string;
  userId: string;
  title: string;
  
  // Configuration
  modernizationStyle: "casual" | "formal" | "contemporary" | "custom";
  tonePreference: "conversational" | "literary" | "neutral";
  targetAudience: "general" | "young-adult" | "academic";
  customInstructions?: string;
  
  // Chunking Settings
  chunkingStrategy: "paragraph" | "scene" | "chapter" | "custom";
  maxChunkSize?: number; // characters
  
  // TTS Settings
  voice: string;
  speed: number; // 0.5 - 2.0
  pitch: number; // 0.5 - 2.0
  
  // Audio Segmentation
  targetSegmentDuration: number; // seconds
  chunksPerSegment: number; // calculated
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  status: "setup" | "chunking" | "modernizing" | "generating-audio" | "complete";
}
```

#### 3. Chunk

```typescript
interface Chunk {
  id: number;
  projectId: string;
  
  // Text Content
  originalText: string;
  modernizedText: string;
  
  // Metadata
  chapterNumber?: number;
  position: number; // Order in book
  
  // Metrics
  charCount: number;
  wordCount: number;
  tokenCount: number;
  
  // Processing
  status: "pending" | "processing" | "completed" | "failed";
  modernizationInstructions?: string;
  estimatedCost: number; // USD
  
  // Flags
  edited: boolean;
  flagged: boolean;
  batchId?: number;
}
```

#### 4. AudioSegment

```typescript
interface AudioSegment {
  id: number;
  projectId: string;
  
  // Composition
  name: string;
  chunkIds: number[];
  
  // Content Metrics
  totalChars: number;
  totalWords: number;
  estimatedDuration: number; // seconds
  estimatedCost: number; // USD
  
  // Generation
  status: "pending" | "processing" | "completed" | "failed";
  progress?: number; // 0-100 for processing
  errorMessage?: string;
  
  // Audio
  audioUrl?: string;
  actualDuration?: number;
  fileSize?: number; // bytes
  format?: "mp3" | "wav" | "ogg";
  
  // Timestamps
  createdAt?: Date;
  completedAt?: Date;
}
```

#### 5. Edition

```typescript
interface Edition {
  id: string;
  projectId: string;
  userId: string;
  bookId: string;
  
  // Metadata
  title: string;
  subtitle?: string;
  description: string;
  coverArtUrl: string;
  
  // Audio
  segments: AudioSegment[];
  totalDuration: number; // seconds
  totalSize: number; // bytes
  
  // Social
  isPublic: boolean;
  publishedAt?: Date;
  viewCount: number;
  likeCount: number;
  clipCount: number;
  
  // Tags & Discovery
  tags: string[];
  genre: string[];
  language: string;
}
```

#### 6. Clip

```typescript
interface Clip {
  id: string;
  editionId: string;
  userId: string;
  
  // Content
  title: string;
  description?: string;
  
  // Audio Selection
  startSegmentId: number;
  endSegmentId: number;
  startTime: number; // seconds within start segment
  endTime: number; // seconds within end segment
  duration: number; // total clip duration
  
  // Media
  audioUrl: string;
  waveformData?: number[];
  thumbnailUrl?: string;
  
  // Social
  isPublic: boolean;
  publishedAt?: Date;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  
  // Timestamps
  createdAt: Date;
}
```

#### 7. User

```typescript
interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  
  // Stats
  editionsCreated: number;
  clipsCreated: number;
  followersCount: number;
  followingCount: number;
  
  // Preferences
  defaultVoice?: string;
  defaultModernizationStyle?: string;
  
  // Timestamps
  joinedAt: Date;
}
```

---

## Core Workflows

### Workflow 1: Upload → Audio Generation

This is the primary workflow for creating an audiobook Edition.

#### Step 1: Project Setup (2-Step Configuration)

**Component**: `ProjectSetup.tsx`

**Purpose**: Configure book metadata and processing parameters before upload.

**User Journey**:

1. **Step 1 - Book Information**
   - Input: Title, Author, Publication Year
   - Input: Genre selection (multi-select)
   - Input: Custom cover upload or URL
   - Optional: Description, source URL

2. **Step 2 - Processing Configuration**
   - **Modernization Settings**:
     - Style preset: Casual | Formal | Contemporary | Custom
     - Tone: Conversational | Literary | Neutral
     - Target Audience: General | Young Adult | Academic
     - Custom instructions (textarea)
   
   - **Chunking Strategy**:
     - Strategy: Paragraph | Scene | Chapter | Custom
     - Max chunk size (characters): slider 500-5000
   
   - **Voice Settings**:
     - Voice selection: dropdown of available TTS voices
     - Speed: slider 0.5x - 2.0x
     - Pitch: slider 0.5x - 2.0x
     - Preview button (plays sample)

3. **Upload File**
   - Accept: .txt, .epub, .pdf
   - Parse and extract text
   - Create initial chunks based on strategy

**State Transitions**:
```
setup → chunking (processing) → chunk-review (ready)
```

#### Step 2: Chunk Review (Modernization Workspace)

**Component**: `ChunkReview.tsx`

**Purpose**: Review chunks, modernize text, and prepare for audio generation.

**Layout**: Two-panel design

**Left Panel - Chunk List**:
- Search and filter chunks
- Multi-select capability
- Status indicators:
  - 🟡 Pending (not modernized)
  - 🔵 Processing (modernization in progress)
  - 🟢 Completed (modernized)
  - 🔴 Failed (error occurred)

**Chunk Card Display**:
```
┌─────────────────────────────────────┐
│ [✓] Chunk #5          [Completed]   │
│     85 words                         │
│                                      │
│ Original: "Thou shalt not..."       │
│                                      │
│ ┌─────────────────────────────────┐ │
│ │ ✓ Modernized:                   │ │
│ │ "You shouldn't..."              │ │
│ └─────────────────────────────────┘ │
│                                      │
│ 450 chars • 95 tokens        [▼]   │
└─────────────────────────────────────┘
```

**Right Panel - Control Center**:
- **Modernization Instructions**: Editable textarea
- **Batch Actions**: 
  - "Modernize Selected" button
  - Shows count and estimated cost
- **Stats Display**:
  - Total chunks
  - Pending / Completed / Failed counts
  - Selected count
  - Estimated cost for selected

**Expanded Detail View** (when chunk clicked):
- Side-by-side comparison: Original | Modernized
- Instructions used for modernization
- Regenerate section:
  - New instructions textarea
  - "Regenerate" button for single chunk
- Metrics: chars, tokens, cost

**Top Actions**:
- "Back" button → returns to upload-setup
- "Modernize X" button → processes selected pending chunks
- "Create Segments" button → opens configuration dialog

**Modernization Process**:

1. User selects chunks (checkbox)
2. Optionally edits instructions
3. Clicks "Modernize X Chunks"
4. Status changes: pending → processing
5. Simulated API call to LLM (OpenAI, Anthropic, etc.)
6. Status changes: processing → completed
7. Modernized text appears in purple highlight box

**Configuration Dialog**: Triggered when "Create Segments" clicked

**Layout**:

```
┌──────────────────────────────────────────┐
│  Configure Audio Segments            [×] │
├──────────────────────────────────────────┤
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ 1️⃣ TARGET SEGMENT DURATION         │ │
│  │                                    │ │
│  │   How long should each segment be?│ │
│  │                                    │ │
│  │              60 seconds            │ │
│  │   ────────────●───────────────     │ │
│  │   15s               5m             │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ 2️⃣ CALCULATED GROUPING             │ │
│  │                                    │ │
│  │   Available Chunks        30       │ │
│  │   Chunks per Segment      ~3       │ │
│  │   ────────────────────────────     │ │
│  │   Total Segments          10       │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ 3️⃣ SUMMARY                         │ │
│  │                                    │ │
│  │   Target per Segment    1m 0s      │ │
│  │   Total Audio Duration  10m 30s    │ │
│  │   Avg Actual Duration   1m 3s      │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ℹ️  Note: Actual durations may vary    │
│     based on chunk boundaries.          │
│                                          │
│  [Cancel]      [Create 10 Segments] →  │
└──────────────────────────────────────────┘
```

**Calculation Logic**:

```typescript
// Calculate average chunk duration
const avgWordsPerChunk = totalWords / chunkCount;
const avgChunkDuration = (avgWordsPerChunk / 150) * 60; // 150 WPM

// Determine chunks per segment
const chunksPerSegment = Math.max(1, 
  Math.round(targetDuration / avgChunkDuration)
);

// Calculate total segments
const totalSegments = Math.ceil(chunkCount / chunksPerSegment);
```

#### Step 3: Segment Builder (Audio Generation)

**Component**: `SegmentBuilder.tsx`

**Purpose**: Group chunks into audio segments and generate TTS audio.

**Layout**: Two-panel design

**Left Panel - Source Chunks Reference**:
- Read-only list of modernized chunks
- Shows which chunks are available
- Preview of modernized text

**Right Panel - Audio Segments**:

Each segment card displays different states:

**State 1: PENDING** (Amber)
```
┌─────────────────────────────────────┐
│ [□] Segment 1             [pending] │
│     Chunks 1-3                      │
│                                      │
│     Chunks: 3                       │
│     Duration: 1m 15s                │
│     Cost: $0.0023                   │
│                                      │
│     Includes:                       │
│     #1: "You shouldn't fear..."     │
│     #2: "The old man walked..."     │
│     +1 more chunk                   │
│                                      │
│     [Waiting to generate...]        │
└─────────────────────────────────────┘
```

**State 2: PROCESSING** (Blue)
```
┌─────────────────────────────────────┐
│ [⟳] Segment 2          [processing] │
│     Chunks 4-6                      │
│                                      │
│     Generating audio...     67%     │
│     ▓▓▓▓▓▓▓▓▓▓▓░░░░░                │
│                                      │
│     Chunks: 3                       │
│     Duration: 1m 8s                 │
│     Cost: $0.0021                   │
└─────────────────────────────────────┘
```

**State 3: COMPLETED** (Green)
```
┌─────────────────────────────────────┐
│ [✓] Segment 3          [completed]  │
│     Chunks 7-9                      │
│                                      │
│     Chunks: 3                       │
│     Duration: 1m 12s                │
│     Cost: $0.0022                   │
│                                      │
│     Includes:                       │
│     #7: "The morning light..."      │
│     #8: "She walked through..."     │
│     +1 more chunk                   │
│                                      │
│     [▶ Preview]    [⬇ Download]     │
└─────────────────────────────────────┘
```

**State 4: FAILED** (Red)
```
┌─────────────────────────────────────┐
│ [!] Segment 4             [failed]  │
│     Chunks 10-12                    │
│                                      │
│  ⚠️ TTS generation failed:          │
│     Rate limit exceeded             │
│                                      │
│     Chunks: 3                       │
│     Duration: 1m 5s                 │
│     Cost: $0.0020                   │
│                                      │
│     [🔄 Retry]                       │
└─────────────────────────────────────┘
```

**Top Stats Bar**:
- Total Segments: 15
- Completed: 8
- Processing: 2
- Pending: 4
- Failed: 1
- Total Duration: 18m 45s
- Total Cost: $0.0453

**Overall Progress Bar**: Visual indicator of completion percentage

**Actions**:
- "Generate X Segments" → Starts TTS generation for pending segments
- "Preview" → Plays completed audio segment
- "Download" → Downloads individual segment
- "Retry" → Re-attempts failed segment generation

**Generation Process**:

1. User clicks "Generate X Segments"
2. Each pending segment transitions to processing
3. Progress bar animates (mock: 0% → 100%)
4. On completion:
   - Status: processing → completed
   - audioUrl populated
   - Preview/Download buttons enabled
5. On failure:
   - Status: processing → failed
   - errorMessage shown
   - Retry button enabled

---

### Workflow 2: Social Platform Features

#### Feed View

**Component**: `FeedView.tsx`

**Purpose**: Social discovery feed showing recent Editions and Clips.

**Content Cards**:

**Edition Card**:
```
┌─────────────────────────────────────┐
│ [Cover]  Pride and Prejudice        │
│  Image   Modern Edition             │
│          by @jane_austen_fan        │
│                                      │
│          "A fresh, conversational   │
│          take on the classic..."    │
│                                      │
│          🎧 2h 45m  💜 1.2k  📎 45   │
│                                      │
│          [▶ Play]  [Bookmark]       │
└─────────────────────────────────────┘
```

**Clip Card**:
```
┌─────────────────────────────────────┐
│ @user shared a clip                 │
│                                      │
│ "Mr. Darcy's Proposal"              │
│ from Pride and Prejudice            │
│                                      │
│ [Waveform Visualization]            │
│ ▁▂▃▅▇▅▃▂▁▂▃▅▇▅▃▂▁                   │
│                                      │
│ ⏱️ 0:45  💜 856  🔄 124              │
│                                      │
│ [▶ Play]  [Share]  [Save]           │
└─────────────────────────────────────┘
```

**Features**:
- Infinite scroll
- Filter: All | Following | Trending
- Sort: Recent | Popular | Trending

#### Public Library

**Component**: `PublicLibraryView.tsx`

**Purpose**: Browse community-created Editions.

**Grid Layout**: Masonry-style book covers

**Filters**:
- Genre
- Language
- Duration
- Popularity
- Recency

**Search**: Full-text search across titles, authors, descriptions

**Book Card** (on hover):
- Cover art
- Title & author
- Creator username
- Duration
- Like count
- Quick play button

#### Editions View

**Component**: `EditionsView.tsx`

**Purpose**: Manage user's created Editions.

**Layout**: Grid of Edition cards

**Edition Card**:
```
┌─────────────────────────────────────┐
│ [Cover Image]                       │
│                                      │
│ Pride and Prejudice                 │
│ Modern Casual Edition               │
│                                      │
│ Status: Published                   │
│ Duration: 2h 45m                    │
│ Segments: 48                        │
│                                      │
│ 👁️ 1.2k  💜 456  📎 23               │
│                                      │
│ [Edit] [Manage] [Analytics]         │
└─────────────────────────────────────┘
```

**Actions**:
- Create New Edition
- Edit existing
- Delete
- Publish/Unpublish
- View analytics

#### Clip Creator

**Component**: `ClipCreator.tsx`

**Purpose**: Extract and share audio clips from Editions.

**Layout**:

```
┌──────────────────────────────────────────┐
│  Edition: Pride and Prejudice            │
│                                          │
│  [Segment Timeline]                      │
│  ├──1──┼──2──┼──3──┼──4──┼──5──┤        │
│     ⎡━━━━━━━━━━━⎤                        │
│     Selected Range                       │
│                                          │
│  [Waveform]                              │
│  ▁▂▃▅▇█▇▅▃▂▁▂▃▅▇█▇▅▃▂▁                   │
│  │←─────────────→│                       │
│  0:23           1:45                     │
│                                          │
│  Title: [Mr. Darcy's Proposal]          │
│  Description: [Optional description...]  │
│                                          │
│  [Cancel]        [Create Clip] →        │
└──────────────────────────────────────────┘
```

**Features**:
- Visual segment selector
- Waveform visualization
- Precise start/end time selection
- Title and description
- Preview before creating
- Share options after creation

---

### Workflow 3: Audio Playback

#### Audio Player View

**Component**: `AudioPlayerView.tsx`

**Purpose**: Full-featured audio player for Editions.

**Layout**:

```
┌──────────────────────────────────────────┐
│                                          │
│         [Large Cover Art]                │
│                                          │
│         Pride and Prejudice              │
│         Modern Edition                   │
│         by Jane Austen                   │
│                                          │
│  ▁▂▃▅▇█▇▅▃▂▁▂▃▅▇█▇▅▃▂▁▂▃▅▇█▇▅▃▂          │
│  │                        ●│              │
│  0:00                          2:45:30   │
│                                          │
│  [⏮] [⏪] [▶/⏸] [⏩] [⏭]                  │
│                                          │
│  🔊 ────●────  1.0x  [≡ Queue]          │
│                                          │
│  Current Chapter: Chapter 5              │
│  Segment 12 of 48                        │
│                                          │
└──────────────────────────────────────────┘
```

**Features**:
- Play/pause
- Skip forward/back 15s
- Previous/next segment
- Volume control
- Playback speed (0.5x - 2.0x)
- Progress scrubbing
- Chapter markers
- Queue management
- Sleep timer
- Bookmarks

---

## Component Library

### Core Components

#### 1. ProjectSetup

**File**: `/components/ProjectSetup.tsx`

**Purpose**: Two-step wizard for project configuration

**Props**:
```typescript
interface ProjectSetupProps {
  onComplete: (config: ProjectConfig) => void;
  onCancel: () => void;
}
```

**State Management**:
```typescript
const [currentStep, setCurrentStep] = useState<1 | 2>(1);
const [bookInfo, setBookInfo] = useState<BookInfo>({});
const [processingConfig, setProcessingConfig] = useState<ProcessingConfig>({});
```

**Key Features**:
- Progress indicator (Step 1 of 2)
- Form validation per step
- "Next" / "Back" navigation
- File upload handling
- Voice preview

**Validation Rules**:
- Step 1: Title, Author required
- Step 2: All fields have defaults, none required
- File upload: Max 50MB, .txt/.epub/.pdf only

#### 2. ChunkReview

**File**: `/components/ChunkReview.tsx`

**Purpose**: Workspace for reviewing and modernizing chunks

**Props**:
```typescript
interface ChunkReviewProps {
  chunks: Chunk[];
  onBack: () => void;
  onEditChunk: (chunkId: number, newText: string) => void;
  onProceedToSegmentBuilder: (chunksPerSegment: number) => void;
  onModernizeChunks?: (chunkIds: number[], instructions: string) => void;
  onRegenerateChunk?: (chunkId: number, instructions: string) => void;
}
```

**State Management**:
```typescript
const [chunks, setChunks] = useState<Chunk[]>(initialChunks);
const [selectedChunkIds, setSelectedChunkIds] = useState<Set<number>>(new Set());
const [expandedChunkId, setExpandedChunkId] = useState<number | null>(null);
const [searchQuery, setSearchQuery] = useState("");
const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "completed" | "failed">("all");
const [modernizationInstructions, setModernizationInstructions] = useState(defaultInstructions);
const [showSegmentConfig, setShowSegmentConfig] = useState(false);
const [targetSegmentDuration, setTargetSegmentDuration] = useState(60);
```

**Computed Stats**:
```typescript
const stats = useMemo(() => ({
  totalPending: chunks.filter(c => c.status === "pending").length,
  totalCompleted: chunks.filter(c => c.status === "completed").length,
  totalFailed: chunks.filter(c => c.status === "failed").length,
  selectedCount: selectedChunkIds.size,
  selectedPending: /* pending chunks in selection */,
  totalWords: /* sum of words */,
  totalChars: /* sum of chars */,
  totalTokens: /* sum of tokens */,
  modernizationCost: /* estimated cost */,
}), [chunks, selectedChunkIds]);
```

**Segment Configuration**:
```typescript
const segmentConfig = useMemo(() => {
  const avgWordsPerChunk = totalWords / completedCount;
  const avgChunkDuration = (avgWordsPerChunk / 150) * 60;
  const chunksPerSegment = Math.max(1, Math.round(targetDuration / avgChunkDuration));
  const totalSegments = Math.ceil(completedCount / chunksPerSegment);
  
  return { chunksPerSegment, totalSegments, /* ... */ };
}, [chunks, targetSegmentDuration]);
```

#### 3. SegmentBuilder

**File**: `/components/SegmentBuilder.tsx`

**Purpose**: Create and generate audio segments from chunks

**Props**:
```typescript
interface SegmentBuilderProps {
  chunks: Chunk[];
  chunksPerSegment: number;
  onBack: () => void;
  onGenerateAudio: (segments: AudioSegment[]) => void;
}
```

**State Management**:
```typescript
const [audioSegments, setAudioSegments] = useState<AudioSegment[]>(() => {
  // Generate segments from chunks
  const segments: AudioSegment[] = [];
  for (let i = 0; i < modernizedChunks.length; i += chunksPerSegment) {
    const segmentChunks = modernizedChunks.slice(i, i + chunksPerSegment);
    segments.push(createSegment(segmentChunks, i));
  }
  return segments;
});

const [playingSegmentId, setPlayingSegmentId] = useState<number | null>(null);
```

**Segment Creation Logic**:
```typescript
function createSegment(chunks: Chunk[], index: number): AudioSegment {
  const totalChars = chunks.reduce((sum, c) => sum + c.charCount, 0);
  const totalWords = chunks.reduce((sum, c) => sum + c.wordCount, 0);
  const estimatedDuration = Math.ceil((totalWords / 150) * 60);
  const estimatedCost = (totalChars / 1000000) * 15; // $15 per 1M chars
  
  return {
    id: index,
    name: `Segment ${index + 1}`,
    chunkIds: chunks.map(c => c.id),
    totalChars,
    totalWords,
    estimatedDuration,
    estimatedCost,
    status: determineInitialStatus(index),
  };
}
```

**Generation Simulation**:
```typescript
const handleGenerate = () => {
  pendingSegments.forEach((segment, index) => {
    setTimeout(() => {
      // Set to processing
      setAudioSegments(prev => prev.map(s =>
        s.id === segment.id 
          ? { ...s, status: "processing", progress: 0 }
          : s
      ));

      // Animate progress
      const interval = setInterval(() => {
        setAudioSegments(prev => {
          const seg = prev.find(s => s.id === segment.id);
          if (seg.progress >= 100) {
            clearInterval(interval);
            return prev.map(s =>
              s.id === segment.id
                ? { ...s, status: "completed", audioUrl: `mock-${s.id}.mp3` }
                : s
            );
          }
          return prev.map(s =>
            s.id === segment.id
              ? { ...s, progress: s.progress + 15 }
              : s
          );
        });
      }, 500);
    }, index * 1000);
  });
};
```

#### 4. Header

**File**: `/components/Header.tsx`

**Purpose**: Global navigation and branding

**Layout**:
```
┌─────────────────────────────────────────────┐
│ 🎧 Audibler    Feed  Library  Editions  ... │
│                              [@username] [⚙️] │
└─────────────────────────────────────────────┘
```

**Navigation Items**:
- Feed
- Public Library
- My Library (user's editions)
- Clips
- Upload (primary CTA)

**User Menu**:
- Profile
- Settings
- Logout

#### 5. BookCard

**File**: `/components/BookCard.tsx`

**Purpose**: Reusable card component for displaying books/editions

**Props**:
```typescript
interface BookCardProps {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  creator?: string;
  duration?: number;
  likeCount?: number;
  clipCount?: number;
  viewCount?: number;
  onPlay?: () => void;
  onBookmark?: () => void;
  variant?: "feed" | "library" | "grid";
}
```

**Variants**:
- **feed**: Full details with social stats
- **library**: Compact with management actions
- **grid**: Cover-focused for browsing

---

## Design System

### Color Palette

**Primary Gradient**:
```css
/* Purple to Pink */
background: linear-gradient(to right, #9333ea, #ec4899);

/* Color tokens */
--purple-50: #faf5ff;
--purple-600: #9333ea;
--purple-700: #7e22ce;
--pink-50: #fdf2f8;
--pink-600: #ec4899;
--pink-700: #be185d;
```

**Status Colors**:
```css
/* Pending */
--amber-50: #fffbeb;
--amber-600: #d97706;
--amber-700: #b45309;

/* Processing */
--blue-50: #eff6ff;
--blue-600: #2563eb;
--blue-700: #1d4ed8;

/* Completed */
--emerald-50: #ecfdf5;
--emerald-600: #059669;
--emerald-700: #047857;

/* Failed */
--red-50: #fef2f2;
--red-600: #dc2626;
--red-700: #b91c1c;
```

**Neutrals**:
```css
--neutral-50: #fafafa;
--neutral-100: #f5f5f5;
--neutral-600: #525252;
--neutral-900: #171717;
```

### Glassmorphism Effect

**Standard Glass Panel**:
```css
.glass-panel {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
```

**Ambient Background Blur**:
```tsx
<div className="fixed inset-0 overflow-hidden pointer-events-none">
  <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl" />
  <div className="absolute top-1/2 -left-40 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl" />
</div>
```

### Typography

**Font Stack**: System default (no custom fonts)

**Hierarchy**:
```css
/* Headers */
h1: text-3xl sm:text-4xl /* 30px/36px → 40px/48px */
h2: text-2xl sm:text-3xl /* 24px/32px → 30px/36px */
h3: text-xl sm:text-2xl /* 20px/28px → 24px/32px */
h4: text-lg sm:text-xl /* 18px/28px → 20px/28px */
h5: text-base sm:text-lg /* 16px/24px → 18px/28px */

/* Body */
p: text-base /* 16px/24px */
small: text-sm /* 14px/20px */
caption: text-xs /* 12px/16px */

/* Tabular Numbers */
.tabular-nums /* For stats, durations, costs */
```

**Important**: Do NOT override typography with Tailwind classes unless explicitly requested. The app uses semantic HTML with default styling from `globals.css`.

### Spacing System

**Padding/Margin Scale**:
```
p-1: 4px
p-2: 8px
p-3: 12px
p-4: 16px
p-6: 24px
p-8: 32px
```

**Gap Scale** (for flex/grid):
```
gap-2: 8px
gap-3: 12px
gap-4: 16px
gap-6: 24px
```

### Border Radius

```css
rounded-lg: 8px   /* Cards, buttons */
rounded-xl: 12px  /* Larger cards, panels */
rounded-full: 9999px /* Avatars, pills */
```

### Shadows

```css
/* Elevation */
shadow-sm: 0 1px 2px rgba(0,0,0,0.05)
shadow: 0 1px 3px rgba(0,0,0,0.1)
shadow-lg: 0 10px 15px rgba(0,0,0,0.1)
shadow-xl: 0 20px 25px rgba(0,0,0,0.1)

/* Glow effects */
shadow-purple-500/25: 0 0 25px rgba(147,51,234,0.25)
shadow-emerald-500/25: 0 0 25px rgba(5,150,105,0.25)
```

### Animations & Transitions

**Hover Effects**:
```css
transition-all duration-200
hover:scale-105
hover:shadow-xl
```

**Loading States**:
```tsx
<Loader2 className="w-5 h-5 animate-spin" />
```

**Progress Bars**:
```tsx
<Progress value={67} className="h-2" />
```

---

## State Management

### App-Level State

**File**: `/App.tsx`

```typescript
const [currentView, setCurrentView] = useState<ViewType>("upload-setup");
const [currentProject, setCurrentProject] = useState<Project | null>(null);
const [chunks, setChunks] = useState<Chunk[]>([]);
const [audioSegments, setAudioSegments] = useState<AudioSegment[]>([]);
const [segmentConfig, setSegmentConfig] = useState({ chunksPerSegment: 3 });
```

### View Routing Logic

```typescript
const renderView = () => {
  switch (currentView) {
    case "upload-setup":
      return <ProjectSetup onComplete={handleSetupComplete} />;
    case "chunk-review":
      return (
        <ChunkReview
          chunks={chunks}
          onBack={() => setCurrentView("upload-setup")}
          onProceedToSegmentBuilder={(cps) => {
            setSegmentConfig({ chunksPerSegment: cps });
            setCurrentView("segment-builder");
          }}
        />
      );
    case "segment-builder":
      return (
        <SegmentBuilder
          chunks={chunks}
          chunksPerSegment={segmentConfig.chunksPerSegment}
          onBack={() => setCurrentView("chunk-review")}
          onGenerateAudio={handleAudioGeneration}
        />
      );
    // ... other views
  }
};
```

### Data Flow

**Upload → Chunk → Segment → Edition**:

```
1. ProjectSetup
   ↓ onComplete(config)
   └─→ Create Project
       └─→ Parse uploaded file
           └─→ Generate Chunks
               └─→ Navigate to ChunkReview

2. ChunkReview
   ↓ Select & Modernize
   └─→ Update Chunk.modernizedText
       └─→ Configure segment duration
           └─→ Navigate to SegmentBuilder

3. SegmentBuilder
   ↓ Generate TTS
   └─→ Create AudioSegments
       └─→ Generate audio files
           └─→ Create Edition
```

### Local Storage Persistence

**Keys**:
```typescript
localStorage.setItem("audibler:currentProject", JSON.stringify(project));
localStorage.setItem("audibler:chunks", JSON.stringify(chunks));
localStorage.setItem("audibler:segments", JSON.stringify(segments));
```

**Recovery**:
```typescript
useEffect(() => {
  const savedProject = localStorage.getItem("audibler:currentProject");
  if (savedProject) {
    setCurrentProject(JSON.parse(savedProject));
  }
}, []);
```

---

## Integration Requirements

### External APIs

#### 1. Text Modernization (LLM)

**Provider Options**: OpenAI, Anthropic, Cohere

**Example Request** (OpenAI):
```typescript
const response = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${API_KEY}`,
  },
  body: JSON.stringify({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: modernizationInstructions,
      },
      {
        role: "user",
        content: `Modernize this text:\n\n${originalText}`,
      },
    ],
    temperature: 0.7,
  }),
});

const data = await response.json();
const modernizedText = data.choices[0].message.content;
```

**Cost Calculation**:
```typescript
// GPT-4: $0.03/1K input tokens, $0.06/1K output tokens
const estimateCost = (text: string) => {
  const tokens = Math.ceil(text.length / 4); // rough estimate
  const inputCost = (tokens / 1000) * 0.03;
  const outputCost = (tokens / 1000) * 0.06;
  return inputCost + outputCost;
};
```

#### 2. Text-to-Speech (TTS)

**Provider Options**: ElevenLabs, Google Cloud TTS, Azure Speech

**Example Request** (ElevenLabs):
```typescript
const response = await fetch(
  `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
  {
    method: "POST",
    headers: {
      "Accept": "audio/mpeg",
      "Content-Type": "application/json",
      "xi-api-key": API_KEY,
    },
    body: JSON.stringify({
      text: modernizedText,
      model_id: "eleven_monolingual_v1",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.5,
      },
    }),
  }
);

const audioBlob = await response.blob();
const audioUrl = URL.createObjectURL(audioBlob);
```

**Cost Calculation**:
```typescript
// ElevenLabs: ~$0.30/1K characters
const estimateTTSCost = (text: string) => {
  const chars = text.length;
  return (chars / 1000) * 0.30;
};
```

#### 3. File Storage

**Provider**: AWS S3, Google Cloud Storage, Cloudflare R2

**Upload Audio**:
```typescript
const uploadAudio = async (file: Blob, segmentId: number) => {
  const formData = new FormData();
  formData.append("file", file, `segment-${segmentId}.mp3`);
  
  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });
  
  const { url } = await response.json();
  return url;
};
```

#### 4. Database

**Provider**: Supabase, Firebase, PostgreSQL

**Schema**:

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  modernization_style TEXT,
  voice TEXT,
  speed DECIMAL,
  pitch DECIMAL,
  target_segment_duration INTEGER,
  chunks_per_segment INTEGER,
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Chunks
CREATE TABLE chunks (
  id SERIAL PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  position INTEGER,
  original_text TEXT,
  modernized_text TEXT,
  char_count INTEGER,
  word_count INTEGER,
  token_count INTEGER,
  status TEXT,
  estimated_cost DECIMAL
);

-- Audio Segments
CREATE TABLE audio_segments (
  id SERIAL PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  name TEXT,
  chunk_ids INTEGER[],
  total_chars INTEGER,
  total_words INTEGER,
  estimated_duration INTEGER,
  actual_duration INTEGER,
  audio_url TEXT,
  status TEXT,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Editions
CREATE TABLE editions (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Clips
CREATE TABLE clips (
  id UUID PRIMARY KEY,
  edition_id UUID REFERENCES editions(id),
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  start_segment_id INTEGER,
  end_segment_id INTEGER,
  start_time INTEGER,
  end_time INTEGER,
  duration INTEGER,
  audio_url TEXT,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Implementation Guide

### Getting Started

**1. Clone and Install**:
```bash
git clone <repository>
cd audibler
npm install
```

**2. Environment Variables**:
```env
# API Keys
VITE_OPENAI_API_KEY=sk-...
VITE_ELEVENLABS_API_KEY=...

# Database
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...

# Storage
VITE_S3_BUCKET=audibler-audio
VITE_S3_REGION=us-east-1
```

**3. Run Development Server**:
```bash
npm run dev
```

### Project Structure Best Practices

**Component Organization**:
```
/components
  /ui              # shadcn components (DO NOT MODIFY)
  /figma           # System components (DO NOT MODIFY)
  /*.tsx           # Feature components
```

**Naming Conventions**:
- Components: PascalCase (`ChunkReview.tsx`)
- Types: PascalCase (`AudioSegment`)
- Functions: camelCase (`handleGenerate`)
- Constants: UPPER_SNAKE_CASE (`DEFAULT_VOICE`)

**Type Safety**:
```typescript
// Always define prop types
interface ComponentProps {
  required: string;
  optional?: number;
  callback: (id: string) => void;
}

// Use discriminated unions for status
type Status = "pending" | "processing" | "completed" | "failed";

// Export types for reuse
export type { Chunk, AudioSegment, Edition };
```

### Mock Data vs Real Implementation

**Current State**: App uses mock data with simulated API calls

**To Integrate Real APIs**:

1. Replace mock functions with actual API calls:
```typescript
// Before (mock)
setTimeout(() => {
  setChunks(prev => prev.map(c => ({
    ...c,
    modernizedText: mockModernize(c.originalText),
  })));
}, 2000);

// After (real)
const response = await fetch("/api/modernize", {
  method: "POST",
  body: JSON.stringify({ text: c.originalText, instructions }),
});
const { modernizedText } = await response.json();
setChunks(prev => prev.map(c => ({ ...c, modernizedText })));
```

2. Replace mock costs with actual pricing:
```typescript
// Real cost calculation
const cost = await calculateActualCost(text, provider);
```

3. Replace mock audio URLs with real storage URLs:
```typescript
// Real audio generation
const audioBlob = await generateTTS(text, voice);
const audioUrl = await uploadToStorage(audioBlob);
```

### Performance Considerations

**Chunking Large Books**:
- Process chunks in batches (10-20 at a time)
- Use background workers for text processing
- Implement progress tracking

**Audio Generation**:
- Queue system for TTS requests
- Rate limiting compliance
- Concurrent segment generation (3-5 at a time)
- Progress streaming from backend

**UI Optimization**:
- Virtual scrolling for large chunk lists
- Lazy loading for segment cards
- Debounced search/filter
- Optimistic UI updates

### Testing Strategy

**Unit Tests**:
```typescript
describe("Segment Configuration", () => {
  it("calculates chunks per segment correctly", () => {
    const result = calculateSegmentConfig({
      targetDuration: 60,
      avgChunkDuration: 20,
      totalChunks: 30,
    });
    
    expect(result.chunksPerSegment).toBe(3);
    expect(result.totalSegments).toBe(10);
  });
});
```

**Integration Tests**:
- Upload flow: Setup → Review → Builder
- Modernization: Select → Process → Complete
- Generation: Configure → Generate → Download

**E2E Tests**:
- Complete audiobook creation workflow
- Social features (feed, clips, library)
- User authentication and authorization

---

## Future Enhancements

### Planned Features

1. **Real-time Collaboration**
   - Multiple users editing same project
   - Comment system on chunks
   - Version history

2. **Advanced Audio Editing**
   - Trim/cut segments
   - Adjust speed per segment
   - Add background music
   - Normalize volume

3. **Quality Assurance**
   - Automated text quality checks
   - Audio quality validation
   - A/B testing for modernization

4. **Analytics Dashboard**
   - Listening statistics
   - Engagement metrics
   - Cost tracking
   - Performance insights

5. **Mobile Apps**
   - iOS native app
   - Android native app
   - Offline playback
   - Background downloads

### Technical Debt

- Replace mock data with real API integrations
- Implement proper error boundaries
- Add comprehensive loading states
- Improve accessibility (ARIA labels, keyboard navigation)
- Add internationalization (i18n)
- Implement proper caching strategy
- Add service worker for offline support

---

## Appendix

### Glossary

- **Chunk**: A segment of the original book text, typically a paragraph or scene
- **Modernization**: The process of updating archaic language to contemporary style
- **Segment**: An audio file containing one or more modernized chunks
- **Edition**: A complete audiobook project with all segments
- **Clip**: A short excerpt from an Edition, shareable on the social feed

### Reference Links

- shadcn/ui: https://ui.shadcn.com/
- Tailwind CSS: https://tailwindcss.com/
- Lucide Icons: https://lucide.dev/
- React Hook Form: https://react-hook-form.com/

### Change Log

**v1.0** (November 7, 2025)
- Initial upload workflow (Setup → Review → Builder)
- Duration-based segment configuration
- Audio segment builder with status states
- Mock data implementation

---

**End of Documentation**

For questions or contributions, please refer to the project repository.
