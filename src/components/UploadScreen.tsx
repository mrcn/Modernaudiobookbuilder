import { useState, useRef } from "react";
import { Upload, FileText, X, Sparkles } from "lucide-react";
import { ProgressRing } from "./ProgressRing";

type UploadScreenProps = {
  onFileSelected: (file: File, content: string) => void;
  onCancel: () => void;
};

export function UploadScreen({ onFileSelected, onCancel }: UploadScreenProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [reading, setReading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type === "text/plain") {
      handleFileLoad(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileLoad(file);
    }
  };

  const handleContinue = () => {
    if (!selectedFile) return;

    setReading(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileSelected(selectedFile, content);
    };
    reader.readAsText(selectedFile);
  };

  const handleFileLoad = (file: File) => {
    setSelectedFile(file);
    setReading(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileSelected(file, content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 relative overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <div className="mb-8 sm:mb-12 text-center">
          <div className="relative inline-block mb-4 sm:mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-2xl opacity-30" />
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-purple-500/20 rounded-3xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400" strokeWidth={2} />
            </div>
          </div>
          <h2 className="text-2xl sm:text-4xl tracking-tight mb-3 text-white">Upload a Book</h2>
          <p className="text-neutral-400 text-base sm:text-lg max-w-xl mx-auto px-4">
            Drop a plain text file of a public domain book and watch it transform into a modern audiobook
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-950/50 to-teal-950/50 border border-emerald-500/20 rounded-lg backdrop-blur-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs text-emerald-400">NEW: Time expansion feature</span>
          </div>
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl sm:rounded-3xl p-8 sm:p-16 transition-all duration-300 ${
            isDragging
              ? "border-purple-500 bg-gradient-to-br from-purple-950/50 to-pink-950/50 scale-[1.02]"
              : "border-white/10 bg-neutral-900/40 backdrop-blur-xl hover:border-purple-500/50 hover:bg-neutral-900/60"
          }`}
        >
          {reading ? (
            <div className="flex flex-col items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-xl opacity-50 animate-pulse" />
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-purple-500/20 flex items-center justify-center animate-pulse">
                  <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-purple-400" strokeWidth={2} />
                </div>
              </div>
              <p className="mt-8 text-neutral-300 text-base sm:text-lg">Reading file...</p>
            </div>
          ) : selectedFile ? (
            <div className="flex flex-col items-center justify-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-xl opacity-30" />
                <div className="relative w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-purple-500/20 rounded-3xl flex items-center justify-center">
                  <FileText className="w-10 h-10 text-purple-400" strokeWidth={2} />
                </div>
              </div>
              <h3 className="text-xl mb-2 text-white">{selectedFile.name}</h3>
              <p className="text-sm text-neutral-400 mb-8">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedFile(null)}
                  className="px-6 py-3 border border-white/10 text-neutral-300 rounded-xl hover:bg-white/5 hover:border-white/20 transition-all duration-200"
                >
                  Choose Different File
                </button>
                <button
                  onClick={handleContinue}
                  className="group relative px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl transition-all duration-200 hover:shadow-xl hover:shadow-purple-500/25 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                  <span className="relative z-10">Continue to Setup</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-xl opacity-30" />
                <div className="relative w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-purple-500/20 rounded-3xl flex items-center justify-center">
                  <Upload className="w-10 h-10 text-purple-400" strokeWidth={2} />
                </div>
              </div>
              <h3 className="text-xl mb-2 text-white">Drop your book here</h3>
              <p className="text-neutral-400 mb-8">or click to browse your files</p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".txt"
                onChange={handleFileSelect}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="group relative px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl transition-all duration-200 hover:shadow-xl hover:shadow-purple-500/25 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <span className="relative z-10">Choose File</span>
              </button>

              <p className="text-xs text-neutral-500 mt-8">Supports .txt files only • Public domain works</p>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={onCancel}
            className="text-neutral-400 hover:text-white text-sm flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/5 transition-all"
          >
            <X className="w-4 h-4" />
            Cancel and return to library
          </button>
        </div>
      </div>
    </div>
  );
}
