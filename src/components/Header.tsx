import { useState } from "react";
import { BookOpen, Library, Headphones, Sparkles, Globe, Rss, Menu, X } from "lucide-react";
import { Book } from "../App";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

type HeaderProps = {
  currentView: "library" | "upload" | "editor" | "player" | "editions" | "public-library" | "feed" | "create-edition" | "create-clip";
  onNavigate: (view: "library" | "upload" | "editor" | "player" | "editions" | "public-library" | "feed") => void;
  selectedBook: Book | null;
};

export function Header({ currentView, onNavigate, selectedBook }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      view: "library" as const,
      icon: Library,
      label: "Library",
      active: currentView === "library" || currentView === "upload" || currentView === "editor" || currentView === "player" || currentView === "create-edition" || currentView === "create-clip"
    },
    {
      view: "editions" as const,
      icon: Sparkles,
      label: "My Editions",
      active: currentView === "editions"
    },
    {
      view: "feed" as const,
      icon: Rss,
      label: "Feed",
      active: currentView === "feed"
    },
    {
      view: "public-library" as const,
      icon: Globe,
      label: "Discover",
      active: currentView === "public-library"
    }
  ];

  const handleNavigate = (view: any) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-neutral-900/90 border-b border-white/10 shadow-xl">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate("library")}
            className="flex items-center gap-2 sm:gap-4 group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl sm:rounded-2xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity" />
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex flex-col items-start">
              <h1 className="text-lg sm:text-2xl tracking-tight bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Audibler
              </h1>
              <p className="hidden sm:block text-xs text-neutral-400 tracking-wide">Old books, reborn in modern voice • v2.2 (Smart chunking)</p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map(({ view, icon: Icon, label, active }) => (
              <button
                key={view}
                onClick={() => onNavigate(view)}
                className={`px-4 lg:px-5 py-2.5 rounded-xl flex items-center gap-2.5 transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25"
                    : "text-neutral-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={2.5} />
                <span className="text-sm">{label}</span>
              </button>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden p-2 hover:bg-white/5 rounded-lg transition-colors text-neutral-400 hover:text-white">
                <Menu className="w-6 h-6" strokeWidth={2.5} />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-neutral-900 border-white/10">
              <div className="flex flex-col gap-4 mt-8">
                <h2 className="text-lg mb-4 text-white">Navigation</h2>
                {navItems.map(({ view, icon: Icon, label, active }) => (
                  <button
                    key={view}
                    onClick={() => handleNavigate(view)}
                    className={`px-5 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 ${
                      active
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                        : "text-neutral-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className="w-5 h-5" strokeWidth={2.5} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
