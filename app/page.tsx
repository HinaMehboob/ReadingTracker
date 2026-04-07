"use client";

import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import BookList from "@/components/BookList";
import ReadingStats from "@/components/ReadingStats";
import { Book } from "@/lib/types";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [stats, setStats] = useState({
    totalBooks: 0,
    completedBooks: 0,
    pagesRead: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchBooks();
    }
  }, [status, router]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/books");
      if (!response.ok) throw new Error("Failed to fetch books");
      
      const data = await response.json();
      setBooks(data);
      updateStats(data);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (booksToStats: Book[]) => {
    const completedBooks = booksToStats.filter(book => book.status === 'completed').length;
    const pagesRead = booksToStats.reduce((total, book) => {
      return total + (book.readingProgress?.currentPage || 0);
    }, 0);

    setStats({
      totalBooks: booksToStats.length,
      completedBooks,
      pagesRead,
    });
  };

  const handleBookUpdate = (updatedBook: Book) => {
    const updatedBooks = books.map(book => 
      book._id === updatedBook._id ? updatedBook : book
    );
    setBooks(updatedBooks);
    updateStats(updatedBooks);
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100">
        <div className="text-center p-8 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl">
          <h1 className="text-3xl font-bold mb-6 tracking-tight">Welcome to Reading Tracker</h1>
          <button
            onClick={() => signIn()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20"
          >
            Sign in to continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 pb-12">
      <header className="bg-zinc-900 border-b border-zinc-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto py-5 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Reading Tracker</span>
          </h1>
          <div className="flex items-center space-x-6">
            <span className="text-sm font-medium text-zinc-400">
              {session.user?.name}
            </span>
            <button
              onClick={() => signOut()}
              className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <ReadingStats stats={stats} />
        
        <div className="mt-10">
          <BookList 
            books={books} 
            onUpdate={handleBookUpdate} 
            onRefresh={fetchBooks} 
          />
        </div>
      </div>
    </main>
  );
}
