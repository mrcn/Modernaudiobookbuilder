import { useState, useMemo, useEffect, useRef } from "react";
import { ArrowLeft, Zap, Search, CheckSquare, Square, RotateCcw, ArrowRight, Settings, Sparkles, BookOpen, ChevronDown, ChevronUp, Pause, Play, X } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Separator } from "./ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";

export type Chunk = {
  id: number;
  originalText: string;
  modernizedText: string;
  charCount: number;
  tokenCount: number;
  wordCount: number;
  estimatedCost: number;
  edited: boolean;
  flagged: boolean;
  batchId?: number;
  status: "pending" | "processing" | "completed" | "failed";
  modernizationInstructions?: string;
};

export type Batch = {
  id: number;
  chunkIds: number[];
  totalChars: number;
  totalTokens: number;
  estimatedCost: number;
  estimatedDuration: number;
  status: "pending" | "processing" | "completed" | "failed";
};

type ChunkReviewProps = {
  chunks?: Chunk[];
  onBack: () => void;
  onEditChunk: (chunkId: number, newText: string) => void;
  onProceedToSegmentBuilder: (chunksPerSegment: number) => void;
  onModernizeChunks?: (chunkIds: number[], instructions: string) => void;
  onRegenerateChunk?: (chunkId: number, instructions: string) => void;
};

// Mock chunks for testing - realistic excerpts from Pride and Prejudice
const generateMockChunks = (): Chunk[] => {
  const mockTexts = [
    "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.",
    "However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.",
    "My dear Mr. Bennet, said his lady to him one day, have you heard that Netherfield Park is let at last?",
    "Mr. Bennet replied that he had not.",
    "But it is, returned she; for Mrs. Long has just been here, and she told me all about it.",
    "Mr. Bennet made no answer.",
    "Do you not want to know who has taken it? cried his wife impatiently.",
    "You want to tell me, and I have no objection to hearing it.",
    "This was invitation enough.",
    "Why, my dear, you must know, Mrs. Long says that Netherfield is taken by a young man of large fortune from the north of England; that he came down on Monday in a chaise and four to see the place, and was so much delighted with it, that he agreed with Mr. Morris immediately; that he is to take possession before Michaelmas, and some of his servants are to be in the house by the end of next week.",
    "What is his name?",
    "Bingley.",
    "Is he married or single?",
    "Oh! Single, my dear, to be sure! A single man of large fortune; four or five thousand a year. What a fine thing for our girls!",
    "How so? How can it affect them?",
    "My dear Mr. Bennet, replied his wife, how can you be so tiresome! You must know that I am thinking of his marrying one of them.",
    "Is that his design in settling here?",
    "Design! Nonsense, how can you talk so! But it is very likely that he may fall in love with one of them, and therefore you must visit him as soon as he comes.",
    "I see no occasion for that. You and the girls may go, or you may send them by themselves, which perhaps will be still better, for as you are as handsome as any of them, Mr. Bingley may like you the best of the party.",
    "My dear, you flatter me. I certainly have had my share of beauty, but I do not pretend to be anything extraordinary now. When a woman has five grown-up daughters, she ought to give over thinking of her own beauty.",
    "In such cases, a woman has not often much beauty to think of.",
    "But, my dear, you must indeed go and see Mr. Bingley when he comes into the neighbourhood.",
    "It is more than I engage for, I assure you.",
    "But consider your daughters. Only think what an establishment it would be for one of them. Sir William and Lady Lucas are determined to go, merely on that account, for in general, you know, they visit no newcomers. Indeed you must go, for it will be impossible for us to visit him if you do not.",
    "You are over-scrupulous, surely. I dare say Mr. Bingley will be very glad to see you; and I will send a few lines by you to assure him of my hearty consent to his marrying whichever he chooses of the girls; though I must throw in a good word for my little Lizzy.",
    "I desire you will do no such thing. Lizzy is not a bit better than the others; and I am sure she is not half so handsome as Jane, nor half so good-humoured as Lydia. But you are always giving her the preference.",
    "They have none of them much to recommend them, replied he; they are all silly and ignorant like other girls; but Lizzy has something more of quickness than her sisters.",
    "Mr. Bennet, how can you abuse your own children in such a way? You take delight in vexing me. You have no compassion for my poor nerves.",
    "You mistake me, my dear. I have a high respect for your nerves. They are my old friends. I have heard you mention them with consideration these last twenty years at least.",
    "Ah, you do not know what I suffer.",
    "But I hope you will get over it, and live to see many young men of four thousand a year come into the neighbourhood.",
  ];

  return mockTexts.map((text, index) => {
    const wordCount = text.split(/\s+/).length;
    const charCount = text.length;
    const tokenCount = Math.round(wordCount * 1.3);
    const estimatedCost = (tokenCount / 1000) * 0.09 + (charCount / 1000000) * 15;

    const isCompleted = index >= 25;
    const modernizedText = isCompleted 
      ? text.replace(/shall/g, "will").replace(/whilst/g, "while").replace(/ought to/g, "should")
      : "";

    return {
      id: index,
      originalText: text,
      modernizedText,
      charCount,
      tokenCount,
      wordCount,
      estimatedCost,
      edited: false,
      flagged: false,
      status: isCompleted ? "completed" : (index === 15 ? "failed" : "pending"),
      modernizationInstructions: isCompleted 
        ? "Modern, casual, conversational tone. Update archaic language while preserving the original meaning and literary style."
        : undefined,
    };
  });
};

