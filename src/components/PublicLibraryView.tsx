import { useState } from "react";
import { Edition } from "../App";
import { Play, Heart, Search, Filter, TrendingUp, Clock, Star } from "lucide-react";
import { Input } from "./ui/input";

type PublicLibraryViewProps = {
  editions: Edition[];
  onEditionClick: (edition: Edition) => void;
};

export function PublicLibraryView({ editions, onEditionClick }: PublicLibraryViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"trending" | "recent" | "popular">("trending");

  const filteredEditions = editions.filter(
    (edition) =>
      edition.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      edition.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      edition.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sortedEditions = [...filteredEditions].sort((a, b) => {
    if (sortBy === "trending") return b.listens - a.listens;
    if (sortBy === "recent") return b.createdAt.getTime() - a.createdAt.getTime();
    if (sortBy === "popular") return b.likes - a.likes;
    return 0;
  });

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
      <div className="mb-8 sm:mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
          <h2 className="text-3xl sm:text-4xl tracking-tight">Public Library</h2>
          <div className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full self-start">
            <span className="text-sm bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {editions.length} editions
            </span>
          </div>
        </div>
        <p className="text-neutral-600 text-base sm:text-lg">
          Discover classic literature reimagined by the community
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 sm:mb-10 flex flex-col gap-3 sm:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" strokeWidth={2.5} />
          <Input
            type="text"
            placeholder="Search by title, author, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 bg-white/70 backdrop-blur-xl border-black/10 rounded-2xl focus:border-purple-400 focus:ring-purple-400"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0">
          <button
            onClick={() => setSortBy("trending")}
            className={`flex-shrink-0 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl flex items-center gap-2 transition-all duration-200 ${
              sortBy === "trending"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25"
                : "bg-white/70 backdrop-blur-xl border border-black/10 text-neutral-700 hover:bg-black/5"
            }`}
          >
            <TrendingUp className="w-4 h-4" strokeWidth={2.5} />
            <span className="text-sm">Trending</span>
          </button>

          <button
            onClick={() => setSortBy("recent")}
            className={`flex-shrink-0 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl flex items-center gap-2 transition-all duration-200 ${
              sortBy === "recent"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25"
                : "bg-white/70 backdrop-blur-xl border border-black/10 text-neutral-700 hover:bg-black/5"
            }`}
          >
            <Clock className="w-4 h-4" strokeWidth={2.5} />
            <span className="text-sm">Recent</span>
          </button>

          <button
            onClick={() => setSortBy("popular")}
            className={`flex-shrink-0 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl flex items-center gap-2 transition-all duration-200 ${
              sortBy === "popular"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25"
                : "bg-white/70 backdrop-blur-xl border border-black/10 text-neutral-700 hover:bg-black/5"
            }`}
          >
            <Star className="w-4 h-4" strokeWidth={2.5} />
            <span className="text-sm">Popular</span>
          </button>
        </div>
      </div>

      {/* Editions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {sortedEditions.map((edition) => (
          <button
            key={edition.id}
            onClick={() => onEditionClick(edition)}
            className="group text-left bg-white/70 backdrop-blur-xl rounded-3xl border border-black/5 hover:border-black/10 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 overflow-hidden hover:scale-[1.02]"
          >
            <div className="relative h-52 overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${edition.coverGradient} opacity-90 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              
              <div className="relative h-full px-6 py-8 flex flex-col justify-end">
                <h3 className="text-white drop-shadow-lg mb-1.5 line-clamp-2">{edition.title}</h3>
                <p className="text-sm text-white/90 drop-shadow-md">{edition.author}</p>
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-xs">
                  {edition.userAvatar || "👤"}
                </div>
                <span className="text-xs text-neutral-600">{edition.userHandle}</span>
              </div>

              <p className="text-sm text-neutral-700 mb-4 line-clamp-2">{edition.summary}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {edition.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs border border-purple-200/50"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4 text-xs text-neutral-500">
                <div className="flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5" strokeWidth={2.5} />
                  <span>{edition.listens.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5" strokeWidth={2.5} />
                  <span>{edition.likes.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {sortedEditions.length === 0 && (
        <div className="text-center py-20">
          <p className="text-neutral-500 text-lg">No editions found matching your search</p>
        </div>
      )}
    </div>
  );
}
