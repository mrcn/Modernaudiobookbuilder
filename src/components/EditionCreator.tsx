import { useState } from "react";
import { Book, Edition } from "../App";
import { ArrowLeft, Globe, Lock, Sparkles, Save } from "lucide-react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

type EditionCreatorProps = {
  book: Book;
  onSave: (edition: Omit<Edition, "id" | "userId" | "userHandle" | "listens" | "likes" | "createdAt">) => void;
  onCancel: () => void;
};

export function EditionCreator({ book, onSave, onCancel }: EditionCreatorProps) {
  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author);
  const [summary, setSummary] = useState("");
  const [tags, setTags] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const handleSave = () => {
    onSave({
      bookId: book.id,
      title,
      author,
      summary,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      coverGradient: book.coverGradient,
      visibility: isPublic ? "public" : "private",
      modernizedText: book.modernizedText,
      audioSegments: book.audioSegments,
    });
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
              <Sparkles className="w-7 h-7 text-purple-600" strokeWidth={2} />
            </div>
          </div>
          <div>
            <h2 className="text-4xl tracking-tight">Create Edition</h2>
            <p className="text-neutral-600 text-lg">Add details and share your modernization</p>
          </div>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-black/5 p-10 shadow-lg space-y-8">
        {/* Preview */}
        <div className="relative h-48 rounded-2xl overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${book.coverGradient}`} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="relative h-full px-8 py-8 flex flex-col justify-end">
            <h3 className="text-white drop-shadow-lg mb-1.5">{title || "Edition Title"}</h3>
            <p className="text-sm text-white/90 drop-shadow-md">{author || "Author Name"}</p>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Edition Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter the title"
            className="h-12 bg-white border-black/10 rounded-xl focus:border-purple-400 focus:ring-purple-400"
          />
        </div>

        {/* Author */}
        <div className="space-y-2">
          <Label htmlFor="author">Author</Label>
          <Input
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Original author name"
            className="h-12 bg-white border-black/10 rounded-xl focus:border-purple-400 focus:ring-purple-400"
          />
        </div>

        {/* Summary */}
        <div className="space-y-2">
          <Label htmlFor="summary">Summary</Label>
          <Textarea
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Write a brief description of your modernization..."
            className="min-h-[120px] bg-white border-black/10 rounded-xl focus:border-purple-400 focus:ring-purple-400 resize-none"
          />
          <p className="text-xs text-neutral-500">
            Tell listeners what makes your version special
          </p>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <Input
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="romance, classic, witty (comma separated)"
            className="h-12 bg-white border-black/10 rounded-xl focus:border-purple-400 focus:ring-purple-400"
          />
          <p className="text-xs text-neutral-500">
            Help others discover your edition with relevant tags
          </p>
        </div>

        {/* Visibility */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200/50">
          <div className="flex items-center gap-4">
            {isPublic ? (
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-purple-600" strokeWidth={2.5} />
              </div>
            ) : (
              <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
                <Lock className="w-6 h-6 text-neutral-600" strokeWidth={2.5} />
              </div>
            )}
            <div>
              <Label htmlFor="visibility" className="cursor-pointer">
                {isPublic ? "Public Edition" : "Private Edition"}
              </Label>
              <p className="text-sm text-neutral-600">
                {isPublic
                  ? "Anyone can discover and listen to this edition"
                  : "Only you can access this edition"}
              </p>
            </div>
          </div>
          <Switch
            id="visibility"
            checked={isPublic}
            onCheckedChange={setIsPublic}
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
            disabled={!title || !author || !summary}
            className="group relative flex-1 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 disabled:from-neutral-300 disabled:to-neutral-400 text-white rounded-2xl flex items-center justify-center gap-3 transition-all duration-200 hover:shadow-2xl hover:shadow-purple-500/25 hover:scale-105 disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
            <Save className="w-5 h-5 relative z-10" strokeWidth={2.5} />
            <span className="relative z-10">Publish Edition</span>
          </button>
        </div>
      </div>
    </div>
  );
}
