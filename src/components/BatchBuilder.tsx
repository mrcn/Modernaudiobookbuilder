import { useState, useMemo } from "react";
import { ArrowLeft, Zap, Play, AlertCircle } from "lucide-react";
import { Slider } from "./ui/slider";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

type Batch = {
  id: number;
  firstChunk: number;
  lastChunk: number;
  charCount: number;
  wordCount: number;
  estimatedSeconds: number;
  estimatedCost: number;
};

type BatchBuilderProps = {
  totalChunks: number;
  onBack: () => void;
  onSubmitBatches: (batches: Batch[]) => void;
};

export function BatchBuilder({ totalChunks, onBack, onSubmitBatches }: BatchBuilderProps) {
  const [targetDuration, setTargetDuration] = useState(30); // Target duration in seconds
  const [maxDuration, setMaxDuration] = useState(60); // Max TTS duration per batch (provider limit)
  const [mode, setMode] = useState<"sentence" | "char-window">("char-window");
  const [keepRangesTogether, setKeepRangesTogether] = useState(true);

  // Mock batch packing (in real app this runs in Web Worker)
  // Audio duration is based on word count: ~150 words per minute average reading speed
  const batches = useMemo(() => {
    const result: Batch[] = [];
    let currentChunk = 0;
    let batchId = 0;

    while (currentChunk < totalChunks) {
      // Mock: Each chunk is ~500 words (realistic for 2000 char chunks)
      const wordsPerChunk = 500;
      const charsPerChunk = 2000;
      
      // Calculate how many chunks fit in target duration
      // 150 words per minute = 2.5 words per second
      const wordsPerSecond = 2.5;
      const targetWords = targetDuration * wordsPerSecond;
      const chunksInBatch = Math.max(1, Math.floor(targetWords / wordsPerChunk));
      
      const actualBatchSize = Math.min(chunksInBatch, totalChunks - currentChunk);
      const wordCount = actualBatchSize * wordsPerChunk;
      const charCount = actualBatchSize * charsPerChunk;
      const estimatedSeconds = Math.ceil(wordCount / wordsPerSecond);
      
      // TTS cost: $15 per 1M characters
      const estimatedCost = (charCount / 1000000) * 15;
      
      result.push({
        id: batchId++,
        firstChunk: currentChunk,
        lastChunk: currentChunk + actualBatchSize - 1,
        charCount,
        wordCount,
        estimatedSeconds,
        estimatedCost,
      });

      currentChunk += actualBatchSize;
    }

    return result;
  }, [totalChunks, targetDuration]);

  const stats = useMemo(() => {
    const durations = batches.map(b => b.estimatedSeconds);
    return {
      total: batches.length,
      minDuration: Math.min(...durations),
      avgDuration: Math.floor(durations.reduce((a, b) => a + b, 0) / batches.length),
      maxDurationValue: Math.max(...durations),
      totalSeconds: batches.reduce((sum, b) => sum + b.estimatedSeconds, 0),
      totalCost: batches.reduce((sum, b) => sum + b.estimatedCost, 0),
      overLimit: batches.filter(b => b.estimatedSeconds > maxDuration).length,
    };
  }, [batches, maxDuration]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-none bg-white/70 backdrop-blur-xl border-b border-black/5 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-black/5 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
            </button>
            <div>
              <h3 className="text-lg sm:text-xl">Batch Builder</h3>
              <p className="text-xs sm:text-sm text-neutral-600">Configure TTS batch settings</p>
            </div>
          </div>

          <button
            onClick={() => onSubmitBatches(batches)}
            className="group relative px-6 sm:px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl flex items-center justify-center gap-3 transition-all duration-200 hover:shadow-xl hover:shadow-purple-500/25 hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
            <Play className="w-4 h-4 relative z-10" strokeWidth={2.5} />
            <span className="relative z-10">Submit {batches.length} Batches</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Controls */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-black/5 p-4 sm:p-6 space-y-4 sm:space-y-6">
          <h4 className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" strokeWidth={2.5} />
            Batch Configuration
          </h4>

          {/* Target Duration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Target Audio Duration per Batch</Label>
              <span className="text-sm text-purple-700">{targetDuration}s</span>
            </div>
            <Slider
              value={[targetDuration]}
              min={10}
              max={120}
              step={5}
              onValueChange={(value) => setTargetDuration(value[0])}
            />
            <p className="text-xs text-neutral-500">
              Shorter batches = more parallel processing, longer = fewer API calls
            </p>
          </div>

          {/* Max Duration Limit */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Provider Max Duration</Label>
              <span className="text-sm text-purple-700">{maxDuration}s</span>
            </div>
            <Slider
              value={[maxDuration]}
              min={30}
              max={300}
              step={10}
              onValueChange={(value) => setMaxDuration(value[0])}
            />
            <p className="text-xs text-neutral-500">
              OpenAI TTS has a limit of ~4096 chars per request (~60s of audio)
            </p>
          </div>

          {/* Mode */}
          <div className="space-y-3">
            <Label>Chunking Mode</Label>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setMode("sentence")}
                className={`flex-1 px-4 py-3 rounded-xl border transition-all ${
                  mode === "sentence"
                    ? "border-purple-300 bg-purple-50 text-purple-700"
                    : "border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                <div className="text-sm">Sentence Chunks</div>
                <div className="text-xs text-neutral-500 mt-1">Natural breaks</div>
              </button>
              <button
                onClick={() => setMode("char-window")}
                className={`flex-1 px-4 py-3 rounded-xl border transition-all ${
                  mode === "char-window"
                    ? "border-purple-300 bg-purple-50 text-purple-700"
                    : "border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                <div className="text-sm">Character Window</div>
                <div className="text-xs text-neutral-500 mt-1">Fixed size</div>
              </button>
            </div>
          </div>

          {/* Keep ranges together */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-neutral-50 rounded-xl">
            <div className="flex-1">
              <Label htmlFor="keep-ranges">Keep Selected Ranges Together</Label>
              <p className="text-xs text-neutral-500 mt-1">
                Honors manually marked chunk groups
              </p>
            </div>
            <Switch
              id="keep-ranges"
              checked={keepRangesTogether}
              onCheckedChange={setKeepRangesTogether}
            />
          </div>
        </div>

        {/* Preview Stats */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-black/5 p-4 sm:p-6">
          <h4 className="mb-4 sm:mb-6">Batch Preview</h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="p-3 sm:p-4 bg-purple-50 rounded-xl border border-purple-200">
              <p className="text-xs sm:text-sm text-purple-600 mb-1">Total Batches</p>
              <p className="text-xl sm:text-2xl">{stats.total}</p>
            </div>
            <div className="p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-xs sm:text-sm text-blue-600 mb-1">Avg Duration</p>
              <p className="text-base sm:text-lg">{formatTime(stats.avgDuration)}</p>
            </div>
            <div className="p-3 sm:p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <p className="text-xs sm:text-sm text-emerald-600 mb-1">Total Audio</p>
              <p className="text-base sm:text-lg">{formatTime(stats.totalSeconds)}</p>
            </div>
            <div className="p-3 sm:p-4 bg-violet-50 rounded-xl border border-violet-200">
              <p className="text-xs sm:text-sm text-violet-600 mb-1">Est. Cost</p>
              <p className="text-base sm:text-lg">${stats.totalCost.toFixed(3)}</p>
            </div>
            <div className="p-3 sm:p-4 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-xs sm:text-sm text-amber-600 mb-1">Over Limit</p>
              <p className="text-xl sm:text-2xl">{stats.overLimit}</p>
            </div>
          </div>

          {/* Duration Distribution Heatbar */}
          <div className="space-y-2">
            <Label>Duration Distribution</Label>
            <div className="h-8 bg-neutral-100 rounded-lg overflow-hidden flex">
              {batches.slice(0, 100).map((batch) => {
                const ratio = batch.estimatedSeconds / maxDuration;
                let color = "bg-emerald-500";
                if (ratio > 0.9) color = "bg-red-500";
                else if (ratio > 0.7) color = "bg-amber-500";
                
                return (
                  <div
                    key={batch.id}
                    className={`flex-1 ${color} transition-all hover:opacity-75`}
                    title={`Batch ${batch.id}: ${formatTime(batch.estimatedSeconds)}`}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>{formatTime(stats.minDuration)}</span>
              <span>{formatTime(stats.maxDurationValue)}</span>
            </div>
          </div>

          {stats.overLimit > 0 && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
              <div>
                <p className="text-sm text-amber-900">
                  {stats.overLimit} batches exceed the provider duration limit
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Reduce target duration or increase max duration limit
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Batch List Preview (first 20) */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-black/5 p-4 sm:p-6">
          <h4 className="mb-4">Batch List Preview (first 20)</h4>
          <div className="space-y-2">
            {batches.slice(0, 20).map((batch) => (
              <div
                key={batch.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors gap-2"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="text-xs sm:text-sm text-neutral-500 w-8 sm:w-12">#{batch.id}</span>
                  <span className="text-sm">
                    Chunks {batch.firstChunk}—{batch.lastChunk}
                  </span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-neutral-600 ml-11 sm:ml-0">
                  <span className="text-neutral-500">{batch.wordCount.toLocaleString()} words</span>
                  <span>~{formatTime(batch.estimatedSeconds)}</span>
                  <span className="text-emerald-700">${batch.estimatedCost.toFixed(4)}</span>
                </div>
              </div>
            ))}
            {batches.length > 20 && (
              <p className="text-sm text-neutral-500 text-center py-2">
                ...and {batches.length - 20} more batches
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
