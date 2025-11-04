import { Edition } from "../App";
import { Play, Heart, Share2, Globe, Lock } from "lucide-react";

type EditionsViewProps = {
  editions: Edition[];
  onEditionClick: (edition: Edition) => void;
};

export function EditionsView({ editions, onEditionClick }: EditionsViewProps) {
  return (
    <div className="max-w-[1400px] mx-auto px-8 py-12">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-4xl tracking-tight">My Editions</h2>
          <div className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
            <span className="text-sm bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {editions.length} published
            </span>
          </div>
        </div>
        <p className="text-neutral-600 text-lg">
          Your modernized classics, ready to share with the world
        </p>
      </div>

      {editions.length === 0 ? (
        <div className="text-center py-32">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-2xl opacity-20" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center">
              <Globe className="w-12 h-12 text-purple-600" strokeWidth={2} />
            </div>
          </div>
          <h3 className="text-2xl mb-3">No editions yet</h3>
          <p className="text-neutral-600 text-lg mb-10 max-w-md mx-auto">
            Once you generate audio for a book, you can publish it as an edition to share with others
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {editions.map((edition) => (
            <button
              key={edition.id}
              onClick={() => onEditionClick(edition)}
              className="group text-left bg-white/70 backdrop-blur-xl rounded-3xl border border-black/5 hover:border-black/10 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 overflow-hidden hover:scale-[1.02]"
            >
              <div className="relative h-48 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${edition.coverGradient} opacity-90 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                
                {/* Visibility badge */}
                <div className="absolute top-4 right-4">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md ${
                    edition.visibility === "public" 
                      ? "bg-white/20 text-white" 
                      : "bg-black/20 text-white"
                  }`}>
                    {edition.visibility === "public" ? (
                      <Globe className="w-3 h-3" strokeWidth={2.5} />
                    ) : (
                      <Lock className="w-3 h-3" strokeWidth={2.5} />
                    )}
                    <span className="text-xs capitalize">{edition.visibility}</span>
                  </div>
                </div>
                
                <div className="relative h-full px-6 py-8 flex flex-col justify-end">
                  <h3 className="text-white drop-shadow-lg mb-1.5 line-clamp-2">{edition.title}</h3>
                  <p className="text-sm text-white/90 drop-shadow-md">{edition.author}</p>
                </div>
              </div>

              <div className="p-5">
                <p className="text-sm text-neutral-700 mb-4 line-clamp-2">{edition.summary}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {edition.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs border border-purple-200/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5" strokeWidth={2.5} />
                      <span>{edition.listens.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5" strokeWidth={2.5} />
                      <span>{edition.likes.toLocaleString()}</span>
                    </div>
                  </div>
                  <span>{edition.createdAt.toLocaleDateString()}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
