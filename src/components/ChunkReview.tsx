import { useState, useMemo, useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, Settings, Clock, FileAudio, Zap, Mic2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
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
    "What is his name?",
    "Bingley.",
    "Is he married or single?",
    "Oh! Single, my dear, to be sure! A single man of large fortune; four or five thousand a year. What a fine thing for our girls!",
    "How so? How can it affect them?",
    "My dear Mr. Bennet, replied his wife, how can you be so tiresome! You must know that I am thinking of his marrying one of them.",
    "Is that his design in settling here?",
    "Design! Nonsense, how can you talk so! But it is very likely that he may fall in love with one of them, and therefore you must visit him as soon as he comes.",
    "I see no occasion for that. You and the girls may go, or you may send them by themselves, which perhaps will be still better, for as you are as handsome as any of them, Mr. Bingley may like you the best of the party.",
    "My dear, you flatter me. I certainly have had my share of beauty, but I do not pretend to be anything extraordinary now. When a woman has five grown-up daughters, she ought to give over thinking of her own beauty.",
    "In such cases, a woman has not often much beauty to think of.",
    "But, my dear, you must indeed go and see Mr. Bingley when he comes into the neighbourhood.",
    "It is more than I engage for, I assure you.",
    "But consider your daughters. Only think what an establishment it would be for one of them. Sir William and Lady Lucas are determined to go, merely on that account, for in general, you know, they visit no newcomers. Indeed you must go, for it will be impossible for us to visit him if you do not.",
    "You are over-scrupulous, surely. I dare say Mr. Bingley will be very glad to see you; and I will send a few lines by you to assure him of my hearty consent to his marrying whichever he chooses of the girls; though I must throw in a good word for my little Lizzy.",
    "I desire you will do no such thing. Lizzy is not a bit better than the others; and I am sure she is not half so handsome as Jane, nor half so good-humoured as Lydia. But you are always giving her the preference.",
    "They have none of them much to recommend them, replied he; they are all silly and ignorant like other girls; but Lizzy has something more of quickness than her sisters.",
    "Mr. Bennet, how can you abuse your own children in such a way? You take delight in vexing me. You have no compassion for my poor nerves.",
    "You mistake me, my dear. I have a high respect for your nerves. They are my old friends. I have heard you mention them with consideration these last twenty years at least.",
    "Ah, you do not know what I suffer.",
    "But I hope you will get over it, and live to see many young men of four thousand a year come into the neighbourhood.",
  ];

  return mockTexts.map((text, index) => {
    const wordCount = text.split(/\s+/).length;
    const charCount = text.length;
    const tokenCount = Math.round(wordCount * 1.3);
    const estimatedCost = (tokenCount / 1000) * 0.09 + (charCount / 1000000) * 15;

    // For demo: mark all as completed with modernized text
    const modernizedText = text
      .replace(/shall/g, "will")
      .replace(/whilst/g, "while")
      .replace(/ought to/g, "should")
      .replace(/replied he/g, "he replied")
      .replace(/returned she/g, "she returned")
      .replace(/cried his wife/g, "his wife cried")
      .replace(/said his lady/g, "his wife said");

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
      status: "completed",
      modernizationInstructions: "Modern, casual, conversational tone. Update archaic language while preserving the original meaning and literary style.",
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
      // If real chunks are provided, modernize the first 3 as examples
      return providedChunks.map((chunk, index) => {
        if (index < 3 && chunk.originalText) {
          // Create sample modernized version for first 3 chunks
          const modernized = chunk.originalText
            .replace(/eBook/g, "ebook")
            .replace(/shall/g, "will")
            .replace(/whilst/g, "while")
            .replace(/ought to/g, "should")
            .replace(/hath/g, "has")
            .replace(/doth/g, "does")
            .replace(/thou/g, "you")
            .replace(/thee/g, "you")
            .replace(/thy/g, "your")
            .replace(/thine/g, "yours");
          
          return {
            ...chunk,
            modernizedText: modernized,
            status: "completed" as const,
          };
        }
        return chunk;
      });
    }
    return generateMockChunks();
  });
  
  useEffect(() => {
    if (providedChunks && providedChunks.length > 0) {
      // Update with sample modernization for first 3
      const updated = providedChunks.map((chunk, index) => {
        if (index < 3 && chunk.originalText) {
          const modernized = chunk.originalText
            .replace(/eBook/g, "ebook")
            .replace(/shall/g, "will")
            .replace(/whilst/g, "while")
            .replace(/ought to/g, "should")
            .replace(/hath/g, "has")
            .replace(/doth/g, "does")
            .replace(/thou/g, "you")
            .replace(/thee/g, "you")
            .replace(/thy/g, "your")
            .replace(/thine/g, "yours");
          
          return {
            ...chunk,
            modernizedText: modernized,
            status: "completed" as const,
          };
        }
        return chunk;
      });
      setChunks(updated);
    }
  }, [providedChunks]);

  // Duration controls
  const [targetSegmentMinutes, setTargetSegmentMinutes] = useState(15); // Default: 15 minute segments
  const [wordsPerMinute, setWordsPerMinute] = useState(150); // Standard audiobook narration rate
  
  // Voice settings state
  const [voiceSettingsOpen, setVoiceSettingsOpen] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("alloy");
  const [pitch, setPitch] = useState(1.0);
  const [stability, setStability] = useState(0.75);
  const [pauseLength, setPauseLength] = useState(1.0);

  // Show ALL chunks (with original text at minimum)
  const visibleChunks = useMemo(() => 
    chunks.filter(c => c.originalText && c.originalText.trim().length > 0),
    [chunks]
  );

  // Calculate duration-based stats
  const durationStats = useMemo(() => {
    const totalWords = visibleChunks.reduce((sum, c) => sum + c.wordCount, 0);
    const totalChars = visibleChunks.reduce((sum, c) => sum + c.charCount, 0);
    const completedCount = visibleChunks.filter(c => c.status === "completed" && c.modernizedText).length;
    
    // Calculate total duration in minutes
    const totalDurationMinutes = totalWords / wordsPerMinute;
    const totalDurationHours = totalDurationMinutes / 60;
    
    // Calculate how many segments needed
    const segmentsNeeded = Math.ceil(totalDurationMinutes / targetSegmentMinutes);
    
    // Calculate words per segment
    const wordsPerSegment = Math.ceil(totalWords / segmentsNeeded);
    
    return {
      totalChunks: visibleChunks.length,
      totalWords,
      totalChars,
      completedCount,
      pendingCount: visibleChunks.length - completedCount,
      totalDurationMinutes,
      totalDurationHours,
      segmentsNeeded,
      wordsPerSegment,
      targetSegmentMinutes,
      wordsPerMinute,
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
      {/* Vignette Overlay - Edge Burn Effect */}
      <div 
        className="fixed inset-0 pointer-events-none z-10"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.6) 100%)'
        }}
      />

      {/* Subtle ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-20 h-full flex flex-col">
        {/* Header with Duration Controls */}
        <div className="flex-none bg-neutral-900/80 backdrop-blur-xl border-b border-white/5">
          {/* Top Bar */}
          <div className="px-6 py-4 border-b border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors text-neutral-400 hover:text-white"
                >
                  <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
                </button>
                <div>
                  <h3 className="text-lg text-white">Text Transformation</h3>
                  <p className="text-sm text-neutral-400">
                    {durationStats.totalWords.toLocaleString()} words • {formatDuration(durationStats.totalDurationMinutes)} total
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  <Settings className="w-4 h-4 mr-2" strokeWidth={2.5} />
                  Settings
                </Button>
                <button
                  onClick={() => onProceedToSegmentBuilder(Math.ceil(visibleChunks.length / durationStats.segmentsNeeded))}
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

          {/* Duration Control Panel */}
          <div className="px-6 py-4 bg-neutral-950/40">
            <div className="grid grid-cols-2 gap-6 max-w-5xl">
              {/* Left Column: Target Segment Duration */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" strokeWidth={2.5} />
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
                <p className="text-xs text-neutral-500">
                  How long should each audio file be?
                </p>
              </div>

              {/* Right Column: Output Summary */}
              <div className="bg-gradient-to-br from-purple-950/50 to-pink-950/50 rounded-xl p-4 border border-purple-500/20">
                <div className="flex items-start justify-between mb-3">
                  <Label className="text-xs uppercase tracking-wider text-purple-300">
                    Audio Output
                  </Label>
                  <FileAudio className="w-4 h-4 text-purple-400" strokeWidth={2.5} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl tabular-nums text-white">
                      {durationStats.segmentsNeeded}
                    </span>
                    <span className="text-sm text-purple-300">audio files</span>
                  </div>
                  <div className="text-xs text-neutral-400 space-y-1">
                    <div>≈ {durationStats.wordsPerSegment.toLocaleString()} words each</div>
                    <div>≈ {formatDuration(targetSegmentMinutes)} per file</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Voice & Reading Settings - Collapsible */}
            <div className="mt-4 max-w-5xl">
              <Collapsible open={voiceSettingsOpen} onOpenChange={setVoiceSettingsOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 bg-neutral-900/40 hover:bg-neutral-900/60 rounded-xl border border-white/10 transition-all group">
                  <div className="flex items-center gap-2">
                    <Mic2 className="w-4 h-4 text-purple-400" strokeWidth={2.5} />
                    <span className="text-sm text-neutral-300">Voice & Reading Settings</span>
                    <span className="text-xs text-neutral-500">({wordsPerMinute} wpm, {selectedVoice} voice)</span>
                  </div>
                  {voiceSettingsOpen ? (
                    <ChevronUp className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" strokeWidth={2.5} />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" strokeWidth={2.5} />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3">
                  <div className="bg-neutral-900/40 rounded-xl border border-white/10 p-4">
                    <div className="grid grid-cols-2 gap-6">
                      {/* Speaking Rate */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                            <Zap className="w-3.5 h-3.5" strokeWidth={2.5} />
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
                          Standard audiobook: 150-160 wpm
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
                                  : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white"
                              }`}
                            >
                              {voice}
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-neutral-500">
                          Choose narrator voice style
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
                          Voice consistency & emotion range
                        </p>
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
                      <p className="text-neutral-600 text-xs mt-2">Upload and chunk a document to see text here</p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {visibleChunks.map((chunk, index) => (
                        <div 
                          key={`original-${chunk.id}`}
                          className="relative"
                        >
                          {/* Chunk separator */}
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
                      <p className="text-neutral-600 text-xs mt-2">Process chunks to see modernized versions</p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {visibleChunks.map((chunk, index) => (
                        <div 
                          key={`modern-${chunk.id}`}
                          className="relative"
                        >
                          {/* Chunk separator */}
                          {index > 0 && (
                            <div className="absolute -top-4 left-0 right-0 flex items-center gap-3">
                              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
                            </div>
                          )}
                          
                          {chunk.modernizedText && chunk.modernizedText.trim().length > 0 ? (
                            <pre 
                              className="text-base leading-relaxed text-white whitespace-pre-wrap break-words font-sans"
                            >
                              {chunk.modernizedText}
                            </pre>
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
            <div className="flex items-center gap-4 text-neutral-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{durationStats.completedCount} modernized</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span>{durationStats.pendingCount} pending</span>
              </div>
              <Separator orientation="vertical" className="h-3" />
              <span className="text-neutral-600">
                {formatDuration(durationStats.totalDurationMinutes)} at {durationStats.wordsPerMinute} wpm
              </span>
            </div>
            <p className="text-neutral-500">
              Scroll either pane to compare original and modernized text side by side
            </p>
          </div>
        </div>
      </div>

      <style>{`
        /* Custom scrollbar styling */
        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}
