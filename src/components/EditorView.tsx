import { useState, useMemo } from "react";
import { Book } from "../App";
import { ArrowLeft, Sparkles, Volume2, Zap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Textarea } from "./ui/textarea";
import { DocumentOverview } from "./DocumentOverview";
import { ChunkReview, Chunk } from "./ChunkReview";
import { BatchBuilder } from "./BatchBuilder";

type EditorViewProps = {
  book: Book;
  onBack: () => void;
  onGenerateAudio: (book: Book) => void;
  onCreateEdition?: () => void;
};

export function EditorView({ book, onBack, onGenerateAudio, onCreateEdition }: EditorViewProps) {
  const [modernizedText, setModernizedText] = useState(book.modernizedText || "");
  const [generating, setGenerating] = useState(false);
  const [editorMode, setEditorMode] = useState<"overview" | "chunks" | "batches">("overview");

  // Generate mock chunks from the text
  const chunks = useMemo<Chunk[]>(() => {
    const text = book.modernizedText || book.originalText || "";
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    return sentences.map((sentence, index) => {
      const charCount = sentence.length;
      const wordCount = sentence.trim().split(/\s+/).length;
      const tokenCount = Math.ceil(charCount / 4); // Rough estimate: 1 token ≈ 4 chars
      const estimatedCost = (tokenCount * 0.002); // Mock: $0.002 per 1k tokens
      
      const statuses: Array<"pending" | "processing" | "completed" | "failed"> = ["pending", "processing", "completed", "failed"];
      
      return {
        id: index,
        originalText: sentence.trim(),
        modernizedText: sentence.trim(),
        charCount,
        wordCount,
        tokenCount,
        estimatedCost,
        edited: Math.random() > 0.8,
        flagged: Math.random() > 0.95,
        batchId: index > 10 ? Math.floor(index / 5) : undefined,
        status: index < 5 ? "completed" : index < 8 ? "processing" : statuses[Math.floor(Math.random() * statuses.length)],
      };
    });
  }, [book]);

  const documentStats = useMemo(() => {
    const totalChars = chunks.reduce((sum, c) => sum + c.charCount, 0);
    const totalWords = chunks.reduce((sum, c) => sum + c.modernizedText.split(/\s+/).length, 0);
    
    return {
      totalChunks: chunks.length,
      totalChars,
      totalWords,
      chunksProcessed: chunks.filter(c => c.edited || c.batchId).length,
      batchesTotal: Math.ceil(chunks.length / 5),
      batchesDone: Math.floor(chunks.length / 10),
      failures: Math.floor(chunks.length / 50),
    };
  }, [chunks]);

  const handleGenerateAudio = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      onGenerateAudio(book);
    }, 2000);
  };

  const handleEditChunk = (chunkId: number, newText: string) => {
    // In real app, this would update the chunk in state/backend
    console.log("Edit chunk", chunkId, newText);
  };

  const handleMergeChunks = (startId: number, endId: number) => {
    // In real app, this would merge chunks
    console.log("Merge chunks", startId, "to", endId);
  };

  const handleSubmitBatches = (batches: any[]) => {
    // In real app, this would submit to TTS
    console.log("Submit batches", batches);
    setEditorMode("overview");
  };

  if (editorMode === "chunks") {
    return (
      <ChunkReview
        chunks={chunks}
        onBack={() => setEditorMode("overview")}
        onEditChunk={handleEditChunk}
        onMergeChunks={handleMergeChunks}
      />
    );
  }

  if (editorMode === "batches") {
    return (
      <BatchBuilder
        totalChunks={chunks.length}
        onBack={() => setEditorMode("overview")}
        onSubmitBatches={handleSubmitBatches}
      />
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-6 sm:mb-8 transition-colors px-4 py-2 rounded-lg hover:bg-black/5"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
        <span>Back to Library</span>
      </button>

      <div className="mb-8 sm:mb-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
            <h2 className="text-2xl sm:text-4xl tracking-tight truncate">{book.title}</h2>
            <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${book.coverGradient} flex-shrink-0`} />
          </div>
          <p className="text-neutral-600 text-base sm:text-lg">{book.author}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          {book.status === "audio-ready" && onCreateEdition && (
            <button
              onClick={onCreateEdition}
              className="group relative px-5 sm:px-6 py-3 sm:py-4 bg-white/70 backdrop-blur-xl border border-purple-300 text-purple-700 rounded-2xl flex items-center justify-center gap-3 transition-all duration-200 hover:shadow-xl hover:shadow-purple-500/10 hover:scale-105"
            >
              <Sparkles className="w-5 h-5" strokeWidth={2.5} />
              <span>Create Edition</span>
            </button>
          )}
          <button
            onClick={handleGenerateAudio}
            disabled={generating}
            className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 disabled:from-neutral-300 disabled:to-neutral-400 text-white rounded-2xl flex items-center justify-center gap-3 transition-all duration-200 hover:shadow-2xl hover:shadow-purple-500/25 hover:scale-105 disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            <div className={`absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity ${generating ? 'animate-pulse' : ''}`} />
            {generating ? (
              <>
                <Zap className="w-5 h-5 relative z-10 animate-pulse" strokeWidth={2.5} />
                <span className="relative z-10 hidden sm:inline">Generating Audio...</span>
                <span className="relative z-10 sm:hidden">Generating...</span>
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5 relative z-10" strokeWidth={2.5} />
                <span className="relative z-10 hidden sm:inline">Generate Audio</span>
                <span className="relative z-10 sm:hidden">Generate</span>
              </>
            )}
          </button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-8 bg-white/70 backdrop-blur-xl border border-black/5 p-1.5">
          <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-lg">
            Overview
          </TabsTrigger>
          <TabsTrigger value="simple" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-lg">
            Simple Edit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <DocumentOverview
            book={book}
            stats={documentStats}
            onOpenChunkReview={() => setEditorMode("chunks")}
            onOpenBatchBuilder={() => setEditorMode("batches")}
          />
        </TabsContent>

        <TabsContent value="simple">
          <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 backdrop-blur-xl rounded-3xl border border-purple-200/50 p-10 shadow-lg">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(168,85,247,0.1),transparent_50%)] rounded-3xl pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-purple-200/50">
                <Sparkles className="w-5 h-5 text-purple-600" strokeWidth={2.5} />
                <h3 className="text-purple-900 uppercase tracking-wide">Modernized Text (Editable)</h3>
              </div>
              <Textarea
                value={modernizedText}
                onChange={(e) => setModernizedText(e.target.value)}
                className="min-h-[700px] bg-white/80 backdrop-blur-sm border-purple-200/50 focus:border-purple-400 focus:ring-purple-400 focus:ring-2 resize-none text-base text-neutral-700 rounded-2xl shadow-sm"
                placeholder="Modernized text will appear here..."
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
