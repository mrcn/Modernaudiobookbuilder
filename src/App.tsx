import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { LibraryView } from "./components/LibraryView";
import { UploadScreen } from "./components/UploadScreen";
import { ProjectSetup, ProjectConfig } from "./components/ProjectSetup";
import { ProjectView } from "./components/ProjectView";
import { Chunk } from "./components/ChunkReview";
import { EditionsView } from "./components/EditionsView";
import { PublicLibraryView } from "./components/PublicLibraryView";
import { FeedView } from "./components/FeedView";
import { EditionCreator } from "./components/EditionCreator";
import { ClipCreator } from "./components/ClipCreator";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner@2.0.3";

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
  chunks?: Chunk[];
};

export type AudioSegment = {
  id: string;
  chunkIndex: number;
  audioUrl: string;
  duration: number;
  text?: string;
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

type View = "library" | "upload" | "project-setup" | "project" | "editions" | "public-library" | "feed" | "create-edition" | "create-clip";

export default function App() {
  // Set browser tab title to show version and show welcome toast
  useEffect(() => {
    document.title = "Audibler v2.3 - Unified Project View";
    
    // Show version notification
    setTimeout(() => {
      toast.success("Audibler v2.3", {
        description: "Everything is now in one unified Project View! Upload a book to try it.",
        duration: 5000,
      });
    }, 1000);
  }, []);
  
  const [currentView, setCurrentView] = useState<View>("library");
  const [uploadedFile, setUploadedFile] = useState<{ file: File; content: string } | null>(null);
  // Helper to generate sample chunks for demo books
  const generateSampleChunks = (text: string, count: number = 5): Chunk[] => {
    const chunks: Chunk[] = [];
    const sentences = text.split('. ');
    
    for (let i = 0; i < Math.min(count, sentences.length); i++) {
      const chunkText = sentences[i] + (i < sentences.length - 1 ? '.' : '');
      const wordCount = chunkText.split(/\s+/).length;
      const charCount = chunkText.length;
      const tokenCount = Math.round(wordCount * 1.3);
      
      chunks.push({
        id: i,
        originalText: chunkText,
        modernizedText: i < 3 ? `[Modernized] ${chunkText}` : "",
        charCount,
        tokenCount,
        wordCount,
        estimatedCost: (tokenCount / 1000) * 0.09 + (charCount / 1000000) * 15,
        edited: false,
        flagged: false,
        status: i < 3 ? "completed" : "pending",
      });
    }
    
    return chunks;
  };

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
        "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.",
      modernizedText:
        "Everyone knows that a wealthy single man must be looking for a wife. No matter how little is known about such a man when he first arrives in a neighborhood, the local families are convinced that he belongs with one of their daughters.",
      audioSegments: [
        {
          id: "seg-1",
          chunkIndex: 0,
          audioUrl: "mock-audio-1.mp3",
          duration: 4.2,
        },
      ],
      chunks: generateSampleChunks("It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.", 3),
    },
    {
      id: "2",
      title: "Moby-Dick",
      author: "Herman Melville",
      coverColor: "#2C5F77",
      coverGradient: "from-blue-500 via-cyan-500 to-teal-400",
      uploadedAt: new Date("2024-10-28"),
      status: "modernized",
      originalText: "Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation.",
      modernizedText: "Call me Ishmael. A few years back, when I was broke and feeling restless, I decided to go to sea for a while. It's my way of dealing with depression and staying sane.",
      chunks: generateSampleChunks("Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation.", 4),
    },
    {
      id: "3",
      title: "The Adventures of Sherlock Holmes",
      author: "Arthur Conan Doyle",
      coverColor: "#6B4423",
      coverGradient: "from-amber-400 via-orange-500 to-red-500",
      uploadedAt: new Date("2024-10-15"),
      status: "uploaded",
      originalText: "To Sherlock Holmes she is always the woman. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex.",
      chunks: generateSampleChunks("To Sherlock Holmes she is always the woman. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex.", 3),
    },
    {
      id: "4",
      title: "Frankenstein",
      author: "Mary Shelley",
      coverColor: "#4A5568",
      coverGradient: "from-slate-500 via-purple-500 to-indigo-600",
      uploadedAt: new Date("2024-10-10"),
      status: "modernized",
      originalText: "You will rejoice to hear that no disaster has accompanied the commencement of an enterprise which you have regarded with such evil forebodings. I arrived here yesterday, and my first task is to assure my dear sister of my welfare and increasing confidence in the success of my undertaking.",
      chunks: generateSampleChunks("You will rejoice to hear that no disaster has accompanied the commencement of an enterprise which you have regarded with such evil forebodings. I arrived here yesterday, and my first task is to assure my dear sister of my welfare and increasing confidence in the success of my undertaking.", 2),
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
  
  // Mock chunks for chunk review - Comprehensive examples showing all states from a full book
  const [chunks, setChunks] = useState<Chunk[]>([
    // COMPLETED CHUNKS (0-29) - Successfully modernized
    {
      id: 0,
      originalText: "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.",
      modernizedText: "Everyone knows that a wealthy single man must be looking for a wife.",
      charCount: 115,
      tokenCount: 28,
      wordCount: 22,
      estimatedCost: 0.0012,
      edited: false,
      flagged: false,
      status: "completed",
    },
    {
      id: 1,
      originalText: "However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.",
      modernizedText: "No matter how little is known about such a man when he first arrives in a neighborhood, the local families are convinced that he belongs with one of their daughters.",
      charCount: 263,
      tokenCount: 51,
      wordCount: 42,
      estimatedCost: 0.0024,
      edited: true,
      flagged: false,
      status: "completed",
    },
    {
      id: 2,
      originalText: "My dear Mr. Bennet, said his lady to him one day, have you heard that Netherfield Park is let at last?",
      modernizedText: "My dear Mr. Bennet, his wife said to him one day, have you heard that Netherfield Park has finally been rented?",
      charCount: 103,
      tokenCount: 24,
      wordCount: 19,
      estimatedCost: 0.0011,
      edited: false,
      flagged: false,
      status: "completed",
    },
    {
      id: 3,
      originalText: "Mr. Bennet replied that he had not. But it is, returned she; for Mrs. Long has just been here, and she told me all about it.",
      modernizedText: "Mr. Bennet replied that he hadn't. But it is, she responded; Mrs. Long was just here and told me everything about it.",
      charCount: 124,
      tokenCount: 30,
      wordCount: 24,
      estimatedCost: 0.0013,
      edited: false,
      flagged: false,
      status: "completed",
    },
    {
      id: 4,
      originalText: "Mr. Bennet made no answer. Do you not want to know who has taken it? cried his wife impatiently. You want to tell me, and I have no objection to hearing it.",
      modernizedText: "Mr. Bennet didn't answer. Don't you want to know who rented it? his wife cried impatiently. You want to tell me, and I don't mind hearing it.",
      charCount: 159,
      tokenCount: 38,
      wordCount: 30,
      estimatedCost: 0.0017,
      edited: false,
      flagged: false,
      status: "completed",
    },
    {
      id: 5,
      originalText: "This was invitation enough. Why, my dear, you must know, Mrs. Long says that Netherfield is taken by a young man of large fortune from the north of England.",
      modernizedText: "That was all the encouragement she needed. Well, my dear, you must know that Mrs. Long says Netherfield has been rented by a wealthy young man from northern England.",
      charCount: 156,
      tokenCount: 37,
      wordCount: 29,
      estimatedCost: 0.0016,
      edited: false,
      flagged: false,
      status: "completed",
    },
    {
      id: 6,
      originalText: "He came down on Monday in a chaise and four to see the place, and was so much delighted with it, that he agreed with Mr. Morris immediately.",
      modernizedText: "He arrived on Monday in an elegant carriage to see the place, and liked it so much that he immediately agreed with Mr. Morris.",
      charCount: 142,
      tokenCount: 34,
      wordCount: 27,
      estimatedCost: 0.0015,
      edited: false,
      flagged: false,
      status: "completed",
    },
    {
      id: 7,
      originalText: "He is to take possession before Michaelmas, and some of his servants are to be in the house by the end of next week.",
      modernizedText: "He'll move in before Michaelmas, and some of his servants will be at the house by the end of next week.",
      charCount: 118,
      tokenCount: 28,
      wordCount: 22,
      estimatedCost: 0.0012,
      edited: false,
      flagged: false,
      status: "completed",
    },
    {
      id: 8,
      originalText: "What is his name? Bingley. Is he married or single? Oh! Single, my dear, to be sure! A single man of large fortune; four or five thousand a year. What a fine thing for our girls!",
      modernizedText: "What's his name? Bingley. Is he married or single? Oh! Single, my dear, definitely! A single man with a large fortune—four or five thousand a year. What wonderful news for our girls!",
      charCount: 182,
      tokenCount: 46,
      wordCount: 36,
      estimatedCost: 0.0020,
      edited: false,
      flagged: false,
      status: "completed",
    },
    {
      id: 9,
      originalText: "How so? How can it affect them? My dear Mr. Bennet, replied his wife, how can you be so tiresome! You must know that I am thinking of his marrying one of them.",
      modernizedText: "How so? How does it affect them? My dear Mr. Bennet, his wife replied, how can you be so annoying! You must know I'm thinking about him marrying one of our daughters.",
      charCount: 162,
      tokenCount: 39,
      wordCount: 31,
      estimatedCost: 0.0017,
      edited: false,
      flagged: false,
      status: "completed",
    },
    {
      id: 10,
      originalText: "Is that his design in settling here? Design! Nonsense, how can you talk so! But it is very likely that he may fall in love with one of them, and therefore you must visit him as soon as he comes.",
      modernizedText: "Is that why he's settling here? Design! Nonsense, how can you say that! But he might very well fall in love with one of them, so you must visit him as soon as he arrives.",
      charCount: 196,
      tokenCount: 47,
      wordCount: 37,
      estimatedCost: 0.0021,
      edited: false,
      flagged: false,
      status: "completed",
    },
    {
      id: 11,
      originalText: "I see no occasion for that. You and the girls may go, or you may send them by themselves, which perhaps will be still better, for as you are as handsome as any of them, Mr. Bingley may like you the best of the party.",
      modernizedText: "I don't see why I should. You and the girls can go, or you can send them alone, which might actually be better since you're as attractive as any of them—Mr. Bingley might prefer you.",
      charCount: 223,
      tokenCount: 54,
      wordCount: 43,
      estimatedCost: 0.0024,
      edited: false,
      flagged: false,
      status: "completed",
    },
    {
      id: 12,
      originalText: "My dear, you flatter me. I certainly have had my share of beauty, but I do not pretend to be anything extraordinary now. When a woman has five grown-up daughters, she ought to give over thinking of her own beauty.",
      modernizedText: "My dear, you flatter me. I was certainly attractive once, but I don't pretend to be anything special now. When a woman has five grown daughters, she should stop thinking about her own looks.",
      charCount: 221,
      tokenCount: 53,
      wordCount: 42,
      estimatedCost: 0.0023,
      edited: false,
      flagged: false,
      status: "completed",
    },
    {
      id: 13,
      originalText: "In such cases, a woman has not often much beauty to think of. But, my dear, you must indeed go and see Mr. Bingley when he comes into the neighbourhood.",
      modernizedText: "In such cases, a woman doesn't usually have much beauty left to think about. But my dear, you really must go see Mr. Bingley when he arrives in the neighborhood.",
      charCount: 153,
      tokenCount: 37,
      wordCount: 29,
      estimatedCost: 0.0016,
      edited: false,
      flagged: false,
      status: "completed",
    },
    {
      id: 14,
      originalText: "It is more than I engage for, I assure you. But consider your daughters. Only think what an establishment it would be for one of them.",
      modernizedText: "I can't promise that, I assure you. But think about your daughters. Just imagine what a great match it would be for one of them.",
      charCount: 137,
      tokenCount: 33,
      wordCount: 26,
      estimatedCost: 0.0014,
      edited: false,
      flagged: false,
      status: "completed",
    },
    {
      id: 15,
      originalText: "Sir William and Lady Lucas are determined to go, merely on that account, for in general, you know, they visit no newcomers. Indeed you must go, for it will be impossible for us to visit him if you do not.",
      modernizedText: "Sir William and Lady Lucas are determined to go just for that reason—you know they normally never visit newcomers. You really must go, because we can't visit him if you don't.",
      charCount: 207,
      tokenCount: 50,
      wordCount: 39,
      estimatedCost: 0.0022,
      edited: false,
      flagged: false,
      status: "completed",
    },
    {
      id: 16,
      originalText: "You are over-scrupulous, surely. I dare say Mr. Bingley will be very glad to see you; and I will send a few lines by you to assure him of my hearty consent to his marrying whichever he chooses of the girls.",
      modernizedText: "You're being too cautious, surely. I'm sure Mr. Bingley will be happy to see you, and I'll send a note with you to let him know I heartily approve of him marrying whichever daughter he chooses.",
      charCount: 208,
      tokenCount: 50,
      wordCount: 39,
      estimatedCost: 0.0022,
      edited: false,
      flagged: false,
      status: "completed",
    },
    {
      id: 17,
      originalText: "Though I must throw in a good word for my little Lizzy. I desire you will do no such thing. Lizzy is not a bit better than the others.",
      modernizedText: "Though I should put in a good word for my little Lizzy. I want you to do no such thing. Lizzy isn't any better than the others.",
      charCount: 137,
      tokenCount: 33,
      wordCount: 26,
      estimatedCost: 0.0014,
      edited: false,
      flagged: false,
      status: "completed",
    },
    {
      id: 18,
      originalText: "And I am sure she is not half so handsome as Jane, nor half so good-humoured as Lydia. But you are always giving her the preference.",
      modernizedText: "And I'm sure she's not half as beautiful as Jane, or half as cheerful as Lydia. But you always favor her.",
      charCount: 135,
      tokenCount: 32,
      wordCount: 25,
      estimatedCost: 0.0014,
      edited: false,
      flagged: false,
      status: "completed",
    },
    {
      id: 19,
      originalText: "They have none of them much to recommend them, replied he; they are all silly and ignorant like other girls; but Lizzy has something more of quickness than her sisters.",
      modernizedText: "None of them have much to recommend them, he replied. They're all silly and ignorant like other girls, but Lizzy is a bit sharper than her sisters.",
      charCount: 170,
      tokenCount: 41,
      wordCount: 32,
      estimatedCost: 0.0018,
      edited: false,
      flagged: false,
      status: "completed",
    },
    {
      id: 20,
      originalText: "Mr. Bennet, how can you abuse your own children in such a way? You take delight in vexing me. You have no compassion for my poor nerves.",
      modernizedText: "Mr. Bennet, how can you criticize your own children like that? You enjoy annoying me. You have no sympathy for my nerves.",
      charCount: 138,
      tokenCount: 33,
      wordCount: 26,
      estimatedCost: 0.0014,
      edited: false,
      flagged: false,
      status: "completed",
    },
    {
      id: 21,
      originalText: "You mistake me, my dear. I have a high respect for your nerves. They are my old friends. I have heard you mention them with consideration these last twenty years at least.",
      modernizedText: "You misunderstand me, my dear. I have great respect for your nerves. They're old friends of mine. I've heard you talk about them constantly for at least twenty years.",
      charCount: 169,
      tokenCount: 41,
      wordCount: 32,
      estimatedCost: 0.0018,
      edited: false,
      flagged: false,
      status: "completed",
    },
    {
      id: 22,
      originalText: "Ah, you do not know what I suffer. But I hope you will get over it, and live to see many young men of four thousand a year come into the neighbourhood.",
      modernizedText: "Ah, you don't know how I suffer. But I hope you'll get over it and live to see many young men worth four thousand a year move into the neighborhood.",
      charCount: 153,
      tokenCount: 37,
      wordCount: 29,
      estimatedCost: 0.0016,
      edited: false,
      flagged: false,
      status: "completed",
    },
    {
      id: 23,
      originalText: "It will be no use to us, if twenty such should come, since you will not visit them. I am sick of Mr. Bingley.",
      modernizedText: "It won't do us any good if twenty such men come, since you won't visit them. I'm sick of hearing about Mr. Bingley.",
      charCount: 109,
      tokenCount: 26,
      wordCount: 20,
      estimatedCost: 0.0011,
      edited: false,
      flagged: false,
      status: "completed",
    },
    {
      id: 24,
      originalText: "I am sorry to hear that; but why did not you tell me that before? If I had known as much this morning I certainly would not have called on him.",
      modernizedText: "I'm sorry to hear that. But why didn't you tell me earlier? If I'd known this morning, I definitely wouldn't have visited him.",
      charCount: 147,
      tokenCount: 35,
      wordCount: 28,
      estimatedCost: 0.0015,
      edited: false,
      flagged: false,
      status: "completed",
    },
    {
      id: 25,
      originalText: "It is unlucky; but as I have actually paid the visit, we cannot escape the acquaintance now. Mr. Bennet was among the earliest of those who waited on Mr. Bingley.",
      modernizedText: "It's unfortunate, but since I've already made the visit, we can't avoid knowing him now. Mr. Bennet was among the first to call on Mr. Bingley.",
      charCount: 162,
      tokenCount: 39,
      wordCount: 31,
      estimatedCost: 0.0017,
      edited: false,
      flagged: false,
      status: "completed",
    },
    {
      id: 26,
      originalText: "He had always intended to visit him, though to the last always assuring his wife that he should not go; and till the evening after the visit was paid she had no knowledge of it.",
      modernizedText: "He'd always planned to visit, though he kept telling his wife he wouldn't. She didn't find out about the visit until the evening after it happened.",
      charCount: 178,
      tokenCount: 43,
      wordCount: 34,
      estimatedCost: 0.0019,
      edited: false,
      flagged: false,
      status: "completed",
    },
    {
      id: 27,
      originalText: "It was then disclosed in the following manner. Observing his second daughter employed in trimming a hat, he suddenly addressed her with: I hope Mr. Bingley will like it, Lizzy.",
      modernizedText: "It was revealed like this: Seeing his second daughter working on a hat, he suddenly said to her, 'I hope Mr. Bingley will like it, Lizzy.'",
      charCount: 166,
      tokenCount: 40,
      wordCount: 31,
      estimatedCost: 0.0017,
      edited: false,
      flagged: false,
      status: "completed",
    },
    {
      id: 28,
      originalText: "We are not in a way to know what Mr. Bingley likes, said her mother resentfully, since we are not to visit. But you forget, mamma, said Elizabeth, that we shall meet him at the assemblies.",
      modernizedText: "We have no way of knowing what Mr. Bingley likes, her mother said resentfully, since we're not going to visit. But you're forgetting, Mama, Elizabeth said, that we'll meet him at the dances.",
      charCount: 192,
      tokenCount: 46,
      wordCount: 36,
      estimatedCost: 0.0020,
      edited: false,
      flagged: false,
      status: "completed",
    },
    {
      id: 29,
      originalText: "And Mrs. Long has promised to introduce him. I do not believe Mrs. Long will do any such thing. She has two nieces of her own. She is a selfish, hypocritical woman, and I have no opinion of her.",
      modernizedText: "And Mrs. Long promised to introduce him. I don't believe Mrs. Long will do any such thing. She has two nieces of her own. She's a selfish, hypocritical woman, and I don't think much of her.",
      charCount: 197,
      tokenCount: 47,
      wordCount: 37,
      estimatedCost: 0.0021,
      edited: false,
      flagged: false,
      status: "completed",
    },
    
    // PROCESSING CHUNKS (30-32) - Currently being modernized
    {
      id: 30,
      originalText: "No more have I, said Mr. Bennet; and I am glad to find that you do not depend on her serving you. Mrs. Bennet deigned not to make any reply.",
      modernizedText: "",
      charCount: 145,
      tokenCount: 35,
      wordCount: 27,
      estimatedCost: 0.0015,
      edited: false,
      flagged: false,
      status: "processing",
    },
    {
      id: 31,
      originalText: "But on the following morning she could not conceal her suspicions from the family. Elizabeth, I hope you have ordered a good dinner today, because I have reason to expect an addition to our family party.",
      modernizedText: "",
      charCount: 213,
      tokenCount: 51,
      wordCount: 40,
      estimatedCost: 0.0022,
      edited: false,
      flagged: false,
      status: "processing",
    },
    {
      id: 32,
      originalText: "Who do you mean, my dear? I know of nobody that is coming, I am sure, unless Charlotte Lucas should happen to call in—and I hope my dinners are good enough for her.",
      modernizedText: "",
      charCount: 171,
      tokenCount: 41,
      wordCount: 32,
      estimatedCost: 0.0018,
      edited: false,
      flagged: false,
      status: "processing",
    },
    
    // FAILED CHUNKS (33-35) - Modernization failed
    {
      id: 33,
      originalText: "The person of whom I speak is a gentleman, and a stranger. Mrs. Bennet's eyes sparkled. A gentleman and a stranger! It is Mr. Bingley, I am sure! Well, I am sure I shall be extremely glad to see Mr. Bingley.",
      modernizedText: "",
      charCount: 210,
      tokenCount: 50,
      wordCount: 39,
      estimatedCost: 0.0022,
      edited: false,
      flagged: true,
      status: "failed",
    },
    {
      id: 34,
      originalText: "But—good Lord! how unlucky! There is not a bit of fish to be got today. Lydia, my love, ring the bell—I must speak to Hill this moment.",
      modernizedText: "",
      charCount: 141,
      tokenCount: 34,
      wordCount: 26,
      estimatedCost: 0.0015,
      edited: false,
      flagged: true,
      status: "failed",
    },
    {
      id: 35,
      originalText: "I am glad it is settled. But, Lizzy, you look as if you did not enjoy it. You are not going to be missish, I hope, and pretend to be affronted at an idle report. For what do we live, but to make sport for our neighbours, and laugh at them in our turn?",
      modernizedText: "",
      charCount: 255,
      tokenCount: 61,
      wordCount: 48,
      estimatedCost: 0.0027,
      edited: false,
      flagged: true,
      status: "failed",
    },
    
    // PENDING CHUNKS (36-49) - Waiting to be modernized
    {
      id: 36,
      originalText: "Oh! you are a great deal too apt, you know, to like people in general. You never see a fault in anybody. All the world are good and agreeable in your eyes. I never heard you speak ill of a human being in your life.",
      modernizedText: "",
      charCount: 218,
      tokenCount: 52,
      wordCount: 41,
      estimatedCost: 0.0023,
      edited: false,
      flagged: false,
      status: "pending",
    },
    {
      id: 37,
      originalText: "I would not wish to be hasty in censuring anyone; but I always speak what I think. I know you do; and it is that which makes the wonder. With your good sense, to be so honestly blind to the follies and nonsense of others!",
      modernizedText: "",
      charCount: 227,
      tokenCount: 54,
      wordCount: 43,
      estimatedCost: 0.0024,
      edited: false,
      flagged: false,
      status: "pending",
    },
    {
      id: 38,
      originalText: "Affectation of candour is common enough—one meets with it everywhere. But to be candid without ostentation or design—to take the good of everybody's character and make it still better, and say nothing of the bad—belongs to you alone.",
      modernizedText: "",
      charCount: 241,
      tokenCount: 58,
      wordCount: 45,
      estimatedCost: 0.0025,
      edited: false,
      flagged: false,
      status: "pending",
    },
    {
      id: 39,
      originalText: "And the world in general would be improved if more people possessed your disposition. But with me, you know, it is quite different. I always judge by appearances.",
      modernizedText: "",
      charCount: 163,
      tokenCount: 39,
      wordCount: 31,
      estimatedCost: 0.0017,
      edited: false,
      flagged: false,
      status: "pending",
    },
    {
      id: 40,
      originalText: "Mr. Darcy soon drew the attention of the room by his fine, tall person, handsome features, noble mien, and the report which was in general circulation within five minutes after his entrance, of his having ten thousand a year.",
      modernizedText: "",
      charCount: 228,
      tokenCount: 55,
      wordCount: 43,
      estimatedCost: 0.0024,
      edited: false,
      flagged: false,
      status: "pending",
    },
    {
      id: 41,
      originalText: "The gentlemen pronounced him to be a fine figure of a man, the ladies declared he was much handsomer than Mr. Bingley, and he was looked at with great admiration for about half the evening.",
      modernizedText: "",
      charCount: 193,
      tokenCount: 46,
      wordCount: 36,
      estimatedCost: 0.0020,
      edited: false,
      flagged: false,
      status: "pending",
    },
    {
      id: 42,
      originalText: "Till his manners gave a disgust which turned the tide of his popularity; for he was discovered to be proud; to be above his company, and above being pleased.",
      modernizedText: "",
      charCount: 157,
      tokenCount: 38,
      wordCount: 29,
      estimatedCost: 0.0016,
      edited: false,
      flagged: false,
      status: "pending",
    },
    {
      id: 43,
      originalText: "And not all his large estate in Derbyshire could then save him from having a most forbidding, disagreeable countenance, and being unworthy to be compared with his friend.",
      modernizedText: "",
      charCount: 172,
      tokenCount: 41,
      wordCount: 32,
      estimatedCost: 0.0018,
      edited: false,
      flagged: false,
      status: "pending",
    },
    {
      id: 44,
      originalText: "Mr. Bingley had soon made himself acquainted with all the principal people in the room; he was lively and unreserved, danced every dance, was angry that the ball closed so early.",
      modernizedText: "",
      charCount: 181,
      tokenCount: 43,
      wordCount: 34,
      estimatedCost: 0.0019,
      edited: false,
      flagged: false,
      status: "pending",
    },
    {
      id: 45,
      originalText: "And talked of giving one himself at Netherfield. Such amiable qualities must speak for themselves. What a contrast between him and his friend! Mr. Darcy danced only once with Mrs. Hurst and once with Miss Bingley.",
      modernizedText: "",
      charCount: 218,
      tokenCount: 52,
      wordCount: 41,
      estimatedCost: 0.0023,
      edited: false,
      flagged: false,
      status: "pending",
    },
    {
      id: 46,
      originalText: "Declined being introduced to any other lady, and spent the rest of the evening in walking about the room, speaking occasionally to one of his own party. His character was decided. He was the proudest, most disagreeable man in the world.",
      modernizedText: "",
      charCount: 238,
      tokenCount: 57,
      wordCount: 45,
      estimatedCost: 0.0025,
      edited: false,
      flagged: false,
      status: "pending",
    },
    {
      id: 47,
      originalText: "And everybody hoped that he would never come there again. Amongst the most violent against him was Mrs. Bennet, whose dislike of his general behaviour was sharpened into particular resentment by his having slighted one of her daughters.",
      modernizedText: "",
      charCount: 242,
      tokenCount: 58,
      wordCount: 45,
      estimatedCost: 0.0025,
      edited: false,
      flagged: false,
      status: "pending",
    },
    {
      id: 48,
      originalText: "Elizabeth Bennet had been obliged, by the scarcity of gentlemen, to sit down for two dances; and during part of that time, Mr. Darcy had been standing near enough for her to hear a conversation between him and Mr. Bingley.",
      modernizedText: "",
      charCount: 228,
      tokenCount: 55,
      wordCount: 43,
      estimatedCost: 0.0024,
      edited: false,
      flagged: false,
      status: "pending",
    },
    {
      id: 49,
      originalText: "Who came from the dance for a few minutes, to press his friend to join it. Come, Darcy, said he, I must have you dance. I hate to see you standing about by yourself in this stupid manner. You had much better dance.",
      modernizedText: "",
      charCount: 215,
      tokenCount: 51,
      wordCount: 40,
      estimatedCost: 0.0022,
      edited: false,
      flagged: false,
      status: "pending",
    },
  ]);

  const handleFileSelected = (file: File, content: string) => {
    setUploadedFile({ file, content });
    setCurrentView("project-setup");
  };

  // Function to chunk text by target character count with natural boundaries
  const chunkText = (text: string, targetChars: number = 2000): Chunk[] => {
    const chunks: Chunk[] = [];
    let chunkIndex = 0;
    
    // Helper to create a chunk
    const createChunk = (text: string) => {
      const wordCount = text.split(/\s+/).length;
      const charCount = text.length;
      const tokenCount = Math.round(wordCount * 1.3);
      const gptInputCost = (tokenCount / 1000) * 0.01;
      const gptOutputCost = (tokenCount / 1000) * 0.03;
      const ttsCost = (charCount / 1000000) * 15;
      const totalCost = gptInputCost + gptOutputCost + ttsCost;
      
      return {
        id: chunkIndex++,
        originalText: text,
        modernizedText: "",
        charCount,
        tokenCount,
        wordCount,
        estimatedCost: totalCost,
        edited: false,
        flagged: false,
        status: "pending" as const,
      };
    };
    
    // Split by paragraphs first
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
    
    // If no paragraphs found (no double newlines), split by single newlines
    const textSegments = paragraphs.length > 0 ? paragraphs : text.split(/\n+/).filter(p => p.trim().length > 0);
    
    let currentChunk = "";
    
    for (const segment of textSegments) {
      const trimmedSegment = segment.trim();
      
      // If this segment alone exceeds target, split it by sentences
      if (trimmedSegment.length > targetChars * 2) {
        // Save current chunk if exists
        if (currentChunk.length > 0) {
          chunks.push(createChunk(currentChunk));
          currentChunk = "";
        }
        
        // Split large segment by sentences
        const sentences = trimmedSegment.split(/[.!?]+\s+/);
        let tempChunk = "";
        
        for (const sentence of sentences) {
          if (tempChunk.length > 0 && tempChunk.length + sentence.length > targetChars) {
            chunks.push(createChunk(tempChunk));
            tempChunk = sentence;
          } else {
            tempChunk += (tempChunk.length > 0 ? ". " : "") + sentence;
          }
        }
        
        if (tempChunk.length > 0) {
          currentChunk = tempChunk;
        }
      }
      // If adding segment would exceed target, save current chunk
      else if (currentChunk.length > 0 && currentChunk.length + trimmedSegment.length + 2 > targetChars) {
        chunks.push(createChunk(currentChunk));
        currentChunk = trimmedSegment;
      }
      // Add segment to current chunk
      else {
        currentChunk += (currentChunk.length > 0 ? "\n\n" : "") + trimmedSegment;
      }
    }
    
    // Save final chunk
    if (currentChunk.length > 0) {
      chunks.push(createChunk(currentChunk));
    }
    
    // Fallback: if still no chunks (empty text), return empty array
    return chunks;
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

    console.log(`📚 Chunking text: ${selectedText.length} characters`);
    console.log(`📊 Range: ${config.startPosition}% to ${config.endPosition}%`);
    
    // Chunk the selected text by target size (2000 chars) with natural boundaries
    const newChunks = chunkText(selectedText);
    
    console.log(`✅ Created ${newChunks.length} chunks from selected text`);
    console.log(`📝 First chunk preview:`, newChunks[0]?.originalText?.substring(0, 100) + "...");

    const newBook: Book = {
      id: Date.now().toString(),
      title: config.title,
      author: config.author,
      coverColor: `hsl(${Math.random() * 360}, 50%, 50%)`,
      coverGradient: gradients[Math.floor(Math.random() * gradients.length)],
      uploadedAt: new Date(),
      status: "processing",
      originalText: selectedText, // Store the full selected text
      chunks: newChunks, // Store chunks with the book
    };

    console.log("📘 New book created:", newBook);
    console.log("📚 Total chunks:", newChunks.length);
    
    setBooks((prev) => [newBook, ...prev]);
    setSelectedBook(newBook);
    setChunks(newChunks);

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
      setSelectedBook((prev) =>
        prev && prev.id === newBook.id
          ? {
              ...prev,
              status: "modernized",
              modernizedText: modernizeText(selectedText.slice(0, 2000)),
            }
          : prev
      );
    }, 2000);

    setUploadedFile(null);
    console.log("🔄 Switching to project view with book:", newBook.title);
    setCurrentView("project");
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
    
    // Load chunks for this book (or generate them if not available)
    if (book.chunks && book.chunks.length > 0) {
      setChunks(book.chunks);
    } else if (book.originalText) {
      // Generate chunks from original text if they don't exist
      const generatedChunks = chunkText(book.originalText, 2000);
      setChunks(generatedChunks);
      // Update the book with generated chunks
      setBooks((prev) =>
        prev.map((b) =>
          b.id === book.id ? { ...b, chunks: generatedChunks } : b
        )
      );
    }
    
    // Always go to unified project view
    setCurrentView("project");
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



  const handleUpdateBook = (bookId: string, updates: Partial<Book>) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === bookId ? { ...b, ...updates } : b))
    );
    setSelectedBook((prev) =>
      prev && prev.id === bookId ? { ...prev, ...updates } : prev
    );
  };

  const handleModernizeMoreChunks = (count?: number) => {
    // Convert next batch of pending chunks (simulate API call)
    const pendingChunks = chunks.filter(c => c.status === "pending");
    
    if (pendingChunks.length === 0) {
      toast.success("Complete!", {
        description: "All chunks have been modernized.",
        duration: 2000,
      });
      return;
    }
    
    // Use provided count or default to 10
    const batchSize = count !== undefined ? Math.min(count, pendingChunks.length) : 10;
    const chunksToConvert = pendingChunks.slice(0, batchSize);
    
    toast.info("Modernization", {
      description: `Converting ${chunksToConvert.length} chunks to Gen Z brainrot slang...`,
      duration: 2000,
    });
    
    // Simulate processing delay
    setTimeout(() => {
      setChunks(prev => prev.map(chunk => {
        if (chunksToConvert.find(c => c.id === chunk.id)) {
          // Apply brainrot transformation
          let modernized = chunk.originalText
            .replace(/\[\d+:\d+:\d+\]/g, "")
            .replace(/^\d+\s*$/gm, "")
            .replace(/^Chapter \d+$/gim, "")
            .replace(/\bit is a truth universally acknowledged\b/gi, "No cap fam, it's giving main character energy")
            .replace(/\bmust be in want of\b/gi, "is lowkey hunting for")
            .replace(/\bmy dear Mr\. Bennet\b/gi, "Yo Mr. Bennet")
            .replace(/\bsaid his lady to him\b/gi, "his wife was like")
            .replace(/\breplied that he had not\b/gi, "straight up said nah I didn't hear that sis")
            .replace(/\bmade no answer\b/gi, "left her on read. Man just ghosted her whole vibe check")
            .replace(/\bcried his wife impatiently\b/gi, "his wife was giving impatient Karen energy rn")
            .replace(/\breturned she\b/gi, "she clapped back")
            .replace(/\bvery\b/gi, "literally")
            .replace(/\breally\b/gi, "lowkey")
            .replace(/\bquite\b/gi, "kinda")
            .replace(/\bgood\b/gi, "bussin")
            .replace(/\bbad\b/gi, "mid")
            .replace(/\!(?=\s|$)/g, " fr!")
            .replace(/\s+/g, " ")
            .trim();
          
          return {
            ...chunk,
            modernizedText: modernized || chunk.originalText,
            status: "completed" as const,
          };
        }
        return chunk;
      }));
      
      // Update the selected book's chunks and the book itself
      if (selectedBook) {
        const updatedChunks = chunks.map(chunk => {
          if (chunksToConvert.find(c => c.id === chunk.id)) {
            let modernized = chunk.originalText
              .replace(/\[\d+:\d+:\d+\]/g, "")
              .replace(/^\d+\s*$/gm, "")
              .replace(/^Chapter \d+$/gim, "")
              .replace(/\bit is a truth universally acknowledged\b/gi, "No cap fam, it's giving main character energy")
              .replace(/\bmust be in want of\b/gi, "is lowkey hunting for")
              .replace(/\bvery\b/gi, "literally")
              .replace(/\breally\b/gi, "lowkey")
              .replace(/\bquite\b/gi, "kinda")
              .replace(/\bgood\b/gi, "bussin")
              .replace(/\bbad\b/gi, "mid")
              .replace(/\s+/g, " ")
              .trim();
            return { ...chunk, modernizedText: modernized, status: "completed" as const };
          }
          return chunk;
        });
        
        setBooks(prev => prev.map(b => 
          b.id === selectedBook.id ? { ...b, chunks: updatedChunks } : b
        ));
        
        setSelectedBook(prev => 
          prev ? { ...prev, chunks: updatedChunks } : prev
        );
      }
      
      const remainingPending = pendingChunks.length - chunksToConvert.length;
      toast.success("Converted!", {
        description: remainingPending > 0 
          ? `${chunksToConvert.length} chunks converted. ${remainingPending} remaining.`
          : "All chunks have been modernized!",
        duration: 2000,
      });
    }, 500);
  };

  const handleGenerateAudioFromProject = () => {
    // This is now handled inside ProjectView's Audio Files tab
    // Just show a toast to confirm the action was triggered
    toast.info("Audio Generation", {
      description: "Generate audio from the Audio Files tab",
      duration: 2000,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      {/* Ambient background blur elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {currentView !== "project-setup" && currentView !== "project" && (
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

          {currentView === "project" && selectedBook && (
            <ProjectView
              book={selectedBook}
              chunks={selectedBook.chunks || chunks}
              onBack={() => {
                setCurrentView("library");
                setSelectedBook(null);
              }}
              onUpdateBook={handleUpdateBook}
              onEditChunk={handleEditChunk}
              onModernizeMoreChunks={handleModernizeMoreChunks}
              onGenerateAudio={handleGenerateAudioFromProject}
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
              onCancel={() => setCurrentView("project")}
            />
          )}

          {currentView === "create-clip" && selectedBook && (
            <ClipCreator
              book={selectedBook}
              onSave={handleCreateClip}
              onCancel={() => setCurrentView("project")}
            />
          )}
        </main>
      </div>
      
      {/* Toast notifications */}
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
