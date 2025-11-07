import { useState, useMemo, useRef, useEffect } from "react";
import { ArrowLeft, Play, Pause, SkipForward, SkipBack, Download, Edit2, Check, X, Volume2, Scissors, MoreVertical } from "lucide-react";
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
  fileSize: number; // in bytes
};

type SegmentBuilderProps = {
  chunks: Chunk[];
  chunksPerSegment: number;
  onBack: () => void;
  onGenerateAudio: (segments: any[]) => void;
};

// Mock text samples of varying lengths
const mockTexts = [
  "In the beginning, there was nothing but endless void. The darkness stretched infinitely in all directions, a canvas waiting for creation to begin its masterwork.",
  "She walked through the ancient forest, where towering trees whispered secrets of centuries past. The morning light filtered through the canopy, casting dancing shadows on the moss-covered ground below.",
  "The old bookstore smelled of vanilla and aged paper—a scent that transported visitors to another time. Leather-bound volumes lined every wall from floor to ceiling, each one a gateway to adventure.",
  "Time moved differently in the mountains. Hours felt like minutes as she climbed higher, the valley shrinking behind her with each determined step forward.",
  "The city never slept, its heartbeat a constant rhythm of honking horns and hurried footsteps. Neon lights reflected off rain-slicked streets, painting the night in electric hues of pink and blue.",
  "He discovered the letter tucked inside an old atlas, its edges yellowed with age. The handwriting was elegant, flowing—words from another era that somehow felt urgent even now.",
  "The ocean stretched to the horizon, an endless expanse of possibility. Waves crashed against the shore in steady percussion, each one bringing treasures from depths unknown.",
  "In the quiet moments before dawn, the world held its breath. Birds began their tentative songs, testing the air, announcing the arrival of a new day filled with potential.",
  "The laboratory was her sanctuary, where equations danced across whiteboards and beakers bubbled with promise. Here, she could lose herself in the pursuit of understanding.",
  "Memories are curious things—fluid, changeable, yet somehow more real than the present moment. They shape us in ways we rarely acknowledge, building the architecture of who we become.",
  "The train rattled through the countryside, carrying passengers toward uncertain destinations. Through the window, fields of golden wheat swayed in the afternoon breeze like waves on a vast, earthen sea.",
  "Jazz music spilled from the open doorway, mingling with laughter and the clink of glasses. Inside, the atmosphere was electric with creativity, with connection, with the simple joy of being alive.",
];

export function SegmentBuilder({ chunks, chunksPerSegment, onBack, onGenerateAudio }: SegmentBuilderProps) {
  // Only show completed/modernized chunks
  const modernizedChunks = useMemo(() => 
    chunks.filter(c => c.status === "completed" && c.modernizedText),
    [chunks]
  );

  // Generate realistic audio tracks with variety
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>(() => {
    // Create at least 12 examples to show variety, or use actual chunks if available
    const trackCount = Math.max(12, modernizedChunks.length);
    
    return Array.from({ length: trackCount }).map((_, index) => {
      const chunk = modernizedChunks[index];
      
      // Vary durations realistically (2-15 minutes)
      const durations = [134, 267, 189, 445, 312, 523, 201, 678, 156, 389, 234, 567];
      const duration = durations[index % durations.length];
      
      // Realistic file sizes (roughly 1MB per minute of audio)
      const fileSize = Math.floor(duration * 16000 + Math.random() * 5000);
      
      // Use chunk data if available, otherwise use mock data
      const text = chunk?.modernizedText || chunk?.originalText || mockTexts[index % mockTexts.length];
      
      return {
        id: index,
        chunkId: chunk?.id || index,
        name: `${index + 1}`, // Simple chronological numbering
        text,
        duration,
        audioUrl: `audio-track-${index + 1}.mp3`,
        status: "ready" as const,
        fileSize,
      };
    });
  });

  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<number | null>(null);
  const [editingTrackId, setEditingTrackId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [playbackProgress, setPlaybackProgress] = useState<{ [key: number]: number }>({});
  const [volume, setVolume] = useState(80);

  const stats = useMemo(() => {
    const totalDuration = audioTracks.reduce((sum, t) => sum + t.duration, 0);
    const totalSize = audioTracks.reduce((sum, t) => sum + t.fileSize, 0);
    
    return {
      totalTracks: audioTracks.length,
      totalDuration,
      totalSize,
    };
  }, [audioTracks]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
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
                  {stats.totalTracks} track{stats.totalTracks !== 1 ? 's' : ''} • {formatTime(stats.totalDuration)} total • {formatFileSize(stats.totalSize)}
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
              <p className="text-xs text-neutral-600 mb-1">Total Size</p>
              <p className="text-xl sm:text-2xl tabular-nums text-neutral-900">{formatFileSize(stats.totalSize)}</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200 p-3 sm:p-4 shadow-sm">
              <p className="text-xs text-emerald-700 mb-1">Now Playing</p>
              <p className="text-base sm:text-lg text-emerald-900">
                {currentTrack ? `Track ${currentTrack.name}` : 'None'}
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
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
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
                              className="h-9 max-w-[200px]"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveRename(track.id);
                                if (e.key === 'Escape') handleCancelRename();
                              }}
                              placeholder="Track name"
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
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-base sm:text-lg">Track {track.name}</h4>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                                onClick={() => handleRename(track.id)}
                              >
                                <Edit2 className="w-3 h-3" strokeWidth={2.5} />
                              </Button>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-neutral-600 flex-wrap">
                              <span>{formatTime(track.duration)}</span>
                              <span>•</span>
                              <span>{formatFileSize(track.fileSize)}</span>
                              <span>•</span>
                              <span className="font-mono text-[10px]">{track.audioUrl}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <Badge variant={isCurrentlyPlaying ? "default" : "secondary"} className={isCurrentlyPlaying ? "bg-purple-600" : ""}>
                        {track.status === "playing" ? "Playing" : track.status === "paused" ? "Paused" : "Ready"}
                      </Badge>
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
                        <div className="h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg overflow-hidden relative cursor-pointer">
                          {/* Simulated waveform background */}
                          <div className="absolute inset-0 flex items-center justify-around px-1">
                            {Array.from({ length: 80 }).map((_, i) => {
                              const height = Math.random() * 70 + 15;
                              return (
                                <div
                                  key={i}
                                  className="w-0.5 bg-purple-300/50 rounded-full transition-colors"
                                  style={{ height: `${height}%` }}
                                />
                              );
                            })}
                          </div>
                          
                          {/* Progress overlay */}
                          <div 
                            className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-40 transition-all duration-300"
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

                        <Button variant="outline" size="sm" className="px-2">
                          <MoreVertical className="w-4 h-4" strokeWidth={2.5} />
                        </Button>
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
