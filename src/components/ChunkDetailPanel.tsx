import { useState } from "react";
import { Edit2, Save, RotateCcw, Flag, Copy, Sparkles } from "lucide-react";
import { Chunk } from "./ChunkReview";
import { ScrollArea } from "./ui/scroll-area";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

type ChunkDetailPanelProps = {
  chunk: Chunk | null;
  onEditChunk: (chunkId: number, newText: string) => void;
  onFlagChunk?: (chunkId: number) => void;
  onRevertChunk?: (chunkId: number) => void;
};

export function ChunkDetailPanel({ 
  chunk, 
  onEditChunk, 
  onFlagChunk,
  onRevertChunk 
}: ChunkDetailPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");

  if (!chunk) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-neutral-50 via-purple-50/20 to-pink-50/20">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-neutral-300 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-neutral-500">Select a chunk to view and edit</p>
        </div>
      </div>
    );
  }

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditText(chunk.modernizedText);
  };

  const handleSaveEdit = () => {
    onEditChunk(chunk.id, editText);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText("");
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(chunk.modernizedText);
  };

  return (
    <div className="flex-1 flex flex-col bg-white border-r border-black/5">
      {/* Header */}
      <div className="flex-none border-b border-black/5 px-6 py-4 bg-white/70 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h3 className="text-lg">Chunk #{chunk.id}</h3>
            <Badge variant={chunk.status === "completed" ? "default" : "secondary"}>
              {chunk.status}
            </Badge>
            {chunk.edited && (
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-300">
                Edited
              </Badge>
            )}
            {chunk.flagged && (
              <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-300">
                Flagged
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyText}
                  className="gap-2"
                >
                  <Copy className="w-4 h-4" strokeWidth={2.5} />
                  Copy
                </Button>
                {onFlagChunk && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onFlagChunk(chunk.id)}
                    className="gap-2"
                  >
                    <Flag className="w-4 h-4" strokeWidth={2.5} />
                    Flag
                  </Button>
                )}
                {onRevertChunk && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRevertChunk(chunk.id)}
                    className="gap-2"
                  >
                    <RotateCcw className="w-4 h-4" strokeWidth={2.5} />
                    Revert
                  </Button>
                )}
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleStartEdit}
                  className="gap-2 bg-purple-600 hover:bg-purple-700"
                >
                  <Edit2 className="w-4 h-4" strokeWidth={2.5} />
                  Edit
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-neutral-600">
          <span>{chunk.wordCount} words</span>
          <span>•</span>
          <span>{chunk.charCount} chars</span>
          <span>•</span>
          <span>{chunk.tokenCount} tokens</span>
          <span>•</span>
          <span className="text-emerald-700">${(chunk.estimatedCost / 100).toFixed(4)} est.</span>
        </div>
      </div>

      {/* Side-by-side text comparison */}
      <div className="flex-1 flex overflow-hidden">
        {/* Original Text (Left) */}
        <div className="flex-1 flex flex-col border-r border-black/5">
          <div className="flex-none px-4 py-3 border-b border-black/5 bg-neutral-50">
            <p className="text-xs text-neutral-700 uppercase tracking-wider">Original Text</p>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-6">
              <p className="text-sm text-neutral-800 leading-relaxed whitespace-pre-wrap">
                {chunk.originalText}
              </p>
            </div>
          </ScrollArea>
        </div>

        {/* Modernized Text (Right) */}
        <div className="flex-1 flex flex-col">
          <div className="flex-none px-4 py-3 border-b border-black/5 bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" strokeWidth={2.5} />
              <p className="text-xs text-purple-800 uppercase tracking-wider">Modernized Text</p>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-6">
              {isEditing ? (
                <Textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="min-h-[400px] text-sm leading-relaxed resize-none border-2 border-purple-300 focus:border-purple-500"
                  placeholder="Edit modernized text..."
                />
              ) : (
                <p className="text-sm text-neutral-900 leading-relaxed whitespace-pre-wrap">
                  {chunk.modernizedText}
                </p>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Edit Actions Footer */}
      {isEditing && (
        <div className="flex-none border-t border-black/5 px-6 py-4 bg-white flex items-center justify-between gap-3">
          <div className="text-xs text-neutral-600">
            {editText.split(/\s+/).length} words • {editText.length} characters
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleCancelEdit}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="bg-purple-600 hover:bg-purple-700 gap-2"
            >
              <Save className="w-4 h-4" strokeWidth={2.5} />
              Save Changes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
