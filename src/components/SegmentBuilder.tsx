import { useState, useMemo, useRef, useEffect } from "react";
import { ArrowLeft, Play, Pause, SkipForward, SkipBack, Download, Edit2, Check, X, Volume2, Scissors } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Slider } from "./ui/slider";
import { Chunk } from "./ChunkReview";

type AudioTrack = {
  id: number;
  chunkId: number;
  name: string;
  text: string;
  duration: number; // in seconds
  audioUrl: string;
  status: "ready" | "playing" | "paused";
};

type SegmentBuilderProps = {
  chunks: Chunk[];
  chunksPerSegment: number;
  onBack: () => void;
  onGenerateAudio: (segments: any[]) => void;
};

export function SegmentBuilder({ chunks, chunksPerSegment, onBack, onGenerateAudio }: SegmentBuilderProps) {
  // Only show completed/modernized chunks
  const modernizedChunks = useMemo(() => 
    chunks.filter(c => c.status === "completed" && c.modernizedText),
    [chunks]
  );

  // Generate audio tracks from modernized chunks (one track per chunk)
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>(() => {
    return modernizedChunks.map((chunk, index) => {
      // Estimate duration: ~150 words per minute
      const estimatedDuration = Math.ceil((chunk.wordCount / 150) * 60);
      
      return {
        id: index,
        chunkId: chunk.id,
        name: `Track ${index + 1}`,
        text: chunk.modernizedText || chunk.originalText,
        duration: estimatedDuration,
        audioUrl: `mock-audio-track-${index}.mp3`, // Mock audio URL
        status: "ready" as const,
      };
    });
  });

  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<number | null>(null);
  const [editingTrackId, setEditingTrackId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [playbackProgress, setPlaybackProgress] = useState<{ [key: number]: number }>({});
  const audioRefs = useRef<{ [key: number]: HTMLAudioElement | null }>({});

  const stats = useMemo(() => {
    const totalDuration = audioTracks.reduce((sum, t) => sum + t.duration, 0);
    const totalWords = modernizedChunks.reduce((sum, c) => sum + c.wordCount, 0);
    
    return {
      totalTracks: audioTracks.length,
      totalDuration,
      totalWords,
    };
  }, [audioTracks, modernizedChunks]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = (trackId: number) => {
    if (currentlyPlayingId === trackId) {
      // Pause current track
      setCurrentlyPlayingId(null);
      setAudioTracks(prev => prev.map(t => 
        t.id === trackId ? { ...t, status: "paused" as const } : t
      ));
    } else {
      // Stop any currently playing track and play this one
      setCurrentlyPlayingId(trackId);
      setAudioTracks(prev => prev.map(t => 
        t.id === trackId 
          ? { ...t, status: "playing" as const }
          : { ...t, status: "ready" as const }
      ));
    }
  };

  const handleStop = () => {
    setCurrentlyPlayingId(null);
    setAudioTracks(prev => prev.map(t => ({ ...t, status: "ready" as const })));
    setPlaybackProgress({});
  };

  const handleSkipNext = () => {
    if (currentlyPlayingId !== null) {
      const currentIndex = audioTracks.findIndex(t => t.id === currentlyPlayingId);
      if (currentIndex < audioTracks.length - 1) {
        handlePlayPause(audioTracks[currentIndex + 1].id);
      }
    }
  };

  const handleSkipPrevious = () => {
    if (currentlyPlayingId !== null) {
      const currentIndex = audioTracks.findIndex(t => t.id === currentlyPlayingId);
      if (currentIndex > 0) {
        handlePlayPause(audioTracks[currentIndex - 1].id);
      }
    }
  };

  const handleRename = (trackId: number) => {
    const track = audioTracks.find(t => t.id === trackId);
    if (track) {
      setEditingTrackId(trackId);
      setEditingName(track.name);
    }
  };

  const handleSaveRename = (trackId: number) => {
    setAudioTracks(prev => prev.map(t => 
      t.id === trackId ? { ...t, name: editingName } : t
    ));
    setEditingTrackId(null);
    setEditingName("");
  };

  const handleCancelRename = () => {
    setEditingTrackId(null);
    setEditingName("");
  };

  // Simulate playback progress
  useEffect(() => {
    if (currentlyPlayingId === null) return;

    const interval = setInterval(() => {
      setPlaybackProgress(prev => {
        const current = prev[currentlyPlayingId] || 0;
        const track = audioTracks.find(t => t.id === currentlyPlayingId);
        if (!track) return prev;
        
        const newProgress = current + 1;
        if (newProgress >= track.duration) {
          // Track finished, skip to next
          handleSkipNext();
          return { ...prev, [currentlyPlayingId]: 0 };
        }
        
        return { ...prev, [currentlyPlayingId]: newProgress };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentlyPlayingId, audioTracks]);

  const currentTrack = audioTracks.find(t => t.id === currentlyPlayingId);

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
                <h3 className="text-lg sm:text-xl">Audio Playlist</h3>
                <p className="text-xs sm:text-sm text-neutral-600">
                  {stats.totalTracks} track{stats.totalTracks !== 1 ? 's' : ''} • {formatTime(stats.totalDuration)} total
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSkipPrevious}
                disabled={currentlyPlayingId === null || currentlyPlayingId === audioTracks[0]?.id}
              >
                <SkipBack className="w-4 h-4" strokeWidth={2.5} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSkipNext}
                disabled={currentlyPlayingId === null || currentlyPlayingId === audioTracks[audioTracks.length - 1]?.id}
              >
                <SkipForward className="w-4 h-4" strokeWidth={2.5} />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex-none bg-white/70 backdrop-blur-xl border-b border-black/5 p-4 sm:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white rounded-xl border border-black/5 p-3 sm:p-4 shadow-sm">
              <p className="text-xs text-neutral-600 mb-1">Total Tracks</p>
              <p className="text-xl sm:text-2xl tabular-nums text-neutral-900">{stats.totalTracks}</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-3 sm:p-4 shadow-sm">
              <p className="text-xs text-purple-700 mb-1">Total Duration</p>
              <p className="text-xl sm:text-2xl tabular-nums text-purple-900">{formatTime(stats.totalDuration)}</p>
            </div>

            <div className="bg-white rounded-xl border border-black/5 p-3 sm:p-4 shadow-sm">
              <p className="text-xs text-neutral-600 mb-1">Total Words</p>
              <p className="text-xl sm:text-2xl tabular-nums text-neutral-900">{stats.totalWords.toLocaleString()}</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200 p-3 sm:p-4 shadow-sm">
              <p className="text-xs text-emerald-700 mb-1">Now Playing</p>
              <p className="text-base sm:text-lg text-emerald-900">
                {currentTrack ? currentTrack.name : 'None'}
              </p>
            </div>
          </div>
        </div>

        {/* Playlist Area */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 sm:p-6 space-y-4">
              {audioTracks.map((track, index) => {
                const isCurrentlyPlaying = currentlyPlayingId === track.id;
                const progress = playbackProgress[track.id] || 0;
                const progressPercent = track.duration > 0 ? (progress / track.duration) * 100 : 0;

                return (
                  <div
                    key={track.id}
                    className={`rounded-xl border p-4 sm:p-6 transition-all ${
                      isCurrentlyPlaying
                        ? "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300 shadow-lg shadow-purple-200/50"
                        : "bg-white/80 backdrop-blur-xl border-black/10 hover:border-purple-200 hover:shadow-md"
                    }`}
                  >
                    {/* Track Header */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isCurrentlyPlaying 
                            ? "bg-gradient-to-r from-purple-600 to-pink-600" 
                            : "bg-gradient-to-r from-neutral-400 to-neutral-500"
                        }`}>
                          <span className="text-white">{index + 1}</span>
                        </div>
                        
                        {editingTrackId === track.id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="h-8"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveRename(track.id);
                                if (e.key === 'Escape') handleCancelRename();
                              }}
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSaveRename(track.id)}
                            >
                              <Check className="w-4 h-4" strokeWidth={2.5} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelRename}
                            >
                              <X className="w-4 h-4" strokeWidth={2.5} />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex-1">
                            <h4 className="text-base sm:text-lg">{track.name}</h4>
                            <p className="text-xs text-neutral-600">
                              Chunk #{track.chunkId} • {formatTime(track.duration)}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {editingTrackId !== track.id && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRename(track.id)}
                          >
                            <Edit2 className="w-4 h-4" strokeWidth={2.5} />
                          </Button>
                        )}
                        <Badge variant={isCurrentlyPlaying ? "default" : "secondary"} className={isCurrentlyPlaying ? "bg-purple-600" : ""}>
                          {track.status === "playing" ? "Playing" : track.status === "paused" ? "Paused" : "Ready"}
                        </Badge>
                      </div>
                    </div>

                    {/* Track Text */}
                    <div className="mb-4 p-4 bg-white/50 rounded-lg border border-black/5">
                      <p className="text-sm leading-relaxed text-neutral-800">
                        {track.text}
                      </p>
                    </div>

                    {/* Audio Player */}
                    <div className="space-y-3">
                      {/* Waveform / Progress Bar */}
                      <div className="space-y-2">
                        <div className="h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg overflow-hidden relative">
                          {/* Simulated waveform background */}
                          <div className="absolute inset-0 flex items-center justify-around px-1">
                            {Array.from({ length: 50 }).map((_, i) => {
                              const height = Math.random() * 60 + 20;
                              return (
                                <div
                                  key={i}
                                  className="w-1 bg-purple-300/40 rounded-full"
                                  style={{ height: `${height}%` }}
                                />
                              );
                            })}
                          </div>
                          
                          {/* Progress overlay */}
                          <div 
                            className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-30 transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>

                        {/* Time display */}
                        <div className="flex items-center justify-between text-xs text-neutral-600">
                          <span className="tabular-nums">{formatTime(progress)}</span>
                          <span className="tabular-nums">{formatTime(track.duration)}</span>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handlePlayPause(track.id)}
                          className={`flex-1 ${
                            isCurrentlyPlaying
                              ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                              : ""
                          }`}
                          variant={isCurrentlyPlaying ? "default" : "outline"}
                        >
                          {track.status === "playing" ? (
                            <>
                              <Pause className="w-4 h-4 mr-2" strokeWidth={2.5} />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" strokeWidth={2.5} />
                              Play
                            </>
                          )}
                        </Button>

                        <Button variant="outline" size="sm">
                          <Scissors className="w-4 h-4 mr-2" strokeWidth={2.5} />
                          Trim
                        </Button>

                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4" strokeWidth={2.5} />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {audioTracks.length === 0 && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Volume2 className="w-12 h-12 text-neutral-300 mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-neutral-500">No audio tracks available</p>
                    <p className="text-xs text-neutral-400 mt-1">
                      Go back and modernize some chunks first
                    </p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
