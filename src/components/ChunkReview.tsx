import { useState, useMemo, useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, Sparkles, Info, Mic2, ChevronDown, ChevronUp, BarChart3 } from "lucide-react";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Separator } from "./ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";

export type Chunk = {
  id: number;
  originalText: string;
  modernizedText: string;
  charCount: number;
  tokenCount: number;
  wordCount: number;
  estimatedCost: number;
  edited: boolean;
  flagged: boolean;
  batchId?: number;
  status: "pending" | "processing" | "completed" | "failed";
  modernizationInstructions?: string;
};

export type Batch = {
  id: number;
  chunkIds: number[];
  totalChars: number;
  totalTokens: number;
  estimatedCost: number;
  estimatedDuration: number;
  status: "pending" | "processing" | "completed" | "failed";
};

type ChunkReviewProps = {
  chunks?: Chunk[];
  onBack: () => void;
  onEditChunk: (chunkId: number, newText: string) => void;
  onProceedToSegmentBuilder: (chunksPerSegment: number) => void;
  onModernizeChunks?: (chunkIds: number[], instructions: string) => void;
  onRegenerateChunk?: (chunkId: number, instructions: string) => void;
};

// Mock chunks for testing - realistic excerpts from Pride and Prejudice
const generateMockChunks = (): Chunk[] => {
  const mockTexts = [
    "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.",
    "However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.",
    "My dear Mr. Bennet, said his lady to him one day, have you heard that Netherfield Park is let at last?",
    "Mr. Bennet replied that he had not.",
    "But it is, returned she; for Mrs. Long has just been here, and she told me all about it.",
    "Mr. Bennet made no answer.",
    "Do you not want to know who has taken it? cried his wife impatiently.",
    "You want to tell me, and I have no objection to hearing it.",
    "This was invitation enough.",
    "Why, my dear, you must know, Mrs. Long says that Netherfield is taken by a young man of large fortune from the north of England; that he came down on Monday in a chaise and four to see the place, and was so much delighted with it, that he agreed with Mr. Morris immediately; that he is to take possession before Michaelmas, and some of his servants are to be in the house by the end of next week.",
  ];

  // Brainrot Gen Z versions - only for first 9 chunks
  const brainrotVersions = [
    "No cap fam, it's giving main character energy that a single dude with mad stacks is lowkey hunting for a wifey fr fr.",
    "Like bestie nobody even knows this man's vibe when he pulls up to the neighborhood, but the local families are already scheming on which daughter gonna rizz him up. Bro is literally community property at this point, it's giving desperate energy ngl.",
    "Yo Mr. Bennet, his wife was like OMG did you hear Netherfield Park finally got rented??? She was pressed fr.",
    "Mr. Bennet straight up said nah I didn't hear that sis.",
    "But it's true though, she clapped back, Mrs. Long literally just came through and spilled ALL the tea sis.",
    "Mr. Bennet left her on read. Man just ghosted her whole vibe check.",
    "You don't wanna know who moved in??? his wife was giving impatient Karen energy rn.",
    "You're literally dying to tell me and honestly I'm here for the drama, go off queen.",
    "That was all the hype she needed to start yapping bestie.",
    "So like periodt, Mrs. Long says this absolutely LOADED young king from up north rented Netherfield. He rolled up Monday in his boujee carriage to scope the place and it was giving such immaculate vibes he signed with Mr. Morris on sight no hesitation. He's moving in before fall and his whole squad is setting up next week. This man is RICH rich like generational wealth type beat fr fr."
  ];

  return mockTexts.map((text, index) => {
    const wordCount = text.split(/\s+/).length;
    const charCount = text.length;
    const tokenCount = Math.round(wordCount * 1.3);
    const estimatedCost = (tokenCount / 1000) * 0.09 + (charCount / 1000000) * 15;

    // Only first 9 get brainrot versions
    const modernizedText = index < 9 ? brainrotVersions[index] : text;

    return {
      id: index,
      originalText: text,
      modernizedText,
      charCount,
      tokenCount,
      wordCount,
      estimatedCost,
      edited: false,
      flagged: false,
      status: index < 9 ? "completed" : "pending",
      modernizationInstructions: "Turn this into Gen Z brainrot slang and remove timestamps",
    };
  });
};

