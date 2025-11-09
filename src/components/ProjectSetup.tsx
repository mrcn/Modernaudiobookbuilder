import { useState, useMemo } from "react";
import { ArrowLeft, Sparkles, Sliders, Zap, Info, Edit2, Check, X } from "lucide-react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
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
  
  // Inline editing states
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);
  const [tempAuthor, setTempAuthor] = useState(author);

  // Calculate book statistics based on selected range
  const stats = useMemo(() => {
    const totalWords = fileContent.trim().split(/\s+/).length;
    const totalChars = fileContent.length;
    
    // Page estimates (approximately 250 words per page, or ~1500 characters per page)
    const CHARS_PER_PAGE = 1500;
    const totalPages = Math.ceil(totalChars / CHARS_PER_PAGE);
    
    // Calculate based on selected range
    const startIndex = Math.floor((totalChars * rangeStart) / 100);
    const endIndex = Math.floor((totalChars * rangeEnd) / 100);
    const selectedContent = fileContent.slice(startIndex, endIndex);
    const selectedChars = selectedContent.length;
    const selectedWords = selectedContent.trim().split(/\s+/).length;
    
    // Calculate page numbers for selected range
    const startPage = Math.floor((totalPages * rangeStart) / 100);
    const endPage = Math.ceil((totalPages * rangeEnd) / 100);
    const selectedPages = endPage - startPage;
    
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
    const llmCost = inputCost + outputCost;
    
    // TTS cost based on modernized text characters
    const ttsCost = (selectedChars / 1000000) * 15; // $15 per 1M characters
    
    const totalCost = llmCost + ttsCost;
    
    // Estimated duration (average reading speed ~150 words/min)
    const durationMinutes = Math.ceil(selectedWords / 150);
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    return {
      totalWords,
      totalChars,
      totalPages,
      selectedWords,
      selectedChars,
      selectedPages,
      startPage,
      endPage,
      paragraphCount,
      estimatedChunks,
      inputTokens,
      outputTokens,
      totalTokens,
      llmCost,
      ttsCost,
      totalCost,
      duration: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
      durationSeconds: durationMinutes * 60,
    };
  }, [fileContent, rangeStart, rangeEnd]);

  const handleConfigure = () => {
    onConfigure({
      title,
      author: author || "Unknown Author", // Default if not provided
      instructions,
      startPosition: rangeStart,
      endPosition: rangeEnd,
    });
  };

  const handleSaveTitle = () => {
    setTitle(tempTitle);
    setEditingTitle(false);
  };

  const handleCancelTitle = () => {
    setTempTitle(title);
    setEditingTitle(false);
  };

  const handleSaveAuthor = () => {
    setAuthor(tempAuthor);
    setEditingAuthor(false);
  };

  const handleCancelAuthor = () => {
    setTempAuthor(author);
    setEditingAuthor(false);
  };

  const isRangeModified = rangeStart > 0 || rangeEnd < 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 relative overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onCancel}
            className="flex items-center gap-2 text-neutral-400 hover:text-white mb-6 transition-colors px-4 py-2 rounded-lg hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
            <span>Back to Upload</span>
          </button>

          {/* Editable Title and Author */}
          <div className="text-center mb-8">
            {/* Title */}
            {editingTitle ? (
              <div className="flex items-center justify-center gap-2 mb-2">
                <Input
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  className="text-3xl sm:text-4xl text-center border-2 border-purple-500 bg-neutral-800/50 text-white max-w-2xl"
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
                  <Check className="w-5 h-5" strokeWidth={2.5} />
                </button>
                <button
                  onClick={handleCancelTitle}
                  className="p-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setEditingTitle(true);
                  setTempTitle(title);
                }}
                className="group inline-flex items-center gap-2 mb-2 text-3xl sm:text-4xl tracking-tight text-white hover:text-purple-300 transition-colors"
              >
                <span>{title || "Untitled Book"}</span>
                <Edit2 className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2.5} />
              </button>
            )}

            {/* Author */}
            {editingAuthor ? (
              <div className="flex items-center justify-center gap-2">
                <Input
                  value={tempAuthor}
                  onChange={(e) => setTempAuthor(e.target.value)}
                  placeholder="Author name (optional)"
                  className="text-base text-center border-2 border-purple-500 bg-neutral-800/50 text-neutral-300 max-w-md"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveAuthor();
                    if (e.key === 'Escape') handleCancelAuthor();
                  }}
                />
                <button
                  onClick={handleSaveAuthor}
                  className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                  <Check className="w-4 h-4" strokeWidth={2.5} />
                </button>
                <button
                  onClick={handleCancelAuthor}
                  className="p-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setEditingAuthor(true);
                  setTempAuthor(author);
                }}
                className="group inline-flex items-center gap-2 text-base text-neutral-400 hover:text-purple-300 transition-colors"
              >
                <span>{author || "Unknown Author"}</span>
                <Edit2 className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        {/* Main Content - Centered Single Column */}
        <div className="space-y-6 max-w-3xl mx-auto">
          {/* Quick Info Bar */}
          <div className="bg-neutral-900/40 backdrop-blur-xl rounded-xl border border-white/10 p-4 shadow-sm">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-xs text-neutral-500 mb-1">File</p>
                <p className="text-sm truncate text-neutral-300" title={fileName}>{fileName}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Est. Pages</p>
                <p className="text-sm tabular-nums text-neutral-300">~{stats.totalPages.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Words</p>
                <p className="text-sm tabular-nums text-neutral-300">{stats.totalWords.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Est. Cost</p>
                <p className="text-sm tabular-nums text-purple-400">${stats.totalCost.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* HERO: Modernization Instructions */}
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-6 text-white">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="w-6 h-6" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-2xl">Modernization Instructions</h3>
                <p className="text-sm text-white/80 mt-1">
                  Tell the AI how to transform your text
                </p>
              </div>
            </div>

            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Enter modernization instructions..."
              className="min-h-[200px] border-2 border-white/30 focus:border-white bg-white/95 backdrop-blur-sm leading-relaxed text-base shadow-lg text-neutral-900"
            />

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-white/90">
                These instructions guide how the AI modernizes your book's language.
              </p>
              <button
                onClick={() => setInstructions(DEFAULT_INSTRUCTIONS)}
                className="text-sm text-white hover:text-white/80 flex items-center gap-1 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Sparkles className="w-3 h-3" strokeWidth={2.5} />
                Reset to default
              </button>
            </div>
          </div>

          {/* Content Range Selector - Always Visible */}
          <div className="bg-neutral-900/40 backdrop-blur-xl rounded-2xl border-2 border-white/10 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Sliders className="w-5 h-5 text-purple-400" strokeWidth={2.5} />
              <div className="flex-1">
                <h3 className="text-lg text-white">Content Range</h3>
                <p className="text-sm text-neutral-400 mt-0.5">Select which portion of the book to process</p>
              </div>
              {isRangeModified && (
                <button
                  onClick={() => {
                    setRangeStart(0);
                    setRangeEnd(100);
                  }}
                  className="text-xs text-purple-400 hover:text-purple-300 px-3 py-1.5 bg-purple-950/50 border border-purple-500/30 rounded-lg transition-colors"
                >
                  Reset to full book
                </button>
              )}
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-400">Start Position</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm tabular-nums text-purple-400">{rangeStart}%</span>
                    <span className="text-xs text-neutral-500">≈ Page {stats.startPage}</span>
                  </div>
                </div>
                <Slider
                  value={[rangeStart]}
                  min={0}
                  max={rangeEnd - 1}
                  step={1}
                  onValueChange={(value) => setRangeStart(value[0])}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-400">End Position</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm tabular-nums text-purple-400">{rangeEnd}%</span>
                    <span className="text-xs text-neutral-500">≈ Page {stats.endPage}</span>
                  </div>
                </div>
                <Slider
                  value={[rangeEnd]}
                  min={rangeStart + 1}
                  max={100}
                  step={1}
                  onValueChange={(value) => setRangeEnd(value[0])}
                  className="w-full"
                />
              </div>
            </div>

            <Separator className="bg-white/10 my-5" />

            {/* Live Stats Preview */}
            <div className="bg-gradient-to-br from-purple-950/50 to-pink-950/50 border border-purple-500/30 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-xs text-purple-300 mb-3 uppercase tracking-wide">Selected Content</p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
                <div>
                  <p className="text-purple-400">Pages</p>
                  <p className="tabular-nums text-white">{stats.selectedPages.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-purple-400">Words</p>
                  <p className="tabular-nums text-white">{stats.selectedWords.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-purple-400">Characters</p>
                  <p className="tabular-nums text-white">{stats.selectedChars.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-purple-400">Paragraphs</p>
                  <p className="tabular-nums text-white">{stats.paragraphCount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-purple-400">API Calls</p>
                  <p className="tabular-nums text-white">~{stats.estimatedChunks.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Processing Info */}
          <div className="bg-neutral-900/60 backdrop-blur-xl border border-white/10 rounded-xl p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
              <div className="text-sm text-neutral-300 space-y-2">
                <p>
                  Your book will be processed through <span className="text-purple-400 tabular-nums">~{stats.estimatedChunks} API calls</span> for language modernization, 
                  then converted to <span className="text-purple-400">{stats.duration}</span> of audio across multiple exported audio segments.
                </p>
                <div className="flex items-center gap-6 text-xs pt-2">
                  <div>
                    <span className="text-neutral-500">LLM API Calls:</span>{" "}
                    <span className="text-emerald-400 tabular-nums">${stats.llmCost.toFixed(2)}</span>
                    <span className="text-neutral-500"> – ${stats.llmCost.toFixed(3)}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">TTS API Calls:</span>{" "}
                    <span className="text-emerald-400 tabular-nums">${stats.ttsCost.toFixed(2)}</span>
                    <span className="text-neutral-500"> – ${stats.ttsCost.toFixed(3)}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">Total:</span>{" "}
                    <span className="text-purple-400 tabular-nums">${stats.totalCost.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Prominent */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-4 border-2 border-white/20 bg-neutral-900/40 backdrop-blur-sm rounded-xl hover:bg-neutral-800/40 hover:border-white/30 transition-all text-neutral-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleConfigure}
              disabled={!title.trim()}
              className="flex-1 sm:flex-[2] group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 disabled:from-neutral-700 disabled:to-neutral-600 text-white rounded-xl transition-all duration-200 hover:shadow-xl hover:shadow-purple-500/25 hover:scale-105 disabled:hover:scale-100 disabled:hover:shadow-none disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <span className="relative z-10 flex items-center justify-center gap-2 text-lg">
                <Zap className="w-5 h-5" strokeWidth={2.5} />
                Start Processing
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
