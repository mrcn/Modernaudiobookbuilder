import { useState } from "react";
import { Clip, Edition } from "../App";
import { Play, Heart, Share2, BookOpen, Pause } from "lucide-react";

type FeedViewProps = {
  clips: Clip[];
  editions: Edition[];
};

export function FeedView({ clips, editions }: FeedViewProps) {
  const [playingClipId, setPlayingClipId] = useState<string | null>(null);
  const [likedClips, setLikedClips] = useState<Set<string>>(new Set());

  const handleLike = (clipId: string) => {
    setLikedClips((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(clipId)) {
        newSet.delete(clipId);
      } else {
        newSet.add(clipId);
      }
      return newSet;
    });
  };

  const togglePlay = (clipId: string) => {
    setPlayingClipId((prev) => (prev === clipId ? null : clipId));
  };

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
      <div className="mb-8 sm:mb-12">
        <h2 className="text-3xl sm:text-4xl tracking-tight mb-3">Feed</h2>
        <p className="text-neutral-600 text-base sm:text-lg">
          See what others are resurrecting this week
        </p>
      </div>

      {/* Featured Editions Banner */}
      <div className="mb-8 sm:mb-12">
        <h3 className="mb-4 sm:mb-6 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-600" strokeWidth={2.5} />
          Featured Editions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {editions.slice(0, 3).map((edition) => (
            <div
              key={edition.id}
              className="group relative bg-white/70 backdrop-blur-xl rounded-2xl border border-black/5 hover:border-black/10 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 overflow-hidden cursor-pointer"
            >
              <div className="relative h-32 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${edition.coverGradient} opacity-90`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="relative h-full px-4 py-4 flex flex-col justify-end">
                  <h4 className="text-white drop-shadow-lg text-sm mb-1 line-clamp-1">{edition.title}</h4>
                  <p className="text-xs text-white/90 drop-shadow-md">{edition.author}</p>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <div className="flex items-center gap-1">
                    <Play className="w-3 h-3" strokeWidth={2.5} />
                    <span>{edition.listens.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3" strokeWidth={2.5} />
                    <span>{edition.likes.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Clips Feed */}
      <div>
        <h3 className="mb-6 flex items-center gap-2">
          <Play className="w-5 h-5 text-purple-600" strokeWidth={2.5} />
          Recent Clips
        </h3>
        <div className="space-y-4">
          {clips.map((clip) => (
            <div
              key={clip.id}
              className="bg-white/70 backdrop-blur-xl rounded-3xl border border-black/5 hover:border-black/10 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10"
            >
              <div className="p-6">
                {/* User info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                    <span className="text-lg">{clip.userAvatar || "👤"}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-neutral-900">{clip.userHandle}</span>
                      <span className="text-xs text-neutral-500">•</span>
                      <span className="text-xs text-neutral-500">
                        {clip.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600">{clip.bookTitle}</p>
                  </div>
                </div>

                {/* Clip content */}
                <div className="mb-4">
                  <h4 className="mb-3">{clip.title}</h4>
                  <div className={`relative p-8 rounded-2xl bg-gradient-to-br ${clip.coverGradient} overflow-hidden`}>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent_70%)]" />
                    <p className="relative text-white text-lg italic leading-relaxed drop-shadow-lg">
                      "{clip.quoteText}"
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {clip.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs border border-purple-200/50"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => togglePlay(clip.id)}
                      className="group relative px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 flex items-center gap-2"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                      {playingClipId === clip.id ? (
                        <>
                          <Pause className="w-4 h-4 relative z-10" strokeWidth={2.5} />
                          <span className="text-sm relative z-10">Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 relative z-10" strokeWidth={2.5} />
                          <span className="text-sm relative z-10">Play</span>
                        </>
                      )}
                      <span className="text-xs opacity-75 relative z-10">
                        {clip.duration}s
                      </span>
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(clip.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                        likedClips.has(clip.id)
                          ? "bg-pink-50 text-pink-600"
                          : "text-neutral-600 hover:bg-black/5"
                      }`}
                    >
                      <Heart
                        className="w-4 h-4"
                        strokeWidth={2.5}
                        fill={likedClips.has(clip.id) ? "currentColor" : "none"}
                      />
                      <span className="text-sm">
                        {clip.likes + (likedClips.has(clip.id) ? 1 : 0)}
                      </span>
                    </button>

                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-neutral-600 hover:bg-black/5 transition-all duration-200">
                      <Share2 className="w-4 h-4" strokeWidth={2.5} />
                      <span className="text-sm">{clip.shares}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
