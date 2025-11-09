import { useState, useMemo, useRef, useEffect } from "react";
import { ArrowLeft, Play, Pause, SkipForward, SkipBack, Download, Edit2, Check, X, Volume2, MoreVertical, Music2, FileAudio } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Slider } from "./ui/slider";
import { Separator } from "./ui/separator";
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

// Mock text samples
const mockTexts = [
  "In the beginning, there was nothing but endless void. The darkness stretched infinitely in all directions, a canvas waiting for creation to begin its masterwork.",
  "She walked through the ancient forest, where towering trees whispered secrets of centuries past. The morning light filtered through the canopy, casting dancing shadows on the moss-covered ground below.",
  "The old bookstore smelled of vanilla and aged paper—a scent that transported visitors to another time. Leather-bound volumes lined every wall from floor to ceiling, each one a gateway to adventure.",
  "Time moved differently in the mountains. Hours felt like minutes as she climbed higher, the valley shrinking behind her with each determined step forward.",
  "The city never slept, its heartbeat a constant rhythm of honking horns and hurried footsteps. Neon lights reflected off rain-slicked streets, painting the night in electric hues of pink and blue.",
  "He discovered the letter tucked inside an old atlas, its edges yellowed with age. The handwriting was elegant, flowing—words from another era that somehow felt urgent even now.",
  "The ocean stretched to the horizon, an endless expanse of possibility. Waves crashed against the shore in steady percussion, each one bringing treasures from depths unknown.",
  "In the quiet moments before dawn, the world held its breath. Birds began their tentative songs, testing the air, announcing the arrival of a new day filled with potential.",
];

