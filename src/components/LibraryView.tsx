import { Plus, Sparkles } from "lucide-react";
import { Book } from "../App";
import { BookCard } from "./BookCard";

type LibraryViewProps = {
  books: Book[];
  onUploadClick: () => void;
  onBookClick: (book: Book) => void;
};

export function LibraryView({ books, onUploadClick, onBookClick }: LibraryViewProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 relative overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="mb-8 sm:mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
              <h2 className="text-3xl sm:text-4xl tracking-tight text-white">Your Library</h2>
              <div className="px-3 py-1 bg-gradient-to-r from-purple-950/50 to-pink-950/50 border border-purple-500/20 backdrop-blur-sm rounded-full self-start">
                <span className="text-sm bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {books.length} {books.length === 1 ? "book" : "books"}
                </span>
              </div>
            </div>
            <p className="text-neutral-400 text-base sm:text-lg">
              Classic literature, modernized for today's listener
            </p>
          </div>
          <button
            onClick={onUploadClick}
            className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl flex items-center justify-center gap-3 transition-all duration-200 hover:shadow-2xl hover:shadow-purple-500/25 hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
            <Plus className="w-5 h-5 relative z-10" strokeWidth={2.5} />
            <span className="relative z-10">Upload Book</span>
          </button>
        </div>

        {books.length === 0 ? (
          <div className="text-center py-16 sm:py-32 px-4">
            <div className="relative inline-block mb-6 sm:mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-2xl opacity-30" />
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-purple-500/20 rounded-3xl flex items-center justify-center">
                <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-purple-400" strokeWidth={2} />
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl mb-3 text-white">No books yet</h3>
            <p className="text-neutral-400 text-base sm:text-lg mb-8 sm:mb-10 max-w-md mx-auto">
              Upload a public domain book to transform it into a modern audiobook
            </p>
            <button
              onClick={onUploadClick}
              className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl inline-flex items-center gap-3 transition-all duration-200 hover:shadow-2xl hover:shadow-purple-500/25 hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              <Plus className="w-5 h-5 relative z-10" strokeWidth={2.5} />
              <span className="relative z-10">Upload Your First Book</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {books.map((book) => (
              <BookCard key={book.id} book={book} onClick={() => onBookClick(book)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
