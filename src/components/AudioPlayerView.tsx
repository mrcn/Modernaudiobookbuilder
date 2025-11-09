import { useState, useRef, useEffect } from "react";
import { Book } from "../App";
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Download, 
  Scissors,
  RotateCcw,
  Edit,
  CheckCircle,
  Settings
} from "lucide-react";
import { Slider } from "./ui/slider";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";

type AudioSegment = {
  id: string;
  chunkId: number;
  text: string;
  originalText: string;
  duration: number;
  url: string;
};

type AudioPlayerViewProps = {
  book: Book;
  onBack: () => void;
  onCreateClip?: () => void;
  onEditChunk?: (chunkId: number) => void;
  onRegenerateChunk?: (chunkId: number) => void;
};

// Mock audio segments
const mockSegments: AudioSegment[] = Array.from({ length: 25 }, (_, i) => ({
  id: `seg-${i}`,
  chunkId: i,
  text: i === 3 
    ? "Everyone knows that a single man in possession of a good fortune must be in want of a wife. This truth is so universally acknowledged that when a young man of considerable wealth moves into the neighborhood, the surrounding families immediately consider him the rightful property of one of their daughters."
    : `Modernized text for chunk ${i}...`,
  originalText: i === 3
    ? "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters."
    : `Original text for chunk ${i}...`,
  duration: 45 + Math.random() * 30,
  url: "",
}));