export function SegmentBuilder({ chunks, chunksPerSegment, onBack, onGenerateAudio }: SegmentBuilderProps) {
  // Project metadata editing
  const [projectTitle, setProjectTitle] = useState("Pride and Prejudice");
  const [projectAuthor, setProjectAuthor] = useState("Jane Austen");
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(false);
  const [tempTitle, setTempTitle] = useState(projectTitle);
  const [tempAuthor, setTempAuthor] = useState(projectAuthor);

  // Only show completed/modernized chunks
  const modernizedChunks = useMemo(() => 
    chunks.filter(c => c.status === "completed" && c.modernizedText),
    [chunks]
  );

  // Generate realistic audio tracks
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>(() => {
    const trackCount = Math.max(8, modernizedChunks.length);
    
    return Array.from({ length: trackCount }).map((_, index) => {
      const chunk = modernizedChunks[index];
      
      // Vary durations realistically (2-15 minutes)
      const durations = [134, 267, 189, 445, 312, 523, 201, 678];
      const duration = durations[index % durations.length];
      
      // Realistic file sizes (roughly 1MB per minute of audio)
      const fileSize = Math.floor(duration * 16000 + Math.random() * 5000);
      
      // Use chunk data if available
      const text = chunk?.modernizedText || chunk?.originalText || mockTexts[index % mockTexts.length];
      
      return {
        id: index,
        chunkId: chunk?.id || index,
        name: `Track ${index + 1}`,
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
  const [editingTrackName, setEditingTrackName] = useState("");
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

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const handlePlayPause = (trackId: number) => {
    if (currentlyPlayingId === trackId) {
      setCurrentlyPlayingId(null);
      setAudioTracks(prev => prev.map(t => 
        t.id === trackId ? { ...t, status: "paused" as const } : t
      ));
    } else {
      setCurrentlyPlayingId(trackId);
      setAudioTracks(prev => prev.map(t => 
        t.id === trackId 
          ? { ...t, status: "playing" as const }
          : { ...t, status: "ready" as const }
      ));
    }
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

  const handleSaveTitle = () => {
    setProjectTitle(tempTitle);
    setEditingTitle(false);
  };

  const handleCancelTitle = () => {
    setTempTitle(projectTitle);
    setEditingTitle(false);
  };

  const handleSaveAuthor = () => {
    setProjectAuthor(tempAuthor);
    setEditingAuthor(false);
  };

  const handleCancelAuthor = () => {
    setTempAuthor(projectAuthor);
    setEditingAuthor(false);
  };

  const handleRenameTrack = (trackId: number) => {
    const track = audioTracks.find(t => t.id === trackId);
    if (track) {
      setEditingTrackId(trackId);
      setEditingTrackName(track.name);
    }
  };

  const handleSaveTrackRename = () => {
    if (editingTrackId !== null) {
      setAudioTracks(prev => prev.map(t => 
        t.id === editingTrackId ? { ...t, name: editingTrackName } : t
      ));
      setEditingTrackId(null);
    }
  };

  const handleCancelTrackRename = () => {
    setEditingTrackId(null);
    setEditingTrackName("");
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
    <div className="h-screen flex flex-col bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 relative overflow-hidden">
      {/* Vignette Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-10"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.6) 100%)'
        }}
      />

      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-20 h-full flex flex-col">
        {/* Header - Project Info with Editable Title/Author */}
        <div className="flex-none bg-neutral-900/80 backdrop-blur-xl border-b border-white/5">
          <div className="px-6 py-4">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-neutral-400 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
              </button>
              <div className="flex-1">
                <p className="text-xs text-neutral-500 mb-1">Audio Project</p>
                
                {/* Editable Title */}
                {editingTitle ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                      className="text-xl border-2 border-purple-500 bg-neutral-800/50 text-white"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveTitle();
                        if (e.key === 'Escape') handleCancelTitle();
                      }}
                    />
                    <button
                      onClick={handleSaveTitle}
                      className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                    >
                      <Check className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={handleCancelTitle}
                      className="p-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingTitle(true);
                      setTempTitle(projectTitle);
                    }}
                    className="group flex items-center gap-2 text-xl text-white hover:text-purple-300 transition-colors"
                  >
                    <span>{projectTitle}</span>
                    <Edit2 className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2.5} />
                  </button>
                )}

                {/* Editable Author */}
                {editingAuthor ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={tempAuthor}
                      onChange={(e) => setTempAuthor(e.target.value)}
                      className="text-sm border-2 border-purple-500 bg-neutral-800/50 text-neutral-300"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveAuthor();
                        if (e.key === 'Escape') handleCancelAuthor();
                      }}
                    />
                    <button
                      onClick={handleSaveAuthor}
                      className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={handleCancelAuthor}
                      className="p-1.5 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
                    >
                      <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingAuthor(true);
                      setTempAuthor(projectAuthor);
                    }}
                    className="group flex items-center gap-2 text-sm text-neutral-400 hover:text-purple-300 transition-colors mt-1"
                  >
                    <span>by {projectAuthor}</span>
                    <Edit2 className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2.5} />
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  <Download className="w-4 h-4 mr-2" strokeWidth={2.5} />
                  Download All
                </Button>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-neutral-800/40 rounded-lg border border-white/10 p-3">
                <p className="text-xs text-neutral-500 mb-1">Total Tracks</p>
                <p className="text-lg tabular-nums text-white">{stats.totalTracks}</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-950/50 to-pink-950/50 rounded-lg border border-purple-500/30 p-3">
                <p className="text-xs text-purple-300 mb-1">Duration</p>
                <p className="text-lg tabular-nums text-white">{formatDuration(stats.totalDuration)}</p>
              </div>

              <div className="bg-neutral-800/40 rounded-lg border border-white/10 p-3">
                <p className="text-xs text-neutral-500 mb-1">Total Size</p>
                <p className="text-lg tabular-nums text-white">{formatFileSize(stats.totalSize)}</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-950/50 to-green-950/50 rounded-lg border border-emerald-500/30 p-3">
                <p className="text-xs text-emerald-300 mb-1">Now Playing</p>
                <p className="text-sm text-white truncate">
                  {currentTrack ? currentTrack.name : 'None'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Playlist Area */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6 space-y-3">
              {audioTracks.map((track, index) => {
                const isCurrentlyPlaying = currentlyPlayingId === track.id;
                const progress = playbackProgress[track.id] || 0;
                const progressPercent = track.duration > 0 ? (progress / track.duration) * 100 : 0;

                return (
                  <div
                    key={track.id}
                    className={`rounded-xl border p-4 transition-all ${
                      isCurrentlyPlaying
                        ? "bg-gradient-to-br from-purple-950/50 to-pink-950/50 border-purple-500/50 shadow-lg shadow-purple-500/20"
                        : "bg-neutral-900/40 backdrop-blur-xl border-white/10 hover:border-purple-500/30"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Track Number */}
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isCurrentlyPlaying 
                          ? "bg-gradient-to-r from-purple-600 to-pink-600" 
                          : "bg-neutral-800"
                      }`}>
                        <span className="text-white text-sm">{index + 1}</span>
                      </div>

                      {/* Play/Pause Button */}
                      <button
                        onClick={() => handlePlayPause(track.id)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                          isCurrentlyPlaying
                            ? "bg-white/20 hover:bg-white/30 text-white"
                            : "bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white"
                        }`}
                      >
                        {track.status === "playing" ? (
                          <Pause className="w-5 h-5" strokeWidth={2.5} />
                        ) : (
                          <Play className="w-5 h-5" strokeWidth={2.5} />
                        )}
                      </button>

                      {/* Track Info */}
                      <div className="flex-1 min-w-0">
                        {editingTrackId === track.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editingTrackName}
                              onChange={(e) => setEditingTrackName(e.target.value)}
                              className="text-sm border-2 border-purple-500 bg-neutral-800/50 text-white"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveTrackRename();
                                if (e.key === 'Escape') handleCancelTrackRename();
                              }}
                            />
                            <button
                              onClick={handleSaveTrackRename}
                              className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                            </button>
                            <button
                              onClick={handleCancelTrackRename}
                              className="p-1.5 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
                            >
                              <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleRenameTrack(track.id)}
                            className="group flex items-center gap-2 text-left w-full"
                          >
                            <p className={`text-sm truncate ${isCurrentlyPlaying ? "text-white" : "text-neutral-300"}`}>
                              {track.name}
                            </p>
                            <Edit2 className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-neutral-500" strokeWidth={2.5} />
                          </button>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
                          <span>{formatTime(track.duration)}</span>
                          <span>•</span>
                          <span>{formatFileSize(track.fileSize)}</span>
                        </div>
                      </div>

                      {/* Progress Indicator */}
                      {isCurrentlyPlaying && (
                        <div className="flex items-center gap-3">
                          <div className="text-xs text-purple-300 tabular-nums">
                            {formatTime(progress)} / {formatTime(track.duration)}
                          </div>
                        </div>
                      )}

                      {/* Download Button */}
                      <button
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-neutral-400 hover:text-white"
                      >
                        <Download className="w-4 h-4" strokeWidth={2.5} />
                      </button>
                    </div>

                    {/* Progress Bar */}
                    {isCurrentlyPlaying && (
                      <div className="mt-3">
                        <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Playback Controls Footer */}
        {currentTrack && (
          <div className="flex-none bg-neutral-900/90 backdrop-blur-xl border-t border-white/5 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                  <Music2 className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-sm text-white">{currentTrack.name}</p>
                  <p className="text-xs text-neutral-400">
                    {formatTime(playbackProgress[currentTrack.id] || 0)} / {formatTime(currentTrack.duration)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSkipPrevious}
                  disabled={currentlyPlayingId === audioTracks[0]?.id}
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  <SkipBack className="w-4 h-4" strokeWidth={2.5} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => currentlyPlayingId !== null && handlePlayPause(currentlyPlayingId)}
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  {currentTrack.status === "playing" ? (
                    <Pause className="w-4 h-4" strokeWidth={2.5} />
                  ) : (
                    <Play className="w-4 h-4" strokeWidth={2.5} />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSkipNext}
                  disabled={currentlyPlayingId === audioTracks[audioTracks.length - 1]?.id}
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  <SkipForward className="w-4 h-4" strokeWidth={2.5} />
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-neutral-400" strokeWidth={2.5} />
                <Slider
                  value={[volume]}
                  onValueChange={([value]) => setVolume(value)}
                  min={0}
                  max={100}
                  step={1}
                  className="w-24"
                />
                <span className="text-xs text-neutral-500 tabular-nums w-8">{volume}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
