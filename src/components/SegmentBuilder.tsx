import { useState, useMemo } from "react";
import { ArrowLeft, Play, Check, Loader2, AlertCircle, Volume2, Pause, Square, RotateCcw, Download } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Progress } from "./ui/progress";
import { Chunk } from "./ChunkReview";

type AudioSegmentStatus = "pending" | "processing" | "completed" | "failed";

type AudioSegment = {
  id: number;
  name: string;
  chunkIds: number[];
  totalChars: number;
  totalWords: number;
  estimatedDuration: number;
  estimatedCost: number;
  status: AudioSegmentStatus;
  audioUrl?: string;
  progress?: number; // For processing state
  errorMessage?: string; // For failed state
};

type SegmentBuilderProps = {
  chunks: Chunk[];
  chunksPerSegment: number;
  onBack: () => void;
  onGenerateAudio: (segments: AudioSegment[]) => void;
};

export function SegmentBuilder({ chunks, chunksPerSegment, onBack, onGenerateAudio }: SegmentBuilderProps) {
  // Only show completed/modernized chunks
  const modernizedChunks = useMemo(() => 
    chunks.filter(c => c.status === "completed" && c.modernizedText),
    [chunks]
  );

  // Generate audio segments from modernized chunks with mock statuses
  const [audioSegments, setAudioSegments] = useState<AudioSegment[]>(() => {
    const segments: AudioSegment[] = [];
    
    for (let i = 0; i < modernizedChunks.length; i += chunksPerSegment) {
      const segmentChunks = modernizedChunks.slice(i, i + chunksPerSegment);
      const totalChars = segmentChunks.reduce((sum, c) => sum + c.charCount, 0);
      const totalWords = segmentChunks.reduce((sum, c) => sum + c.wordCount, 0);
      
      // Estimate duration: ~150 words per minute
      const estimatedDuration = Math.ceil((totalWords / 150) * 60);
      
      // TTS cost: $15 per 1M characters
      const estimatedCost = (totalChars / 1000000) * 15;
      
      // Assign diverse mock statuses for comprehensive demo
      let status: AudioSegmentStatus = "pending";
      let progress: number | undefined;
      let audioUrl: string | undefined;
      let errorMessage: string | undefined;

      const segmentIndex = segments.length;
      
      // Show variety of statuses
      if (segmentIndex < 4) {
        // First 4 segments completed
        status = "completed";
        audioUrl = `mock-audio-${segmentIndex}.mp3`;
      } else if (segmentIndex === 4) {
        // 5th segment processing at 25%
        status = "processing";
        progress = 25;
      } else if (segmentIndex === 5) {
        // 6th segment processing at 67%
        status = "processing";
        progress = 67;
      } else if (segmentIndex === 6) {
        // 7th segment processing at 89%
        status = "processing";
        progress = 89;
      } else if (segmentIndex === 7) {
        // 8th segment failed - rate limit
        status = "failed";
        errorMessage = "TTS generation failed: Rate limit exceeded. Please try again in a few moments.";
      } else if (segmentIndex === 8) {
        // 9th segment failed - network error
        status = "failed";
        errorMessage = "Network timeout: Unable to reach TTS service. Check your connection.";
      }
      // Rest (9+) remain pending
      
      segments.push({
        id: segments.length,
        name: `Segment ${segments.length + 1}`,
        chunkIds: segmentChunks.map(c => c.id),
        totalChars,
        totalWords,
        estimatedDuration,
        estimatedCost,
        status,
        audioUrl,
        progress,
        errorMessage,
      });
    }
    
    return segments;
  });

  const [playingSegmentId, setPlayingSegmentId] = useState<number | null>(null);

  const stats = useMemo(() => {
    const totalDuration = audioSegments.reduce((sum, s) => sum + s.estimatedDuration, 0);
    const totalCost = audioSegments.reduce((sum, s) => sum + s.estimatedCost, 0);
    const totalWords = audioSegments.reduce((sum, s) => sum + s.totalWords, 0);
    
    return {
      totalSegments: audioSegments.length,
      completed: audioSegments.filter(s => s.status === "completed").length,
      processing: audioSegments.filter(s => s.status === "processing").length,
      pending: audioSegments.filter(s => s.status === "pending").length,
      failed: audioSegments.filter(s => s.status === "failed").length,
      totalDuration,
      totalCost,
      totalWords,
    };
  }, [audioSegments]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const handleGenerate = () => {
    const pendingSegments = audioSegments.filter(s => s.status === "pending");
    
    if (pendingSegments.length === 0) {
      onGenerateAudio(audioSegments);
      return;
    }

    // Simulate generation
    pendingSegments.forEach((seg, index) => {
      setTimeout(() => {
        setAudioSegments(prev => prev.map(s =>
          s.id === seg.id ? { ...s, status: "processing" as const, progress: 0 } : s
        ));

        // Simulate progress
        const progressInterval = setInterval(() => {
          setAudioSegments(prev => {
            const segment = prev.find(s => s.id === seg.id);
            if (!segment || segment.status !== "processing") {
              clearInterval(progressInterval);
              return prev;
            }

            const newProgress = (segment.progress || 0) + 15;
            if (newProgress >= 100) {
              clearInterval(progressInterval);
              return prev.map(s =>
                s.id === seg.id
                  ? { ...s, status: "completed" as const, progress: 100, audioUrl: `mock-audio-${s.id}.mp3` }
                  : s
              );
            }

            return prev.map(s =>
              s.id === seg.id ? { ...s, progress: newProgress } : s
            );
          });
        }, 500);
      }, index * 1000);
    });
  };

  const handleRetryFailed = (segmentId: number) => {
    setAudioSegments(prev => prev.map(s =>
      s.id === segmentId 
        ? { ...s, status: "processing" as const, progress: 0, errorMessage: undefined }
        : s
    ));

    // Simulate retry
    setTimeout(() => {
      setAudioSegments(prev => prev.map(s =>
        s.id === segmentId
          ? { ...s, status: "completed" as const, progress: 100, audioUrl: `mock-audio-${s.id}.mp3` }
          : s
      ));
    }, 2000);
  };

  const handlePlayPause = (segmentId: number) => {
    if (playingSegmentId === segmentId) {
      setPlayingSegmentId(null);
    } else {
      setPlayingSegmentId(segmentId);
    }
  };

  const getStatusColor = (status: AudioSegmentStatus) => {
    switch (status) {
      case "completed": return "emerald";
      case "processing": return "blue";
      case "failed": return "red";
      default: return "amber";
    }
  };

  const completionPercentage = stats.totalSegments > 0
    ? Math.round((stats.completed / stats.totalSegments) * 100)
    : 0;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-neutral-50 via-purple-50/30 to-pink-50/30">
      {/* Ambient background blur elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="flex-none bg-white/70 backdrop-blur-xl border-b border-black/5 px-4 sm:px-6 py-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-black/5 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
              </button>
              <div>
                <h3 className="text-lg sm:text-xl">Audio Segment Builder</h3>
                <p className="text-xs sm:text-sm text-neutral-600">
                  {chunksPerSegment} chunks per segment • Generate TTS audio
                </p>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={stats.pending === 0}
              className="group relative px-6 sm:px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl flex items-center justify-center gap-3 transition-all duration-200 hover:shadow-xl hover:shadow-purple-500/25 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <Play className="w-4 h-4 relative z-10" strokeWidth={2.5} />
              <span className="relative z-10">
                {stats.pending > 0 ? `Generate ${stats.pending} Segment${stats.pending !== 1 ? 's' : ''}` : 'All Generated'}
              </span>
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex-none bg-white/70 backdrop-blur-xl border-b border-black/5 p-4 sm:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4 mb-4">
            <div className="bg-white rounded-xl border border-black/5 p-3 sm:p-4 shadow-sm">
              <p className="text-xs text-neutral-600 mb-1">Total Segments</p>
              <p className="text-xl sm:text-2xl tabular-nums text-neutral-900">{stats.totalSegments}</p>
            </div>
            
            <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-3 sm:p-4 shadow-sm">
              <p className="text-xs text-emerald-700 mb-1">Completed</p>
              <p className="text-xl sm:text-2xl tabular-nums text-emerald-900">{stats.completed}</p>
            </div>

            <div className="bg-blue-50 rounded-xl border border-blue-200 p-3 sm:p-4 shadow-sm">
              <p className="text-xs text-blue-700 mb-1">Processing</p>
              <p className="text-xl sm:text-2xl tabular-nums text-blue-900">{stats.processing}</p>
            </div>
            
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-3 sm:p-4 shadow-sm">
              <p className="text-xs text-amber-700 mb-1">Pending</p>
              <p className="text-xl sm:text-2xl tabular-nums text-amber-900">{stats.pending}</p>
            </div>

            <div className="bg-red-50 rounded-xl border border-red-200 p-3 sm:p-4 shadow-sm">
              <p className="text-xs text-red-700 mb-1">Failed</p>
              <p className="text-xl sm:text-2xl tabular-nums text-red-900">{stats.failed}</p>
            </div>

            <div className="bg-white rounded-xl border border-black/5 p-3 sm:p-4 shadow-sm">
              <p className="text-xs text-neutral-600 mb-1">Total Duration</p>
              <p className="text-base sm:text-lg tabular-nums">{formatTime(stats.totalDuration)}</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200 p-3 sm:p-4 shadow-sm">
              <p className="text-xs text-emerald-700 mb-1">Total Cost</p>
              <p className="text-base sm:text-lg tabular-nums text-emerald-900">
                ${stats.totalCost.toFixed(3)}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600">Overall Progress</span>
              <span className="tabular-nums text-purple-700">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </div>

        {/* Two-Panel Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Modernized Chunks Reference */}
          <div className="w-2/5 flex flex-col bg-white border-r border-black/5">
            <div className="flex-none px-4 py-3 border-b border-black/5 bg-white/70 backdrop-blur-xl">
              <h4 className="text-sm">Source Chunks</h4>
              <p className="text-xs text-neutral-600 mt-0.5">
                {modernizedChunks.length} modernized chunks available
              </p>
            </div>

            <ScrollArea className="flex-1">
              <div>
                {modernizedChunks.map((chunk) => (
                  <div
                    key={chunk.id}
                    className="border-b border-black/5 px-4 py-3"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-xs text-neutral-500">Chunk #{chunk.id}</p>
                      <Badge variant="default" className="text-xs bg-emerald-600">
                        <Check className="w-3 h-3 mr-1" strokeWidth={2.5} />
                        Modernized
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {chunk.wordCount} words
                      </Badge>
                    </div>

                    <p className="text-sm text-purple-900 line-clamp-2">
                      {chunk.modernizedText}
                    </p>
                  </div>
                ))}

                {modernizedChunks.length === 0 && (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <Volume2 className="w-12 h-12 text-neutral-300 mx-auto mb-3" strokeWidth={1.5} />
                      <p className="text-neutral-500">No modernized chunks available</p>
                      <p className="text-xs text-neutral-400 mt-1">
                        Go back and modernize some chunks first
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right Panel: Audio Segments */}
          <div className="flex-1 flex flex-col bg-white/70 backdrop-blur-xl">
            <div className="flex-none px-4 py-3 border-b border-black/5">
              <h4 className="text-sm">Audio Segments</h4>
              <p className="text-xs text-neutral-600 mt-0.5">
                {stats.completed}/{stats.totalSegments} generated • {chunksPerSegment} chunks per segment
              </p>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-3">
                {audioSegments.map((segment) => {
                  const color = getStatusColor(segment.status);
                  const isPlaying = playingSegmentId === segment.id;

                  return (
                    <div
                      key={segment.id}
                      className={`rounded-xl border p-4 ${
                        segment.status === "completed"
                          ? "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200"
                          : segment.status === "processing"
                          ? "bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200"
                          : segment.status === "failed"
                          ? "bg-gradient-to-br from-red-50 to-rose-50 border-red-200"
                          : "bg-white border-neutral-200"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-r from-${color}-500 to-${color}-600 flex items-center justify-center`}>
                            {segment.status === "completed" && (
                              <Check className="w-5 h-5 text-white" strokeWidth={2.5} />
                            )}
                            {segment.status === "processing" && (
                              <Loader2 className="w-5 h-5 text-white animate-spin" strokeWidth={2.5} />
                            )}
                            {segment.status === "failed" && (
                              <AlertCircle className="w-5 h-5 text-white" strokeWidth={2.5} />
                            )}
                            {segment.status === "pending" && (
                              <Square className="w-5 h-5 text-white" strokeWidth={2.5} />
                            )}
                          </div>
                          <div>
                            <h5 className="text-sm">{segment.name}</h5>
                            <p className="text-xs text-neutral-600">
                              Chunks {segment.chunkIds[0]}–{segment.chunkIds[segment.chunkIds.length - 1]}
                            </p>
                          </div>
                        </div>
                        
                        <Badge 
                          variant={segment.status === "completed" ? "default" : "secondary"}
                          className={`text-xs ${
                            segment.status === "completed" ? "bg-emerald-600" :
                            segment.status === "processing" ? "bg-blue-600" :
                            segment.status === "failed" ? "bg-red-600" :
                            "bg-amber-600"
                          } ${segment.status !== "pending" ? "text-white" : ""}`}
                        >
                          {segment.status}
                        </Badge>
                      </div>

                      {/* Processing Progress */}
                      {segment.status === "processing" && segment.progress !== undefined && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-blue-700">Generating audio...</span>
                            <span className="tabular-nums text-blue-900">{segment.progress}%</span>
                          </div>
                          <Progress value={segment.progress} className="h-1.5" />
                        </div>
                      )}

                      {/* Error Message */}
                      {segment.status === "failed" && segment.errorMessage && (
                        <div className="mb-3 p-2 bg-red-100 rounded-lg border border-red-300">
                          <p className="text-xs text-red-800">{segment.errorMessage}</p>
                        </div>
                      )}

                      <Separator className={`my-3 ${
                        segment.status === "completed" ? "bg-emerald-200" :
                        segment.status === "processing" ? "bg-blue-200" :
                        segment.status === "failed" ? "bg-red-200" :
                        "bg-neutral-200"
                      }`} />

                      <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                        <div>
                          <p className="text-neutral-600">Chunks</p>
                          <p className="tabular-nums">{segment.chunkIds.length}</p>
                        </div>
                        <div>
                          <p className="text-neutral-600">Duration</p>
                          <p className="tabular-nums">{formatTime(segment.estimatedDuration)}</p>
                        </div>
                        <div>
                          <p className="text-neutral-600">Cost</p>
                          <p className="tabular-nums">${segment.estimatedCost.toFixed(4)}</p>
                        </div>
                      </div>

                      {/* Preview text */}
                      <div className="mb-3">
                        <p className="text-xs text-neutral-600 mb-1">Includes:</p>
                        <div className="space-y-1">
                          {segment.chunkIds.slice(0, 2).map(chunkId => {
                            const chunk = chunks.find(c => c.id === chunkId);
                            return chunk ? (
                              <p key={chunkId} className="text-xs text-neutral-700 line-clamp-1">
                                #{chunkId}: {chunk.modernizedText || chunk.originalText}
                              </p>
                            ) : null;
                          })}
                          {segment.chunkIds.length > 2 && (
                            <p className="text-xs text-neutral-500 italic">
                              +{segment.chunkIds.length - 2} more chunk{segment.chunkIds.length - 2 !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {segment.status === "completed" && segment.audioUrl && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePlayPause(segment.id)}
                              className="flex-1"
                            >
                              {isPlaying ? (
                                <>
                                  <Pause className="w-3 h-3 mr-1" strokeWidth={2.5} />
                                  Pause
                                </>
                              ) : (
                                <>
                                  <Play className="w-3 h-3 mr-1" strokeWidth={2.5} />
                                  Preview
                                </>
                              )}
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="w-3 h-3 mr-1" strokeWidth={2.5} />
                              Download
                            </Button>
                          </>
                        )}
                        {segment.status === "failed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRetryFailed(segment.id)}
                            className="w-full"
                          >
                            <RotateCcw className="w-3 h-3 mr-1" strokeWidth={2.5} />
                            Retry
                          </Button>
                        )}
                        {segment.status === "pending" && (
                          <Button size="sm" variant="ghost" className="w-full" disabled>
                            Waiting to generate...
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {audioSegments.length === 0 && (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <Volume2 className="w-12 h-12 text-neutral-300 mx-auto mb-3" strokeWidth={1.5} />
                      <p className="text-neutral-500">No segments configured</p>
                      <p className="text-xs text-neutral-400 mt-1">
                        Go back to adjust settings
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
