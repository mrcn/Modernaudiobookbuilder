import { useState } from "react";
import { Book, Clip } from "../App";
import { ArrowLeft, Scissors, Save, Play } from "lucide-react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";

type ClipCreatorProps = {
  book: Book;
  onSave: (clip: Omit<Clip, "id" | "userId" | "userHandle" | "likes" | "shares" | "createdAt">) => void;
  onCancel: () => void;
};

export function ClipCreator({ book, onSave, onCancel }: ClipCreatorProps) {
  const [title, setTitle] = useState("");
  const [quoteText, setQuoteText] = useState(book.modernizedText?.slice(0, 150) || "");
  const [tags, setTags] = useState("");
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(10);

  const duration = endTime - startTime;

  const handleSave = () => {
    onSave({
      editionId: book.id,
      title,
      bookTitle: book.title,
      quoteText,
      audioUrl: "mock-clip-audio.mp3",
      startTime,
      endTime,
      duration,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      coverGradient: book.coverGradient,
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-8 py-10">
      <button
        onClick={onCancel}
        className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-8 transition-colors px-4 py-2 rounded-lg hover:bg-black/5"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
        <span>Back</span>
      </button>

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-50" />
            <div className="relative w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center">
              <Scissors className="w-7 h-7 text-purple-600" strokeWidth={2} />
            </div>
          </div>
          <div>
            <h2 className="text-4xl tracking-tight">Create Clip</h2>
            <p className="text-neutral-600 text-lg">Choose the lines that hit hardest</p>
          </div>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-black/5 p-10 shadow-lg space-y-8">
        {/* Quote Preview */}
        <div className={`relative p-10 rounded-2xl bg-gradient-to-br ${book.coverGradient} overflow-hidden`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent_70%)]" />
          <p className="relative text-white text-xl italic leading-relaxed drop-shadow-lg text-center">
            "{quoteText || "Your quote will appear here..."}"
          </p>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Clip Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your clip a catchy title"
            className="h-12 bg-white border-black/10 rounded-xl focus:border-purple-400 focus:ring-purple-400"
          />
        </div>

        {/* Quote Text */}
        <div className="space-y-2">
          <Label htmlFor="quote">Quote Text</Label>
          <Textarea
            id="quote"
            value={quoteText}
            onChange={(e) => setQuoteText(e.target.value)}
            placeholder="Enter the quote you want to share..."
            className="min-h-[120px] bg-white border-black/10 rounded-xl focus:border-purple-400 focus:ring-purple-400 resize-none"
          />
          <p className="text-xs text-neutral-500">
            Keep it short and impactful - the best quotes are memorable
          </p>
        </div>

        {/* Audio Timeline */}
        <div className="space-y-4 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200/50">
          <div className="flex items-center justify-between mb-2">
            <Label>Audio Selection</Label>
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Play className="w-4 h-4" strokeWidth={2.5} />
              <span>{formatTime(duration)} clip</span>
            </div>
          </div>
          <p className="text-xs text-neutral-500 -mt-2">Select clips from 15 seconds up to 3 hours</p>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">Start Time</span>
                <span className="text-purple-700">{formatTime(startTime)}</span>
              </div>
              <Slider
                value={[startTime]}
                max={10800}
                step={1}
                onValueChange={(value) => setStartTime(Math.min(value[0], endTime - 1))}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">End Time</span>
                <span className="text-purple-700">{formatTime(endTime)}</span>
              </div>
              <Slider
                value={[endTime]}
                max={10800}
                step={1}
                onValueChange={(value) => setEndTime(Math.max(value[0], startTime + 1))}
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 pt-4">
            <button className="px-6 py-2.5 bg-white hover:bg-neutral-50 border border-purple-200 rounded-xl transition-all duration-200 flex items-center gap-2">
              <Play className="w-4 h-4 text-purple-600" strokeWidth={2.5} />
              <span className="text-sm text-purple-700">Preview Clip</span>
            </button>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <Input
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="iconic, poetic, wisdom (comma separated)"
            className="h-12 bg-white border-black/10 rounded-xl focus:border-purple-400 focus:ring-purple-400"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-4 border border-black/10 text-neutral-700 rounded-2xl hover:bg-black/5 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title || !quoteText}
            className="group relative flex-1 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 disabled:from-neutral-300 disabled:to-neutral-400 text-white rounded-2xl flex items-center justify-center gap-3 transition-all duration-200 hover:shadow-2xl hover:shadow-purple-500/25 hover:scale-105 disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
            <Save className="w-5 h-5 relative z-10" strokeWidth={2.5} />
            <span className="relative z-10">Share Clip</span>
          </button>
        </div>
      </div>
    </div>
  );
}
