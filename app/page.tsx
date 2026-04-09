"use client";

import { useEffect, useState } from "react";
import { Book } from "@/lib/types";
import BookList from "@/components/BookList";
import TrackerChart from "@/components/TrackerChart";
import NotesSection from "@/components/NotesSection";
import Sidebar from "@/components/Sidebar";
import FeaturedBook from "@/components/FeaturedBook";
import { useSession } from "next-auth/react";
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
    <main className="min-h-screen bg-[#111111] text-[#e5e5e5] pb-24 font-sans selection:bg-blue-500/30 overflow-x-hidden flex">
      {/* Sidebar Layout */}
      <Sidebar userName={session.user?.name} />

      {/* Main Content Pane */}
      <div className="ml-64 flex-1">
        <div className="max-w-[1400px] mx-auto px-8 lg:px-12 py-12 space-y-12">
          
          {/* Header Description */}
          <div className="mb-2 max-w-4xl">
            <h1 className="text-[28px] font-bold text-white mb-3 tracking-tight">Reading Book Tracker</h1>
            <p className="text-[13px] text-[#a3a3a3] leading-relaxed max-w-3xl">
              Here I keep track of my reading progress. I update the <strong className="text-[#f5f5f5] font-semibold">pages read</strong> to see how much you've completed and what's left. Each book also has a space for notes and thoughts. Happy reading to me. I am capable of doing more than I know!!!
            </p>
          </div>

          <div id="library">
             {/* Dynamic Featured Book */}
             <FeaturedBook books={books} />
          </div>

          {/* Collections section - Full Width */}
          <div id="collections">
            <h2 className="text-xl font-bold text-white mb-4">Your Collections</h2>
            <BookList 
              books={books} 
              onUpdate={handleBookUpdate} 
              onRefresh={fetchBooks} 
            />
          </div>

          {/* Analytics - Full Width, side by side internal grid */}
          <div id="analytics" className="pt-4">
            <h2 className="text-xl font-bold text-white mb-4">Reading Analytics</h2>
            <TrackerChart books={books} />
          </div>

          {/* Notes Section anchored at bottom */}
          <div id="notes" className="pt-4">
            <h2 className="text-xl font-bold text-white mb-4">Notes & Annotations</h2>
            <NotesSection books={books} onUpdate={handleBookUpdate} />
          </div>

        </div>
      </div>
    </main>
  );
}
