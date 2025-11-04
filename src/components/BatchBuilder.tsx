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
  estimatedSeconds: number;
};

type BatchBuilderProps = {
  totalChunks: number;
  onBack: () => void;
  onSubmitBatches: (batches: Batch[]) => void;
};

export function BatchBuilder({ totalChunks, onBack, onSubmitBatches }: BatchBuilderProps) {
  const [targetSize, setTargetSize] = useState(3000);
  const [maxChars, setMaxChars] = useState(5000);
  const [mode, setMode] = useState<"sentence" | "char-window">("char-window");
  const [keepRangesTogether, setKeepRangesTogether] = useState(true);

  // Mock batch packing (in real app this runs in Web Worker)
  const batches = useMemo(() => {
    const result: Batch[] = [];
    let currentChunk = 0;
    let batchId = 0;

    while (currentChunk < totalChunks) {
      const chunkSize = Math.floor(Math.random() * 500) + 200; // Mock chunk size
      const batchSize = Math.min(
        Math.floor(targetSize / chunkSize),
        totalChunks - currentChunk
      );

      const charCount = batchSize * chunkSize;
      
      result.push({
        id: batchId++,
        firstChunk: currentChunk,
        lastChunk: currentChunk + batchSize - 1,
        charCount: charCount,
        estimatedSeconds: Math.floor(charCount / 15), // ~15 chars per second
      });

      currentChunk += batchSize;
    }

    return result;
  }, [totalChunks, targetSize]);

  const stats = useMemo(() => {
    const charCounts = batches.map(b => b.charCount);
    return {
      total: batches.length,
      minChars: Math.min(...charCounts),
      avgChars: Math.floor(charCounts.reduce((a, b) => a + b, 0) / batches.length),
      maxChars: Math.max(...charCounts),
      totalSeconds: batches.reduce((sum, b) => sum + b.estimatedSeconds, 0),
      overLimit: batches.filter(b => b.charCount > maxChars).length,
    };
  }, [batches, maxChars]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-none bg-white/70 backdrop-blur-xl border-b border-black/5 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-black/5 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
            </button>
            <div>
              <h3 className="text-xl">Batch Builder</h3>
              <p className="text-sm text-neutral-600">Configure TTS batch settings</p>
            </div>
          </div>

          <button
            onClick={() => onSubmitBatches(batches)}
            className="group relative px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl flex items-center gap-3 transition-all duration-200 hover:shadow-xl hover:shadow-purple-500/25 hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
            <Play className="w-4 h-4 relative z-10" strokeWidth={2.5} />
            <span className="relative z-10">Submit {batches.length} Batches</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Controls */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-black/5 p-6 space-y-6">
          <h4 className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" strokeWidth={2.5} />
            Batch Configuration
          </h4>

          {/* Target Size */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Target Batch Size</Label>
              <span className="text-sm text-purple-700">{targetSize.toLocaleString()} chars</span>
            </div>
            <Slider
              value={[targetSize]}
              min={1000}
              max={5000}
              step={100}
              onValueChange={(value) => setTargetSize(value[0])}
            />
            <p className="text-xs text-neutral-500">
              Smaller batches = more granular control, larger = fewer API calls
            </p>
          </div>

          {/* Max Chars Limit */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Provider Max Characters</Label>
              <span className="text-sm text-purple-700">{maxChars.toLocaleString()}</span>
            </div>
            <Slider
              value={[maxChars]}
              min={2000}
              max={10000}
              step={100}
              onValueChange={(value) => setMaxChars(value[0])}
            />
          </div>

          {/* Mode */}
          <div className="space-y-3">
            <Label>Chunking Mode</Label>
            <div className="flex gap-3">
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
          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
            <div>
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
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-black/5 p-6">
          <h4 className="mb-6">Batch Preview</h4>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
              <p className="text-sm text-purple-600 mb-1">Total Batches</p>
              <p className="text-2xl">{stats.total}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-600 mb-1">Avg Size</p>
              <p className="text-2xl">{stats.avgChars}</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <p className="text-sm text-emerald-600 mb-1">Est. Duration</p>
              <p className="text-2xl">{formatTime(stats.totalSeconds)}</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-sm text-amber-600 mb-1">Over Limit</p>
              <p className="text-2xl">{stats.overLimit}</p>
            </div>
          </div>

          {/* Size Distribution Heatbar */}
          <div className="space-y-2">
            <Label>Size Distribution</Label>
            <div className="h-8 bg-neutral-100 rounded-lg overflow-hidden flex">
              {batches.slice(0, 100).map((batch) => {
                const ratio = batch.charCount / maxChars;
                let color = "bg-emerald-500";
                if (ratio > 0.9) color = "bg-red-500";
                else if (ratio > 0.7) color = "bg-amber-500";
                
                return (
                  <div
                    key={batch.id}
                    className={`flex-1 ${color} transition-all hover:opacity-75`}
                    title={`Batch ${batch.id}: ${batch.charCount} chars`}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>{stats.minChars} chars</span>
              <span>{stats.maxChars} chars</span>
            </div>
          </div>

          {stats.overLimit > 0 && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
              <div>
                <p className="text-sm text-amber-900">
                  {stats.overLimit} batches exceed the provider limit
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Reduce target size or increase max character limit
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Batch List Preview (first 20) */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-black/5 p-6">
          <h4 className="mb-4">Batch List Preview (first 20)</h4>
          <div className="space-y-2">
            {batches.slice(0, 20).map((batch) => (
              <div
                key={batch.id}
                className="flex items-center justify-between p-3 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm text-neutral-500 w-12">#{batch.id}</span>
                  <span className="text-sm">
                    Chunks {batch.firstChunk}—{batch.lastChunk}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-neutral-600">
                  <span>{batch.charCount.toLocaleString()} chars</span>
                  <span>~{formatTime(batch.estimatedSeconds)}</span>
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