export function ChunkReview({ 
  chunks: providedChunks, 
  onBack, 
  onEditChunk, 
  onProceedToSegmentBuilder,
  onModernizeChunks,
  onRegenerateChunk,
}: ChunkReviewProps) {
  const [chunks, setChunks] = useState<Chunk[]>(providedChunks || []);
  
  useEffect(() => {
    if (providedChunks) {
      setChunks(providedChunks);
    }
  }, [providedChunks]);
  
  const [selectedChunkIds, setSelectedChunkIds] = useState<Set<number>>(new Set());
  const [expandedChunkId, setExpandedChunkId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [modernizationInstructions, setModernizationInstructions] = useState(
    "Modern, casual, conversational tone. Update archaic language while preserving the original meaning and literary style."
  );
  const [regenerateInstructions, setRegenerateInstructions] = useState("");
  const [showSegmentConfig, setShowSegmentConfig] = useState(false);
  const [targetSegmentDuration, setTargetSegmentDuration] = useState(60);

  // Modernization process control
  const [isModernizing, setIsModernizing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentProcessingIndex, setCurrentProcessingIndex] = useState(0);
  const modernizationQueueRef = useRef<number[]>([]);
  const modernizationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Filter chunks
  const filteredChunks = useMemo(() => {
    let result = chunks;

    if (filterStatus === "pending") {
      result = result.filter(c => c.status === "pending");
    } else if (filterStatus === "completed") {
      result = result.filter(c => c.status === "completed");
    } else if (filterStatus === "failed") {
      result = result.filter(c => c.status === "failed");
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.originalText.toLowerCase().includes(query) ||
        c.modernizedText.toLowerCase().includes(query)
      );
    }

    return result;
  }, [chunks, filterStatus, searchQuery]);

  // Calculate stats
  const stats = useMemo(() => {
    const selectedChunks = chunks.filter(c => selectedChunkIds.has(c.id));
    const pendingSelectedChunks = selectedChunks.filter(c => c.status === "pending");
    const pendingTokens = pendingSelectedChunks.reduce((sum, c) => sum + c.tokenCount, 0);
    const modernizationCost = (pendingTokens / 1000) * 0.09;
    
    return {
      totalPending: chunks.filter(c => c.status === "pending").length,
      totalCompleted: chunks.filter(c => c.status === "completed").length,
      totalFailed: chunks.filter(c => c.status === "failed").length,
      selectedCount: selectedChunkIds.size,
      selectedPending: pendingSelectedChunks.length,
      modernizationCost,
    };
  }, [chunks, selectedChunkIds]);

  const handleChunkSelect = (chunkId: number) => {
    const newSelection = new Set(selectedChunkIds);
    if (newSelection.has(chunkId)) {
      newSelection.delete(chunkId);
    } else {
      newSelection.add(chunkId);
    }
    setSelectedChunkIds(newSelection);
  };

  const handleToggleExpand = (chunkId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedChunkId(expandedChunkId === chunkId ? null : chunkId);
  };

  const handleSelectAll = () => {
    setSelectedChunkIds(new Set(filteredChunks.map(c => c.id)));
  };

  const handleSelectNone = () => {
    setSelectedChunkIds(new Set());
  };

  // Process one chunk at a time
  const processNextChunk = () => {
    if (modernizationQueueRef.current.length === 0) {
      setIsModernizing(false);
      setCurrentProcessingIndex(0);
      return;
    }

    const chunkId = modernizationQueueRef.current[0];
    
    setChunks(prev => prev.map(chunk => 
      chunk.id === chunkId
        ? { ...chunk, status: "processing" as const }
        : chunk
    ));

    modernizationTimerRef.current = setTimeout(() => {
      setChunks(prev => prev.map(chunk => {
        if (chunk.id === chunkId) {
          const modernized = chunk.originalText
            .replace(/shall/g, "will")
            .replace(/whilst/g, "while")
            .replace(/ought to/g, "should")
            .replace(/hath/g, "has")
            .replace(/doth/g, "does");
          
          return {
            ...chunk,
            status: "completed" as const,
            modernizedText: modernized,
            modernizationInstructions,
          };
        }
        return chunk;
      }));

      modernizationQueueRef.current.shift();
      setCurrentProcessingIndex(prev => prev + 1);
      
      if (!isPaused) {
        processNextChunk();
      }
    }, 2000);
  };

  const handleModernize = () => {
    const selectedIds = Array.from(selectedChunkIds);
    const pendingIds = selectedIds.filter(id => {
      const chunk = chunks.find(c => c.id === id);
      return chunk && chunk.status === "pending";
    });

    if (pendingIds.length === 0) return;

    modernizationQueueRef.current = pendingIds;
    setIsModernizing(true);
    setIsPaused(false);
    setCurrentProcessingIndex(0);
    processNextChunk();
  };

  const handlePauseResume = () => {
    if (isPaused) {
      // Resume
      setIsPaused(false);
      processNextChunk();
    } else {
      // Pause
      setIsPaused(true);
      if (modernizationTimerRef.current) {
        clearTimeout(modernizationTimerRef.current);
      }
    }
  };

  const handleStop = () => {
    setIsModernizing(false);
    setIsPaused(false);
    setCurrentProcessingIndex(0);
    modernizationQueueRef.current = [];
    
    if (modernizationTimerRef.current) {
      clearTimeout(modernizationTimerRef.current);
    }

    // Reset any processing chunks back to pending
    setChunks(prev => prev.map(chunk => 
      chunk.status === "processing"
        ? { ...chunk, status: "pending" as const }
        : chunk
    ));
  };

  const handleRegenerateChunk = (chunkId: number) => {
    const instructions = regenerateInstructions || modernizationInstructions;
    
    setChunks(prev => prev.map(chunk =>
      chunk.id === chunkId
        ? { ...chunk, status: "processing" as const }
        : chunk
    ));

    setTimeout(() => {
      setChunks(prev => prev.map(chunk => {
        if (chunk.id === chunkId) {
          const modernized = chunk.originalText
            .replace(/shall/g, "will")
            .replace(/whilst/g, "while")
            .replace(/ought to/g, "should");
          
          return {
            ...chunk,
            status: "completed" as const,
            modernizedText: modernized + " [Regenerated]",
            modernizationInstructions: instructions,
          };
        }
        return chunk;
      }));
      setRegenerateInstructions("");
    }, 1500);
  };

  const canProceedToSegments = chunks.some(c => c.status === "completed");

  const segmentConfig = useMemo(() => {
    const completedChunks = chunks.filter(c => c.status === "completed");
    
    if (completedChunks.length === 0) {
      return {
        chunksPerSegment: 0,
        totalSegments: 0,
        avgChunkDuration: 0,
        totalDuration: 0,
      };
    }

    const totalWords = completedChunks.reduce((sum, c) => sum + c.wordCount, 0);
    const avgWordsPerChunk = totalWords / completedChunks.length;
    const avgChunkDuration = (avgWordsPerChunk / 150) * 60;
    const chunksPerSegment = Math.max(1, Math.round(targetSegmentDuration / avgChunkDuration));
    const totalSegments = Math.ceil(completedChunks.length / chunksPerSegment);
    const totalDuration = (totalWords / 150) * 60;
    
    return {
      chunksPerSegment,
      totalSegments,
      avgChunkDuration,
      totalDuration,
      completedCount: completedChunks.length,
    };
  }, [chunks, targetSegmentDuration]);

  const handleProceedClick = () => {
    setShowSegmentConfig(true);
  };

  const handleConfirmProceed = () => {
    setShowSegmentConfig(false);
    onProceedToSegmentBuilder(segmentConfig.chunksPerSegment);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.round(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-neutral-50 via-purple-50/30 to-pink-50/30">
      {/* Segment Configuration Dialog */}
      <Dialog open={showSegmentConfig} onOpenChange={setShowSegmentConfig}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-600" strokeWidth={2.5} />
              Configure Audio Segments
            </DialogTitle>
            <DialogDescription>
              Set your preferred segment duration and we'll calculate the optimal grouping
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* INPUT: Target Duration */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">1</div>
                <Label className="text-sm text-blue-900">Target Segment Duration</Label>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-blue-700">How long should each audio segment be?</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl tabular-nums text-blue-900">{targetSegmentDuration < 60 ? targetSegmentDuration : ''}</span>
                  {targetSegmentDuration < 60 && <span className="text-sm text-blue-700">seconds</span>}
                  {targetSegmentDuration >= 60 && <span className="text-2xl tabular-nums text-blue-900">{formatTime(targetSegmentDuration)}</span>}
                </div>
              </div>
              
              <Slider
                value={[targetSegmentDuration]}
                min={15}
                max={10800}
                step={15}
                onValueChange={(value) => setTargetSegmentDuration(value[0])}
                className="mb-3"
              />
              
              <div className="flex items-center justify-between text-xs text-blue-600">
                <span>15s (min)</span>
                <span>{formatTime(targetSegmentDuration)}</span>
                <span>3h (max)</span>
              </div>
            </div>

            <Separator />

            {/* OUTPUT: Calculated Results */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">2</div>
                <h5 className="text-sm text-purple-900">Calculated Grouping</h5>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">Available Chunks</span>
                  <span className="tabular-nums text-neutral-900 px-2 py-1 bg-white rounded border border-purple-200">
                    {segmentConfig.completedCount || stats.totalCompleted}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">Chunks per Segment</span>
                  <span className="tabular-nums text-purple-700 px-2 py-1 bg-white rounded border border-purple-200">
                    ~{segmentConfig.chunksPerSegment}
                  </span>
                </div>
                
                <Separator className="bg-purple-200" />
                
                <div className="flex justify-between items-center pt-1">
                  <span className="text-purple-700">Total Segments</span>
                  <span className="text-lg tabular-nums text-purple-900 px-3 py-1 bg-white rounded border-2 border-purple-300">
                    {segmentConfig.totalSegments}
                  </span>
                </div>
              </div>
            </div>

            {/* SUMMARY */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg border border-emerald-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">3</div>
                <h5 className="text-sm text-emerald-900">Summary</h5>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Target per Segment</span>
                  <span className="tabular-nums text-emerald-900">{formatTime(targetSegmentDuration)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Total Audio Duration</span>
                  <span className="tabular-nums text-emerald-900">{formatTime(segmentConfig.totalDuration)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Avg Actual Duration</span>
                  <span className="tabular-nums text-emerald-900">
                    {segmentConfig.totalSegments > 0 
                      ? formatTime(segmentConfig.totalDuration / segmentConfig.totalSegments)
                      : "0s"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 rounded-lg border border-amber-200 p-3">
              <p className="text-xs text-amber-800">
                <strong>Note:</strong> Actual segment durations may vary slightly based on natural chunk boundaries. 
                Each segment will contain approximately {segmentConfig.chunksPerSegment} chunk{segmentConfig.chunksPerSegment !== 1 ? 's' : ''}.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSegmentConfig(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmProceed}
              disabled={segmentConfig.totalSegments === 0}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
            >
              <ArrowRight className="w-4 h-4 mr-2" strokeWidth={2.5} />
              Create {segmentConfig.totalSegments} Segment{segmentConfig.totalSegments !== 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 h-full flex flex-col">
        {/* UNIFIED TOOLBAR - Everything in ONE compact row */}
        <div className="flex-none bg-white/80 backdrop-blur-xl border-b border-black/5 px-4 sm:px-6 py-2.5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Back + Title */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={onBack}
                className="flex-shrink-0 p-2 hover:bg-black/5 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-600 flex-shrink-0" strokeWidth={2.5} />
                  <h3 className="text-base sm:text-lg truncate">Text Transformation</h3>
                </div>
              </div>
            </div>

            {/* Center: Search + Filter + Stats */}
            <div className="flex items-center gap-2 flex-1 max-w-2xl">
              {/* Search */}
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" strokeWidth={2.5} />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="pl-8 h-8 text-sm"
                />
              </div>
              
              {/* Filter */}
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-28 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Done</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Separator orientation="vertical" className="h-6" />

              {/* Compact Stats */}
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-neutral-600 tabular-nums">{stats.totalCompleted}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span className="text-neutral-600 tabular-nums">{stats.totalPending}</span>
                </div>
                {stats.selectedCount > 0 && (
                  <>
                    <Separator orientation="vertical" className="h-3" />
                    <div className="flex items-center gap-1">
                      <CheckSquare className="w-3 h-3 text-purple-600" strokeWidth={2.5} />
                      <span className="text-purple-700 tabular-nums">{stats.selectedCount}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Select All/Clear */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  className="h-7 px-2 text-xs"
                >
                  All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectNone}
                  className="h-7 px-2 text-xs"
                >
                  Clear
                </Button>
              </div>
            </div>

            {/* Right: Modernization Controls + Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Modernization Progress/Controls */}
              {isModernizing && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                    <span className="text-xs text-blue-700 tabular-nums">
                      {currentProcessingIndex}/{modernizationQueueRef.current.length + currentProcessingIndex}
                    </span>
                  </div>
                  
                  <Separator orientation="vertical" className="h-4" />
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handlePauseResume}
                      className="p-1 hover:bg-blue-100 rounded transition-colors"
                      title={isPaused ? "Resume" : "Pause"}
                    >
                      {isPaused ? (
                        <Play className="w-3.5 h-3.5 text-blue-700" strokeWidth={2.5} />
                      ) : (
                        <Pause className="w-3.5 h-3.5 text-blue-700" strokeWidth={2.5} />
                      )}
                    </button>
                    <button
                      onClick={handleStop}
                      className="p-1 hover:bg-red-100 rounded transition-colors"
                      title="Stop"
                    >
                      <X className="w-3.5 h-3.5 text-red-600" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              )}

              {/* Modernize Button */}
              {!isModernizing && stats.selectedPending > 0 && (
                <Button
                  onClick={handleModernize}
                  size="sm"
                  className="h-8 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" strokeWidth={2.5} />
                  <span className="text-xs">Modernize {stats.selectedPending}</span>
                </Button>
              )}
              
              {/* Create Audio Button */}
              {canProceedToSegments && (
                <Button
                  onClick={handleProceedClick}
                  size="sm"
                  className="h-8 px-4 bg-emerald-600 text-white gap-1.5"
                >
                  <span className="text-xs">Create Audio</span>
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content - Side by Side Text */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-4 max-w-7xl mx-auto">
            {filteredChunks.map((chunk) => {
              const isSelected = selectedChunkIds.has(chunk.id);
              const isExpanded = expandedChunkId === chunk.id;
              const isCompleted = chunk.status === "completed";
              
              return (
                <div 
                  key={chunk.id}
                  className={`group relative bg-white rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
                    isSelected
                      ? "border-purple-300 shadow-lg shadow-purple-500/10"
                      : "border-black/5 hover:border-purple-200 hover:shadow-md"
                  }`}
                >
                  {/* Selection indicator */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all ${
                    isSelected ? "bg-gradient-to-b from-purple-600 to-pink-600" : "bg-transparent"
                  }`} />

                  {/* Main Content */}
                  <div className="pl-6 pr-4 py-5">
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <button
                        onClick={() => handleChunkSelect(chunk.id)}
                        className="flex-shrink-0 mt-1 p-1 hover:bg-purple-50 rounded transition-colors"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-purple-600" strokeWidth={2.5} />
                        ) : (
                          <Square className="w-5 h-5 text-neutral-300 group-hover:text-purple-400" strokeWidth={2.5} />
                        )}
                      </button>

                      {/* Text Content */}
                      <div className="flex-1 min-w-0">
                        {/* Status Badge */}
                        <div className="flex items-center gap-2 mb-3">
                          {chunk.status === "completed" && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                              <Sparkles className="w-3 h-3" strokeWidth={2.5} />
                              <span className="text-xs">Modernized</span>
                            </div>
                          )}
                          {chunk.status === "pending" && (
                            <div className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs">
                              Pending
                            </div>
                          )}
                          {chunk.status === "processing" && (
                            <div className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs animate-pulse">
                              Processing...
                            </div>
                          )}
                          {chunk.status === "failed" && (
                            <div className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">
                              Failed
                            </div>
                          )}
                        </div>

                        {/* Side by Side Text */}
                        <div className={`grid gap-6 ${isCompleted ? 'grid-cols-2' : 'grid-cols-1'}`}>
                          {/* Original Text */}
                          <div>
                            {isCompleted && (
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-1 h-4 bg-neutral-300 rounded-full" />
                                <span className="text-xs text-neutral-500 uppercase tracking-wide">Original</span>
                              </div>
                            )}
                            <p className="text-base leading-relaxed text-neutral-700">
                              {chunk.originalText}
                            </p>
                          </div>

                          {/* Modernized Text */}
                          {isCompleted && chunk.modernizedText && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-1 h-4 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
                                <span className="text-xs text-purple-700 uppercase tracking-wide">TTS-Ready</span>
                              </div>
                              <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-lg p-3 border border-purple-200/50">
                                <p className="text-base leading-relaxed text-purple-900">
                                  {chunk.modernizedText}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Expand for Tools */}
                        {isCompleted && (
                          <div className="mt-4">
                            <button
                              onClick={(e) => handleToggleExpand(chunk.id, e)}
                              className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 transition-colors"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="w-4 h-4" strokeWidth={2.5} />
                                  <span>Hide Tools</span>
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4" strokeWidth={2.5} />
                                  <span>Edit & Regenerate</span>
                                </>
                              )}
                            </button>

                            {isExpanded && (
                              <div className="mt-3 p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-3">
                                <div>
                                  <Label className="text-xs text-neutral-600 mb-2 block">
                                    Custom regeneration instructions (optional)
                                  </Label>
                                  <Textarea
                                    value={regenerateInstructions}
                                    onChange={(e) => setRegenerateInstructions(e.target.value)}
                                    placeholder={modernizationInstructions}
                                    className="min-h-[60px] text-sm resize-none"
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <p className="text-xs text-neutral-500">
                                    Leave empty to use default instructions
                                  </p>
                                  <Button
                                    onClick={() => handleRegenerateChunk(chunk.id)}
                                    size="sm"
                                    variant="outline"
                                    className="gap-2"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" strokeWidth={2.5} />
                                    Regenerate
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Bottom Settings Bar - Modernization Instructions */}
        <div className="flex-none bg-white/90 backdrop-blur-xl border-t border-black/5 px-6 py-3">
          <div className="flex items-center gap-3">
            <Label className="text-xs text-neutral-600 whitespace-nowrap flex-shrink-0">
              Default Instructions:
            </Label>
            <Textarea
              value={modernizationInstructions}
              onChange={(e) => setModernizationInstructions(e.target.value)}
              placeholder="Describe how you want text modernized..."
              className="flex-1 min-h-[50px] text-sm resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
