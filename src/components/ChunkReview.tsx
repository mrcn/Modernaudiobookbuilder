import { useState, useMemo } from "react";
import { ArrowLeft, CheckCircle, Clock, AlertCircle, XCircle, Edit3, Zap, Search, Settings } from "lucide-react";
import { ChunkList } from "./ChunkList";
import { ChunkDetailPanel } from "./ChunkDetailPanel";
import { ChunkContextPanel } from "./ChunkContextPanel";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

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
  chunks: Chunk[];
  onBack: () => void;
  onEditChunk: (chunkId: number, newText: string) => void;
  onProceedToAudioBuilder: () => void;
};

export function ChunkReview({ chunks, onBack, onEditChunk, onProceedToAudioBuilder }: ChunkReviewProps) {
  const [selectedChunkId, setSelectedChunkId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Mock batches for display
  const batches: Batch[] = [
    {
      id: 1,
      chunkIds: [0, 1, 2, 3, 4],
      totalChars: 2450,
      totalTokens: 612,
      estimatedCost: 1.22,
      estimatedDuration: 163,
      status: "completed",
    },
    {
      id: 2,
      chunkIds: [5, 6, 7, 8],
      totalChars: 3100,
      totalTokens: 775,
      estimatedCost: 1.55,
      estimatedDuration: 206,
      status: "processing",
    },
  ];

  const handleChunkSelect = (chunkId: number) => {
    setSelectedChunkId(chunkId === selectedChunkId ? null : chunkId);
  };

  const selectedChunk = useMemo(() => {
    if (selectedChunkId === null) return null;
    return chunks.find(c => c.id === selectedChunkId) || null;
  }, [chunks, selectedChunkId]);

  // Filter and search chunks
  const filteredChunks = useMemo(() => {
    let result = chunks;

    // Apply status filter
    if (filterStatus === "edited") {
      result = result.filter(c => c.edited);
    } else if (filterStatus === "flagged") {
      result = result.filter(c => c.flagged);
    } else if (filterStatus !== "all") {
      result = result.filter(c => c.status === filterStatus);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.modernizedText.toLowerCase().includes(query) ||
        c.originalText.toLowerCase().includes(query)
      );
    }

    return result;
  }, [chunks, filterStatus, searchQuery]);

  const stats = useMemo(() => {
    const totalWords = chunks.reduce((sum, c) => sum + c.wordCount, 0);
    const totalChars = chunks.reduce((sum, c) => sum + c.charCount, 0);
    const totalTokens = chunks.reduce((sum, c) => sum + c.tokenCount, 0);
    const totalCost = chunks.reduce((sum, c) => sum + c.estimatedCost, 0);
    
    return {
      totalChunks: chunks.length,
      totalWords,
      totalChars,
      totalTokens,
      totalCost,
      completed: chunks.filter(c => c.status === "completed").length,
      processing: chunks.filter(c => c.status === "processing").length,
      pending: chunks.filter(c => c.status === "pending").length,
      failed: chunks.filter(c => c.status === "failed").length,
      edited: chunks.filter(c => c.edited).length,
      batchesTotal: batches.length,
      batchesCompleted: batches.filter(b => b.status === "completed").length,
      batchesFailed: batches.filter(b => b.status === "failed").length,
    };
  }, [chunks, batches]);

  const handleFlagChunk = (chunkId: number) => {
    // Toggle flag - implement in parent
    console.log("Toggle flag for chunk", chunkId);
  };

  const handleReprocessChunk = (chunkId: number, instructions: string) => {
    console.log("Reprocess chunk", chunkId, "with instructions:", instructions);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-neutral-50 via-purple-50/30 to-pink-50/30">
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
                  Review, edit, and prepare chunks for audio generation
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Settings className="w-4 h-4" strokeWidth={2.5} />
                Settings
              </Button>
              
              <button
                onClick={onProceedToAudioBuilder}
                className="group relative px-6 sm:px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl flex items-center gap-3 transition-all duration-200 hover:shadow-xl hover:shadow-purple-500/25 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <Zap className="w-4 h-4 relative z-10" strokeWidth={2.5} />
                <span className="relative z-10">Build Audio</span>
              </button>
            </div>
          </div>
        </div>

        {/* Metrics Section */}
        <div className="flex-none bg-white/70 backdrop-blur-xl border-b border-black/5 p-4 sm:p-6">
          <div className="space-y-4">
            {/* Primary Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <div className="bg-white rounded-xl border border-black/5 p-3 sm:p-4 shadow-sm">
                <p className="text-xs text-neutral-600 mb-1">Total Chunks</p>
                <p className="text-xl sm:text-2xl tabular-nums">{stats.totalChunks}</p>
              </div>
              
              <div className="bg-white rounded-xl border border-black/5 p-3 sm:p-4 shadow-sm">
                <p className="text-xs text-neutral-600 mb-1">Total Words</p>
                <p className="text-xl sm:text-2xl tabular-nums">{stats.totalWords.toLocaleString()}</p>
              </div>
              
              <div className="bg-white rounded-xl border border-black/5 p-3 sm:p-4 shadow-sm">
                <p className="text-xs text-neutral-600 mb-1">Total Tokens</p>
                <p className="text-xl sm:text-2xl tabular-nums">{stats.totalTokens.toLocaleString()}</p>
              </div>

              <div className="bg-white rounded-xl border border-black/5 p-3 sm:p-4 shadow-sm">
                <p className="text-xs text-neutral-600 mb-1">Est. Cost</p>
                <p className="text-xl sm:text-2xl tabular-nums">${stats.totalCost.toFixed(2)}</p>
              </div>

              <div className="bg-white rounded-xl border border-black/5 p-3 sm:p-4 shadow-sm">
                <p className="text-xs text-neutral-600 mb-1">Batches</p>
                <p className="text-xl sm:text-2xl tabular-nums">
                  {stats.batchesCompleted}/{stats.batchesTotal}
                </p>
              </div>

              <div className="bg-white rounded-xl border border-black/5 p-3 sm:p-4 shadow-sm">
                <p className="text-xs text-neutral-600 mb-1">Edited</p>
                <p className="text-xl sm:text-2xl tabular-nums">{stats.edited}</p>
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                <CheckCircle className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
                <span className="text-sm text-emerald-900">{stats.completed} Completed</span>
              </div>
              
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                <Clock className="w-4 h-4 text-blue-600" strokeWidth={2.5} />
                <span className="text-sm text-blue-900">{stats.processing} Processing</span>
              </div>
              
              <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-neutral-600" strokeWidth={2.5} />
                <span className="text-sm text-neutral-900">{stats.pending} Pending</span>
              </div>
              
              {stats.failed > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
                  <XCircle className="w-4 h-4 text-red-600" strokeWidth={2.5} />
                  <span className="text-sm text-red-900">{stats.failed} Failed</span>
                </div>
              )}

              {stats.edited > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg">
                  <Edit3 className="w-4 h-4 text-purple-600" strokeWidth={2.5} />
                  <span className="text-sm text-purple-900">{stats.edited} Edited</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Three-Panel Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Chunk List */}
          <div className="w-80 flex flex-col bg-white border-r border-black/5">
            {/* Search and Filter */}
            <div className="flex-none p-4 space-y-3 border-b border-black/5 bg-white/70 backdrop-blur-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" strokeWidth={2.5} />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search chunks..."
                  className="pl-9"
                />
              </div>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Chunks</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="edited">Edited</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                </SelectContent>
              </Select>

              <div className="text-xs text-neutral-600">
                Showing {filteredChunks.length} of {chunks.length} chunks
              </div>
            </div>

            {/* Chunk List */}
            <ChunkList
              chunks={filteredChunks}
              selectedChunkIds={selectedChunkId !== null ? new Set([selectedChunkId]) : new Set()}
              onChunkSelect={handleChunkSelect}
              batches={batches}
            />
          </div>

          {/* Center Panel: Chunk Detail (Side-by-side text) */}
          <ChunkDetailPanel
            chunk={selectedChunk}
            onEditChunk={onEditChunk}
            onFlagChunk={handleFlagChunk}
          />

          {/* Right Panel: Context & Actions */}
          <ChunkContextPanel
            chunk={selectedChunk}
            onReprocessChunk={handleReprocessChunk}
            onFlagChunk={handleFlagChunk}
          />
        </div>
      </div>
    </div>
  );
}