export function ChunkReview({ 
  chunks: providedChunks, 
  onBack, 
  onEditChunk, 
  onProceedToSegmentBuilder,
  onModernizeChunks,
  onRegenerateChunk,
}: ChunkReviewProps) {
  const [chunks, setChunks] = useState<Chunk[]>(() => {
    if (providedChunks && providedChunks.length > 0) {
      // Apply Gen Z brainrot transformation only to first 9 chunks for demo
      return providedChunks.map((chunk, index) => {
        if (chunk.originalText && index < 9) {
          // Gen Z brainrot transformation
          let modernized = chunk.originalText
            // Remove timestamps and metadata
            .replace(/\[\d+:\d+:\d+\]/g, "")
            .replace(/^\d+\s*$/gm, "")
            .replace(/^Chapter \d+$/gim, "")
            
            // Brainrot transformations
            .replace(/\bit is a truth universally acknowledged\b/gi, "No cap fam, it's giving main character energy")
            .replace(/\bmust be in want of\b/gi, "is lowkey hunting for")
            .replace(/\bmy dear Mr\. Bennet\b/gi, "Yo Mr. Bennet")
            .replace(/\bsaid his lady to him\b/gi, "his wife was like")
            .replace(/\breplied that he had not\b/gi, "straight up said nah I didn't hear that sis")
            .replace(/\bmade no answer\b/gi, "left her on read. Man just ghosted her whole vibe check")
            .replace(/\bcried his wife impatiently\b/gi, "his wife was giving impatient Karen energy rn")
            .replace(/\breturned she\b/gi, "she clapped back")
            .replace(/\bYou want to tell me, and I have no objection to hearing it\b/gi, "You're literally dying to tell me and honestly I'm here for the drama, go off queen")
            .replace(/\bThis was invitation enough\b/gi, "That was all the hype she needed to start yapping bestie")
            
            // Add brainrot flair
            .replace(/\bvery\b/gi, "literally")
            .replace(/\breally\b/gi, "lowkey")
            .replace(/\bquite\b/gi, "kinda")
            .replace(/\bgood\b/gi, "bussin")
            .replace(/\bbad\b/gi, "mid")
            .replace(/\!(?=\s|$)/g, " fr!")
            
            // Clean up
            .replace(/\s+/g, " ")
            .trim();
          
          return {
            ...chunk,
            modernizedText: modernized || chunk.originalText,
            status: "completed" as const,
          };
        }
        return {
          ...chunk,
          modernizedText: chunk.originalText,
          status: index < 9 ? "completed" as const : "pending" as const,
        };
      });
    }
    return generateMockChunks();
  });
  
  useEffect(() => {
    if (providedChunks && providedChunks.length > 0) {
      const updated = providedChunks.map((chunk, index) => {
        if (chunk.originalText && index < 9) {
          // Apply same Gen Z brainrot transformation to first 9 only
          let modernized = chunk.originalText
            .replace(/\[\d+:\d+:\d+\]/g, "")
            .replace(/^\d+\s*$/gm, "")
            .replace(/^Chapter \d+$/gim, "")
            .replace(/\bit is a truth universally acknowledged\b/gi, "No cap fam, it's giving main character energy")
            .replace(/\bmust be in want of\b/gi, "is lowkey hunting for")
            .replace(/\bmy dear Mr\. Bennet\b/gi, "Yo Mr. Bennet")
            .replace(/\bsaid his lady to him\b/gi, "his wife was like")
            .replace(/\breplied that he had not\b/gi, "straight up said nah I didn't hear that sis")
            .replace(/\bmade no answer\b/gi, "left her on read. Man just ghosted her whole vibe check")
            .replace(/\bcried his wife impatiently\b/gi, "his wife was giving impatient Karen energy rn")
            .replace(/\breturned she\b/gi, "she clapped back")
            .replace(/\bYou want to tell me, and I have no objection to hearing it\b/gi, "You're literally dying to tell me and honestly I'm here for the drama, go off queen")
            .replace(/\bThis was invitation enough\b/gi, "That was all the hype she needed to start yapping bestie")
            .replace(/\bvery\b/gi, "literally")
            .replace(/\breally\b/gi, "lowkey")
            .replace(/\bquite\b/gi, "kinda")
            .replace(/\bgood\b/gi, "bussin")
            .replace(/\bbad\b/gi, "mid")
            .replace(/\!(?=\s|$)/g, " fr!")
            .replace(/\s+/g, " ")
            .trim();
          
          return {
            ...chunk,
            modernizedText: modernized || chunk.originalText,
            status: "completed" as const,
          };
        }
        return {
          ...chunk,
          modernizedText: chunk.originalText,
          status: index < 9 ? "completed" as const : "pending" as const,
        };
      });
      setChunks(updated);
    }
  }, [providedChunks]);

  // Voice & Audio Settings
  const [targetSegmentMinutes, setTargetSegmentMinutes] = useState(15);
  const [wordsPerMinute, setWordsPerMinute] = useState(150);
  const [selectedVoice, setSelectedVoice] = useState("alloy");
  const [pitch, setPitch] = useState(1.0);
  const [stability, setStability] = useState(0.75);
  const [pauseLength, setPauseLength] = useState(1.0);
  const [voiceSettingsOpen, setVoiceSettingsOpen] = useState(false);

  // Show ALL chunks with modernized text
  const visibleChunks = useMemo(() => 
    chunks.filter(c => c.originalText && c.originalText.trim().length > 0),
    [chunks]
  );

  // Calculate duration-based stats
  const stats = useMemo(() => {
    const totalWords = visibleChunks.reduce((sum, c) => sum + c.wordCount, 0);
    const totalChars = visibleChunks.reduce((sum, c) => sum + c.charCount, 0);
    const completedCount = visibleChunks.filter(c => c.status === "completed" && c.modernizedText).length;
    
    const totalDurationMinutes = totalWords / wordsPerMinute;
    const segmentsNeeded = Math.ceil(totalDurationMinutes / targetSegmentMinutes);
    const wordsPerSegment = Math.ceil(totalWords / segmentsNeeded);
    
    return {
      totalChunks: visibleChunks.length,
      totalWords,
      totalChars,
      completedCount,
      pendingCount: visibleChunks.length - completedCount,
      totalDurationMinutes,
      segmentsNeeded,
      wordsPerSegment,
    };
  }, [visibleChunks, targetSegmentMinutes, wordsPerMinute]);

  // Refs for scroll sync
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const [activePane, setActivePane] = useState<'left' | 'right' | null>(null);

  // Sync scrolling between panes
  const handleScroll = (pane: 'left' | 'right') => (e: React.UIEvent<HTMLDivElement>) => {
    if (activePane !== pane) return;
    
    const source = e.currentTarget;
    const target = pane === 'left' ? rightScrollRef.current : leftScrollRef.current;
    
    if (target) {
      const scrollPercentage = source.scrollTop / (source.scrollHeight - source.clientHeight);
      target.scrollTop = scrollPercentage * (target.scrollHeight - target.clientHeight);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

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
        {/* Redesigned Header - Priority-based Layout */}
        <div className="flex-none bg-neutral-900/80 backdrop-blur-xl border-b border-white/5">
          <div className="px-6 py-4">
            <div className="grid grid-cols-3 gap-6 items-center">
              {/* Left: Navigation */}
              <div className="flex items-center gap-3">
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors text-neutral-400 hover:text-white"
                >
                  <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
                </button>
                <div>
                  <h3 className="text-lg text-white">Text Transformation</h3>
                  <p className="text-sm text-neutral-400">
                    {stats.completedCount} of {stats.totalChunks} modernized
                  </p>
                </div>
              </div>

              {/* Center: Primary Stats */}
              <div className="flex items-center justify-center gap-6">
                <div className="text-center">
                  <p className="text-xs text-neutral-500 mb-1">Words</p>
                  <p className="text-lg tabular-nums text-white">{stats.totalWords.toLocaleString()}</p>
                </div>
                <Separator orientation="vertical" className="h-10 bg-white/10" />
                <div className="text-center">
                  <p className="text-xs text-neutral-500 mb-1">Duration</p>
                  <p className="text-lg tabular-nums text-white">{formatDuration(stats.totalDurationMinutes)}</p>
                </div>
                <Separator orientation="vertical" className="h-10 bg-white/10" />
                <div className="text-center">
                  <p className="text-xs text-neutral-500 mb-1">Audio Files</p>
                  <p className="text-lg tabular-nums text-purple-400">{stats.segmentsNeeded}</p>
                </div>
              </div>

              {/* Right: Primary Action */}
              <div className="flex items-center justify-end">
                <button
                  onClick={() => onProceedToSegmentBuilder(Math.ceil(visibleChunks.length / stats.segmentsNeeded))}
                  className="group relative px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl transition-all duration-200 hover:shadow-xl hover:shadow-purple-500/25 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                  <span className="relative z-10 flex items-center gap-2">
                    Continue to Audio
                    <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Secondary Controls Row */}
          <div className="px-6 py-4 border-t border-white/5 bg-neutral-950/40">
            <div className="grid grid-cols-2 gap-6 items-center">
              {/* Target Segment Length */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs uppercase tracking-wider text-neutral-400">
                    Target Segment Length
                  </Label>
                  <span className="text-sm tabular-nums text-white">
                    {targetSegmentMinutes} min
                  </span>
                </div>
                <Slider
                  value={[targetSegmentMinutes]}
                  onValueChange={([value]) => setTargetSegmentMinutes(value)}
                  min={5}
                  max={60}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* Voice Settings Toggle */}
              <Collapsible open={voiceSettingsOpen} onOpenChange={setVoiceSettingsOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2.5 bg-neutral-800/40 hover:bg-neutral-800/60 rounded-xl border border-white/10 transition-all group">
                  <div className="flex items-center gap-2">
                    <Mic2 className="w-4 h-4 text-purple-400" strokeWidth={2.5} />
                    <span className="text-sm text-neutral-300">Voice & Reading Settings</span>
                    <span className="text-xs text-neutral-500">({wordsPerMinute} wpm, {selectedVoice})</span>
                  </div>
                  {voiceSettingsOpen ? (
                    <ChevronUp className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" strokeWidth={2.5} />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" strokeWidth={2.5} />
                  )}
                </CollapsibleTrigger>
              </Collapsible>
            </div>

            {/* Expanded Voice Settings */}
            <Collapsible open={voiceSettingsOpen} onOpenChange={setVoiceSettingsOpen}>
              <CollapsibleContent className="mt-4">
                <div className="bg-neutral-800/30 rounded-xl border border-white/10 p-5">
                  <div className="grid grid-cols-3 gap-6">
                    {/* Speaking Rate */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs uppercase tracking-wider text-neutral-400">
                          Speaking Rate
                        </Label>
                        <span className="text-sm tabular-nums text-white">
                          {wordsPerMinute} wpm
                        </span>
                      </div>
                      <Slider
                        value={[wordsPerMinute]}
                        onValueChange={([value]) => setWordsPerMinute(value)}
                        min={120}
                        max={180}
                        step={5}
                        className="w-full"
                      />
                      <p className="text-xs text-neutral-500">
                        Standard: 150-160 wpm
                      </p>
                    </div>

                    {/* Pitch */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs uppercase tracking-wider text-neutral-400">
                          Pitch
                        </Label>
                        <span className="text-sm tabular-nums text-white">
                          {pitch.toFixed(2)}x
                        </span>
                      </div>
                      <Slider
                        value={[pitch]}
                        onValueChange={([value]) => setPitch(value)}
                        min={0.8}
                        max={1.2}
                        step={0.05}
                        className="w-full"
                      />
                      <p className="text-xs text-neutral-500">
                        Voice pitch adjustment
                      </p>
                    </div>

                    {/* Stability */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs uppercase tracking-wider text-neutral-400">
                          Stability
                        </Label>
                        <span className="text-sm tabular-nums text-white">
                          {(stability * 100).toFixed(0)}%
                        </span>
                      </div>
                      <Slider
                        value={[stability]}
                        onValueChange={([value]) => setStability(value)}
                        min={0.5}
                        max={1.0}
                        step={0.05}
                        className="w-full"
                      />
                      <p className="text-xs text-neutral-500">
                        Consistency vs. emotion
                      </p>
                    </div>

                    {/* Voice Selection */}
                    <div className="space-y-3">
                      <Label className="text-xs uppercase tracking-wider text-neutral-400">
                        Voice
                      </Label>
                      <div className="grid grid-cols-3 gap-2">
                        {["alloy", "echo", "nova"].map((voice) => (
                          <button
                            key={voice}
                            onClick={() => setSelectedVoice(voice)}
                            className={`px-3 py-2 rounded-lg text-xs transition-all ${
                              selectedVoice === voice
                                ? "bg-purple-600 text-white"
                                : "bg-neutral-700/50 text-neutral-400 hover:bg-neutral-700 hover:text-white"
                            }`}
                          >
                            {voice}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Pause Length */}
                    <div className="space-y-3 col-span-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs uppercase tracking-wider text-neutral-400">
                          Pause Length
                        </Label>
                        <span className="text-sm tabular-nums text-white">
                          {pauseLength.toFixed(1)}x
                        </span>
                      </div>
                      <Slider
                        value={[pauseLength]}
                        onValueChange={([value]) => setPauseLength(value)}
                        min={0.5}
                        max={2.0}
                        step={0.1}
                        className="w-full"
                      />
                      <p className="text-xs text-neutral-500">
                        Duration of pauses between sentences and paragraphs
                      </p>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>

        {/* Dual Pane Reading View */}
        <div className="flex-1 grid grid-cols-2 gap-0 min-h-0">
          {/* Left Pane - Original Text */}
          <div className="flex flex-col border-r border-white/5 bg-neutral-900/40 backdrop-blur-sm min-h-0">
            <div className="flex-none px-8 py-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-neutral-500 rounded-full" />
                <h4 className="text-sm uppercase tracking-wider text-neutral-400">Original Text</h4>
              </div>
            </div>
            
            <div 
              ref={leftScrollRef}
              onScroll={handleScroll('left')}
              onMouseEnter={() => setActivePane('left')}
              className="flex-1 overflow-y-scroll overflow-x-hidden min-h-0"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(255,255,255,0.2) transparent'
              }}
            >
              <div className="px-8 py-12">
                <div className="max-w-3xl mx-auto">
                  {visibleChunks.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-neutral-500 text-sm">No text chunks available</p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {visibleChunks.map((chunk, index) => (
                        <div 
                          key={`original-${chunk.id}`}
                          className="relative"
                        >
                          {index > 0 && (
                            <div className="absolute -top-4 left-0 right-0 flex items-center gap-3">
                              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                            </div>
                          )}
                          
                          <pre 
                            className="text-base leading-relaxed text-neutral-300 whitespace-pre-wrap break-words font-sans"
                          >
                            {chunk.originalText}
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Pane - Modernized Text */}
          <div className="flex flex-col bg-gradient-to-br from-purple-950/30 to-pink-950/30 backdrop-blur-sm min-h-0">
            <div className="flex-none px-8 py-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
                <h4 className="text-sm uppercase tracking-wider text-purple-300">Modernized Text</h4>
              </div>
            </div>
            
            <div 
              ref={rightScrollRef}
              onScroll={handleScroll('right')}
              onMouseEnter={() => setActivePane('right')}
              className="flex-1 overflow-y-scroll overflow-x-hidden min-h-0"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(168,85,247,0.3) transparent'
              }}
            >
              <div className="px-8 py-12">
                <div className="max-w-3xl mx-auto">
                  {visibleChunks.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-purple-400 text-sm">No modernized text yet</p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {visibleChunks.map((chunk, index) => (
                        <div 
                          key={`modern-${chunk.id}`}
                          className="relative"
                        >
                          {index > 0 && (
                            <div className="absolute -top-4 left-0 right-0 flex items-center gap-3">
                              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
                            </div>
                          )}
                          
                          {chunk.status === "completed" ? (
                            <pre 
                              className="text-base leading-relaxed text-white whitespace-pre-wrap break-words font-sans"
                            >
                              {chunk.modernizedText || chunk.originalText}
                            </pre>
                          ) : index === 9 ? (
                            <div className="border-2 border-dashed border-purple-500/40 rounded-xl p-8 bg-neutral-900/40 backdrop-blur-sm">
                              <div className="text-center space-y-4">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/20 rounded-full border border-purple-500/30">
                                  <Sparkles className="w-4 h-4 text-purple-400" strokeWidth={2.5} />
                                  <span className="text-sm text-purple-300">Preview Ended</span>
                                </div>
                                <p className="text-sm text-neutral-400 max-w-md mx-auto">
                                  The first 9 chunks have been converted to brainrot Gen Z slang. Convert the remaining {stats.pendingCount} chunks to continue.
                                </p>
                                <button 
                                  onClick={() => {
                                    // This would trigger actual modernization
                                    console.log("Convert more chunks");
                                  }}
                                  className="group relative px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl transition-all duration-200 hover:shadow-xl hover:shadow-purple-500/25 hover:scale-105"
                                >
                                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                                  <span className="relative z-10 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" strokeWidth={2.5} />
                                    Convert More
                                  </span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-base leading-relaxed text-neutral-600 italic border border-dashed border-neutral-700 rounded-lg p-6 bg-neutral-900/30">
                              <p className="text-xs uppercase tracking-wider text-neutral-500 mb-2">Pending Modernization</p>
                              <p className="text-sm">This segment hasn't been modernized yet...</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="flex-none bg-neutral-900/80 backdrop-blur-xl border-t border-white/5 px-6 py-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4 text-neutral-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{stats.completedCount} modernized</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span>{stats.pendingCount} pending</span>
              </div>
              <Separator orientation="vertical" className="h-3 bg-white/10" />
              <span>
                {formatDuration(stats.totalDurationMinutes)} at {stats.wordsPerMinute} wpm
              </span>
            </div>
            <p className="text-neutral-500">
              Scroll either pane to compare text side by side
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .overflow-y-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .overflow-y-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .overflow-y-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
        .overflow-y-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}
