"use client";

import { useEffect, useState } from "react";
import { Book } from "@/lib/types";
import BookList from "@/components/BookList";
import TrackerChart from "@/components/TrackerChart";
import NotesSection from "@/components/NotesSection";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/books");
      if (!response.ok) throw new Error("Failed to fetch books");
      
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchBooks();
    }
  }, [status]);

  const handleBookUpdate = (updatedBook: Book) => {
    setBooks(books.map(b => b._id === updatedBook._id ? updatedBook : b));
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#111111]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#a3a3a3]"></div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <main className="min-h-screen bg-[#111111] text-[#e5e5e5] pb-24 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      <header className="border-b border-[#2d2d2d] bg-[#111111] sticky top-0 z-50 px-4 py-3">
        <div className="max-w-[1700px] mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h1 className="text-sm font-semibold tracking-tight text-[#e5e5e5]">Reading Tracker</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-xs text-[#a3a3a3]">{session.user?.name}</span>
            <button
              onClick={() => signOut()}
              className="text-xs font-medium text-[#a3a3a3] hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 max-w-4xl">
          <h1 className="text-[28px] font-bold text-white mb-3 tracking-tight">Reading Book Tracker</h1>
          <p className="text-[13px] text-[#a3a3a3] leading-relaxed max-w-3xl">
            Here I keep track of my reading progress. I update the <strong className="text-[#f5f5f5] font-semibold">pages read</strong> to see how much you've completed and what's left. Each book also has a space for notes and thoughts. Happy reading to me. I am capable of doing more than I know!!!
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">
          <div className="xl:col-span-3">
            <BookList 
              books={books} 
              onUpdate={handleBookUpdate} 
              onRefresh={fetchBooks} 
            />
          </div>
          <div className="xl:col-span-1">
            <TrackerChart books={books} />
          </div>
        </div>

        <div className="mt-6">
          <NotesSection books={books} onUpdate={handleBookUpdate} />
        </div>
      </div>
    </main>
  );
}
