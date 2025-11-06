import { useState } from "react";
import { 
  RotateCcw, 
  Settings, 
  Zap, 
  Play,
  Flag,
  Merge,
  Scissors,
  Trash2,
  FileText
} from "lucide-react";
import { Chunk } from "./ChunkReview";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";

type ChunkContextPanelProps = {
  chunk: Chunk | null;
  onReprocessChunk?: (chunkId: number, instructions: string) => void;
  onFlagChunk?: (chunkId: number) => void;
  onMergeWithNext?: (chunkId: number) => void;
  onSplitChunk?: (chunkId: number) => void;
  onResetChunk?: (chunkId: number) => void;
  onGenerateAudio?: (chunkId: number) => void;
};

export function ChunkContextPanel({
  chunk,
  onReprocessChunk,
  onFlagChunk,
  onMergeWithNext,
  onSplitChunk,
  onResetChunk,
  onGenerateAudio,
}: ChunkContextPanelProps) {
  const [instructions, setInstructions] = useState("Modern, casual, conversational tone");
  const [isReprocessOpen, setIsReprocessOpen] = useState(false);

  if (!chunk) {
    return (
      <div className="w-80 bg-white/70 backdrop-blur-xl border-l border-black/5 flex items-center justify-center">
        <div className="text-center px-6">
          <Settings className="w-10 h-10 text-neutral-300 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm text-neutral-500">Select a chunk to view actions</p>
        </div>
      </div>
    );
  }

  const handleReprocess = () => {
    if (onReprocessChunk) {
      onReprocessChunk(chunk.id, instructions);
      setIsReprocessOpen(false);
    }
  };

  return (
    <div className="w-80 bg-white/70 backdrop-blur-xl border-l border-black/5 flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Chunk Info Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-purple-600" strokeWidth={2.5} />
              <h4 className="text-sm">Chunk Info</h4>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">Words</span>
                <span className="tabular-nums">{chunk.wordCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">Characters</span>
                <span className="tabular-nums">{chunk.charCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">Tokens</span>
                <span className="tabular-nums">{chunk.tokenCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">Est. Cost</span>
                <span className="tabular-nums text-emerald-700">
                  ${(chunk.estimatedCost / 100).toFixed(4)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">Status</span>
                <Badge variant="secondary" className="text-xs">
                  {chunk.status}
                </Badge>
              </div>
              {chunk.edited && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Modified</span>
                  <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
                    User Edited
                  </Badge>
                </div>
              )}
              {chunk.flagged && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Flag</span>
                  <Badge variant="secondary" className="text-xs bg-red-50 text-red-700 border-red-300">
                    Needs Review
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Reprocess Section */}
          <Collapsible open={isReprocessOpen} onOpenChange={setIsReprocessOpen}>
            <div>
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                >
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-purple-600" strokeWidth={2.5} />
                    <span>Reprocess Chunk</span>
                  </div>
                  <Zap className="w-4 h-4 text-amber-500" strokeWidth={2.5} />
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-3 space-y-3">
                <div>
                  <Label className="text-xs text-neutral-600">Instructions</Label>
                  <Textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Enter modernization instructions..."
                    className="mt-2 min-h-[100px] text-sm"
                  />
                  <p className="text-xs text-neutral-500 mt-2">
                    This will re-modernize the original text with new instructions.
                  </p>
                </div>
                
                <Button
                  onClick={handleReprocess}
                  className="w-full bg-purple-600 hover:bg-purple-700 gap-2"
                >
                  <Zap className="w-4 h-4" strokeWidth={2.5} />
                  Reprocess Now
                </Button>
              </CollapsibleContent>
            </div>
          </Collapsible>

          <Separator />

          {/* Actions Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-4 h-4 text-purple-600" strokeWidth={2.5} />
              <h4 className="text-sm">Actions</h4>
            </div>
            
            <div className="space-y-2">
              {onFlagChunk && (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => onFlagChunk(chunk.id)}
                >
                  <Flag className="w-4 h-4" strokeWidth={2.5} />
                  {chunk.flagged ? "Unflag" : "Flag for Review"}
                </Button>
              )}
              
              {onMergeWithNext && (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => onMergeWithNext(chunk.id)}
                >
                  <Merge className="w-4 h-4" strokeWidth={2.5} />
                  Merge with Next
                </Button>
              )}
              
              {onSplitChunk && (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => onSplitChunk(chunk.id)}
                >
                  <Scissors className="w-4 h-4" strokeWidth={2.5} />
                  Split Chunk
                </Button>
              )}
              
              {onResetChunk && (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onResetChunk(chunk.id)}
                >
                  <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                  Reset to Original
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Audio Generation Section */}
          {onGenerateAudio && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Play className="w-4 h-4 text-purple-600" strokeWidth={2.5} />
                <h4 className="text-sm">Audio</h4>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-700">Estimated Duration</span>
                    <span className="tabular-nums">
                      ~{Math.ceil(chunk.wordCount / 2.5)}s
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-700">TTS Cost</span>
                    <span className="tabular-nums text-emerald-700">
                      ${((chunk.charCount / 1000000) * 15).toFixed(4)}
                    </span>
                  </div>
                  
                  <Button
                    onClick={() => onGenerateAudio(chunk.id)}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gap-2"
                  >
                    <Play className="w-4 h-4" strokeWidth={2.5} />
                    Generate Audio
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Segment Info (if assigned) */}
          <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
            <div className="text-xs text-neutral-600 mb-2">Segment Assignment</div>
            <div className="text-sm">
              <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-300">
                Segment #7
              </Badge>
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              Part of a segment with chunks 20-25
            </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
