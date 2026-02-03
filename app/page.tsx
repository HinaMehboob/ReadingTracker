"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase"; // Uses the file you just created
import { BookCard } from "./components/BookCard";
import { AddBookModal } from "./components/AddBookModal";

export default function Home() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch books from the 'books' table you created in SQL
  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setBooks(data);
    } catch (err) {
      console.error("Error fetching books:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Reading Dashboard</h1>

        <div className="flex flex-col lg:flex-row gap-6 mb-10">
          {/* Main Tracker Area (from your sketch) */}
          <div className="flex-1 bg-[#161616] p-6 rounded-2xl border border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => (
                <BookCard key={book.id} {...book} />
              ))}
              {/* Passing fetchBooks so the dashboard refreshes after adding a book */}
              <AddBookModal onAddBook={fetchBooks} />
            </div>
          </div>

          {/* Graph Section (from your sketch) */}
          <div className="lg:w-80 bg-[#161616] p-6 rounded-2xl border border-gray-800 flex flex-col items-center justify-center">
            <h2 className="text-sm font-semibold mb-6 self-start text-gray-400 uppercase tracking-widest">
              Reading Stats
            </h2>
            <div className="relative w-40 h-40 rounded-full border-[10px] border-blue-500 flex items-center justify-center">
              <div className="text-center">
                <span className="text-4xl font-bold">
                  {loading ? "..." : books.length}
                </span>
                <p className="text-[10px] text-gray-500 uppercase">
                  Total Books
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section (from your sketch) */}
        <div className="bg-[#161616] p-8 rounded-2xl border border-gray-800 min-h-[300px]">
          <h2 className="text-xl font-bold mb-6">📝 Notes & Thoughts</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="aspect-video bg-white/5 rounded-xl border border-dashed border-gray-700 flex items-center justify-center text-gray-500">
              Select a book to view notes
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
