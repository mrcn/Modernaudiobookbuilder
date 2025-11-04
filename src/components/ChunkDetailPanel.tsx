import { useState } from "react";
import { X, Edit2, Save, Sparkles, DollarSign, Type, Hash } from "lucide-react";
import { Chunk } from "./ChunkReview";
import { ScrollArea } from "./ui/scroll-area";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";

type ChunkDetailPanelProps = {
  selectedChunks: Chunk[];
  onEditChunk: (chunkId: number, newText: string) => void;
  onClose: () => void;
};

export function ChunkDetailPanel({ selectedChunks, onEditChunk, onClose }: ChunkDetailPanelProps) {
  const [editingChunkId, setEditingChunkId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const singleChunk = selectedChunks.length === 1 ? selectedChunks[0] : null;
  const multipleSelected = selectedChunks.length > 1;

  const handleStartEdit = (chunk: Chunk) => {
    setEditingChunkId(chunk.id);
    setEditText(chunk.modernizedText);
  };

  const handleSaveEdit = () => {
    if (editingChunkId !== null) {
      onEditChunk(editingChunkId, editText);
      setEditingChunkId(null);
    }
  };

  // Aggregate stats for multiple selection
  const aggregateStats = {
    totalChars: selectedChunks.reduce((sum, c) => sum + c.charCount, 0),
    totalTokens: selectedChunks.reduce((sum, c) => sum + c.tokenCount, 0),
    totalWords: selectedChunks.reduce((sum, c) => sum + c.wordCount, 0),
    totalCost: selectedChunks.reduce((sum, c) => sum + c.estimatedCost, 0),
  };

  return (
    <div className="w-96 bg-white border-l-2 border-neutral-300 flex flex-col shadow-lg">
      {/* Header */}
      <div className="flex-none border-b-2 border-neutral-300 px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg">
            {multipleSelected ? `${selectedChunks.length} Chunks Selected` : `Chunk #${singleChunk?.id}`}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors border border-transparent hover:border-neutral-300"
          >
            <X className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
        {!multipleSelected && singleChunk && (
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-xs border-2 ${
              singleChunk.status === "completed" ? "bg-emerald-50 text-emerald-800 border-emerald-400" :
              singleChunk.status === "processing" ? "bg-blue-50 text-blue-800 border-blue-400" :
              singleChunk.status === "failed" ? "bg-red-50 text-red-800 border-red-400" :
              "bg-neutral-50 text-neutral-700 border-neutral-300"
            }`}>
              {singleChunk.status}
            </span>
            {singleChunk.edited && (
              <span className="px-2 py-1 rounded text-xs bg-blue-50 text-blue-800 border-2 border-blue-400">
                Edited
              </span>
            )}
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-neutral-50 rounded-lg p-4 border-2 border-neutral-300">
              <div className="flex items-center gap-2 mb-2">
                <Type className="w-4 h-4 text-neutral-600" strokeWidth={2.5} />
                <p className="text-xs text-neutral-600 uppercase tracking-wide">Characters</p>
              </div>
              <p className="text-2xl text-neutral-900 tabular-nums">
                {multipleSelected ? aggregateStats.totalChars.toLocaleString() : singleChunk?.charCount}
              </p>
            </div>

            <div className="bg-neutral-50 rounded-lg p-4 border-2 border-neutral-300">
              <div className="flex items-center gap-2 mb-2">
                <Hash className="w-4 h-4 text-neutral-600" strokeWidth={2.5} />
                <p className="text-xs text-neutral-600 uppercase tracking-wide">Tokens</p>
              </div>
              <p className="text-2xl text-neutral-900 tabular-nums">
                {multipleSelected ? aggregateStats.totalTokens.toLocaleString() : singleChunk?.tokenCount}
              </p>
            </div>

            <div className="bg-neutral-50 rounded-lg p-4 border-2 border-neutral-300">
              <div className="flex items-center gap-2 mb-2">
                <Type className="w-4 h-4 text-neutral-600" strokeWidth={2.5} />
                <p className="text-xs text-neutral-600 uppercase tracking-wide">Words</p>
              </div>
              <p className="text-2xl text-neutral-900 tabular-nums">
                {multipleSelected ? aggregateStats.totalWords.toLocaleString() : singleChunk?.wordCount}
              </p>
            </div>

            <div className="bg-emerald-50 rounded-lg p-4 border-2 border-emerald-400">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-emerald-700" strokeWidth={2.5} />
                <p className="text-xs text-emerald-700 uppercase tracking-wide">Est. Cost</p>
              </div>
              <p className="text-2xl text-emerald-900 tabular-nums">
                ${multipleSelected 
                  ? (aggregateStats.totalCost / 100).toFixed(3) 
                  : ((singleChunk?.estimatedCost || 0) / 100).toFixed(3)}
              </p>
            </div>
          </div>

          {/* Single Chunk Details */}
          {singleChunk && !multipleSelected && (
            <>
              <Separator />

              {/* Original Text */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-neutral-500" />
                  <p className="text-xs text-neutral-700 uppercase tracking-wider">Original Text</p>
                </div>
                <div className="bg-neutral-50 rounded-lg p-4 border-2 border-neutral-300">
                  <p className="text-sm text-neutral-800 leading-relaxed">{singleChunk.originalText}</p>
                </div>
              </div>

              <Separator />

              {/* Modernized Text */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" strokeWidth={2.5} />
                    <p className="text-xs text-purple-800 uppercase tracking-wider">Modernized Text</p>
                  </div>
                  {editingChunkId !== singleChunk.id && (
                    <button
                      onClick={() => handleStartEdit(singleChunk)}
                      className="p-1.5 hover:bg-purple-100 rounded-lg transition-colors border border-transparent hover:border-purple-300"
                    >
                      <Edit2 className="w-4 h-4 text-purple-600" strokeWidth={2.5} />
                    </button>
                  )}
                </div>

                {editingChunkId === singleChunk.id ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="min-h-[150px] border-2 border-purple-400 focus:border-purple-500 focus:ring-purple-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 border-2 border-purple-700"
                      >
                        <Save className="w-4 h-4" strokeWidth={2.5} />
                        Save
                      </button>
                      <button
                        onClick={() => setEditingChunkId(null)}
                        className="px-4 py-2 border-2 border-neutral-300 rounded-lg hover:bg-neutral-100 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border-2 border-purple-300">
                    <p className="text-sm text-neutral-900 leading-relaxed">{singleChunk.modernizedText}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Multiple Selection Info */}
          {multipleSelected && (
            <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-300">
              <p className="text-sm text-purple-900">
                You have selected {selectedChunks.length} chunks. Use the batch organizer to group them or edit them individually.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
