import { useState } from "react";
import { Header } from "./components/Header";
import { LibraryView } from "./components/LibraryView";
import { UploadScreen } from "./components/UploadScreen";
import { ProjectSetup, ProjectConfig } from "./components/ProjectSetup";
import { ChunkReview, Chunk } from "./components/ChunkReview";
import { BatchBuilder } from "./components/BatchBuilder";
import { EditorView } from "./components/EditorView";
import { AudioPlayerView } from "./components/AudioPlayerView";
import { EditionsView } from "./components/EditionsView";
import { PublicLibraryView } from "./components/PublicLibraryView";
import { FeedView } from "./components/FeedView";
import { EditionCreator } from "./components/EditionCreator";
import { ClipCreator } from "./components/ClipCreator";

export type Book = {
  id: string;
  title: string;
  author: string;
  coverColor: string;
  coverGradient: string;
  uploadedAt: Date;
  status: "uploaded" | "processing" | "modernized" | "audio-ready";
  originalText?: string;
  modernizedText?: string;
  audioSegments?: AudioSegment[];
};

export type AudioSegment = {
  id: string;
  chunkIndex: number;
  audioUrl: string;
  duration: number;
};

export type Edition = {
  id: string;
  bookId: string;
  userId: string;
  userHandle: string;
  userAvatar?: string;
  title: string;
  author: string;
  summary: string;
  tags: string[];
  coverGradient: string;
  visibility: "public" | "private";
  listens: number;
  likes: number;
  createdAt: Date;
  modernizedText?: string;
  audioSegments?: AudioSegment[];
};

export type Clip = {
  id: string;
  editionId: string;
  userId: string;
  userHandle: string;
  userAvatar?: string;
  title: string;
  bookTitle: string;
  quoteText: string;
  audioUrl: string;
  startTime: number;
  endTime: number;
  duration: number;
  tags: string[];
  likes: number;
  shares: number;
  coverGradient: string;
  createdAt: Date;
};

type View = "library" | "upload" | "project-setup" | "chunk-review" | "batch-builder" | "editor" | "player" | "editions" | "public-library" | "feed" | "create-edition" | "create-clip";

