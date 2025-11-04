import { useState, useMemo } from "react";
import { Search, Edit, Merge, ArrowLeft, Check, X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";

export type Chunk = {
  id: number;
  originalText: string;
  modernizedText: string;
  charCount: number;
  tokenCount: number;
  wordCount: number;
  estimatedCost: number; // in cents
  edited: boolean;
  flagged: boolean;
  batchId?: number;
  status: "pending" | "processing" | "completed" | "failed";
};

type ChunkReviewProps = {
  chunks: Chunk[];
  onBack: () => void;
  onEditChunk: (chunkId: number, newText: string) => void;
  onMergeChunks: (startId: number, endId: number) => void;
};

export function ChunkReview({ chunks, onBack, onEditChunk, onMergeChunks }: ChunkReviewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChunks, setSelectedChunks] = useState<Set<number>>(new Set());
  const [expandedChunk, setExpandedChunk] = useState<number | null>(null);
  const [editingChunk, setEditingChunk] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [filterEdited, setFilterEdited] = useState<boolean | null>(null);
  const [filterLong, setFilterLong] = useState<boolean | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const ITEMS_PER_PAGE = 50;

  // Filter chunks
  const filteredChunks = useMemo(() => {
    return chunks.filter((chunk) => {
      // Search filter
      if (searchQuery && !chunk.modernizedText.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Edited filter
      if (filterEdited !== null && chunk.edited !== filterEdited) {
        return false;
      }
      
      // Long chunks filter (>1000 chars)
      if (filterLong !== null) {
        const isLong = chunk.charCount > 1000;
        if (filterLong !== isLong) {
          return false;
        }
      }
      
      return true;
    });
  }, [chunks, searchQuery, filterEdited, filterLong]);

  const handleChunkClick = (chunkId: number, isShiftClick: boolean) => {
    if (isShiftClick && selectedChunks.size > 0) {
      // Range selection
      const selectedArray = Array.from(selectedChunks);
      const lastSelected = Math.max(...selectedArray);
      const start = Math.min(lastSelected, chunkId);
      const end = Math.max(lastSelected, chunkId);
      
      const newSelection = new Set<number>();
      for (let i = start; i <= end; i++) {
        newSelection.add(i);
      }
      setSelectedChunks(newSelection);
    } else {
      // Toggle selection
      const newSelection = new Set(selectedChunks);
      if (newSelection.has(chunkId)) {
        newSelection.delete(chunkId);
      } else {
        newSelection.add(chunkId);
      }
      setSelectedChunks(newSelection);
    }
  };

  const handleStartEdit = (chunk: Chunk) => {
    setEditingChunk(chunk.id);
    setEditText(chunk.modernizedText);
  };

  const handleSaveEdit = () => {
    if (editingChunk !== null) {
      onEditChunk(editingChunk, editText);
      setEditingChunk(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingChunk(null);
    setEditText("");
  };

  const handleMergeSelected = () => {
    if (selectedChunks.size < 2) return;
    const selected = Array.from(selectedChunks).sort((a, b) => a - b);
    onMergeChunks(selected[0], selected[selected.length - 1]);
    setSelectedChunks(new Set());
  };

  // Pagination
  const totalPages = Math.ceil(filteredChunks.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredChunks.length);
  const paginatedChunks = filteredChunks.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(0, Math.min(page, totalPages - 1)));
  };

  const ChunkRow = ({ chunk }: { chunk: Chunk }) => {
    const isSelected = selectedChunks.has(chunk.id);
    const isExpanded = expandedChunk === chunk.id;
    const isEditing = editingChunk === chunk.id;

    const handleRowClick = (e: React.MouseEvent) => {
      // Don't expand if clicking checkbox or edit button
      if ((e.target as HTMLElement).closest('button')) return;
      if (!isEditing) {
        setExpandedChunk(isExpanded ? null : chunk.id);
      }
    };

    const statusColors = {
      pending: "bg-slate-100 text-slate-800 border-slate-400",
      processing: "bg-blue-100 text-blue-800 border-blue-400",
      completed: "bg-emerald-100 text-emerald-800 border-emerald-500",
      failed: "bg-red-100 text-red-800 border-red-400",
    };

    return (
      <div className={`border-b-2 ${isExpanded ? "border-purple-300" : "border-neutral-300"} last:border-b-0`}>
        <div
          onClick={handleRowClick}
          className={`group transition-all duration-200 cursor-pointer ${
            isSelected
              ? "bg-purple-50 hover:bg-purple-100/80 border-l-4 border-l-purple-600"
              : "bg-white hover:bg-neutral-50/80 border-l-4 border-l-transparent hover:border-l-neutral-300"
          } ${isExpanded ? "shadow-sm bg-neutral-50/50" : ""}`}
        >
          <div className="px-6 py-4">
            <div className="flex items-start gap-6">
              {/* Selection checkbox */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleChunkClick(chunk.id, e.shiftKey);
                }}
                className={`w-5 h-5 rounded-md border-2 transition-all flex-shrink-0 mt-1 ${
                  isSelected
                    ? "bg-purple-600 border-purple-600 shadow-sm"
                    : "border-neutral-500 hover:border-purple-600 hover:shadow-sm"
                } flex items-center justify-center`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
              </button>

              {/* Chunk ID */}
              <div className="w-20 flex-shrink-0">
                <span className="text-sm text-neutral-700 tabular-nums px-2 py-1 bg-neutral-100 rounded-md border border-neutral-300">
                  #{chunk.id}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full min-h-[120px] px-4 py-3 border-2 border-purple-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none text-neutral-900 shadow-sm"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={handleSaveEdit}
                        className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm border border-purple-700"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-6 py-2.5 border-2 border-neutral-400 rounded-lg hover:bg-neutral-100 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className={`text-neutral-900 leading-relaxed ${!isExpanded && "line-clamp-2"}`}>
                      {chunk.modernizedText}
                    </p>
                  </>
                )}
              </div>

              {/* Metadata Pills */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="flex items-center gap-2 px-3.5 py-2 bg-white rounded-lg border-2 border-neutral-300 shadow-sm">
                  <span className="text-xs text-neutral-600">Chars</span>
                  <span className="text-neutral-900 tabular-nums">{chunk.charCount}</span>
                </div>
                
                <div className="flex items-center gap-2 px-3.5 py-2 bg-white rounded-lg border-2 border-neutral-300 shadow-sm">
                  <span className="text-xs text-neutral-600">Tokens</span>
                  <span className="text-neutral-900 tabular-nums">{chunk.tokenCount}</span>
                </div>

                <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 rounded-lg border-2 border-emerald-400 shadow-sm">
                  <span className="text-xs text-emerald-700">Cost</span>
                  <span className="text-emerald-900 tabular-nums">${(chunk.estimatedCost / 100).toFixed(3)}</span>
                </div>

                <div className={`px-3.5 py-2 rounded-lg border-2 text-xs shadow-sm uppercase tracking-wide ${statusColors[chunk.status]}`}>
                  {chunk.status}
                </div>
              </div>

              {/* Edit button */}
              {!isEditing && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartEdit(chunk);
                  }}
                  className="p-2.5 hover:bg-purple-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0 border-2 border-transparent hover:border-purple-300"
                  title="Edit chunk"
                >
                  <Edit className="w-4 h-4 text-purple-600" strokeWidth={2.5} />
                </button>
              )}
            </div>

            {/* Status badges row */}
            {!isEditing && (chunk.edited || chunk.charCount > 1000 || chunk.flagged || chunk.batchId !== undefined) && (
              <div className="flex items-center gap-2 mt-4 ml-[132px]">
                {chunk.edited && (
                  <Badge className="bg-blue-100 text-blue-900 border-2 border-blue-400 hover:bg-blue-100 shadow-sm">
                    ✓ Edited
                  </Badge>
                )}
                {chunk.charCount > 1000 && (
                  <Badge className="bg-amber-100 text-amber-900 border-2 border-amber-400 hover:bg-amber-100 shadow-sm">
                    ⚠ Long chunk
                  </Badge>
                )}
                {chunk.flagged && (
                  <Badge className="bg-red-100 text-red-900 border-2 border-red-400 hover:bg-red-100 shadow-sm">
                    🚩 Flagged
                  </Badge>
                )}
                {chunk.batchId !== undefined && (
                  <Badge className="bg-purple-100 text-purple-900 border-2 border-purple-400 hover:bg-purple-100 shadow-sm">
                    📦 Batch #{chunk.batchId}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Expanded view with diff */}
          {isExpanded && !isEditing && (
            <div className="px-6 pb-6 pt-2">
              <div className="bg-gradient-to-br from-white via-purple-50/40 to-pink-50/40 rounded-xl border-2 border-neutral-400 shadow-lg p-6">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-neutral-400">
                      <div className="w-2 h-2 rounded-full bg-neutral-600 shadow-sm" />
                      <p className="text-xs text-neutral-800 uppercase tracking-wider">Original Text</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border-2 border-neutral-300 shadow-sm">
                      <p className="text-neutral-800 leading-relaxed">{chunk.originalText}</p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-purple-500">
                      <Sparkles className="w-4 h-4 text-purple-600" strokeWidth={2.5} />
                      <p className="text-xs text-purple-900 uppercase tracking-wider">Modernized Text</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border-2 border-purple-300 shadow-sm">
                      <p className="text-neutral-900 leading-relaxed">{chunk.modernizedText}</p>
                    </div>
                  </div>
                </div>

                {/* Additional metadata */}
                <div className="mt-8 pt-6 border-t-2 border-neutral-400">
                  <p className="text-xs text-neutral-700 uppercase tracking-wider mb-4">Detailed Metrics</p>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-5 border-2 border-neutral-300 shadow-md hover:shadow-lg transition-shadow">
                      <p className="text-xs text-neutral-600 mb-2 uppercase tracking-wide">Word Count</p>
                      <p className="text-2xl text-neutral-900 tabular-nums">{chunk.wordCount}</p>
                    </div>
                    <div className="bg-white rounded-lg p-5 border-2 border-neutral-300 shadow-md hover:shadow-lg transition-shadow">
                      <p className="text-xs text-neutral-600 mb-2 uppercase tracking-wide">Characters</p>
                      <p className="text-2xl text-neutral-900 tabular-nums">{chunk.charCount}</p>
                    </div>
                    <div className="bg-white rounded-lg p-5 border-2 border-blue-300 shadow-md hover:shadow-lg transition-shadow">
                      <p className="text-xs text-blue-700 mb-2 uppercase tracking-wide">Tokens</p>
                      <p className="text-2xl text-blue-900 tabular-nums">{chunk.tokenCount}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-5 border-2 border-emerald-500 shadow-md hover:shadow-lg transition-shadow">
                      <p className="text-xs text-emerald-800 mb-2 uppercase tracking-wide">Est. Cost</p>
                      <p className="text-2xl text-emerald-900 tabular-nums">${(chunk.estimatedCost / 100).toFixed(3)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-none bg-white border-b-2 border-neutral-400 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors border-2 border-transparent hover:border-neutral-300"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
            </button>
            <div>
              <h3 className="text-xl">Chunk Review</h3>
              <p className="text-sm text-neutral-700">
                {filteredChunks.length.toLocaleString()} of {chunks.length.toLocaleString()} chunks
              </p>
            </div>
          </div>

          {selectedChunks.size > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-neutral-700 px-3 py-1.5 bg-neutral-100 rounded-lg border-2 border-neutral-300">
                {selectedChunks.size} selected
              </span>
              <button
                onClick={handleMergeSelected}
                disabled={selectedChunks.size < 2}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-neutral-300 text-white rounded-lg text-sm flex items-center gap-2 transition-colors shadow-sm border-2 border-purple-700 disabled:border-neutral-400"
              >
                <Merge className="w-4 h-4" strokeWidth={2.5} />
                Merge
              </button>
              <button
                onClick={() => setSelectedChunks(new Set())}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors border-2 border-transparent hover:border-neutral-300"
              >
                <X className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" strokeWidth={2.5} />
            <Input
              type="text"
              placeholder="Search chunks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-2 border-neutral-400 focus:border-purple-500 shadow-sm"
            />
          </div>

          <button
            onClick={() => setFilterEdited(filterEdited === true ? null : true)}
            className={`px-5 py-2 rounded-lg text-sm border-2 transition-colors shadow-sm ${
              filterEdited === true
                ? "bg-blue-100 border-blue-400 text-blue-900"
                : "bg-white border-neutral-400 hover:bg-neutral-50 hover:border-neutral-500"
            }`}
          >
            Edited only
          </button>

          <button
            onClick={() => setFilterLong(filterLong === true ? null : true)}
            className={`px-5 py-2 rounded-lg text-sm border-2 transition-colors shadow-sm ${
              filterLong === true
                ? "bg-amber-100 border-amber-400 text-amber-900"
                : "bg-white border-neutral-400 hover:bg-neutral-50 hover:border-neutral-500"
            }`}
          >
            Long chunks
          </button>
        </div>
      </div>

      {/* Chunk List */}
      <div className="flex-1 bg-neutral-100 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="border-t-2 border-neutral-400">
            {paginatedChunks.map((chunk) => (
              <ChunkRow key={chunk.id} chunk={chunk} />
            ))}
          </div>
        </ScrollArea>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="border-t-2 border-neutral-400 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-800 px-3 py-1.5 bg-neutral-100 rounded-lg border-2 border-neutral-300">
                Showing <span className="tabular-nums">{startIndex + 1}-{endIndex}</span> of <span className="tabular-nums">{filteredChunks.length}</span> chunks
              </p>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="p-2.5 rounded-lg hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-2 border-neutral-400 disabled:border-neutral-300 hover:shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
                </button>
                
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i;
                    } else if (currentPage < 3) {
                      pageNum = i;
                    } else if (currentPage > totalPages - 4) {
                      pageNum = totalPages - 5 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`min-w-[36px] h-9 px-2 rounded-lg text-sm transition-colors border-2 shadow-sm ${
                          currentPage === pageNum
                            ? "bg-purple-600 text-white border-purple-700"
                            : "bg-white border-neutral-400 hover:bg-neutral-100 hover:border-neutral-500"
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                  className="p-2.5 rounded-lg hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-2 border-neutral-400 disabled:border-neutral-300 hover:shadow-sm"
                >
                  <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
