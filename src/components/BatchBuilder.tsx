import { useState, useMemo } from "react";
import { ArrowLeft, Zap, Play, AlertCircle, Check, Clock } from "lucide-react";
import { Slider } from "./ui/slider";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";

type Segment = {
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
  onSubmitBatches: (segments: Segment[]) => void;
};

export function BatchBuilder({ totalChunks, onBack, onSubmitBatches }: BatchBuilderProps) {
  const [targetMinutes, setTargetMinutes] = useState(20); // Target total audio duration in minutes
  const [selectedSegmentIds, setSelectedSegmentIds] = useState<Set<number>>(new Set());

  // Calculate segments based on target duration
  const segments = useMemo(() => {
    const result: Segment[] = [];
    
    // Mock: Each chunk is ~500 words (realistic for 2000 char chunks)
    const wordsPerChunk = 500;
    const charsPerChunk = 2000;
    
    // Calculate total words needed for target duration
    // 150 words per minute average reading speed
    const wordsPerMinute = 150;
    const targetTotalWords = targetMinutes * wordsPerMinute;
    
    // Calculate how many chunks we need
    const chunksNeeded = Math.min(
      Math.ceil(targetTotalWords / wordsPerChunk),
      totalChunks
    );
    
    // Now create segments
    // Each segment should be ~30-60 seconds of audio (optimal for TTS)
    const wordsPerSecond = 2.5;
    const targetSegmentSeconds = 45; // Sweet spot for TTS
    const wordsPerSegment = Math.floor(targetSegmentSeconds * wordsPerSecond);
    const chunksPerSegment = Math.max(1, Math.floor(wordsPerSegment / wordsPerChunk));
    
    let currentChunk = 0;
    let segmentId = 0;
    
    while (currentChunk < chunksNeeded) {
      const actualSegmentSize = Math.min(chunksPerSegment, chunksNeeded - currentChunk);
      const wordCount = actualSegmentSize * wordsPerChunk;
      const charCount = actualSegmentSize * charsPerChunk;
      const estimatedSeconds = Math.ceil(wordCount / wordsPerSecond);
      
      // TTS cost: $15 per 1M characters
      const estimatedCost = (charCount / 1000000) * 15;
      
      result.push({
        id: segmentId++,
        firstChunk: currentChunk,
        lastChunk: currentChunk + actualSegmentSize - 1,
        charCount,
        wordCount,
        estimatedSeconds,
        estimatedCost,
      });

      currentChunk += actualSegmentSize;
    }

    return result;
  }, [totalChunks, targetMinutes]);

  // Auto-select all segments when they change
  useMemo(() => {
    setSelectedSegmentIds(new Set(segments.map(s => s.id)));
  }, [segments]);

  const handleSegmentSelect = (segmentId: number, isShiftClick: boolean) => {
    if (isShiftClick && selectedSegmentIds.size > 0) {
      // Range selection
      const selectedArray = Array.from(selectedSegmentIds);
      const lastSelected = Math.max(...selectedArray);
      const start = Math.min(lastSelected, segmentId);
      const end = Math.max(lastSelected, segmentId);
      
      const newSelection = new Set<number>();
      for (let i = start; i <= end; i++) {
        newSelection.add(i);
      }
      setSelectedSegmentIds(newSelection);
    } else {
      // Toggle single selection
      const newSelection = new Set(selectedSegmentIds);
      if (newSelection.has(segmentId)) {
        newSelection.delete(segmentId);
      } else {
        newSelection.add(segmentId);
      }
      setSelectedSegmentIds(newSelection);
    }
  };

  const selectedSegments = useMemo(() => {
    return segments.filter(s => selectedSegmentIds.has(s.id));
  }, [segments, selectedSegmentIds]);

  const stats = useMemo(() => {
    const selected = selectedSegments;
    const durations = selected.map(s => s.estimatedSeconds);
    
    return {
      totalSegments: segments.length,
      selectedCount: selected.length,
      totalSeconds: selected.reduce((sum, s) => sum + s.estimatedSeconds, 0),
      totalCost: selected.reduce((sum, s) => sum + s.estimatedCost, 0),
      totalWords: selected.reduce((sum, s) => sum + s.wordCount, 0),
      totalChars: selected.reduce((sum, s) => sum + s.charCount, 0),
      minDuration: selected.length > 0 ? Math.min(...durations) : 0,
      maxDuration: selected.length > 0 ? Math.max(...durations) : 0,
      avgDuration: selected.length > 0 
        ? Math.floor(durations.reduce((a, b) => a + b, 0) / selected.length)
        : 0,
    };
  }, [segments, selectedSegments]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const handleSubmit = () => {
    if (selectedSegments.length > 0) {
      onSubmitBatches(selectedSegments);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      {/* Ambient background blur elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="flex-none bg-neutral-900/80 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-neutral-400 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
              </button>
              <div>
                <h3 className="text-lg sm:text-xl text-white">Audio Segment Builder</h3>
                <p className="text-xs sm:text-sm text-neutral-400">
                  Select target duration to generate audio segments
                </p>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={selectedSegments.length === 0}
              className="group relative px-6 sm:px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl flex items-center justify-center gap-3 transition-all duration-200 hover:shadow-xl hover:shadow-purple-500/25 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <Play className="w-4 h-4 relative z-10" strokeWidth={2.5} />
              <span className="relative z-10">
                Generate Audio Segment
              </span>
            </button>
          </div>
        </div>

        {/* Target Duration Control */}
        <div className="flex-none bg-neutral-900/40 backdrop-blur-xl border-b border-white/10 p-4 sm:p-6">
          <div className="max-w-4xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div>
                <Label className="flex items-center gap-2 text-neutral-300">
                  <Clock className="w-4 h-4 text-purple-400" strokeWidth={2.5} />
                  Target Audio Duration
                </Label>
                <p className="text-xs text-neutral-500 mt-1">
                  How much audio do you want to generate?
                </p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl tabular-nums text-purple-400">
                  {targetMinutes}
                </span>
                <span className="text-lg text-neutral-400">minutes</span>
              </div>
            </div>
            
            <Slider
              value={[targetMinutes]}
              min={5}
              max={120}
              step={5}
              onValueChange={(value) => setTargetMinutes(value[0])}
              className="mb-2"
            />
            
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>5 min</span>
              <span>~{Math.ceil((targetMinutes * 150) / 500)} chunks needed</span>
              <span>120 min</span>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="flex-none bg-white/70 backdrop-blur-xl border-b border-black/5 p-4 sm:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="bg-white rounded-xl border border-black/5 p-3 sm:p-4 shadow-sm">
              <p className="text-xs text-neutral-600 mb-1">Segments</p>
              <p className="text-xl sm:text-2xl tabular-nums text-purple-700">
                {stats.selectedCount}/{stats.totalSegments}
              </p>
            </div>
            
            <div className="bg-white rounded-xl border border-black/5 p-3 sm:p-4 shadow-sm">
              <p className="text-xs text-neutral-600 mb-1">Total Audio</p>
              <p className="text-base sm:text-lg tabular-nums">{formatTime(stats.totalSeconds)}</p>
            </div>
            
            <div className="bg-white rounded-xl border border-black/5 p-3 sm:p-4 shadow-sm">
              <p className="text-xs text-neutral-600 mb-1">Total Words</p>
              <p className="text-base sm:text-lg tabular-nums">{stats.totalWords.toLocaleString()}</p>
            </div>

            <div className="bg-white rounded-xl border border-black/5 p-3 sm:p-4 shadow-sm">
              <p className="text-xs text-neutral-600 mb-1">Total Cost</p>
              <p className="text-base sm:text-lg tabular-nums text-emerald-700">
                ${stats.totalCost.toFixed(3)}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-black/5 p-3 sm:p-4 shadow-sm">
              <p className="text-xs text-neutral-600 mb-1">Avg Duration</p>
              <p className="text-base sm:text-lg tabular-nums">{formatTime(stats.avgDuration)}</p>
            </div>

            <div className="bg-white rounded-xl border border-black/5 p-3 sm:p-4 shadow-sm">
              <p className="text-xs text-neutral-600 mb-1">Range</p>
              <p className="text-xs tabular-nums">
                {formatTime(stats.minDuration)}—{formatTime(stats.maxDuration)}
              </p>
            </div>
          </div>
        </div>

        {/* Segment Selection List */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-none bg-white/70 backdrop-blur-xl border-b border-black/5 px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h4>Segment Selection</h4>
                <p className="text-xs text-neutral-600 mt-0.5">
                  {selectedSegmentIds.size} of {segments.length} segments selected • Chunks grouped into segments
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedSegmentIds(new Set(segments.map(s => s.id)))}
                  className="px-3 py-1.5 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  Select All
                </button>
                <button
                  onClick={() => setSelectedSegmentIds(new Set())}
                  className="px-3 py-1.5 text-sm bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="bg-white/70 backdrop-blur-xl">
              {segments.map((segment) => {
                const isSelected = selectedSegmentIds.has(segment.id);
                
                return (
                  <div
                    key={segment.id}
                    onClick={(e) => handleSegmentSelect(segment.id, e.shiftKey)}
                    className={`group border-b border-black/5 px-4 sm:px-6 py-3 sm:py-4 cursor-pointer transition-all ${
                      isSelected
                        ? "bg-purple-50 border-l-4 border-l-purple-600"
                        : "hover:bg-neutral-50 border-l-4 border-l-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      {/* Selection Checkbox */}
                      <div className="flex-shrink-0">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? "bg-purple-600 border-purple-600"
                              : "border-neutral-400 group-hover:border-purple-400"
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                        </div>
                      </div>

                      {/* Segment ID */}
                      <div className="flex-shrink-0 w-12 sm:w-16">
                        <span className="text-xs sm:text-sm text-neutral-500 tabular-nums">
                          Segment #{segment.id}
                        </span>
                      </div>

                      {/* Chunk Range */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          Chunks {segment.firstChunk}—{segment.lastChunk}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            {segment.wordCount.toLocaleString()} words
                          </Badge>
                          <Badge variant="secondary" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                            {formatTime(segment.estimatedSeconds)}
                          </Badge>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="flex-shrink-0 text-right hidden sm:block">
                        <p className="text-sm tabular-nums text-emerald-700">
                          ${segment.estimatedCost.toFixed(4)}
                        </p>
                        <p className="text-xs text-neutral-500 tabular-nums mt-0.5">
                          {segment.charCount.toLocaleString()} chars
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
