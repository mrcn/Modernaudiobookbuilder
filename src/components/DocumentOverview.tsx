import { Book } from "../App";
import { FileText, Zap, CheckCircle, AlertCircle, BarChart3, ChevronRight } from "lucide-react";

type DocumentStats = {
  totalChunks: number;
  totalChars: number;
  totalWords: number;
  chunksProcessed: number;
  batchesTotal: number;
  batchesDone: number;
  failures: number;
};

type DocumentOverviewProps = {
  book: Book;
  stats: DocumentStats;
  onOpenChunkReview: () => void;
  onOpenBatchBuilder: () => void;
};

export function DocumentOverview({ book, stats, onOpenChunkReview, onOpenBatchBuilder }: DocumentOverviewProps) {
  const progress = stats.totalChunks > 0 ? (stats.chunksProcessed / stats.totalChunks) * 100 : 0;
  const batchProgress = stats.batchesTotal > 0 ? (stats.batchesDone / stats.batchesTotal) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-black/5 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Total Chunks</p>
              <p className="text-2xl">{stats.totalChunks.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-black/5 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Total Words</p>
              <p className="text-2xl">{stats.totalWords.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-black/5 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Batches Done</p>
              <p className="text-2xl">{stats.batchesDone}/{stats.batchesTotal}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-black/5 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Failures</p>
              <p className="text-2xl">{stats.failures}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-black/5 p-6">
        <h3 className="mb-6">Processing Progress</h3>
        
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-neutral-600">Chunks Processed</span>
              <span className="text-sm">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-neutral-600">TTS Batches</span>
              <span className="text-sm">{Math.round(batchProgress)}%</span>
            </div>
            <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-600 transition-all duration-500"
                style={{ width: `${batchProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={onOpenChunkReview}
          className="group bg-white/70 backdrop-blur-xl rounded-2xl border border-black/5 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-500/10 p-6 transition-all duration-200 text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="mb-2">Open Chunk Review</h4>
              <p className="text-sm text-neutral-600">Browse and edit all text chunks</p>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-purple-600 transition-colors" strokeWidth={2.5} />
          </div>
        </button>

        <button
          onClick={onOpenBatchBuilder}
          className="group bg-white/70 backdrop-blur-xl rounded-2xl border border-black/5 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-500/10 p-6 transition-all duration-200 text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="mb-2">Batch Builder</h4>
              <p className="text-sm text-neutral-600">Configure and pack TTS batches</p>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-purple-600 transition-colors" strokeWidth={2.5} />
          </div>
        </button>
      </div>
    </div>
  );
}
