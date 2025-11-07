import { useState, useMemo } from "react";
import { ArrowLeft, Sparkles, FileText, Book as BookIcon, Sliders, Zap, AlertCircle, Info } from "lucide-react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Alert, AlertDescription } from "./ui/alert";
import { Separator } from "./ui/separator";

export type ProjectConfig = {
  title: string;
  author: string;
  instructions: string;
  startPosition: number; // Percentage of book to start from
  endPosition: number; // Percentage of book to end at
};

type ProjectSetupProps = {
  fileName: string;
  fileSize: number;
  fileContent: string;
  onConfigure: (config: ProjectConfig) => void;
  onCancel: () => void;
};

const DEFAULT_INSTRUCTIONS = `Modernize the language while preserving the original meaning and tone. Update archaic terms, simplify complex sentences, and make the text more accessible to contemporary readers. Maintain the author's voice and narrative style.`;

export function ProjectSetup({ fileName, fileSize, fileContent, onConfigure, onCancel }: ProjectSetupProps) {
  const [title, setTitle] = useState(fileName.replace(/\.[^/.]+$/, ""));
  const [author, setAuthor] = useState("");
  const [instructions, setInstructions] = useState(DEFAULT_INSTRUCTIONS);
  const [rangeStart, setRangeStart] = useState(0);
  const [rangeEnd, setRangeEnd] = useState(100);

  // Calculate book statistics based on selected range
  const stats = useMemo(() => {
    const totalWords = fileContent.trim().split(/\s+/).length;
    const totalChars = fileContent.length;
    
    // Calculate based on selected range
    const startIndex = Math.floor((totalChars * rangeStart) / 100);
    const endIndex = Math.floor((totalChars * rangeEnd) / 100);
    const selectedContent = fileContent.slice(startIndex, endIndex);
    const selectedChars = selectedContent.length;
    const selectedWords = selectedContent.trim().split(/\s+/).length;
    
    // Count paragraphs in selected content
    const paragraphs = selectedContent.split(/\n\n+/).filter(p => p.trim().length > 0);
    const paragraphCount = paragraphs.length;
    
    // Estimate chunks based on target size of 2000 characters per chunk
    const TARGET_CHUNK_SIZE = 2000;
    const estimatedChunks = Math.ceil(selectedChars / TARGET_CHUNK_SIZE);
    
    // Token estimates (1 token ≈ 4 characters)
    const inputTokens = Math.ceil(selectedChars / 4);
    const outputTokens = Math.ceil(selectedChars / 4);
    const totalTokens = inputTokens + outputTokens;
    
    // Cost estimates based on GPT-4 Turbo pricing
    const inputCost = (inputTokens / 1000) * 0.01; // $0.01 per 1k input tokens
    const outputCost = (outputTokens / 1000) * 0.03; // $0.03 per 1k output tokens
    const modernizationCost = inputCost + outputCost;
    
    // TTS cost based on modernized text characters
    const ttsCost = (selectedChars / 1000000) * 15; // $15 per 1M characters
    
    const totalCost = modernizationCost + ttsCost;
    
    // Estimated duration (average reading speed ~150 words/min)
    const durationMinutes = Math.ceil(selectedWords / 150);
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    return {
      totalWords,
      totalChars,
      selectedWords,
      selectedChars,
      paragraphCount,
      estimatedChunks,
      inputTokens,
      outputTokens,
      totalTokens,
      modernizationCost,
      ttsCost,
      totalCost,
      duration: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
      durationSeconds: durationMinutes * 60,
    };
  }, [fileContent, rangeStart, rangeEnd]);

  const handleConfigure = () => {
    onConfigure({
      title,
      author,
      instructions,
      startPosition: rangeStart,
      endPosition: rangeEnd,
    });
  };

  const isRangeModified = rangeStart > 0 || rangeEnd < 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-purple-50/30 to-pink-50/30">
      {/* Ambient background blur */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onCancel}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-6 transition-colors px-4 py-2 rounded-lg hover:bg-white/70 backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
            <span>Back to Upload</span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-3xl sm:text-4xl tracking-tight mb-2">Project Setup</h2>
              <p className="text-neutral-600 text-base sm:text-lg">
                Configure your audiobook modernization
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onCancel}
                className="flex-1 sm:flex-none px-5 py-3 border-2 border-neutral-300 bg-white/70 backdrop-blur-sm rounded-xl hover:bg-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfigure}
                disabled={!title.trim() || !author.trim()}
                className="flex-1 sm:flex-none group relative px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 disabled:from-neutral-300 disabled:to-neutral-400 text-white rounded-xl transition-all duration-200 hover:shadow-xl hover:shadow-purple-500/25 hover:scale-105 disabled:hover:scale-100 disabled:hover:shadow-none disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <span className="relative z-10 flex items-center gap-2">
                  <Zap className="w-4 h-4" strokeWidth={2.5} />
                  Start Processing
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Details Card */}
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border-2 border-black/5 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <BookIcon className="w-5 h-5 text-purple-600" strokeWidth={2.5} />
                <h3 className="text-xl">Project Details</h3>
              </div>

              <div className="space-y-5">
                <div>
                  <Label htmlFor="title" className="text-sm mb-2 block">
                    Book Title *
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter book title..."
                    className="border-2 border-neutral-300 focus:border-purple-500 bg-white"
                  />
                </div>

                <div>
                  <Label htmlFor="author" className="text-sm mb-2 block">
                    Author *
                  </Label>
                  <Input
                    id="author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Enter author name..."
                    className="border-2 border-neutral-300 focus:border-purple-500 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Content Range Card - MOVED UP */}
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border-2 border-black/5 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Sliders className="w-5 h-5 text-purple-600" strokeWidth={2.5} />
                <h3 className="text-xl">Content Range</h3>
              </div>

              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm">Select portion to process</Label>
                    {isRangeModified && (
                      <button
                        onClick={() => {
                          setRangeStart(0);
                          setRangeEnd(100);
                        }}
                        className="text-xs text-purple-600 hover:text-purple-700"
                      >
                        Reset to full book
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-neutral-600">Start</span>
                        <span className="text-sm tabular-nums text-purple-600">{rangeStart}%</span>
                      </div>
                      <Slider
                        value={[rangeStart]}
                        min={0}
                        max={rangeEnd - 1}
                        step={1}
                        onValueChange={(value) => setRangeStart(value[0])}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-neutral-600">End</span>
                        <span className="text-sm tabular-nums text-purple-600">{rangeEnd}%</span>
                      </div>
                      <Slider
                        value={[rangeEnd]}
                        min={rangeStart + 1}
                        max={100}
                        step={1}
                        onValueChange={(value) => setRangeEnd(value[0])}
                      />
                    </div>
                  </div>

                  {/* Live Stats Preview */}
                  <div className="mt-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-4">
                    <p className="text-xs text-purple-700 mb-3 uppercase tracking-wide">Selected Content</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-purple-600">Words</p>
                        <p className="tabular-nums text-purple-900">{stats.selectedWords.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-purple-600">Characters</p>
                        <p className="tabular-nums text-purple-900">{stats.selectedChars.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-purple-600">Paragraphs</p>
                        <p className="tabular-nums text-purple-900">{stats.paragraphCount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-purple-600">Est. Chunks</p>
                        <p className="tabular-nums text-purple-900">{stats.estimatedChunks.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-purple-200 flex items-start gap-2">
                      <Info className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                      <p className="text-xs text-purple-700 leading-relaxed">
                        Each paragraph will become a chunk, ending at natural boundaries. This preserves narrative flow and ensures clean breaks.
                      </p>
                    </div>
                  </div>

                  {isRangeModified && (
                    <Alert className="mt-4 border-amber-400 bg-amber-50/70 backdrop-blur-sm">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <AlertDescription className="text-sm text-amber-800">
                        Processing {rangeEnd - rangeStart}% of the book. This reduces cost and time significantly.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </div>

            {/* Modernization Instructions Card */}
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border-2 border-black/5 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-purple-600" strokeWidth={2.5} />
                <h3 className="text-xl">Modernization Instructions</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="instructions" className="text-sm mb-2 block">
                    Custom Instructions
                  </Label>
                  <Textarea
                    id="instructions"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Enter modernization instructions..."
                    className="min-h-[120px] border-2 border-neutral-300 focus:border-purple-500 leading-relaxed bg-white"
                  />
                  <p className="text-xs text-neutral-500 mt-2">
                    These instructions guide the AI in modernizing your book's language while preserving its essence.
                  </p>
                </div>

                <button
                  onClick={() => setInstructions(DEFAULT_INSTRUCTIONS)}
                  className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" strokeWidth={2.5} />
                  Reset to default instructions
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Live Cost & Stats */}
          <div className="space-y-6">
            {/* Cost Breakdown Card */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-xl sticky top-6">
              <h3 className="text-xl mb-4">Cost Estimate</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white/80 text-sm">AI Modernization</span>
                    <span className="tabular-nums">${stats.modernizationCost.toFixed(3)}</span>
                  </div>
                  <p className="text-xs text-white/60">
                    {stats.inputTokens.toLocaleString()} in + {stats.outputTokens.toLocaleString()} out tokens
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white/80 text-sm">Text-to-Speech</span>
                    <span className="tabular-nums">${stats.ttsCost.toFixed(3)}</span>
                  </div>
                  <p className="text-xs text-white/60">
                    {stats.selectedChars.toLocaleString()} characters
                  </p>
                </div>

                <Separator className="bg-white/20" />

                <div>
                  <div className="text-xs text-white/70 mb-1 uppercase tracking-wide">Total Cost</div>
                  <div className="text-4xl tabular-nums mb-1">${stats.totalCost.toFixed(2)}</div>
                  <div className="text-sm text-white/80">
                    for {stats.duration} of audio
                  </div>
                </div>
              </div>

              <Alert className="bg-white/10 border-white/20 backdrop-blur-sm">
                <Info className="w-4 h-4 text-white" strokeWidth={2.5} />
                <AlertDescription className="text-xs text-white/90 leading-relaxed">
                  Costs update automatically based on your content range selection above. Final costs may vary slightly.
                </AlertDescription>
              </Alert>
            </div>

            {/* File Info Card */}
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border-2 border-black/5 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-purple-600" strokeWidth={2.5} />
                <h3 className="text-lg">Original File</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Filename</p>
                  <p className="text-sm truncate" title={fileName}>{fileName}</p>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Size</span>
                  <span className="tabular-nums">{(fileSize / 1024).toFixed(1)} KB</span>
                </div>

                <Separator />

                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Total Words</span>
                  <span className="tabular-nums">{stats.totalWords.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Total Characters</span>
                  <span className="tabular-nums">{stats.totalChars.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Processing Preview */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border-2 border-emerald-200 p-6 shadow-sm">
              <h3 className="text-lg mb-4 text-emerald-900">What Happens Next</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</div>
                  <div>
                    <p className="text-emerald-900">Text Chunking</p>
                    <p className="text-xs text-emerald-700">Break into ~{stats.estimatedChunks} paragraph chunks</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</div>
                  <div>
                    <p className="text-emerald-900">AI Modernization</p>
                    <p className="text-xs text-emerald-700">Update language while preserving meaning</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</div>
                  <div>
                    <p className="text-emerald-900">Audio Generation</p>
                    <p className="text-xs text-emerald-700">Create {stats.duration} of high-quality TTS</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
