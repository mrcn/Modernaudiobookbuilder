import { BookOpen, Library, Headphones, Sparkles, Globe, Rss } from "lucide-react";
import { Book } from "../App";

type HeaderProps = {
  currentView: "library" | "upload" | "editor" | "player" | "editions" | "public-library" | "feed" | "create-edition" | "create-clip";
  onNavigate: (view: "library" | "upload" | "editor" | "player" | "editions" | "public-library" | "feed") => void;
  selectedBook: Book | null;
};

export function Header({ currentView, onNavigate, selectedBook }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-black/5 shadow-sm">
      <div className="max-w-[1400px] mx-auto px-8 py-5">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate("library")}
            className="flex items-center gap-4 group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity" />
              <div className="relative w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex flex-col items-start">
              <h1 className="text-2xl tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Audibler
              </h1>
              <p className="text-xs text-neutral-500 tracking-wide">Old books, reborn in modern voice</p>
            </div>
          </button>

          <nav className="flex items-center gap-2">
            <button
              onClick={() => onNavigate("library")}
              className={`px-5 py-2.5 rounded-xl flex items-center gap-2.5 transition-all duration-200 ${
                currentView === "library" || currentView === "upload" || currentView === "editor" || currentView === "player" || currentView === "create-edition" || currentView === "create-clip"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25"
                  : "text-neutral-600 hover:bg-black/5"
              }`}
            >
              <Library className="w-4 h-4" strokeWidth={2.5} />
              <span className="text-sm">Library</span>
            </button>

            <button
              onClick={() => onNavigate("editions")}
              className={`px-5 py-2.5 rounded-xl flex items-center gap-2.5 transition-all duration-200 ${
                currentView === "editions"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25"
                  : "text-neutral-600 hover:bg-black/5"
              }`}
            >
              <Sparkles className="w-4 h-4" strokeWidth={2.5} />
              <span className="text-sm">My Editions</span>
            </button>

            <button
              onClick={() => onNavigate("feed")}
              className={`px-5 py-2.5 rounded-xl flex items-center gap-2.5 transition-all duration-200 ${
                currentView === "feed"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25"
                  : "text-neutral-600 hover:bg-black/5"
              }`}
            >
              <Rss className="w-4 h-4" strokeWidth={2.5} />
              <span className="text-sm">Feed</span>
            </button>

            <button
              onClick={() => onNavigate("public-library")}
              className={`px-5 py-2.5 rounded-xl flex items-center gap-2.5 transition-all duration-200 ${
                currentView === "public-library"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25"
                  : "text-neutral-600 hover:bg-black/5"
              }`}
            >
              <Globe className="w-4 h-4" strokeWidth={2.5} />
              <span className="text-sm">Discover</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
