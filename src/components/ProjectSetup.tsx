import { useState, useMemo } from "react";
import { ArrowLeft, Save, Sparkles, DollarSign, FileText, Book as BookIcon, Sliders, ChevronDown, Zap, AlertCircle } from "lucide-react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Badge } from "./ui/badge";
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

  // Calculate book statistics
  const stats = useMemo(() => {
    const totalWords = fileContent.trim().split(/\s+/).length;
    const totalChars = fileContent.length;
    
    // Calculate based on selected range
    const startIndex = Math.floor((totalChars * rangeStart) / 100);
    const endIndex = Math.floor((totalChars * rangeEnd) / 100);
    const selectedChars = endIndex - startIndex;
    const selectedWords = fileContent.slice(startIndex, endIndex).trim().split(/\s+/).length;
    
    // Token estimates (1 token ≈ 4 characters)
    const inputTokens = Math.ceil(selectedChars / 4); // Original text to GPT-4
    const outputTokens = Math.ceil(selectedChars / 4); // Modernized text from GPT-4 (similar length)
    const totalTokens = inputTokens + outputTokens;
    
    // Cost estimates based on GPT-4 Turbo pricing
    const inputCost = (inputTokens / 1000) * 0.01; // $0.01 per 1k input tokens
    const outputCost = (outputTokens / 1000) * 0.03; // $0.03 per 1k output tokens
    const modernizationCost = inputCost + outputCost;
    
    // TTS cost based on modernized text characters (output)
    const ttsChars = selectedChars; // Modernized text will be similar length
    const ttsCost = (ttsChars / 1000000) * 15; // $15 per 1M characters (OpenAI TTS pricing)
    
    const totalCost = modernizationCost + ttsCost;
    
    // Estimated duration (average reading speed ~150 words/min for audiobooks)
    const durationMinutes = Math.ceil(selectedWords / 150);
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    return {
      totalWords,
      totalChars,
      selectedWords,
      selectedChars,
      inputTokens,
      outputTokens,
      totalTokens,
      ttsChars,
      modernizationCost,
      ttsCost,
      totalCost,
      duration: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
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
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onCancel}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-6 transition-colors px-4 py-2 rounded-lg hover:bg-white"
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
                className="flex-1 sm:flex-none px-5 py-3 border-2 border-neutral-300 rounded-xl hover:bg-white transition-colors"
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

          {/* Cost Estimate Banner */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5" strokeWidth={2.5} />
                  <h3 className="text-xl">Estimated Cost</h3>
                </div>
                <p className="text-white/80 text-sm mb-3">Based on your selections below</p>
                <div className="space-y-1 text-sm text-white/90">
                  <div className="flex items-center justify-between sm:justify-start sm:gap-4">
                    <span>AI Modernization:</span>
                    <span className="font-medium">${stats.modernizationCost.toFixed(3)}</span>
                  </div>
                  <div className="text-xs text-white/70 ml-4">
                    {stats.inputTokens.toLocaleString()} input + {stats.outputTokens.toLocaleString()} output tokens
                  </div>
                  <div className="flex items-center justify-between sm:justify-start sm:gap-4 pt-1">
                    <span>Text-to-Speech:</span>
                    <span className="font-medium">${stats.ttsCost.toFixed(3)}</span>
                  </div>
                  <div className="text-xs text-white/70 ml-4">
                    {stats.ttsChars.toLocaleString()} characters
                  </div>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-xs text-white/80 mb-1 uppercase tracking-wide">Total</div>
                <div className="text-4xl sm:text-5xl mb-1 tabular-nums">${stats.totalCost.toFixed(2)}</div>
                <div className="text-sm text-white/80">
                  for {stats.duration} of audio
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Details Card */}
            <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6 shadow-sm">
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
                    className="border-2 border-neutral-300 focus:border-purple-500"
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
                    className="border-2 border-neutral-300 focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Modernization Instructions Card */}
            <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6 shadow-sm">
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
                    className="min-h-[120px] border-2 border-neutral-300 focus:border-purple-500 leading-relaxed"
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

            {/* Content Range Card */}
            <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Sliders className="w-5 h-5 text-purple-600" strokeWidth={2.5} />
                <h3 className="text-xl">Content Range</h3>
              </div>

              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm">Select portion to modernize</Label>
                    <button
                      onClick={() => {
                        setRangeStart(0);
                        setRangeEnd(100);
                      }}
                      className="text-xs text-purple-600 hover:text-purple-700"
                    >
                      Reset to full book
                    </button>
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

                  {isRangeModified && (
                    <Alert className="mt-4 border-amber-400 bg-amber-50">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <AlertDescription className="text-sm text-amber-800">
                        You've selected {rangeEnd - rangeStart}% of the book ({stats.selectedWords.toLocaleString()} words).
                        This will reduce processing time and cost.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Statistics */}
          <div className="space-y-6">
            {/* File Info Card */}
            <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6 shadow-sm sticky top-6">
              <div className="flex items-center gap-2 mb-6">
                <FileText className="w-5 h-5 text-purple-600" strokeWidth={2.5} />
                <h3 className="text-xl">Book Statistics</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Original File</p>
                  <p className="text-sm truncate" title={fileName}>{fileName}</p>
                  <p className="text-xs text-neutral-500 mt-1">{(fileSize / 1024).toFixed(1)} KB</p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Total Words</span>
                    <span className="text-sm tabular-nums">{stats.totalWords.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Total Characters</span>
                    <span className="text-sm tabular-nums">{stats.totalChars.toLocaleString()}</span>
                  </div>
                </div>

                <Separator />

                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                  <p className="text-xs text-purple-700 mb-3 uppercase tracking-wide">Selected Range</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-purple-800">Words</span>
                      <span className="text-sm tabular-nums font-medium text-purple-900">
                        {stats.selectedWords.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-purple-800">Characters</span>
                      <span className="text-sm tabular-nums font-medium text-purple-900">
                        {stats.selectedChars.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-purple-800">Total Tokens</span>
                      <span className="text-sm tabular-nums font-medium text-purple-900">
                        {stats.totalTokens.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-purple-600 mt-2 pt-2 border-t border-purple-200">
                      {stats.inputTokens.toLocaleString()} in + {stats.outputTokens.toLocaleString()} out
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Audio Duration</span>
                    <span className="text-sm tabular-nums">{stats.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Estimated Cost</span>
                    <span className="text-sm tabular-nums font-medium text-emerald-700">
                      ${stats.totalCost.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t-2 border-neutral-200">
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Cost includes AI modernization and text-to-speech processing. Final cost may vary based on actual usage.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
