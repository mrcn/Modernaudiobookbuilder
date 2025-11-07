import { useState, useMemo } from "react";
import { ArrowLeft, Zap, Search, Filter, CheckSquare, Square, ChevronDown, ChevronUp, RotateCcw, Check, ArrowRight, Settings } from "lucide-react";
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
  modernizationInstructions?: string; // Store what instructions were used
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
    // Rough token estimate: ~1.3 tokens per word
    const tokenCount = Math.round(wordCount * 1.3);
    const estimatedCost = (tokenCount / 1000) * 0.09 + (charCount / 1000000) * 15;

    // Make some chunks completed to test the UI
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
  // Use provided chunks or generate mock chunks for testing
  const [chunks, setChunks] = useState<Chunk[]>(providedChunks || generateMockChunks());
  const [selectedChunkIds, setSelectedChunkIds] = useState<Set<number>>(new Set());
  const [expandedChunkId, setExpandedChunkId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [modernizationInstructions, setModernizationInstructions] = useState(
    "Modern, casual, conversational tone. Update archaic language while preserving the original meaning and literary style."
  );
  const [regenerateInstructions, setRegenerateInstructions] = useState("");
  const [showSegmentConfig, setShowSegmentConfig] = useState(false);
  const [targetSegmentDuration, setTargetSegmentDuration] = useState(60); // Duration in seconds

  // Filter chunks
  const filteredChunks = useMemo(() => {
    let result = chunks;

    // Apply status filter
    if (filterStatus === "pending") {
      result = result.filter(c => c.status === "pending");
    } else if (filterStatus === "completed") {
      result = result.filter(c => c.status === "completed");
    } else if (filterStatus === "failed") {
      result = result.filter(c => c.status === "failed");
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.originalText.toLowerCase().includes(query) ||
        c.modernizedText.toLowerCase().includes(query)
      );
    }

    return result;
  }, [chunks, filterStatus, searchQuery]);

  // Calculate dynamic stats based on selection
  const stats = useMemo(() => {
    const selectedChunks = chunks.filter(c => selectedChunkIds.has(c.id));
    const totalWords = selectedChunks.reduce((sum, c) => sum + c.wordCount, 0);
    const totalChars = selectedChunks.reduce((sum, c) => sum + c.charCount, 0);
    const totalTokens = selectedChunks.reduce((sum, c) => sum + c.tokenCount, 0);
    
    // Only calculate modernization cost for pending chunks
    const pendingSelectedChunks = selectedChunks.filter(c => c.status === "pending");
    const pendingTokens = pendingSelectedChunks.reduce((sum, c) => sum + c.tokenCount, 0);
    const modernizationCost = (pendingTokens / 1000) * 0.09;
    
    return {
      totalPending: chunks.filter(c => c.status === "pending").length,
      totalCompleted: chunks.filter(c => c.status === "completed").length,
      totalFailed: chunks.filter(c => c.status === "failed").length,
      selectedCount: selectedChunkIds.size,
      selectedPending: pendingSelectedChunks.length,
      totalWords,
      totalChars,
      totalTokens,
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

  const handleModernize = () => {
    // Simulate modernization
    const selectedIds = Array.from(selectedChunkIds);
    const pendingIds = selectedIds.filter(id => {
      const chunk = chunks.find(c => c.id === id);
      return chunk && chunk.status === "pending";
    });

    if (pendingIds.length === 0) return;

    // Update chunks to processing
    setChunks(prev => prev.map(chunk => 
      pendingIds.includes(chunk.id)
        ? { ...chunk, status: "processing" as const }
        : chunk
    ));

    // Simulate API call
    setTimeout(() => {
      setChunks(prev => prev.map(chunk => {
        if (pendingIds.includes(chunk.id)) {
          // Simple modernization simulation
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
    }, 2000);
  };

  const handleRegenerateChunk = (chunkId: number) => {
    const instructions = regenerateInstructions || modernizationInstructions;
    
    // Update chunk to processing
    setChunks(prev => prev.map(chunk =>
      chunk.id === chunkId
        ? { ...chunk, status: "processing" as const }
        : chunk
    ));

    // Simulate regeneration
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

    // Calculate average chunk duration
    // Assumption: ~150 words per minute reading speed
    const totalWords = completedChunks.reduce((sum, c) => sum + c.wordCount, 0);
    const avgWordsPerChunk = totalWords / completedChunks.length;
    const avgChunkDuration = (avgWordsPerChunk / 150) * 60; // in seconds
    
    // Calculate how many chunks fit in target duration
    const chunksPerSegment = Math.max(1, Math.round(targetSegmentDuration / avgChunkDuration));
    
    // Calculate total segments needed
    const totalSegments = Math.ceil(completedChunks.length / chunksPerSegment);
    
    // Calculate actual total duration
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
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
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
                  <span className="text-3xl tabular-nums text-blue-900">{targetSegmentDuration}</span>
                  <span className="text-sm text-blue-700">seconds</span>
                </div>
              </div>
              
              <Slider
                value={[targetSegmentDuration]}
                min={15}
                max={300}
                step={15}
                onValueChange={(value) => setTargetSegmentDuration(value[0])}
                className="mb-3"
              />
              
              <div className="flex items-center justify-between text-xs text-blue-600">
                <span>15s (very short)</span>
                <span>{formatTime(targetSegmentDuration)}</span>
                <span>5m (very long)</span>
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

      {/* Ambient background blur elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 h-full flex flex-col">
        {/* Top Header */}
        <div className="flex-none bg-white/70 backdrop-blur-xl border-b border-black/5 px-4 sm:px-6 py-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-black/5 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
              </button>
              <div>
                <h3 className="text-lg sm:text-xl">Chunk Workspace</h3>
                <p className="text-xs sm:text-sm text-neutral-600">
                  Modernize chunks, then create audio segments
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {stats.selectedPending > 0 && (
                <button
                  onClick={handleModernize}
                  className="group relative px-6 sm:px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl flex items-center gap-3 transition-all duration-200 hover:shadow-xl hover:shadow-purple-500/25 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                  <Zap className="w-4 h-4 relative z-10" strokeWidth={2.5} />
                  <span className="relative z-10">Modernize {stats.selectedPending}</span>
                </button>
              )}
              
              {canProceedToSegments && (
                <button
                  onClick={handleProceedClick}
                  className="px-6 sm:px-8 py-3 bg-emerald-600 text-white rounded-xl flex items-center gap-3 transition-all duration-200 hover:shadow-xl hover:shadow-emerald-500/25 hover:scale-105"
                >
                  <span>Create Segments</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Stats Bar */}
        <div className="flex-none bg-white/70 backdrop-blur-xl border-b border-black/5 p-4 sm:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="bg-white rounded-xl border border-black/5 p-3 sm:p-4 shadow-sm">
              <p className="text-xs text-neutral-600 mb-1">Total Chunks</p>
              <p className="text-xl sm:text-2xl tabular-nums text-neutral-900">{chunks.length}</p>
            </div>
            
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-3 sm:p-4 shadow-sm">
              <p className="text-xs text-amber-700 mb-1">Pending</p>
              <p className="text-xl sm:text-2xl tabular-nums text-amber-900">{stats.totalPending}</p>
            </div>

            <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-3 sm:p-4 shadow-sm">
              <p className="text-xs text-emerald-700 mb-1">Completed</p>
              <p className="text-xl sm:text-2xl tabular-nums text-emerald-900">{stats.totalCompleted}</p>
            </div>
            
            <div className="bg-white rounded-xl border border-black/5 p-3 sm:p-4 shadow-sm">
              <p className="text-xs text-neutral-600 mb-1">Selected</p>
              <p className="text-xl sm:text-2xl tabular-nums text-purple-700">{stats.selectedCount}</p>
            </div>

            {stats.selectedPending > 0 && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-3 sm:p-4 shadow-sm">
                <p className="text-xs text-purple-700 mb-1">Est. Cost</p>
                <p className="text-base sm:text-lg tabular-nums text-purple-900">
                  ${stats.modernizationCost.toFixed(3)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Two-Panel Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Chunk List */}
          <div className="flex-1 flex flex-col bg-white border-r border-black/5">
            {/* Search and Filter */}
            <div className="flex-none p-4 space-y-3 border-b border-black/5 bg-white/70 backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" strokeWidth={2.5} />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search chunks..."
                    className="pl-9"
                  />
                </div>
                
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Chunks</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-neutral-600">
                  Showing {filteredChunks.length} chunks • {stats.selectedCount} selected
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAll}
                    className="h-7 text-xs"
                  >
                    Select All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectNone}
                    className="h-7 text-xs"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>

            {/* Chunk List */}
            <ScrollArea className="flex-1">
              <div className="bg-white/70 backdrop-blur-xl">
                {filteredChunks.map((chunk) => {
                  const isSelected = selectedChunkIds.has(chunk.id);
                  const isExpanded = expandedChunkId === chunk.id;
                  
                  return (
                    <div key={chunk.id}>
                      <div
                        onClick={() => handleChunkSelect(chunk.id)}
                        className={`group border-b border-black/5 px-4 py-3 cursor-pointer transition-all ${
                          isSelected
                            ? "bg-purple-50 border-l-4 border-l-purple-600"
                            : "hover:bg-neutral-50 border-l-4 border-l-transparent"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Selection checkbox */}
                          <div className="flex-shrink-0 mt-1">
                            {isSelected ? (
                              <CheckSquare className="w-5 h-5 text-purple-600" strokeWidth={2.5} />
                            ) : (
                              <Square className="w-5 h-5 text-neutral-400 group-hover:text-purple-400" strokeWidth={2.5} />
                            )}
                          </div>

                          {/* Chunk content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-xs text-neutral-500">Chunk #{chunk.id}</p>
                              <Badge 
                                variant={chunk.status === "completed" ? "default" : chunk.status === "failed" ? "destructive" : "secondary"}
                                className={`text-xs ${chunk.status === "completed" ? "bg-emerald-600" : ""}`}
                              >
                                {chunk.status === "processing" ? "Processing..." : chunk.status}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {chunk.wordCount} words
                              </Badge>
                            </div>

                            {/* Original Text */}
                            <p className="text-sm text-neutral-900 line-clamp-2 mb-2">
                              {chunk.originalText}
                            </p>

                            {/* Modernized Text (if available) */}
                            {chunk.status === "completed" && chunk.modernizedText && (
                              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-2 border border-purple-200">
                                <div className="flex items-center gap-2 mb-1">
                                  <Check className="w-3 h-3 text-emerald-600" strokeWidth={2.5} />
                                  <span className="text-xs text-purple-700">Modernized</span>
                                </div>
                                <p className="text-sm text-purple-900 line-clamp-2">
                                  {chunk.modernizedText}
                                </p>
                              </div>
                            )}

                            <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500">
                              <span>{chunk.charCount} chars</span>
                              <span>•</span>
                              <span>{chunk.tokenCount} tokens</span>
                            </div>
                          </div>

                          {/* Expand button */}
                          {chunk.status === "completed" && (
                            <button
                              onClick={(e) => handleToggleExpand(chunk.id, e)}
                              className="flex-shrink-0 p-2 hover:bg-black/5 rounded-lg transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" strokeWidth={2.5} />
                              ) : (
                                <ChevronDown className="w-4 h-4" strokeWidth={2.5} />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expanded Detail View */}
                      {isExpanded && chunk.status === "completed" && (
                        <div className="border-b border-black/5 bg-gradient-to-br from-purple-50/50 to-pink-50/50 p-6">
                          <div className="max-w-4xl">
                            <h4 className="text-sm mb-4">Chunk #{chunk.id} Details</h4>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                              {/* Original */}
                              <div>
                                <Label className="text-xs text-neutral-600 mb-2 block">Original Text</Label>
                                <div className="bg-white rounded-lg border border-neutral-200 p-4">
                                  <p className="text-sm text-neutral-900 whitespace-pre-wrap">
                                    {chunk.originalText}
                                  </p>
                                </div>
                              </div>

                              {/* Modernized */}
                              <div>
                                <Label className="text-xs text-purple-700 mb-2 block">Modernized Text</Label>
                                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-4">
                                  <p className="text-sm text-purple-900 whitespace-pre-wrap">
                                    {chunk.modernizedText}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <Separator className="my-4" />

                            {/* Instructions Used */}
                            <div className="mb-4">
                              <Label className="text-xs text-neutral-600 mb-2 block">Instructions Used</Label>
                              <div className="bg-white rounded-lg border border-neutral-200 p-3">
                                <p className="text-sm text-neutral-700">
                                  {chunk.modernizationInstructions || "Default modernization instructions"}
                                </p>
                              </div>
                            </div>

                            {/* Regenerate Section */}
                            <div>
                              <Label className="text-xs text-neutral-600 mb-2 block">Regenerate with New Instructions</Label>
                              <div className="flex gap-2">
                                <Textarea
                                  value={regenerateInstructions}
                                  onChange={(e) => setRegenerateInstructions(e.target.value)}
                                  placeholder="Enter new instructions or leave empty to use current settings..."
                                  className="flex-1 min-h-[80px] text-sm"
                                />
                                <Button
                                  onClick={() => handleRegenerateChunk(chunk.id)}
                                  variant="outline"
                                  className="gap-2"
                                  disabled={chunk.status === "processing"}
                                >
                                  <RotateCcw className="w-4 h-4" strokeWidth={2.5} />
                                  Regenerate
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {filteredChunks.length === 0 && (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <Filter className="w-12 h-12 text-neutral-300 mx-auto mb-3" strokeWidth={1.5} />
                      <p className="text-neutral-500">No chunks match your filters</p>
                      <p className="text-xs text-neutral-400 mt-1">
                        Try adjusting your search or filter
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right Panel: Configuration */}
          <div className="w-96 bg-white/70 backdrop-blur-xl border-l border-black/5 flex flex-col">
            <div className="flex-none px-6 py-4 border-b border-black/5">
              <h4 className="text-sm">Modernization Settings</h4>
              <p className="text-xs text-neutral-600 mt-1">
                Configure how chunks will be modernized
              </p>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-6 space-y-6">
                {/* Instructions */}
                <div>
                  <Label className="text-sm mb-2 block">Instructions</Label>
                  <Textarea
                    value={modernizationInstructions}
                    onChange={(e) => setModernizationInstructions(e.target.value)}
                    placeholder="Describe how you want the text modernized..."
                    className="min-h-[150px] text-sm"
                  />
                  <p className="text-xs text-neutral-500 mt-2">
                    These instructions will be used for newly selected chunks.
                  </p>
                </div>

                {/* Quick presets */}
                <div>
                  <Label className="text-sm mb-2 block">Quick Presets</Label>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-left text-xs"
                      onClick={() => setModernizationInstructions("Modern, casual, conversational tone. Update archaic language while preserving the original meaning and literary style.")}
                    >
                      Casual & Conversational
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-left text-xs"
                      onClick={() => setModernizationInstructions("Preserve the formal literary style but make the language accessible to modern readers. Update only the most archaic terms.")}
                    >
                      Literary & Accessible
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-left text-xs"
                      onClick={() => setModernizationInstructions("Simplify complex sentences. Use contemporary language. Make it easy to understand for all readers.")}
                    >
                      Simple & Clear
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Workflow Guide */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                  <h5 className="text-sm mb-2 text-blue-900">Workflow</h5>
                  <ol className="text-xs text-blue-800 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center text-xs">1</span>
                      <span>Select pending chunks to modernize</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center text-xs">2</span>
                      <span>Click "Modernize" to process them</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center text-xs">3</span>
                      <span>Review before/after text inline</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-200 flex items-center justify-center text-xs">4</span>
                      <span>Proceed to create audio segments</span>
                    </li>
                  </ol>
                </div>

                {/* Progress Summary */}
                <div className="bg-white rounded-lg border border-neutral-200 p-4">
                  <h5 className="text-sm mb-3">Progress</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Total Chunks</span>
                      <span className="tabular-nums">{chunks.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Modernized</span>
                      <span className="tabular-nums text-emerald-700">{stats.totalCompleted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Remaining</span>
                      <span className="tabular-nums text-amber-700">{stats.totalPending}</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2 mt-3">
                      <div 
                        className="bg-gradient-to-r from-emerald-600 to-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${(stats.totalCompleted / chunks.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
