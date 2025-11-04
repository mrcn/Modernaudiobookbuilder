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
    <div className="max-w-[1400px] mx-auto px-8 py-12">
      <div className="mb-12 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-4xl tracking-tight">Your Library</h2>
            <div className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
              <span className="text-sm bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {books.length} {books.length === 1 ? "book" : "books"}
              </span>
            </div>
          </div>
          <p className="text-neutral-600 text-lg">
            Classic literature, modernized for today's listener
          </p>
        </div>
        <button
          onClick={onUploadClick}
          className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl flex items-center gap-3 transition-all duration-200 hover:shadow-2xl hover:shadow-purple-500/25 hover:scale-105"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
          <Plus className="w-5 h-5 relative z-10" strokeWidth={2.5} />
          <span className="relative z-10">Upload Book</span>
        </button>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-32">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-2xl opacity-20" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-purple-600" strokeWidth={2} />
            </div>
          </div>
          <h3 className="text-2xl mb-3">No books yet</h3>
          <p className="text-neutral-600 text-lg mb-10 max-w-md mx-auto">
            Upload a public domain book to transform it into a modern audiobook
          </p>
          <button
            onClick={onUploadClick}
            className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl inline-flex items-center gap-3 transition-all duration-200 hover:shadow-2xl hover:shadow-purple-500/25 hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
            <Plus className="w-5 h-5 relative z-10" strokeWidth={2.5} />
            <span className="relative z-10">Upload Your First Book</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} onClick={() => onBookClick(book)} />
          ))}
        </div>
      )}
    </div>
  );
}
