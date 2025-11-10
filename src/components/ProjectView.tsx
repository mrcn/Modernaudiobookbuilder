import { useState, useRef, useEffect, useMemo } from "react";
import { ArrowLeft, FileText, Music2, Settings, Edit2, Check, X, Download, Sparkles, BookOpen, ChevronRight, Play, Pause, Volume2, SkipForward, SkipBack } from "lucide-react";
import { Book } from "../App";
import { Chunk } from "./ChunkReview";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Slider } from "./ui/slider";

type ProjectViewProps = {
  book: Book;
  chunks: Chunk[];
  onBack: () => void;
  onUpdateBook: (bookId: string, updates: Partial<Book>) => void;
  onEditChunk: (chunkId: number, newText: string) => void;
  onModernizeMoreChunks: (count?: number) => void;
  onGenerateAudio: () => void;
};

export function ProjectView({
  book,
  chunks,
  onBack,
  onUpdateBook,
  onEditChunk,
  onModernizeMoreChunks,
  onGenerateAudio,
}: ProjectViewProps) {
  const [activeTab, setActiveTab] = useState<"text" | "audio" | "settings">("text");
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(false);
  const [tempTitle, setTempTitle] = useState(book?.title || "");
  const [tempAuthor, setTempAuthor] = useState(book?.author || "");

  console.log("🎬 ProjectView rendering with:", { 
    bookTitle: book?.title, 
    chunkCount: chunks?.length,
    bookId: book?.id 
  });

  // Safety check after hooks
  if (!book || !chunks) {
    console.error("❌ ProjectView: Missing book or chunks!", { book, chunks });
    return (
      <div className="h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-xl mb-2">Error loading project</p>
          <p className="text-sm text-neutral-500">Book or chunks data is missing</p>
        </div>
      </div>
    );
  }

  // Calculate stats
  const textStats = {
    totalChunks: chunks.length,
    completedChunks: chunks.filter(c => c.status === "completed").length,
    pendingChunks: chunks.filter(c => c.status === "pending").length,
    totalWords: chunks.reduce((sum, c) => sum + c.wordCount, 0),
  };

  const audioStats = {
    totalTracks: book.audioSegments?.length || 0,
    totalDuration: book.audioSegments?.reduce((sum, seg) => sum + seg.duration, 0) || 0,
  };

  const handleSaveTitle = () => {
    onUpdateBook(book.id, { title: tempTitle });
    setEditingTitle(false);
  };

  const handleCancelTitle = () => {
    setTempTitle(book.title);
    setEditingTitle(false);
  };

  const handleSaveAuthor = () => {
    onUpdateBook(book.id, { author: tempAuthor });
    setEditingAuthor(false);
  };

  const handleCancelAuthor = () => {
    setTempAuthor(book.author);
    setEditingAuthor(false);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 relative overflow-hidden">
      {/* Vignette Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-10"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.6) 100%)'
        }}
      />

      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-20 h-full flex flex-col">
        {/* Header - Project Info */}
        <div className="flex-none bg-neutral-900/80 backdrop-blur-xl border-b border-white/5">
          <div className="px-6 py-4">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-neutral-400 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
              </button>

              <div className="flex-1">
                <p className="text-xs text-neutral-500 mb-1">Project</p>
                
                {/* Editable Title */}
                {editingTitle ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                      className="text-xl border-2 border-purple-500 bg-neutral-800/50 text-white"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveTitle();
                        if (e.key === 'Escape') handleCancelTitle();
                      }}
                    />
                    <button
                      onClick={handleSaveTitle}
                      className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                    >
                      <Check className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={handleCancelTitle}
                      className="p-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingTitle(true);
                      setTempTitle(book.title);
                    }}
                    className="group flex items-center gap-2 text-xl text-white hover:text-purple-300 transition-colors"
                  >
                    <span>{book.title}</span>
                    <Edit2 className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2.5} />
                  </button>
                )}

                {/* Editable Author */}
                {editingAuthor ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={tempAuthor}
                      onChange={(e) => setTempAuthor(e.target.value)}
                      className="text-sm border-2 border-purple-500 bg-neutral-800/50 text-neutral-300"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveAuthor();
                        if (e.key === 'Escape') handleCancelAuthor();
                      }}
                    />
                    <button
                      onClick={handleSaveAuthor}
                      className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={handleCancelAuthor}
                      className="p-1.5 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
                    >
                      <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingAuthor(true);
                      setTempAuthor(book.author);
                    }}
                    className="group flex items-center gap-2 text-sm text-neutral-400 hover:text-purple-300 transition-colors mt-1"
                  >
                    <span>by {book.author}</span>
                    <Edit2 className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2.5} />
                  </button>
                )}
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-3">
                <Badge 
                  variant="outline" 
                  className={`${
                    book.status === "audio-ready" 
                      ? "border-emerald-500/50 bg-emerald-950/30 text-emerald-300"
                      : book.status === "modernized"
                      ? "border-purple-500/50 bg-purple-950/30 text-purple-300"
                      : "border-amber-500/50 bg-amber-950/30 text-amber-300"
                  }`}
                >
                  {book.status === "audio-ready" ? "Audio Ready" : 
                   book.status === "modernized" ? "Text Modernized" : 
                   "Processing"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex-none bg-neutral-900/60 backdrop-blur-xl border-b border-white/5">
          <div className="px-6">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
              <TabsList className="w-full justify-start bg-transparent border-0 p-0 h-auto">
                <TabsTrigger 
                  value="text"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none px-6 py-3 text-neutral-400 data-[state=active]:text-white"
                >
                  <FileText className="w-4 h-4 mr-2" strokeWidth={2.5} />
                  Text Review
                  {textStats.pendingChunks > 0 && (
                    <Badge variant="outline" className="ml-2 border-amber-500/50 bg-amber-950/30 text-amber-300 text-xs">
                      {textStats.pendingChunks} pending
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="audio"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none px-6 py-3 text-neutral-400 data-[state=active]:text-white"
                >
                  <Music2 className="w-4 h-4 mr-2" strokeWidth={2.5} />
                  Audio Files
                  {audioStats.totalTracks > 0 && (
                    <Badge variant="outline" className="ml-2 border-emerald-500/50 bg-emerald-950/30 text-emerald-300 text-xs">
                      {audioStats.totalTracks}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="settings"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none px-6 py-3 text-neutral-400 data-[state=active]:text-white"
                >
                  <Settings className="w-4 h-4 mr-2" strokeWidth={2.5} />
                  Settings
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {activeTab === "text" && (
            <TextReviewTab 
              chunks={chunks}
              onEditChunk={onEditChunk}
              onModernizeMore={onModernizeMoreChunks}
              setActiveTab={setActiveTab}
            />
          )}
          {activeTab === "audio" && (
            <AudioFilesTab 
              book={book}
              chunks={chunks}
              onGenerateAudio={onGenerateAudio}
            />
          )}
          {activeTab === "settings" && (
            <SettingsTab book={book} />
          )}
        </div>
      </div>
    </div>
  );
}

// Chapter detection helper
type Chapter = {
  id: number;
  title: string;
  chunkIndex: number;
};

function detectChapters(chunks: Chunk[]): Chapter[] {
  const chapters: Chapter[] = [];
  
  chunks.forEach((chunk, index) => {
    const text = chunk.originalText;
    const firstLines = text.split('\n').slice(0, 5).join('\n');
    
    // Comprehensive chapter detection patterns for classical and modern texts
    const patterns = [
      /^BOOK\s+([IVXLCDM]+|ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE|TEN|[0-9]+)/im,
      /^CHAPTER\s+([IVXLCDM]+|ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE|TEN|[0-9]+)/im,
      /^PART\s+([IVXLCDM]+|ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE|TEN|[0-9]+)/im,
      /^SECTION\s+([IVXLCDM]+|[0-9]+)/im,
      /^([IVXLCDM]+)\.\s*$/m,
      /^([0-9]+)\.\s+[A-Z]/m,
      /^\[(?:BOOK|CHAPTER|PART)\s+([IVXLCDM]+|[0-9]+)\]/im,
      /^(BOOK\s+[IVXLCDM]+):/im,
      /^(?:VOLUME|VOL\.?)\s+([IVXLCDM]+|[0-9]+)/im,
    ];
    
    let matched = false;
    for (const pattern of patterns) {
      const match = firstLines.match(pattern);
      if (match) {
        let title = match[0].trim().replace(/[\[\]]/g, '').replace(/\s+/g, ' ');
        if (/^([IVXLCDM]+|[0-9]+)\.$/.test(title)) {
          title = `Section ${title}`;
        }
        chapters.push({ id: chunk.id, title: title, chunkIndex: index });
        matched = true;
        break;
      }
    }
    
    if (!matched) {
      const subsectionMatch = firstLines.match(/^([IVXLCDM]+)\.\s+/m);
      if (subsectionMatch && subsectionMatch[1].length <= 4) {
        chapters.push({ id: chunk.id, title: `Section ${subsectionMatch[1]}`, chunkIndex: index });
      }
    }
  });
  
  // If no chapters detected, create sections every 5 chunks using actual text
  if (chapters.length === 0) {
    for (let i = 0; i < chunks.length; i += 5) {
      const chunk = chunks[i];
      const lines = chunk.originalText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const firstLine = lines[0] || '';
      
      // Use first line if it's a reasonable length and looks like a heading
      let title = `Section ${Math.floor(i / 5) + 1}`;
      if (firstLine.length > 0 && firstLine.length < 80) {
        // Clean up the title - remove quotes, asterisks, etc.
        const cleanedTitle = firstLine.replace(/^[*_"']+|[*_"']+$/g, '').trim();
        if (cleanedTitle.length > 0) {
          title = cleanedTitle.length > 50 ? cleanedTitle.slice(0, 47) + '...' : cleanedTitle;
        }
      }
      
      chapters.push({
        id: chunk.id,
        title: title,
        chunkIndex: i,
      });
    }
  }
  
  return chapters;
}

// Text Review Tab Component
function TextReviewTab({ 
  chunks, 
  onEditChunk, 
  onModernizeMore,
  setActiveTab
}: { 
  chunks: Chunk[]; 
  onEditChunk: (chunkId: number, newText: string) => void;
  onModernizeMore: (count?: number) => void;
  setActiveTab: (tab: "text" | "audio" | "settings") => void;
}) {
  const completedChunks = chunks.filter(c => c.status === "completed");
  const pendingChunks = chunks.filter(c => c.status === "pending");
  const nextBatchSize = Math.min(10, pendingChunks.length);
  const nextBatchIds = pendingChunks.slice(0, nextBatchSize).map(c => c.id);
  
  const [activeChapter, setActiveChapter] = useState<number | null>(null);
  const chunkRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const modernizedScrollRef = useRef<HTMLDivElement | null>(null);
  const isSyncingScroll = useRef(false);
  
  // Detect chapters
  const chapters = detectChapters(chunks);
  
  // Synchronized scroll handlers
  const handleOriginalScroll = () => {
    if (isSyncingScroll.current) return;
    
    const originalContainer = scrollContainerRef.current;
    const modernizedContainer = modernizedScrollRef.current;
    
    if (originalContainer && modernizedContainer) {
      isSyncingScroll.current = true;
      modernizedContainer.scrollTop = originalContainer.scrollTop;
      requestAnimationFrame(() => {
        isSyncingScroll.current = false;
      });
    }
  };
  
  const handleModernizedScroll = () => {
    if (isSyncingScroll.current) return;
    
    const originalContainer = scrollContainerRef.current;
    const modernizedContainer = modernizedScrollRef.current;
    
    if (originalContainer && modernizedContainer) {
      isSyncingScroll.current = true;
      originalContainer.scrollTop = modernizedContainer.scrollTop;
      requestAnimationFrame(() => {
        isSyncingScroll.current = false;
      });
    }
  };
  
  // Scroll to chapter
  const scrollToChapter = (chunkId: number) => {
    const element = chunkRefs.current[chunkId];
    if (element && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const elementTop = element.offsetTop;
      const offset = 100; // Offset from top
      
      container.scrollTo({
        top: elementTop - offset,
        behavior: 'smooth'
      });
      
      setActiveChapter(chunkId);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Batch Conversion Controls - Moved to Top */}
      {pendingChunks.length > 0 && (
        <div className="flex-none border-b border-white/5 bg-neutral-900/90 backdrop-blur-md">
          <div className="px-6 py-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-purple-400" strokeWidth={2.5} />
                  <div>
                    <p className="text-xs text-purple-300">Batch Conversion</p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">
                      {completedChunks.length} completed · {pendingChunks.length} remaining
                    </p>
                  </div>
                </div>
                
                {/* Total word count */}
                <div className="text-right">
                  <p className="text-[10px] text-neutral-500">Total Words</p>
                  <p className="text-xs text-emerald-300 tabular-nums">
                    {chunks.reduce((sum, c) => sum + c.wordCount, 0).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[0.1, 0.25, 0.5, 1].map((percent, idx) => {
                  const count = percent === 1 ? pendingChunks.length : Math.ceil(pendingChunks.length * percent);
                  const words = pendingChunks.slice(0, count).reduce((sum, c) => sum + c.wordCount, 0);
                  const minutes = Math.round(words / 150);
                  const label = percent === 1 ? 'All' : `${percent * 100}%`;
                  
                  return (
                    <button 
                      key={idx}
                      onClick={() => onModernizeMore(count)}
                      className={`group relative px-3 py-2 rounded-lg transition-all duration-200 ${
                        percent === 1
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl hover:shadow-purple-500/25 hover:scale-105'
                          : 'bg-gradient-to-br from-purple-600/10 to-pink-600/10 hover:from-purple-600/20 hover:to-pink-600/20 border border-purple-500/30 hover:border-purple-500/50 text-white hover:shadow-lg hover:shadow-purple-500/20'
                      }`}
                    >
                      {percent === 1 && (
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                      )}
                      <div className={`${percent === 1 ? 'relative z-10' : ''} space-y-0.5`}>
                        <div className={`text-xs font-medium ${percent === 1 ? 'text-white' : 'text-purple-300'}`}>
                          {label}
                        </div>
                        <div className={`text-[10px] ${percent === 1 ? 'opacity-90' : 'text-neutral-400'}`}>
                          {count} · ~{minutes}m
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              
              {/* LLM API Cost Estimates */}
              <div className="pt-3 border-t border-white/5">
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[0.1, 0.25, 0.5, 1].map((percent, idx) => {
                    const count = percent === 1 ? pendingChunks.length : Math.ceil(pendingChunks.length * percent);
                    const words = pendingChunks.slice(0, count).reduce((sum, c) => sum + c.wordCount, 0);
                    const tokens = Math.round(words * 1.3);
                    const cost = ((tokens * 2 * 0.003) / 1000);
                    const displayCost = cost < 0.01 ? '<$0.01' : `$${cost.toFixed(2)}`;
                    
                    return (
                      <p key={idx} className="text-[9px] text-amber-400/70">
                        ~{displayCost}
                      </p>
                    );
                  })}
                </div>
                <p className="text-[9px] text-neutral-600 text-center mt-1">
                  Estimated LLM API cost (Claude Sonnet 4)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex-1 flex gap-0 min-h-0 overflow-hidden">
        {/* Chapter Navigation Sidebar */}
        <div className="w-64 flex-shrink-0 flex flex-col border-r border-white/5 bg-neutral-900/60 backdrop-blur-sm">
          <div className="flex-none px-4 py-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-400" strokeWidth={2.5} />
              <h4 className="text-xs uppercase tracking-wider text-purple-300">Chapters</h4>
            </div>
          </div>
          
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              <div className="p-2 space-y-1">
                {chapters.map((chapter, index) => (
                <button
                  key={chapter.id}
                  onClick={() => scrollToChapter(chapter.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-all group ${
                    activeChapter === chapter.id
                      ? 'bg-purple-600/20 border border-purple-500/40 text-purple-300'
                      : 'hover:bg-white/5 text-neutral-400 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs truncate">{chapter.title}</p>
                      <p className="text-[10px] text-neutral-500 mt-0.5">
                        Chunk {chapter.chunkIndex + 1}
                      </p>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ml-2 transition-transform ${
                      activeChapter === chapter.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
                    }`} strokeWidth={2.5} />
                  </div>
                </button>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          <div className="flex-none px-4 py-3 border-t border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-neutral-500 uppercase tracking-wider">
                {chapters.length} {chapters.length === 1 ? 'Chapter' : 'Chapters'}
              </p>
              <p className="text-[10px] text-neutral-400 tabular-nums">
                {chunks.length} chunks
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-neutral-500">Modernized</p>
              <p className="text-[10px] text-purple-300 tabular-nums">
                {completedChunks.length} / {chunks.length}
              </p>
            </div>
          </div>
        </div>

        {/* Original Text Pane */}
        <div className="flex-1 flex flex-col border-r border-white/5 bg-neutral-900/40 backdrop-blur-sm overflow-hidden">
          <div className="flex-none px-8 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-neutral-500 rounded-full" />
              <h4 className="text-sm uppercase tracking-wider text-neutral-400">Original Text</h4>
            </div>
          </div>
          
          <div 
            ref={scrollContainerRef} 
            onScroll={handleOriginalScroll}
            className="flex-1 overflow-y-auto px-8 py-12"
          >
            <div className="max-w-3xl mx-auto space-y-8">
              {chunks.map((chunk, index) => (
                <div 
                  key={`orig-${chunk.id}`} 
                  ref={(el) => { chunkRefs.current[chunk.id] = el; }}
                  className="relative"
                >
                  {index > 0 && (
                    <div className="absolute -top-4 left-0 right-0">
                      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    </div>
                  )}
                  <pre className="text-base leading-relaxed text-neutral-300 whitespace-pre-wrap break-words font-sans">
                    {chunk.originalText}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modernized Text Pane */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-purple-950/30 to-pink-950/30 backdrop-blur-sm overflow-hidden">
          <div className="flex-none px-8 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
              <h4 className="text-sm uppercase tracking-wider text-purple-300">Modernized Text</h4>
            </div>
          </div>
          
          <div 
            ref={modernizedScrollRef}
            onScroll={handleModernizedScroll}
            className="flex-1 overflow-y-auto px-8 py-12"
          >
            <div className="max-w-3xl mx-auto space-y-8">
              {chunks.map((chunk, index) => (
                <div key={`mod-${chunk.id}`} className="relative">
                  {index > 0 && (
                    <div className="absolute -top-4 left-0 right-0">
                      <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
                    </div>
                  )}
                  
                  {chunk.status === "completed" ? (
                    <pre className="text-base leading-relaxed text-white whitespace-pre-wrap break-words font-sans">
                      {chunk.modernizedText || chunk.originalText}
                    </pre>
                  ) : index === completedChunks.length ? (
                    <div className="border-2 border-dashed border-purple-500/40 rounded-xl p-6 bg-neutral-900/40">
                      <div className="text-center space-y-3">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/20 rounded-full border border-purple-500/30">
                          <Sparkles className="w-4 h-4 text-purple-400" strokeWidth={2.5} />
                          <span className="text-sm text-purple-300">Preview Ended</span>
                        </div>
                        <p className="text-xs text-neutral-400">
                          Use the conversion controls at the top to continue
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className={`relative group ${nextBatchIds.includes(chunk.id) ? 'ring-1 ring-purple-500/30 rounded-lg' : ''}`}>
                      <div className="absolute top-2 right-2 z-10">
                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border ${
                          nextBatchIds.includes(chunk.id) 
                            ? 'bg-purple-600/20 border-purple-500/40'
                            : 'bg-amber-600/20 border-amber-500/30'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            nextBatchIds.includes(chunk.id) ? 'bg-purple-400' : 'bg-amber-500'
                          }`} />
                          <span className={`text-xs ${
                            nextBatchIds.includes(chunk.id) ? 'text-purple-300' : 'text-amber-300'
                          }`}>
                            {nextBatchIds.includes(chunk.id) ? 'Next' : 'Pending'}
                          </span>
                        </div>
                      </div>
                      <pre className="text-base leading-relaxed text-neutral-600/50 whitespace-pre-wrap break-words font-sans border border-dashed border-neutral-700/50 rounded-lg p-6 bg-neutral-900/20 blur-[0.5px]">
                        {chunk.originalText}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar with Next Step Guidance */}
      <div className="flex-none bg-neutral-900/80 backdrop-blur-xl border-t border-white/5">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4 text-xs text-neutral-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{completedChunks.length} modernized</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>{pendingChunks.length} pending</span>
                </div>
              </div>
              <p className="text-[10px] text-neutral-500">Scroll either pane to compare text side by side</p>
            </div>
            
            {/* Next Step CTA */}
            {completedChunks.length >= 10 && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs text-emerald-300">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Ready for audio generation</span>
                </div>
                <button
                  onClick={() => setActiveTab("audio")}
                  className="group relative px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25 text-xs"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity" />
                  <span className="relative z-10 flex items-center gap-2">
                    <Music2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                    Go to Audio Files
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Audio Files Tab Component
type AudioTrack = {
  id: number;
  chunkId: number;
  name: string;
  text: string;
  duration: number;
  audioUrl: string;
  generationStatus: "pending" | "generating" | "completed" | "failed";
  playbackStatus: "ready" | "playing" | "paused";
  fileSize: number;
  progress?: number; // 0-100 for generating state
};

type VoiceOption = {
  id: string;
  name: string;
  gender: string;
  language: string;
  style: string;
  costPerChar: number; // in dollars
};

const VOICE_OPTIONS: VoiceOption[] = [
  { id: 'nova', name: 'Nova', gender: 'Female', language: 'English', style: 'Warm & Engaging', costPerChar: 0.000015 },
  { id: 'alloy', name: 'Alloy', gender: 'Neutral', language: 'English', style: 'Versatile & Clear', costPerChar: 0.000015 },
  { id: 'echo', name: 'Echo', gender: 'Male', language: 'English', style: 'Deep & Resonant', costPerChar: 0.000015 },
  { id: 'fable', name: 'Fable', gender: 'Male', language: 'English', style: 'Expressive & Dynamic', costPerChar: 0.000015 },
  { id: 'onyx', name: 'Onyx', gender: 'Male', language: 'English', style: 'Authoritative & Rich', costPerChar: 0.000015 },
  { id: 'shimmer', name: 'Shimmer', gender: 'Female', language: 'English', style: 'Gentle & Soothing', costPerChar: 0.000015 },
];

function AudioFilesTab({ 
  book, 
  chunks,
  onGenerateAudio 
}: { 
  book: Book; 
  chunks: Chunk[];
  onGenerateAudio: () => void;
}) {
  const completedChunks = useMemo(() => 
    chunks.filter(c => c.status === "completed" && c.modernizedText),
    [chunks]
  );
  
  const pendingAudioChunks = useMemo(() =>
    chunks.filter(c => c.status === "completed" && c.modernizedText && !c.hasAudio),
    [chunks]
  );

  // TTS Settings State
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(VOICE_OPTIONS[0]);
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [isPlayingSample, setIsPlayingSample] = useState(false);

  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>(() => {
    if (book.audioSegments && book.audioSegments.length > 0) {
      return book.audioSegments.map((seg, index) => ({
        id: seg.id,
        chunkId: index,
        name: `Track ${index + 1}`,
        text: seg.text || "",
        duration: seg.duration,
        audioUrl: seg.audioUrl,
        generationStatus: "completed" as const,
        playbackStatus: "ready" as const,
        fileSize: Math.floor(seg.duration * 16000),
      }));
    }
    return [];
  });

  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<number | null>(null);
  const [editingTrackId, setEditingTrackId] = useState<number | null>(null);
  const [editingTrackName, setEditingTrackName] = useState("");
  const [volume, setVolume] = useState(80);
  const [playbackProgress, setPlaybackProgress] = useState<{ [key: number]: number }>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationIntervals, setGenerationIntervals] = useState<Map<number, NodeJS.Timeout>>(new Map());

  const stats = useMemo(() => {
    const totalDuration = audioTracks.reduce((sum, t) => sum + t.duration, 0);
    const totalSize = audioTracks.reduce((sum, t) => sum + t.fileSize, 0);
    return {
      totalTracks: audioTracks.length,
      totalDuration,
      totalSize,
    };
  }, [audioTracks]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const handlePlayPause = (trackId: number) => {
    if (currentlyPlayingId === trackId) {
      setCurrentlyPlayingId(null);
      setAudioTracks(prev => prev.map(t => 
        t.id === trackId ? { ...t, playbackStatus: "paused" as const } : t
      ));
    } else {
      setCurrentlyPlayingId(trackId);
      setAudioTracks(prev => prev.map(t => 
        t.id === trackId 
          ? { ...t, playbackStatus: "playing" as const }
          : { ...t, playbackStatus: "ready" as const }
      ));
    }
  };



  // Simulate playback progress
  useEffect(() => {
    if (currentlyPlayingId === null) return;
    
    const interval = setInterval(() => {
      setPlaybackProgress(prev => {
        const current = prev[currentlyPlayingId] || 0;
        const track = audioTracks.find(t => t.id === currentlyPlayingId);
        if (!track) return prev;
        
        const newProgress = current + 1;
        if (newProgress >= track.duration) {
          setCurrentlyPlayingId(null);
          return { ...prev, [currentlyPlayingId]: 0 };
        }
        
        return { ...prev, [currentlyPlayingId]: newProgress };
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [currentlyPlayingId, audioTracks]);

  // Sample text for preview
  const sampleText = completedChunks.length > 0 
    ? completedChunks[0].modernizedText?.substring(0, 200) + "..." 
    : "The quick brown fox jumps over the lazy dog. This is a sample of how your audiobook will sound with the selected voice and settings.";

  const handlePlaySample = () => {
    setIsPlayingSample(true);
    // Simulate audio playback
    setTimeout(() => setIsPlayingSample(false), 3000);
  };

  const handleGenerateBatch = (count: number) => {
    // Create tracks with "pending" status first
    const tracksToGenerate = completedChunks.slice(0, count);
    const newTracks: AudioTrack[] = tracksToGenerate.map((chunk, index) => ({
      id: Date.now() + index,
      chunkId: chunk.id,
      name: `Track ${index + 1}`,
      text: chunk.modernizedText || chunk.originalText,
      duration: 0,
      audioUrl: '',
      generationStatus: "pending" as const,
      playbackStatus: "ready" as const,
      fileSize: 0,
      progress: 0,
    }));
    
    setAudioTracks(newTracks);
    setIsGenerating(true);
    
    // Clear any existing intervals
    generationIntervals.forEach(interval => clearInterval(interval));
    setGenerationIntervals(new Map());
    
    // Simulate generation process - much slower and more realistic
    newTracks.forEach((track, index) => {
      // Stagger start times more (3-5 seconds between tracks)
      const startDelay = index * 3000;
      
      setTimeout(() => {
        // Start generating
        setAudioTracks(prev => prev.map(t => 
          t.id === track.id ? { ...t, generationStatus: "generating" as const } : t
        ));
        
        // Simulate progress slowly (1% every 800ms = 80 seconds per track)
        const progressInterval = setInterval(() => {
          setAudioTracks(prev => prev.map(t => {
            if (t.id === track.id && t.generationStatus === "generating") {
              const newProgress = (t.progress || 0) + 1;
              if (newProgress >= 100) {
                clearInterval(progressInterval);
                setGenerationIntervals(prev => {
                  const newMap = new Map(prev);
                  newMap.delete(track.id);
                  return newMap;
                });
                
                // Complete the track
                const durations = [134, 267, 189, 445, 312, 523, 201, 678];
                const duration = durations[index % durations.length];
                const fileSize = Math.floor(duration * 16000 + Math.random() * 5000);
                
                // Check if this is the last track
                const allCompleted = prev.every(t => 
                  t.id === track.id || t.generationStatus === "completed"
                );
                if (allCompleted) {
                  setIsGenerating(false);
                }
                
                return {
                  ...t,
                  generationStatus: "completed" as const,
                  duration,
                  fileSize,
                  audioUrl: `audio-track-${index + 1}.mp3`,
                  progress: 100,
                };
              }
              return { ...t, progress: newProgress };
            }
            return t;
          }));
        }, 800); // Much slower - 800ms per 1% (80 seconds total per track)
        
        // Store the interval
        setGenerationIntervals(prev => {
          const newMap = new Map(prev);
          newMap.set(track.id, progressInterval);
          return newMap;
        });
      }, startDelay);
    });
  };

  const handlePauseAllGeneration = () => {
    setIsGenerating(false);
    // Pause all generating tracks
    setAudioTracks(prev => prev.map(t => 
      t.generationStatus === "generating"
        ? { ...t, generationStatus: "pending" as const }
        : t
    ));
    // Clear all intervals
    generationIntervals.forEach(interval => clearInterval(interval));
    setGenerationIntervals(new Map());
  };

  const handleResumeAllGeneration = () => {
    const pausedTracks = audioTracks.filter(t => t.generationStatus === "pending");
    if (pausedTracks.length === 0) return;
    
    setIsGenerating(true);
    
    // Resume all paused tracks
    pausedTracks.forEach((track) => {
      const trackId = track.id;
      
      // Set to generating
      setAudioTracks(prev => prev.map(t => 
        t.id === trackId ? { ...t, generationStatus: "generating" as const } : t
      ));
      
      // Continue progress
      const progressInterval = setInterval(() => {
        setAudioTracks(prev => prev.map(t => {
          if (t.id === trackId && t.generationStatus === "generating") {
            const newProgress = (t.progress || 0) + 1;
            if (newProgress >= 100) {
              clearInterval(progressInterval);
              setGenerationIntervals(prev => {
                const newMap = new Map(prev);
                newMap.delete(trackId);
                return newMap;
              });
              
              // Complete the track
              const trackIndex = audioTracks.findIndex(tr => tr.id === trackId);
              const durations = [134, 267, 189, 445, 312, 523, 201, 678];
              const duration = durations[trackIndex % durations.length];
              const fileSize = Math.floor(duration * 16000 + Math.random() * 5000);
              
              return {
                ...t,
                generationStatus: "completed" as const,
                duration,
                fileSize,
                audioUrl: `audio-track-${trackIndex + 1}.mp3`,
                progress: 100,
              };
            }
            return { ...t, progress: newProgress };
          }
          return t;
        }));
      }, 800);
      
      // Store the interval
      setGenerationIntervals(prev => {
        const newMap = new Map(prev);
        newMap.set(trackId, progressInterval);
        return newMap;
      });
    });
  };

  const handleStopGeneration = () => {
    setIsGenerating(false);
    // Clear all intervals
    generationIntervals.forEach(interval => clearInterval(interval));
    setGenerationIntervals(new Map());
    // Remove all incomplete tracks
    setAudioTracks(prev => prev.filter(t => t.generationStatus === "completed"));
  };

  // Individual track controls
  const handlePauseTrack = (trackId: number) => {
    // Clear the interval for this track
    const interval = generationIntervals.get(trackId);
    if (interval) {
      clearInterval(interval);
      setGenerationIntervals(prev => {
        const newMap = new Map(prev);
        newMap.delete(trackId);
        return newMap;
      });
    }
    
    // Set track to paused (pending) status
    setAudioTracks(prev => prev.map(t => 
      t.id === trackId && t.generationStatus === "generating"
        ? { ...t, generationStatus: "pending" as const }
        : t
    ));
    
    // Check if all tracks are paused/completed
    const anyGenerating = audioTracks.some(t => 
      t.id !== trackId && t.generationStatus === "generating"
    );
    if (!anyGenerating) {
      setIsGenerating(false);
    }
  };

  const handleResumeTrack = (trackId: number) => {
    const track = audioTracks.find(t => t.id === trackId);
    if (!track || track.generationStatus !== "pending") return;
    
    setIsGenerating(true);
    
    // Resume generating
    setAudioTracks(prev => prev.map(t => 
      t.id === trackId ? { ...t, generationStatus: "generating" as const } : t
    ));
    
    // Continue progress from where it left off
    const progressInterval = setInterval(() => {
      setAudioTracks(prev => prev.map(t => {
        if (t.id === trackId && t.generationStatus === "generating") {
          const newProgress = (t.progress || 0) + 1;
          if (newProgress >= 100) {
            clearInterval(progressInterval);
            setGenerationIntervals(prev => {
              const newMap = new Map(prev);
              newMap.delete(trackId);
              return newMap;
            });
            
            // Complete the track
            const trackIndex = audioTracks.findIndex(tr => tr.id === trackId);
            const durations = [134, 267, 189, 445, 312, 523, 201, 678];
            const duration = durations[trackIndex % durations.length];
            const fileSize = Math.floor(duration * 16000 + Math.random() * 5000);
            
            return {
              ...t,
              generationStatus: "completed" as const,
              duration,
              fileSize,
              audioUrl: `audio-track-${trackIndex + 1}.mp3`,
              progress: 100,
            };
          }
          return { ...t, progress: newProgress };
        }
        return t;
      }));
    }, 800);
    
    // Store the interval
    setGenerationIntervals(prev => {
      const newMap = new Map(prev);
      newMap.set(trackId, progressInterval);
      return newMap;
    });
  };

  const handleCancelTrack = (trackId: number) => {
    // Clear the interval if it exists
    const interval = generationIntervals.get(trackId);
    if (interval) {
      clearInterval(interval);
      setGenerationIntervals(prev => {
        const newMap = new Map(prev);
        newMap.delete(trackId);
        return newMap;
      });
    }
    
    // Remove the track
    setAudioTracks(prev => prev.filter(t => t.id !== trackId));
    
    // Check if all tracks are completed
    const anyGenerating = audioTracks.some(t => 
      t.id !== trackId && (t.generationStatus === "generating" || t.generationStatus === "pending")
    );
    if (!anyGenerating) {
      setIsGenerating(false);
    }
  };

  // TTS Generation View (when no audio exists but modernized text is available)
  if (audioTracks.length === 0) {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        {/* Voice Configuration Section */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-8 space-y-8">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-2 border-purple-500/30 flex items-center justify-center">
                <Music2 className="w-8 h-8 text-purple-400" strokeWidth={2} />
              </div>
              <h3 className="text-2xl text-white">Generate Audiobook</h3>
              <p className="text-sm text-neutral-400">
                Configure voice settings and preview before generating {completedChunks.length} audio tracks
              </p>
              {completedChunks.length === 0 && (
                <p className="text-xs text-amber-400 mt-2">
                  ⚠️ You need to modernize some text chunks first
                </p>
              )}
            </div>

            {/* Voice Selection */}
            <div className="bg-neutral-900/40 backdrop-blur-sm rounded-xl border border-white/10 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-purple-400" strokeWidth={2.5} />
                <h4 className="text-sm uppercase tracking-wider text-purple-300">Voice Selection</h4>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {VOICE_OPTIONS.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice)}
                    className={`relative p-4 rounded-lg border transition-all text-left ${
                      selectedVoice.id === voice.id
                        ? 'border-purple-500/50 bg-purple-950/30'
                        : 'border-white/10 bg-neutral-800/40 hover:border-purple-500/30'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-white">{voice.name}</p>
                        {selectedVoice.id === voice.id && (
                          <div className="w-2 h-2 rounded-full bg-purple-500" />
                        )}
                      </div>
                      <p className="text-xs text-neutral-400">{voice.gender} • {voice.style}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Settings */}
            <div className="bg-neutral-900/40 backdrop-blur-sm rounded-xl border border-white/10 p-6 space-y-6">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-purple-400" strokeWidth={2.5} />
                <h4 className="text-sm uppercase tracking-wider text-purple-300">Voice Settings</h4>
              </div>
              
              <div className="space-y-5">
                {/* Speed Control */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-neutral-300">Speed</label>
                    <span className="text-xs text-purple-300 tabular-nums">{speed.toFixed(1)}x</span>
                  </div>
                  <Slider
                    value={[speed]}
                    onValueChange={([v]) => setSpeed(v)}
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500">
                    <span>0.5x (Slower)</span>
                    <span>2.0x (Faster)</span>
                  </div>
                </div>

                {/* Pitch Control */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-neutral-300">Pitch</label>
                    <span className="text-xs text-purple-300 tabular-nums">{pitch.toFixed(1)}x</span>
                  </div>
                  <Slider
                    value={[pitch]}
                    onValueChange={([v]) => setPitch(v)}
                    min={0.5}
                    max={1.5}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500">
                    <span>0.5x (Lower)</span>
                    <span>1.5x (Higher)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sample Preview */}
            <div className="bg-gradient-to-br from-purple-950/30 to-pink-950/30 backdrop-blur-sm rounded-xl border border-purple-500/30 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Play className="w-5 h-5 text-purple-400" strokeWidth={2.5} />
                  <h4 className="text-sm uppercase tracking-wider text-purple-300">Preview Sample</h4>
                </div>
                <button
                  onClick={handlePlaySample}
                  disabled={isPlayingSample || completedChunks.length === 0}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white text-xs rounded-lg transition-colors flex items-center gap-2"
                >
                  {isPlayingSample ? (
                    <>
                      <Pause className="w-3.5 h-3.5" strokeWidth={2.5} />
                      Playing...
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" strokeWidth={2.5} />
                      Play Sample
                    </>
                  )}
                </button>
              </div>
              
              <div className="bg-neutral-900/60 rounded-lg p-4 border border-white/5">
                <p className="text-xs text-neutral-300 leading-relaxed italic">
                  "{sampleText}"
                </p>
              </div>
              
              <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" strokeWidth={2.5} />
                <span>Voice: {selectedVoice.name} • Speed: {speed}x • Pitch: {pitch}x</span>
              </div>
            </div>
          </div>
        </div>

        {/* Batch Generation Controls - Sticky Bottom */}
        {completedChunks.length > 0 && (
          <div className="flex-none border-t border-white/5 bg-neutral-900/80 backdrop-blur-md">
            <div className="px-8 py-6">
              <div className="max-w-5xl mx-auto space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-purple-400" strokeWidth={2.5} />
                    <div>
                      <p className="text-xs text-purple-300">Batch TTS Generation</p>
                      <p className="text-[10px] text-neutral-500 mt-0.5">
                        {completedChunks.length} chunks ready for audio generation
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-[10px] text-neutral-500">Total Characters</p>
                    <p className="text-xs text-emerald-300 tabular-nums">
                      {completedChunks.reduce((sum, c) => sum + (c.modernizedText?.length || 0), 0).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-3">
                  {[0.1, 0.25, 0.5, 1].map((percent, idx) => {
                    const count = percent === 1 ? completedChunks.length : Math.ceil(completedChunks.length * percent);
                    const chars = completedChunks.slice(0, count).reduce((sum, c) => sum + (c.modernizedText?.length || 0), 0);
                    const minutes = Math.round((chars / 5) / 150); // ~5 chars per word, 150 words per minute
                    const cost = chars * selectedVoice.costPerChar;
                    const displayCost = cost < 0.01 ? '<$0.01' : `$${cost.toFixed(2)}`;
                    const label = percent === 1 ? 'All' : `${percent * 100}%`;
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => handleGenerateBatch(count)}
                        className={`group relative px-4 py-3 rounded-lg transition-all duration-200 ${
                          percent === 1
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl hover:shadow-purple-500/25 hover:scale-105'
                            : 'bg-gradient-to-br from-purple-600/10 to-pink-600/10 hover:from-purple-600/20 hover:to-pink-600/20 border border-purple-500/30 hover:border-purple-500/50 text-white hover:shadow-lg hover:shadow-purple-500/20'
                        }`}
                      >
                        {percent === 1 && (
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                        )}
                        <div className={`${percent === 1 ? 'relative z-10' : ''} space-y-1`}>
                          <div className={`text-sm font-medium ${percent === 1 ? 'text-white' : 'text-purple-300'}`}>
                            {label}
                          </div>
                          <div className="text-[10px] text-neutral-400">
                            {count} tracks · ~{minutes}m
                          </div>
                          <div className={`text-[10px] ${percent === 1 ? 'text-white/80' : 'text-amber-400/80'}`}>
                            {displayCost}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                <p className="text-[9px] text-neutral-600 text-center">
                  Estimated TTS API cost using {selectedVoice.name} voice
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Audio tracks view
  return (
    <div className="h-full flex flex-col">
      {/* Header with stats and generation controls */}
      <div className="flex-none px-8 py-4 border-b border-white/5 bg-neutral-900/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wider">Total Duration</p>
              <p className="text-lg text-white">{formatDuration(stats.totalDuration)}</p>
            </div>
            <Separator orientation="vertical" className="h-10 bg-white/10" />
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wider">Tracks</p>
              <p className="text-lg text-white">{stats.totalTracks}</p>
            </div>
            <Separator orientation="vertical" className="h-10 bg-white/10" />
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wider">Total Size</p>
              <p className="text-lg text-white">{formatFileSize(stats.totalSize)}</p>
            </div>
            
            {/* Generation status indicator */}
            {isGenerating && (
              <>
                <Separator orientation="vertical" className="h-10 bg-white/10" />
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <p className="text-xs text-blue-400">Generating...</p>
                </div>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Generation control buttons */}
            {isGenerating && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handlePauseAllGeneration}
                  className="bg-amber-600/20 border-amber-500/30 text-amber-300 hover:bg-amber-600/30 hover:text-amber-200"
                >
                  <Pause className="w-4 h-4 mr-2" strokeWidth={2.5} />
                  Pause All
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleStopGeneration}
                  className="bg-red-600/20 border-red-500/30 text-red-300 hover:bg-red-600/30 hover:text-red-200"
                >
                  <X className="w-4 h-4 mr-2" strokeWidth={2.5} />
                  Stop All
                </Button>
              </>
            )}
            
            {/* Show Resume All if there are paused tracks */}
            {!isGenerating && audioTracks.some(t => t.generationStatus === "pending") && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleResumeAllGeneration}
                className="bg-emerald-600/20 border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/30 hover:text-emerald-200"
              >
                <Play className="w-4 h-4 mr-2" strokeWidth={2.5} />
                Resume All
              </Button>
            )}
            
            {!isGenerating && audioTracks.length > 0 && audioTracks.some(t => t.generationStatus === "completed") && (
              <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                <Download className="w-4 h-4 mr-2" strokeWidth={2.5} />
                Download All
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Track list */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-3">
          {audioTracks.map((track, index) => {
            const isGenerating = track.generationStatus === "generating";
            const isPending = track.generationStatus === "pending";
            const isCompleted = track.generationStatus === "completed";
            const isFailed = track.generationStatus === "failed";
            
            return (
              <div
                key={track.id}
                className={`rounded-xl border backdrop-blur-xl p-4 transition-all ${
                  track.playbackStatus === "playing"
                    ? "border-purple-500/50 bg-purple-950/30"
                    : isPending
                    ? "border-amber-500/30 bg-amber-950/20"
                    : isGenerating
                    ? "border-blue-500/30 bg-blue-950/20"
                    : isFailed
                    ? "border-red-500/30 bg-red-950/20"
                    : "border-white/10 bg-neutral-900/40 hover:border-purple-500/30"
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Track number / Status indicator */}
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    track.playbackStatus === "playing"
                      ? "bg-gradient-to-r from-purple-600 to-pink-600"
                      : isPending
                      ? "bg-amber-600/20 border border-amber-500/30"
                      : isGenerating
                      ? "bg-blue-600/20 border border-blue-500/30"
                      : isFailed
                      ? "bg-red-600/20 border border-red-500/30"
                      : "bg-neutral-800/80"
                  }`}>
                    {isGenerating ? (
                      <div className="relative w-8 h-8">
                        <div className="absolute inset-0 rounded-full border-2 border-blue-500/30" />
                        <div 
                          className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"
                        />
                      </div>
                    ) : isPending ? (
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    ) : isFailed ? (
                      <X className="w-6 h-6 text-red-400" strokeWidth={2.5} />
                    ) : (
                      <span className="text-white">{index + 1}</span>
                    )}
                  </div>

                  {/* Track info */}
                  <div className="flex-1 min-w-0">
                    {editingTrackId === track.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editingTrackName}
                          onChange={(e) => setEditingTrackName(e.target.value)}
                          className="h-8 bg-neutral-800 border-purple-500/30 text-white"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setAudioTracks(prev => prev.map(t =>
                              t.id === track.id ? { ...t, name: editingTrackName } : t
                            ));
                            setEditingTrackId(null);
                          }}
                          className="h-8 w-8 p-0 text-emerald-400 hover:text-emerald-300"
                      >
                        <Check className="w-4 h-4" strokeWidth={2.5} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingTrackId(null)}
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" strokeWidth={2.5} />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-white truncate">{track.name}</p>
                      {isCompleted && (
                        <button
                          onClick={() => {
                            setEditingTrackId(track.id);
                            setEditingTrackName(track.name);
                          }}
                          className="text-neutral-500 hover:text-purple-400 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                        </button>
                      )}
                    </div>
                  )}
                  
                  {/* Status and metadata */}
                  <div className="flex items-center gap-2 mt-0.5">
                    {isPending && (
                      <span className="text-xs text-amber-400">Queued...</span>
                    )}
                    {isGenerating && (
                      <span className="text-xs text-blue-400">Generating {track.progress}%</span>
                    )}
                    {isFailed && (
                      <span className="text-xs text-red-400">Failed - Click to retry</span>
                    )}
                    {isCompleted && (
                      <p className="text-xs text-neutral-500 truncate">
                        {formatTime(track.duration)} • {formatFileSize(track.fileSize)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Generation controls - for generating/pending tracks */}
                {isGenerating && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePauseTrack(track.id)}
                      className="bg-amber-600/20 border-amber-500/30 text-amber-300 hover:bg-amber-600/30"
                    >
                      <Pause className="w-4 h-4 mr-1.5" strokeWidth={2.5} />
                      Pause
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelTrack(track.id)}
                      className="bg-red-600/20 border-red-500/30 text-red-300 hover:bg-red-600/30"
                    >
                      <X className="w-4 h-4" strokeWidth={2.5} />
                    </Button>
                  </div>
                )}

                {isPending && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResumeTrack(track.id)}
                      className="bg-emerald-600/20 border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/30"
                    >
                      <Play className="w-4 h-4 mr-1.5" strokeWidth={2.5} />
                      Resume
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelTrack(track.id)}
                      className="bg-red-600/20 border-red-500/30 text-red-300 hover:bg-red-600/30"
                    >
                      <X className="w-4 h-4" strokeWidth={2.5} />
                    </Button>
                  </div>
                )}

                {/* Play button - only for completed tracks */}
                {isCompleted && (
                  <button
                    onClick={() => handlePlayPause(track.id)}
                    className="w-10 h-10 rounded-lg bg-purple-600 hover:bg-purple-500 flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    {track.playbackStatus === "playing" ? (
                      <Pause className="w-5 h-5 text-white" strokeWidth={2.5} fill="white" />
                    ) : (
                      <Play className="w-5 h-5 text-white" strokeWidth={2.5} fill="white" />
                    )}
                  </button>
                )}

                {/* Download button - only for completed tracks */}
                {isCompleted && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/5 border-white/10 text-white hover:bg-white/10 flex-shrink-0"
                  >
                    <Download className="w-4 h-4" strokeWidth={2.5} />
                  </Button>
                )}
              </div>

              {/* Generation Progress Bar */}
              {isGenerating && (
                <div className="mt-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-cyan-600 transition-all duration-300"
                        style={{ width: `${track.progress || 0}%` }}
                      />
                    </div>
                    <span className="text-xs text-blue-400 tabular-nums">{track.progress}%</span>
                  </div>
                </div>
              )}

              {/* Playback Progress Bar */}
              {track.playbackStatus === "playing" && isCompleted && (
                <div className="mt-3">
                  <div className="flex items-center gap-3 text-xs text-neutral-400">
                    <span>{formatTime(playbackProgress[track.id] || 0)}</span>
                    <div className="flex-1 h-1 bg-neutral-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-1000"
                        style={{ width: `${((playbackProgress[track.id] || 0) / track.duration) * 100}%` }}
                      />
                    </div>
                    <span>{formatTime(track.duration)}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        </div>
      </ScrollArea>

      {/* Playback controls (global) */}
      {currentlyPlayingId !== null && (
        <div className="flex-none px-8 py-4 border-t border-white/5 bg-neutral-900/60 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  const currentIndex = audioTracks.findIndex(t => t.id === currentlyPlayingId);
                  if (currentIndex > 0) handlePlayPause(audioTracks[currentIndex - 1].id);
                }}
                className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-colors"
              >
                <SkipBack className="w-4 h-4 text-white" strokeWidth={2.5} />
              </button>
              <button
                onClick={() => {
                  const currentIndex = audioTracks.findIndex(t => t.id === currentlyPlayingId);
                  if (currentIndex < audioTracks.length - 1) handlePlayPause(audioTracks[currentIndex + 1].id);
                }}
                className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-colors"
              >
                <SkipForward className="w-4 h-4 text-white" strokeWidth={2.5} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <Volume2 className="w-4 h-4 text-neutral-400" strokeWidth={2.5} />
              <Slider
                value={[volume]}
                onValueChange={([v]) => setVolume(v)}
                max={100}
                step={1}
                className="w-32"
              />
              <span className="text-xs text-neutral-500 w-8">{volume}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Settings Tab Component
function SettingsTab({ book }: { book: Book }) {
  return (
    <div className="h-full p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <h3 className="text-lg text-white mb-6">Project Settings</h3>
        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-neutral-900/40 p-5">
            <p className="text-sm text-neutral-400">Settings coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