export default function App() {
  const [currentView, setCurrentView] = useState<View>("library");
  const [uploadedFile, setUploadedFile] = useState<{ file: File; content: string } | null>(null);
  const [books, setBooks] = useState<Book[]>([
    {
      id: "1",
      title: "Pride and Prejudice",
      author: "Jane Austen",
      coverColor: "#8B7355",
      coverGradient: "from-rose-400 via-pink-500 to-purple-500",
      uploadedAt: new Date("2024-11-01"),
      status: "audio-ready",
      originalText:
        "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.",
      modernizedText:
        "Everyone knows that a wealthy single man must be looking for a wife.",
      audioSegments: [
        {
          id: "seg-1",
          chunkIndex: 0,
          audioUrl: "mock-audio-1.mp3",
          duration: 4.2,
        },
      ],
    },
    {
      id: "2",
      title: "Moby-Dick",
      author: "Herman Melville",
      coverColor: "#2C5F77",
      coverGradient: "from-blue-500 via-cyan-500 to-teal-400",
      uploadedAt: new Date("2024-10-28"),
      status: "modernized",
      originalText: "Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse...",
      modernizedText: "Call me Ishmael. A few years back, when I was broke and feeling restless...",
    },
    {
      id: "3",
      title: "The Adventures of Sherlock Holmes",
      author: "Arthur Conan Doyle",
      coverColor: "#6B4423",
      coverGradient: "from-amber-400 via-orange-500 to-red-500",
      uploadedAt: new Date("2024-10-15"),
      status: "uploaded",
    },
    {
      id: "4",
      title: "Frankenstein",
      author: "Mary Shelley",
      coverColor: "#4A5568",
      coverGradient: "from-slate-500 via-purple-500 to-indigo-600",
      uploadedAt: new Date("2024-10-10"),
      status: "modernized",
    },
  ]);
  
  const [myEditions, setMyEditions] = useState<Edition[]>([
    {
      id: "e1",
      bookId: "1",
      userId: "me",
      userHandle: "you",
      title: "Pride and Prejudice",
      author: "Jane Austen",
      summary: "A fresh, modern take on Austen's timeless classic about love, class, and first impressions.",
      tags: ["romance", "classic", "witty"],
      coverGradient: "from-rose-400 via-pink-500 to-purple-500",
      visibility: "public",
      listens: 1247,
      likes: 89,
      createdAt: new Date("2024-11-02"),
      modernizedText: "Everyone knows that a wealthy single man must be looking for a wife.",
    },
  ]);

  const [publicEditions, setPublicEditions] = useState<Edition[]>([
    {
      id: "pe1",
      bookId: "x1",
      userId: "u1",
      userHandle: "@classicreader",
      userAvatar: "👤",
      title: "Dracula",
      author: "Bram Stoker",
      summary: "The iconic vampire story, reimagined with contemporary language while keeping all the gothic atmosphere.",
      tags: ["horror", "gothic", "vampire"],
      coverGradient: "from-red-500 via-rose-600 to-purple-700",
      visibility: "public",
      listens: 3421,
      likes: 234,
      createdAt: new Date("2024-10-20"),
    },
    {
      id: "pe2",
      bookId: "x2",
      userId: "u2",
      userHandle: "@modernclassics",
      userAvatar: "📚",
      title: "The Picture of Dorian Gray",
      author: "Oscar Wilde",
      summary: "Wilde's masterpiece about beauty, morality, and corruption - now accessible to modern ears.",
      tags: ["philosophy", "gothic", "aesthetic"],
      coverGradient: "from-violet-500 via-purple-500 to-indigo-600",
      visibility: "public",
      listens: 2156,
      likes: 178,
      createdAt: new Date("2024-10-18"),
    },
    {
      id: "pe3",
      bookId: "x3",
      userId: "u3",
      userHandle: "@audiophile",
      userAvatar: "🎧",
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      summary: "Jazz Age glamour and tragedy, retold for today's listener with crystal-clear language.",
      tags: ["classic", "american", "1920s"],
      coverGradient: "from-amber-400 via-yellow-500 to-orange-500",
      visibility: "public",
      listens: 5234,
      likes: 412,
      createdAt: new Date("2024-10-15"),
    },
    {
      id: "pe4",
      bookId: "x4",
      userId: "u4",
      userHandle: "@litlover",
      userAvatar: "✨",
      title: "Wuthering Heights",
      author: "Emily Brontë",
      summary: "A passionate tale of obsessive love on the Yorkshire moors, now easier to follow.",
      tags: ["romance", "gothic", "tragedy"],
      coverGradient: "from-slate-600 via-gray-700 to-purple-800",
      visibility: "public",
      listens: 1876,
      likes: 145,
      createdAt: new Date("2024-10-12"),
    },
  ]);

  const [feedClips, setFeedClips] = useState<Clip[]>([
    {
      id: "c1",
      editionId: "pe1",
      userId: "u1",
      userHandle: "@classicreader",
      title: "Opening Line",
      bookTitle: "Dracula",
      quoteText: "I must record everything. No detail is too small when the threat is this ancient.",
      audioUrl: "mock-clip-1.mp3",
      startTime: 0,
      endTime: 8,
      duration: 8,
      tags: ["iconic", "horror"],
      likes: 456,
      shares: 89,
      coverGradient: "from-red-500 via-rose-600 to-purple-700",
      createdAt: new Date("2024-11-03"),
    },
    {
      id: "c2",
      editionId: "pe3",
      userId: "u3",
      userHandle: "@audiophile",
      title: "Green Light",
      bookTitle: "The Great Gatsby",
      quoteText: "So we keep pushing forward, fighting against the current, always pulled back to where we started.",
      audioUrl: "mock-clip-2.mp3",
      startTime: 0,
      endTime: 6,
      duration: 6,
      tags: ["philosophy", "poetic"],
      likes: 892,
      shares: 167,
      coverGradient: "from-amber-400 via-yellow-500 to-orange-500",
      createdAt: new Date("2024-11-02"),
    },
    {
      id: "c3",
      editionId: "pe2",
      userId: "u2",
      userHandle: "@modernclassics",
      title: "The Portrait",
      bookTitle: "The Picture of Dorian Gray",
      quoteText: "The only way to resist temptation is to give in to it.",
      audioUrl: "mock-clip-3.mp3",
      startTime: 0,
      endTime: 5,
      duration: 5,
      tags: ["quote", "wisdom"],
      likes: 634,
      shares: 123,
      coverGradient: "from-violet-500 via-purple-500 to-indigo-600",
      createdAt: new Date("2024-11-01"),
    },
  ]);

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedEdition, setSelectedEdition] = useState<Edition | null>(null);
  
  // Mock chunks for chunk review
  const [chunks, setChunks] = useState<Chunk[]>([
    {
      id: 0,
      originalText: "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.",
      modernizedText: "Everyone knows that a wealthy single man must be looking for a wife.",
      charCount: 450,
      tokenCount: 112,
      wordCount: 85,
      estimatedCost: 0.05,
      edited: false,
      flagged: false,
      status: "completed",
    },
    {
      id: 1,
      originalText: "However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.",
      modernizedText: "No matter how little is known about such a man when he first arrives in a neighborhood, the local families are convinced that he belongs with one of their daughters.",
      charCount: 520,
      tokenCount: 130,
      wordCount: 95,
      estimatedCost: 0.06,
      edited: true,
      flagged: false,
      status: "completed",
    },
    {
      id: 2,
      originalText: "My dear Mr. Bennet, said his lady to him one day, have you heard that Netherfield Park is let at last?",
      modernizedText: "My dear Mr. Bennet, his wife said to him one day, have you heard that Netherfield Park has finally been rented?",
      charCount: 380,
      tokenCount: 95,
      wordCount: 70,
      estimatedCost: 0.04,
      edited: false,
      flagged: false,
      status: "completed",
    },
  ]);

  const handleFileSelected = (file: File, content: string) => {
    setUploadedFile({ file, content });
    setCurrentView("project-setup");
  };

  const handleProjectConfigure = (config: ProjectConfig) => {
    if (!uploadedFile) return;

    const gradients = [
      "from-violet-500 via-purple-500 to-pink-500",
      "from-emerald-400 via-teal-500 to-cyan-500",
      "from-yellow-400 via-orange-500 to-red-500",
      "from-indigo-500 via-blue-500 to-cyan-500",
    ];

    // Calculate the portion of text based on range
    const text = uploadedFile.content;
    const startIndex = Math.floor((text.length * config.startPosition) / 100);
    const endIndex = Math.floor((text.length * config.endPosition) / 100);
    const selectedText = text.slice(startIndex, endIndex);

    const newBook: Book = {
      id: Date.now().toString(),
      title: config.title,
      author: config.author,
      coverColor: `hsl(${Math.random() * 360}, 50%, 50%)`,
      coverGradient: gradients[Math.floor(Math.random() * gradients.length)],
      uploadedAt: new Date(),
      status: "processing",
      originalText: selectedText.slice(0, 2000), // Store a preview
    };

    setBooks((prev) => [newBook, ...prev]);
    setSelectedBook(newBook);

    // Simulate processing with the config
    setTimeout(() => {
      setBooks((prev) =>
        prev.map((b) =>
          b.id === newBook.id
            ? {
                ...b,
                status: "modernized",
                modernizedText: modernizeText(selectedText.slice(0, 2000)),
              }
            : b
        )
      );
    }, 2000);

    setUploadedFile(null);
    setCurrentView("chunk-review");
  };

  const modernizeText = (text: string): string => {
    return text
      .replace(/whilst/gi, "while")
      .replace(/thou /gi, "you ")
      .replace(/thee/gi, "you")
      .replace(/hath/gi, "has")
      .replace(/doth/gi, "does")
      .replace(/—never mind how long precisely—/gi, ", exactly when doesn't matter,");
  };

  const handleOpenBook = (book: Book) => {
    setSelectedBook(book);
    if (book.status === "audio-ready") {
      setCurrentView("player");
    } else if (book.status === "modernized" || book.status === "processing") {
      setCurrentView("chunk-review");
    } else {
      setCurrentView("chunk-review");
    }
  };

  const handleGenerateAudio = (book: Book) => {
    setBooks((prev) =>
      prev.map((b) =>
        b.id === book.id
          ? {
              ...b,
              status: "audio-ready",
              audioSegments: [
                {
                  id: "seg-" + Date.now(),
                  chunkIndex: 0,
                  audioUrl: "mock-audio.mp3",
                  duration: 5.5,
                },
              ],
            }
          : b
      )
    );
    setSelectedBook((prev) =>
      prev
        ? {
            ...prev,
            status: "audio-ready",
            audioSegments: [
              {
                id: "seg-" + Date.now(),
                chunkIndex: 0,
                audioUrl: "mock-audio.mp3",
                duration: 5.5,
              },
            ],
          }
        : null
    );
  };

  const handleCreateEdition = (edition: Omit<Edition, "id" | "userId" | "userHandle" | "listens" | "likes" | "createdAt">) => {
    const newEdition: Edition = {
      ...edition,
      id: "e" + Date.now(),
      userId: "me",
      userHandle: "you",
      listens: 0,
      likes: 0,
      createdAt: new Date(),
    };
    setMyEditions((prev) => [newEdition, ...prev]);
    setCurrentView("editions");
  };

  const handleCreateClip = (clip: Omit<Clip, "id" | "userId" | "userHandle" | "likes" | "shares" | "createdAt">) => {
    const newClip: Clip = {
      ...clip,
      id: "c" + Date.now(),
      userId: "me",
      userHandle: "you",
      likes: 0,
      shares: 0,
      createdAt: new Date(),
    };
    setFeedClips((prev) => [newClip, ...prev]);
    setCurrentView("feed");
  };

  const handleEditChunk = (chunkId: number, newText: string) => {
    setChunks((prev) =>
      prev.map((chunk) =>
        chunk.id === chunkId
          ? { ...chunk, modernizedText: newText, edited: true }
          : chunk
      )
    );
  };

  const handleProceedToAudioBuilder = () => {
    setCurrentView("batch-builder");
  };

  const handleSubmitBatches = (batches: any[]) => {
    // Simulate audio generation
    if (selectedBook) {
      setBooks((prev) =>
        prev.map((b) =>
          b.id === selectedBook.id
            ? {
                ...b,
                status: "audio-ready",
                audioSegments: [
                  {
                    id: "seg-" + Date.now(),
                    chunkIndex: 0,
                    audioUrl: "mock-audio.mp3",
                    duration: 5.5,
                  },
                ],
              }
            : b
        )
      );
      setSelectedBook((prev) =>
        prev
          ? {
              ...prev,
              status: "audio-ready",
              audioSegments: [
                {
                  id: "seg-" + Date.now(),
                  chunkIndex: 0,
                  audioUrl: "mock-audio.mp3",
                  duration: 5.5,
                },
              ],
            }
          : null
      );
      setCurrentView("player");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-purple-50/30 to-pink-50/30">
      {/* Ambient background blur elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {currentView !== "project-setup" && currentView !== "chunk-review" && currentView !== "batch-builder" && (
          <Header
            currentView={currentView}
            onNavigate={(view) => {
              setCurrentView(view);
              if (view === "library") {
                setSelectedBook(null);
                setSelectedEdition(null);
              }
            }}
            selectedBook={selectedBook}
          />
        )}

        <main>
          {currentView === "library" && (
            <LibraryView
              books={books}
              onUploadClick={() => setCurrentView("upload")}
              onBookClick={handleOpenBook}
            />
          )}

          {currentView === "upload" && (
            <UploadScreen
              onFileSelected={handleFileSelected}
              onCancel={() => setCurrentView("library")}
            />
          )}

          {currentView === "project-setup" && uploadedFile && (
            <ProjectSetup
              fileName={uploadedFile.file.name}
              fileSize={uploadedFile.file.size}
              fileContent={uploadedFile.content}
              onConfigure={handleProjectConfigure}
              onCancel={() => {
                setUploadedFile(null);
                setCurrentView("upload");
              }}
            />
          )}

          {currentView === "chunk-review" && selectedBook && (
            <ChunkReview
              chunks={chunks}
              onBack={() => setCurrentView("library")}
              onEditChunk={handleEditChunk}
              onProceedToAudioBuilder={handleProceedToAudioBuilder}
            />
          )}

          {currentView === "batch-builder" && (
            <BatchBuilder
              totalChunks={chunks.length}
              onBack={() => setCurrentView("chunk-review")}
              onSubmitBatches={handleSubmitBatches}
            />
          )}

          {currentView === "editor" && selectedBook && (
            <EditorView
              book={selectedBook}
              onBack={() => setCurrentView("library")}
              onGenerateAudio={handleGenerateAudio}
              onCreateEdition={() => {
                setSelectedEdition(null);
                setCurrentView("create-edition");
              }}
            />
          )}

          {currentView === "player" && selectedBook && (
            <AudioPlayerView
              book={selectedBook}
              onBack={() => setCurrentView("chunk-review")}
              onCreateClip={() => setCurrentView("create-clip")}
            />
          )}

          {currentView === "editions" && (
            <EditionsView
              editions={myEditions}
              onEditionClick={(edition) => {
                setSelectedEdition(edition);
                // Navigate to a player view for editions
              }}
            />
          )}

          {currentView === "public-library" && (
            <PublicLibraryView
              editions={publicEditions}
              onEditionClick={(edition) => {
                setSelectedEdition(edition);
              }}
            />
          )}

          {currentView === "feed" && (
            <FeedView
              clips={feedClips}
              editions={publicEditions}
            />
          )}

          {currentView === "create-edition" && selectedBook && (
            <EditionCreator
              book={selectedBook}
              onSave={handleCreateEdition}
              onCancel={() => setCurrentView("editor")}
            />
          )}

          {currentView === "create-clip" && selectedBook && (
            <ClipCreator
              book={selectedBook}
              onSave={handleCreateClip}
              onCancel={() => setCurrentView("player")}
            />
          )}
        </main>
      </div>
    </div>
  );
}
