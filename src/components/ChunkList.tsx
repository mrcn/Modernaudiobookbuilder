import { Check } from "lucide-react";
import { Chunk, Batch } from "./ChunkReview";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";

type ChunkListProps = {
  chunks: Chunk[];
  selectedChunkIds: Set<number>;
  onChunkSelect: (chunkId: number, isShiftClick: boolean) => void;
  batches: Batch[];
};

export function ChunkList({ chunks, selectedChunkIds, onChunkSelect, batches }: ChunkListProps) {
  const getBatchForChunk = (chunkId: number) => {
    return batches.find(batch => batch.chunkIds.includes(chunkId));
  };

  const getStatusColor = (status: Chunk["status"]) => {
    switch (status) {
      case "completed": return "bg-emerald-500";
      case "processing": return "bg-blue-500";
      case "pending": return "bg-neutral-400";
      case "failed": return "bg-red-500";
    }
  };

  return (
    <div className="flex-1 bg-white border-r-2 border-neutral-300 flex flex-col">
      <div className="flex-none border-b-2 border-neutral-200 px-4 py-3 bg-neutral-50">
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-700">
            <span className="tabular-nums">{chunks.length}</span> chunks
          </p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-neutral-600">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Complete</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-neutral-600">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Processing</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-neutral-600">
              <div className="w-2 h-2 rounded-full bg-neutral-400" />
              <span>Pending</span>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div>
          {chunks.map((chunk) => {
            const isSelected = selectedChunkIds.has(chunk.id);
            const batch = getBatchForChunk(chunk.id);

            return (
              <div
                key={chunk.id}
                onClick={(e) => onChunkSelect(chunk.id, e.shiftKey)}
                className={`group border-b border-neutral-200 px-4 py-3 cursor-pointer transition-all ${
                  isSelected
                    ? "bg-purple-50 border-l-4 border-l-purple-600"
                    : "hover:bg-neutral-50 border-l-4 border-l-transparent"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Selection Indicator */}
                  <div className="flex-shrink-0 mt-1">
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-purple-600 border-purple-600"
                          : "border-neutral-400 group-hover:border-purple-400"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex-shrink-0 mt-1.5">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(chunk.status)}`} />
                  </div>

                  {/* Chunk ID */}
                  <div className="flex-shrink-0 w-12">
                    <span className="text-xs text-neutral-500 tabular-nums">#{chunk.id}</span>
                  </div>

                  {/* Text Preview */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-neutral-900 line-clamp-1">
                      {chunk.modernizedText}
                    </p>
                    {(chunk.edited || chunk.flagged || batch) && (
                      <div className="flex items-center gap-1.5 mt-1">
                        {chunk.edited && (
                          <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
                            Edited
                          </Badge>
                        )}
                        {chunk.flagged && (
                          <Badge variant="secondary" className="text-xs bg-red-50 text-red-700 border-red-300">
                            Flagged
                          </Badge>
                        )}
                        {batch && (
                          <Badge variant="secondary" className="text-xs bg-purple-50 text-purple-700 border-purple-300">
                            Batch #{batch.id}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs text-neutral-500 tabular-nums">{chunk.charCount} chars</p>
                    <p className="text-xs text-neutral-400 tabular-nums mt-0.5">{chunk.tokenCount} tokens</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
