import { useState, useMemo } from "react";
import { Search, ArrowLeft, Plus, Layers } from "lucide-react";
import { Input } from "./ui/input";
import { ChunkList } from "./ChunkList";
import { ChunkDetailPanel } from "./ChunkDetailPanel";
import { DocumentNavigator } from "./DocumentNavigator";
import { BatchOrganizer } from "./BatchOrganizer";
import { ScrollArea } from "./ui/scroll-area";

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
  onMergeChunks: (startId: number, endId: number) => void;
};

export function ChunkReview({ chunks, onBack, onEditChunk, onMergeChunks }: ChunkReviewProps) {
  const [selectedChunkIds, setSelectedChunkIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterEdited, setFilterEdited] = useState<boolean | null>(null);
  const [showBatchOrganizer, setShowBatchOrganizer] = useState(false);

  // Mock batches
  const [batches] = useState<Batch[]>([
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
  ]);

  // Filter chunks
  const filteredChunks = useMemo(() => {
    return chunks.filter((chunk) => {
      if (searchQuery && !chunk.modernizedText.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (filterStatus && chunk.status !== filterStatus) {
        return false;
      }
      if (filterEdited !== null && chunk.edited !== filterEdited) {
        return false;
      }
      return true;
    });
  }, [chunks, searchQuery, filterStatus, filterEdited]);

  const handleChunkSelect = (chunkId: number, isShiftClick: boolean) => {
    if (isShiftClick && selectedChunkIds.size > 0) {
      // Range selection
      const selectedArray = Array.from(selectedChunkIds);
      const lastSelected = Math.max(...selectedArray);
      const start = Math.min(lastSelected, chunkId);
      const end = Math.max(lastSelected, chunkId);
      
      const newSelection = new Set<number>();
      for (let i = start; i <= end; i++) {
        newSelection.add(i);
      }
      setSelectedChunkIds(newSelection);
    } else {
      // Toggle single selection
      const newSelection = new Set(selectedChunkIds);
      if (newSelection.has(chunkId)) {
        newSelection.delete(chunkId);
      } else {
        newSelection.add(chunkId);
      }
      setSelectedChunkIds(newSelection);
    }
  };

  const selectedChunks = useMemo(() => {
    return chunks.filter(chunk => selectedChunkIds.has(chunk.id));
  }, [chunks, selectedChunkIds]);

  const documentStats = useMemo(() => {
    return {
      total: chunks.length,
      completed: chunks.filter(c => c.status === "completed").length,
      processing: chunks.filter(c => c.status === "processing").length,
      pending: chunks.filter(c => c.status === "pending").length,
      failed: chunks.filter(c => c.status === "failed").length,
      edited: chunks.filter(c => c.edited).length,
      flagged: chunks.filter(c => c.flagged).length,
    };
  }, [chunks]);

  return (
    <div className="h-screen flex flex-col bg-neutral-50">
      {/* Top Header */}
      <div className="flex-none bg-white border-b-2 border-neutral-300 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors border border-transparent hover:border-neutral-300"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
            </button>
            <div>
              <h3 className="text-xl">Document Review</h3>
              <p className="text-sm text-neutral-600">
                {filteredChunks.length.toLocaleString()} chunks • {selectedChunkIds.size} selected
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowBatchOrganizer(!showBatchOrganizer)}
              className={`px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-2 ${
                showBatchOrganizer
                  ? "bg-purple-100 border-purple-400 text-purple-900"
                  : "bg-white border-neutral-300 hover:border-neutral-400"
              }`}
            >
              <Layers className="w-4 h-4" strokeWidth={2.5} />
              <span className="text-sm">Batch Organizer</span>
            </button>

            {selectedChunkIds.size > 0 && (
              <button
                onClick={() => setSelectedChunkIds(new Set())}
                className="px-4 py-2 bg-neutral-100 border-2 border-neutral-300 rounded-lg hover:bg-neutral-200 transition-colors text-sm"
              >
                Clear Selection
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Navigator */}
        <DocumentNavigator
          stats={documentStats}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterStatus={filterStatus}
          onFilterStatusChange={setFilterStatus}
          filterEdited={filterEdited}
          onFilterEditedChange={setFilterEdited}
        />

        {/* Center - Chunk List */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ChunkList
            chunks={filteredChunks}
            selectedChunkIds={selectedChunkIds}
            onChunkSelect={handleChunkSelect}
            batches={batches}
          />
        </div>

        {/* Right Sidebar - Detail Panel */}
        {selectedChunkIds.size > 0 && (
          <ChunkDetailPanel
            selectedChunks={selectedChunks}
            onEditChunk={onEditChunk}
            onClose={() => setSelectedChunkIds(new Set())}
          />
        )}
      </div>

      {/* Bottom Panel - Batch Organizer */}
      {showBatchOrganizer && (
        <BatchOrganizer
          chunks={chunks}
          batches={batches}
          selectedChunkIds={selectedChunkIds}
          onClose={() => setShowBatchOrganizer(false)}
        />
      )}
    </div>
  );
}
