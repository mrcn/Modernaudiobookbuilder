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
  Settings,
  RotateCcw,
  Edit,
  CheckCircle
} from "lucide-react";
import { Slider } from "./ui/slider";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

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
    <div className="h-screen flex flex-col bg-gradient-to-br from-neutral-50 via-purple-50/30 to-pink-50/30">
      {/* Ambient background blur elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 h-full flex flex-col">
        {/* Top Header */}
        <div className="flex-none bg-white/70 backdrop-blur-xl border-b border-black/5 px-4 sm:px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 hover:bg-black/5 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
              </button>
              <div>
                <h3 className="text-lg sm:text-xl">{book.title}</h3>
                <p className="text-xs sm:text-sm text-neutral-600">{book.author}</p>
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

        {/* Sticky Media Player */}
        <div className="flex-none bg-white/70 backdrop-blur-xl border-b border-black/5 p-4 sm:p-6 shadow-sm">
          <div className="max-w-6xl mx-auto">
            {/* Segment info and controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <span className="text-purple-700">{currentSegmentIndex + 1}</span>
                </div>
                <div>
                  <p className="text-sm">Chunk #{currentSegment.chunkId}</p>
                  <p className="text-xs text-neutral-600">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {playbackSpeed}x
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
                    const currentIndex = speeds.indexOf(playbackSpeed);
                    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
                    setPlaybackSpeed(nextSpeed);
                  }}
                >
                  Speed
                </Button>
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

            {/* Playback controls */}
            <div className="flex items-center justify-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePreviousSegment}
                disabled={currentSegmentIndex === 0}
              >
                <SkipBack className="w-5 h-5" strokeWidth={2.5} />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={skipBackward}
              >
                <RotateCcw className="w-4 h-4" strokeWidth={2.5} />
                <span className="text-xs ml-1">15s</span>
              </Button>

              <button
                onClick={togglePlayPause}
                className="relative group w-14 h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-white relative z-10" fill="white" strokeWidth={2.5} />
                ) : (
                  <Play className="w-5 h-5 text-white ml-0.5 relative z-10" fill="white" strokeWidth={2.5} />
                )}
              </button>

              <Button
                variant="ghost"
                size="icon"
                onClick={skipForward}
              >
                <span className="text-xs mr-1">15s</span>
                <RotateCcw className="w-4 h-4 rotate-180" strokeWidth={2.5} />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextSegment}
                disabled={currentSegmentIndex === mockSegments.length - 1}
              >
                <SkipForward className="w-5 h-5" strokeWidth={2.5} />
              </Button>

              <div className="flex items-center gap-2 ml-4">
                <Volume2 className="w-4 h-4 text-neutral-600" strokeWidth={2.5} />
                <Slider
                  value={[volume * 100]}
                  max={100}
                  step={1}
                  onValueChange={(value) => setVolume(value[0] / 100)}
                  className="w-24"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Three-Panel Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Chunk Navigation */}
          <div className="w-80 flex flex-col bg-white border-r border-black/5">
            <div className="flex-none p-4 border-b border-black/5 bg-white/70 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm">Chunks</h4>
                <Badge variant="secondary" className="text-xs">
                  {currentSegmentIndex + 1}/{mockSegments.length}
                </Badge>
              </div>
              <p className="text-xs text-neutral-600">
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
                      className={`group border-b border-black/5 px-4 py-3 cursor-pointer transition-all ${
                        isCurrent
                          ? "bg-purple-50 border-l-4 border-l-purple-600"
                          : "hover:bg-neutral-50 border-l-4 border-l-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Play status indicator */}
                        <div className="flex-shrink-0">
                          {isPlayed ? (
                            <CheckCircle className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
                          ) : isCurrent && isPlaying ? (
                            <div className="w-4 h-4 rounded-full border-2 border-purple-600 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-neutral-300" />
                          )}
                        </div>

                        {/* Chunk info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-neutral-500">Chunk #{segment.chunkId}</p>
                          <p className="text-sm line-clamp-1">{segment.text}</p>
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
            <div className="flex-none p-4 border-t border-black/5 bg-white/70 backdrop-blur-xl space-y-2">
              {onEditChunk && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2"
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
                  className="w-full justify-start gap-2"
                  onClick={() => onRegenerateChunk(currentSegment.chunkId)}
                >
                  <RotateCcw className="w-4 h-4" strokeWidth={2.5} />
                  Regenerate Audio
                </Button>
              )}
            </div>
          </div>

          {/* Center Panel: Synchronized Text Display */}
          <div className="flex-1 flex flex-col bg-white">
            <div className="flex-none px-6 py-4 border-b border-black/5 bg-white/70 backdrop-blur-xl">
              <Tabs value={textView} onValueChange={(v) => setTextView(v as any)}>
                <TabsList>
                  <TabsTrigger value="original">Original</TabsTrigger>
                  <TabsTrigger value="modernized">Modernized</TabsTrigger>
                  <TabsTrigger value="sidebyside">Side-by-Side</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex-1 overflow-hidden">
              {textView === "sidebyside" ? (
                <div className="h-full flex">
                  {/* Original */}
                  <div className="flex-1 flex flex-col border-r border-black/5">
                    <div className="flex-none px-4 py-3 border-b border-black/5 bg-neutral-50">
                      <p className="text-xs text-neutral-700 uppercase tracking-wider">Original</p>
                    </div>
                    <ScrollArea className="flex-1">
                      <div className="p-6">
                        <p className="text-sm text-neutral-800 leading-relaxed whitespace-pre-wrap">
                          {currentSegment.originalText}
                        </p>
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Modernized */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex-none px-4 py-3 border-b border-black/5 bg-gradient-to-r from-purple-50 to-pink-50">
                      <p className="text-xs text-purple-800 uppercase tracking-wider">Modernized</p>
                    </div>
                    <ScrollArea className="flex-1">
                      <div className="p-6">
                        <p className="text-sm text-neutral-900 leading-relaxed whitespace-pre-wrap">
                          {currentSegment.text}
                        </p>
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              ) : (
                <ScrollArea className="h-full">
                  <div className="p-8">
                    <p className="text-base leading-relaxed whitespace-pre-wrap">
                      {textView === "original" ? currentSegment.originalText : currentSegment.text}
                    </p>
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>

          {/* Right Panel: Settings & Info (optional, can be toggled) */}
          <div className="w-80 bg-white/70 backdrop-blur-xl border-l border-black/5 flex flex-col">
            <div className="flex-none px-6 py-4 border-b border-black/5">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-purple-600" strokeWidth={2.5} />
                <h4 className="text-sm">Playback Settings</h4>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-6 space-y-6">
                <div>
                  <h5 className="text-xs text-neutral-600 uppercase tracking-wider mb-3">Speed</h5>
                  <div className="grid grid-cols-3 gap-2">
                    {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((speed) => (
                      <Button
                        key={speed}
                        variant={playbackSpeed === speed ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPlaybackSpeed(speed)}
                        className={playbackSpeed === speed ? "bg-purple-600" : ""}
                      >
                        {speed}x
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="text-xs text-neutral-600 uppercase tracking-wider mb-3">Current Segment</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Chunk</span>
                      <span>#{currentSegment.chunkId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Duration</span>
                      <span>{formatTime(currentSegment.duration)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Words</span>
                      <span>{currentSegment.text.split(/\s+/).length}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="text-xs text-neutral-600 uppercase tracking-wider mb-3">Progress</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Completed</span>
                      <span>{currentSegmentIndex}/{mockSegments.length}</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
                        style={{ width: `${(currentSegmentIndex / mockSegments.length) * 100}%` }}
                      />
                    </div>
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