export function AudioPlayerView({ book, onBack, onCreateClip, onEditChunk, onRegenerateChunk }: AudioPlayerViewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(3);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [textView, setTextView] = useState<"original" | "modernized" | "sidebyside">("sidebyside");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentSegment = mockSegments[currentSegmentIndex];
  const duration = currentSegment.duration;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            // Auto-advance to next segment
            if (currentSegmentIndex < mockSegments.length - 1) {
              setCurrentSegmentIndex(currentSegmentIndex + 1);
              return 0;
            } else {
              setIsPlaying(false);
              return duration;
            }
          }
          return prev + 0.1;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration, currentSegmentIndex]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    setCurrentTime(value[0]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const skipBackward = () => {
    setCurrentTime(Math.max(0, currentTime - 15));
  };

  const skipForward = () => {
    setCurrentTime(Math.min(duration, currentTime + 15));
  };

  const handlePreviousSegment = () => {
    if (currentSegmentIndex > 0) {
      setCurrentSegmentIndex(currentSegmentIndex - 1);
      setCurrentTime(0);
    }
  };

  const handleNextSegment = () => {
    if (currentSegmentIndex < mockSegments.length - 1) {
      setCurrentSegmentIndex(currentSegmentIndex + 1);
      setCurrentTime(0);
    }
  };

  const jumpToSegment = (index: number) => {
    setCurrentSegmentIndex(index);
    setCurrentTime(0);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      {/* Ambient background blur elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 h-full flex flex-col">
        {/* Top Header */}
        <div className="flex-none bg-neutral-900/80 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-neutral-400 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
              </button>
              <div>
                <h3 className="text-lg sm:text-xl text-white">{book.title}</h3>
                <p className="text-xs sm:text-sm text-neutral-400">{book.author}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onCreateClip && (
                <Button
                  onClick={onCreateClip}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Scissors className="w-4 h-4" strokeWidth={2.5} />
                  Create Clip
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Download className="w-4 h-4" strokeWidth={2.5} />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Three-Panel Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Chunk Navigation */}
          <div className="w-80 flex flex-col bg-neutral-900/60 border-r border-white/10">
            <div className="flex-none p-4 border-b border-white/10 bg-neutral-900/40 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm text-white">Chunks</h4>
                <Badge variant="secondary" className="text-xs bg-neutral-800 text-neutral-300">
                  {currentSegmentIndex + 1}/{mockSegments.length}
                </Badge>
              </div>
              <p className="text-xs text-neutral-400">
                {mockSegments.filter((_, i) => i <= currentSegmentIndex).length} of {mockSegments.length} played
              </p>
            </div>

            <ScrollArea className="flex-1">
              <div>
                {mockSegments.map((segment, index) => {
                  const isPlayed = index < currentSegmentIndex;
                  const isCurrent = index === currentSegmentIndex;
                  
                  return (
                    <div
                      key={segment.id}
                      onClick={() => jumpToSegment(index)}
                      className={`group border-b border-white/5 px-4 py-3 cursor-pointer transition-all ${
                        isCurrent
                          ? "bg-purple-950/50 border-l-4 border-l-purple-500"
                          : "hover:bg-neutral-800/50 border-l-4 border-l-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Play status indicator */}
                        <div className="flex-shrink-0">
                          {isPlayed ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400" strokeWidth={2.5} />
                          ) : isCurrent && isPlaying ? (
                            <div className="w-4 h-4 rounded-full border-2 border-purple-500 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-neutral-600" />
                          )}
                        </div>

                        {/* Chunk info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-neutral-500">Chunk #{segment.chunkId}</p>
                          <p className="text-sm line-clamp-1 text-neutral-300">{segment.text}</p>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            {formatTime(segment.duration)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Actions */}
            <div className="flex-none p-4 border-t border-white/10 bg-neutral-900/40 backdrop-blur-xl space-y-2">
              {onEditChunk && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 border-white/20 text-neutral-300 hover:bg-white/5 hover:text-white"
                  onClick={() => onEditChunk(currentSegment.chunkId)}
                >
                  <Edit className="w-4 h-4" strokeWidth={2.5} />
                  Edit in Workspace
                </Button>
              )}
              {onRegenerateChunk && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 border-white/20 text-neutral-300 hover:bg-white/5 hover:text-white"
                  onClick={() => onRegenerateChunk(currentSegment.chunkId)}
                >
                  <RotateCcw className="w-4 h-4" strokeWidth={2.5} />
                  Regenerate Audio
                </Button>
              )}
            </div>
          </div>

          {/* Center Panel: Synchronized Text Display */}
          <div className="flex-1 flex flex-col bg-neutral-950/50">
            <div className="flex-none px-6 py-4 border-b border-white/10 bg-neutral-900/40 backdrop-blur-xl">
              <Tabs value={textView} onValueChange={(v) => setTextView(v as any)}>
                <TabsList className="bg-neutral-800 border-white/10">
                  <TabsTrigger value="original" className="data-[state=active]:bg-neutral-700 data-[state=active]:text-white text-neutral-400">Original</TabsTrigger>
                  <TabsTrigger value="modernized" className="data-[state=active]:bg-neutral-700 data-[state=active]:text-white text-neutral-400">Modernized</TabsTrigger>
                  <TabsTrigger value="sidebyside" className="data-[state=active]:bg-neutral-700 data-[state=active]:text-white text-neutral-400">Side-by-Side</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex-1 overflow-hidden">
              {textView === "sidebyside" ? (
                <div className="h-full flex">
                  {/* Original */}
                  <div className="flex-1 flex flex-col border-r border-white/10">
                    <div className="flex-none px-4 py-3 border-b border-white/10 bg-neutral-900/50">
                      <p className="text-xs text-neutral-400 uppercase tracking-wider">Original</p>
                    </div>
                    <ScrollArea className="flex-1">
                      <div className="p-6">
                        <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">
                          {currentSegment.originalText}
                        </p>
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Modernized */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex-none px-4 py-3 border-b border-white/10 bg-gradient-to-r from-purple-950/50 to-pink-950/50">
                      <p className="text-xs text-purple-300 uppercase tracking-wider">Modernized</p>
                    </div>
                    <ScrollArea className="flex-1">
                      <div className="p-6">
                        <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">
                          {currentSegment.text}
                        </p>
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              ) : (
                <ScrollArea className="h-full">
                  <div className="p-8">
                    <p className="text-base leading-relaxed whitespace-pre-wrap text-neutral-300">
                      {textView === "original" ? currentSegment.originalText : currentSegment.text}
                    </p>
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>

          {/* Right Panel: Player Controls & Settings */}
          <div className="w-80 bg-neutral-900/60 backdrop-blur-xl border-l border-white/10 flex flex-col">
            <div className="flex-none px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-purple-400" strokeWidth={2.5} />
                <h4 className="text-sm text-white">Playback</h4>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-6 space-y-6">
                {/* Current Segment Info */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-950/50 to-pink-950/50 border border-purple-500/30 flex items-center justify-center backdrop-blur-sm">
                      <span className="text-purple-300">{currentSegmentIndex + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm text-white">Chunk #{currentSegment.chunkId}</p>
                      <p className="text-xs text-neutral-400">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <Slider
                    value={[currentTime]}
                    max={duration}
                    step={0.1}
                    onValueChange={handleSeek}
                    className="mb-4"
                  />
                </div>

                <Separator className="bg-white/10" />

                {/* Playback Controls */}
                <div>
                  <h5 className="text-xs text-neutral-400 uppercase tracking-wider mb-3">Controls</h5>
                  
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handlePreviousSegment}
                      disabled={currentSegmentIndex === 0}
                      className="text-neutral-400 hover:text-white hover:bg-white/5"
                    >
                      <SkipBack className="w-4 h-4" strokeWidth={2.5} />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={skipBackward}
                      className="text-neutral-400 hover:text-white hover:bg-white/5"
                    >
                      <RotateCcw className="w-4 h-4" strokeWidth={2.5} />
                    </Button>

                    <button
                      onClick={togglePlayPause}
                      className="relative group w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center transition-all duration-200 hover:scale-105"
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 text-white" fill="white" strokeWidth={2.5} />
                      ) : (
                        <Play className="w-5 h-5 text-white ml-0.5" fill="white" strokeWidth={2.5} />
                      )}
                    </button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={skipForward}
                      className="text-neutral-400 hover:text-white hover:bg-white/5"
                    >
                      <RotateCcw className="w-4 h-4 rotate-180" strokeWidth={2.5} />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleNextSegment}
                      disabled={currentSegmentIndex === mockSegments.length - 1}
                      className="text-neutral-400 hover:text-white hover:bg-white/5"
                    >
                      <SkipForward className="w-4 h-4" strokeWidth={2.5} />
                    </Button>
                  </div>

                  <div className="text-center text-xs text-neutral-500 mb-2">
                    Skip 15s backward/forward
                  </div>
                </div>

                <Separator className="bg-white/10" />

                {/* Volume Control */}
                <div>
                  <h5 className="text-xs text-neutral-400 uppercase tracking-wider mb-3">Volume</h5>
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-4 h-4 text-neutral-400 flex-shrink-0" strokeWidth={2.5} />
                    <Slider
                      value={[volume * 100]}
                      max={100}
                      step={1}
                      onValueChange={(value) => setVolume(value[0] / 100)}
                      className="flex-1"
                    />
                    <span className="text-sm text-neutral-300 w-12 text-right">{Math.round(volume * 100)}%</span>
                  </div>
                </div>

                <Separator className="bg-white/10" />

                {/* Speed Control */}
                <div>
                  <h5 className="text-xs text-neutral-400 uppercase tracking-wider mb-3">Speed</h5>
                  <div className="grid grid-cols-3 gap-2">
                    {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((speed) => (
                      <Button
                        key={speed}
                        variant={playbackSpeed === speed ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPlaybackSpeed(speed)}
                        className={playbackSpeed === speed ? "bg-purple-600" : "border-white/20 text-neutral-300 hover:bg-white/5"}
                      >
                        {speed}x
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator className="bg-white/10" />

                {/* Segment Stats */}
                <div>
                  <h5 className="text-xs text-neutral-400 uppercase tracking-wider mb-3">Current Segment</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Duration</span>
                      <span className="tabular-nums text-neutral-300">{formatTime(currentSegment.duration)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Words</span>
                      <span className="tabular-nums text-neutral-300">{currentSegment.text.split(/\s+/).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Characters</span>
                      <span className="tabular-nums text-neutral-300">{currentSegment.text.length}</span>
                    </div>
                  </div>
                </div>

                <Separator className="bg-white/10" />

                {/* Overall Progress */}
                <div>
                  <h5 className="text-xs text-neutral-400 uppercase tracking-wider mb-3">Progress</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-400">Completed</span>
                      <span className="tabular-nums text-neutral-300">{currentSegmentIndex}/{mockSegments.length}</span>
                    </div>
                    <div className="w-full bg-neutral-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
                        style={{ width: `${(currentSegmentIndex / mockSegments.length) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-neutral-500">
                      {Math.round((currentSegmentIndex / mockSegments.length) * 100)}% complete
                    </p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
