import { X, Plus, Play } from "lucide-react";
import { Chunk, Batch } from "./ChunkReview";
import { Separator } from "./ui/separator";

type BatchOrganizerProps = {
  chunks: Chunk[];
  batches: Batch[];
  selectedChunkIds: Set<number>;
  onClose: () => void;
};

export function BatchOrganizer({ chunks, batches, selectedChunkIds, onClose }: BatchOrganizerProps) {
  const selectedChunks = chunks.filter(c => selectedChunkIds.has(c.id));
  const canCreateBatch = selectedChunks.length > 0;

  const aggregateStats = {
    totalChars: selectedChunks.reduce((sum, c) => sum + c.charCount, 0),
    totalTokens: selectedChunks.reduce((sum, c) => sum + c.tokenCount, 0),
    totalCost: selectedChunks.reduce((sum, c) => sum + c.estimatedCost, 0),
  };

  return (
    <div className="h-72 bg-white border-t-2 border-neutral-300 shadow-2xl flex flex-col">
      {/* Header */}
      <div className="flex-none border-b-2 border-neutral-300 px-6 py-4 bg-neutral-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg">Batch Organizer</h3>
            <p className="text-sm text-neutral-600">{batches.length} batches created</p>
          </div>
          <div className="flex items-center gap-3">
            {canCreateBatch && (
              <button className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 border-2 border-purple-700 shadow-sm">
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                Create Batch from Selection
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors border border-transparent hover:border-neutral-300"
            >
              <X className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-4">
          {/* Selection Preview */}
          {selectedChunkIds.size > 0 && (
            <div className="bg-purple-50 rounded-lg p-5 border-2 border-purple-300">
              <h4 className="mb-3">Current Selection</h4>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-purple-700 mb-1">Chunks</p>
                  <p className="text-xl text-purple-900 tabular-nums">{selectedChunks.length}</p>
                </div>
                <div>
                  <p className="text-xs text-purple-700 mb-1">Characters</p>
                  <p className="text-xl text-purple-900 tabular-nums">{aggregateStats.totalChars.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-purple-700 mb-1">Tokens</p>
                  <p className="text-xl text-purple-900 tabular-nums">{aggregateStats.totalTokens.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-purple-700 mb-1">Est. Cost</p>
                  <p className="text-xl text-purple-900 tabular-nums">${(aggregateStats.totalCost / 100).toFixed(3)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Existing Batches */}
          <div>
            <h4 className="mb-3">Existing Batches</h4>
            <div className="grid grid-cols-3 gap-4">
              {batches.map((batch) => (
                <div
                  key={batch.id}
                  className="bg-white rounded-lg p-4 border-2 border-neutral-300 hover:border-purple-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-sm">Batch #{batch.id}</h5>
                    <span className={`px-2 py-1 rounded text-xs border-2 ${
                      batch.status === "completed" ? "bg-emerald-50 text-emerald-800 border-emerald-400" :
                      batch.status === "processing" ? "bg-blue-50 text-blue-800 border-blue-400" :
                      "bg-neutral-50 text-neutral-700 border-neutral-300"
                    }`}>
                      {batch.status}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs text-neutral-600">
                    <div className="flex justify-between">
                      <span>Chunks:</span>
                      <span className="tabular-nums">{batch.chunkIds.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Chars:</span>
                      <span className="tabular-nums">{batch.totalChars.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tokens:</span>
                      <span className="tabular-nums">{batch.totalTokens.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cost:</span>
                      <span className="tabular-nums">${(batch.estimatedCost / 100).toFixed(3)}</span>
                    </div>
                  </div>
                  {batch.status === "pending" && (
                    <button className="w-full mt-3 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs flex items-center justify-center gap-1.5 border border-blue-700">
                      <Play className="w-3 h-3" strokeWidth={2.5} />
                      Process
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
