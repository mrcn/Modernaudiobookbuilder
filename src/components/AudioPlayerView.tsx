import { useState, useRef, useEffect } from "react";
import { Book } from "../App";
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, Volume2, Download, Music, Scissors } from "lucide-react";
import { Slider } from "./ui/slider";

type AudioPlayerViewProps = {
  book: Book;
  onBack: () => void;
  onCreateClip?: () => void;
};

export function AudioPlayerView({ book, onBack, onCreateClip }: AudioPlayerViewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setDuration(book.audioSegments?.[0]?.duration || 300);
  }, [book]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return prev + 0.1;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

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

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-10 transition-colors px-4 py-2 rounded-lg hover:bg-black/5"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
        <span>Back to Library</span>
      </button>

      <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] border border-black/5 shadow-2xl overflow-hidden">
        {/* Album Art / Book Cover */}
        <div className="relative h-80 overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${book.coverGradient}`} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Animated music visualizer bars */}
          {isPlaying && (
            <div className="absolute bottom-8 left-8 flex items-end gap-1.5 h-16">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-white/60 rounded-full"
                  style={{
                    height: `${20 + Math.random() * 80}%`,
                    animation: `pulse ${0.5 + Math.random() * 0.5}s ease-in-out infinite alternate`,
                  }}
                />
              ))}
            </div>
          )}
          
          <div className="relative h-full px-10 py-12 flex flex-col justify-end">
            <div className="flex items-center gap-2 mb-3">
              <Music className="w-5 h-5 text-white/80" strokeWidth={2.5} />
              <span className="text-sm text-white/80 uppercase tracking-wider">Now Playing</span>
            </div>
            <h2 className="text-3xl text-white drop-shadow-lg mb-2">{book.title}</h2>
            <p className="text-lg text-white/90 drop-shadow-md">{book.author}</p>
          </div>
        </div>

        {/* Player Controls */}
        <div className="p-10">
          {/* Progress Bar */}
          <div className="mb-8">
            <Slider
              value={[currentTime]}
              max={duration}
              step={0.1}
              onValueChange={handleSeek}
              className="mb-3"
            />
            <div className="flex justify-between text-sm text-neutral-500">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Text Preview */}
          <div className="mb-10 p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200/50">
            <p className="text-sm text-neutral-700 italic leading-relaxed">
              {book.modernizedText || "Audio content playing..."}
            </p>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-center gap-6 mb-10">
            <button
              onClick={skipBackward}
              className="w-14 h-14 rounded-2xl hover:bg-black/5 flex items-center justify-center transition-all duration-200 hover:scale-110"
            >
              <SkipBack className="w-6 h-6 text-neutral-700" strokeWidth={2.5} />
            </button>

            <button
              onClick={togglePlayPause}
              className="relative group w-20 h-20 rounded-3xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/25"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              {isPlaying ? (
                <Pause className="w-7 h-7 text-white relative z-10" fill="white" strokeWidth={2.5} />
              ) : (
                <Play className="w-7 h-7 text-white ml-1 relative z-10" fill="white" strokeWidth={2.5} />
              )}
            </button>

            <button
              onClick={skipForward}
              className="w-14 h-14 rounded-2xl hover:bg-black/5 flex items-center justify-center transition-all duration-200 hover:scale-110"
            >
              <SkipForward className="w-6 h-6 text-neutral-700" strokeWidth={2.5} />
            </button>
          </div>

          {/* Volume & Download */}
          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-4 flex-1 max-w-sm">
              <Volume2 className="w-5 h-5 text-neutral-600" strokeWidth={2.5} />
              <Slider
                value={[volume * 100]}
                max={100}
                step={1}
                onValueChange={(value) => setVolume(value[0] / 100)}
              />
              <span className="text-sm text-neutral-500 min-w-[3ch]">{Math.round(volume * 100)}</span>
            </div>

            <div className="flex gap-3">
              {onCreateClip && (
                <button
                  onClick={onCreateClip}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-xl hover:shadow-purple-500/25 flex items-center gap-2.5 transition-all duration-200 hover:scale-105"
                >
                  <Scissors className="w-4 h-4" strokeWidth={2.5} />
                  <span className="text-sm">Create Clip</span>
                </button>
              )}
              <button className="px-6 py-3 border border-black/10 rounded-xl hover:bg-black/5 flex items-center gap-2.5 text-neutral-700 transition-all duration-200 hover:scale-105">
                <Download className="w-4 h-4" strokeWidth={2.5} />
                <span className="text-sm">Download</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chapter List */}
      <div className="mt-8 bg-white/70 backdrop-blur-xl rounded-3xl border border-black/5 p-8 shadow-lg">
        <h3 className="mb-6 text-neutral-900 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${book.coverGradient}`} />
          Audio Segments
        </h3>
        <div className="space-y-2">
          {book.audioSegments?.map((segment, index) => (
            <button
              key={segment.id}
              className="w-full text-left p-5 rounded-2xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 flex items-center justify-between group border border-transparent hover:border-purple-200/50"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 group-hover:from-purple-600 group-hover:to-pink-600 flex items-center justify-center text-sm text-purple-600 group-hover:text-white transition-all duration-200">
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm text-neutral-900">Segment {index + 1}</p>
                  <p className="text-xs text-neutral-500">
                    {formatTime(segment.duration)}
                  </p>
                </div>
              </div>
              <Play className="w-5 h-5 text-neutral-400 group-hover:text-purple-600 transition-colors" strokeWidth={2.5} />
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          from {
            height: 20%;
          }
          to {
            height: 80%;
          }
        }
      `}</style>
    </div>
  );
}
