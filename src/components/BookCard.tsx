import { Book as BookType } from "../App";
import { Clock, Check, Sparkles, Headphones } from "lucide-react";

type BookCardProps = {
  book: BookType;
  onClick: () => void;
};

export function BookCard({ book, onClick }: BookCardProps) {
  const statusConfig = {
    uploaded: {
      icon: Clock,
      label: "Uploaded",
      color: "text-neutral-400",
      bg: "bg-neutral-900/50",
      border: "border-neutral-700/50",
    },
    processing: {
      icon: Sparkles,
      label: "Processing",
      color: "text-blue-400",
      bg: "bg-blue-950/50",
      border: "border-blue-700/50",
    },
    modernized: {
      icon: Check,
      label: "Modernized",
      color: "text-emerald-400",
      bg: "bg-emerald-950/50",
      border: "border-emerald-700/50",
    },
    "audio-ready": {
      icon: Headphones,
      label: "Audio Ready",
      color: "text-purple-400",
      bg: "bg-purple-950/50",
      border: "border-purple-700/50",
    },
  };

  const config = statusConfig[book.status];
  const StatusIcon = config.icon;

  return (
    <button
      onClick={onClick}
      className="group text-left bg-neutral-900/40 backdrop-blur-xl rounded-3xl border border-white/10 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 overflow-hidden hover:scale-[1.02]"
    >
      <div className="relative h-56 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${book.coverGradient} opacity-90 group-hover:opacity-100 transition-opacity duration-300`} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Animated grain texture */}
        <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />
        
        <div className="relative h-full px-6 py-8 flex flex-col justify-end">
          <h3 className="text-white drop-shadow-lg mb-1.5 line-clamp-2">{book.title}</h3>
          <p className="text-sm text-white/90 drop-shadow-md">{book.author}</p>
        </div>
      </div>

      <div className="p-5 bg-neutral-950/30 backdrop-blur-sm border-t border-white/5">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border backdrop-blur-sm ${config.bg} ${config.color} ${config.border}`}>
          <StatusIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
          <span>{config.label}</span>
        </div>
        <p className="text-xs text-neutral-500 mt-4">
          {book.uploadedAt.toLocaleDateString("en-US", { 
            month: "short", 
            day: "numeric", 
            year: "numeric" 
          })}
        </p>
      </div>
    </button>
  );
}
