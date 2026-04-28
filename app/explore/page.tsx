"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { GALLERY_BOOKS, GalleryBook } from "@/lib/galleryBooks";
import { FiPlus, FiCheck } from "react-icons/fi";
import { getGenreColor } from "@/lib/colors";
import Image from "next/image";

export default function ExplorePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set());
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const handleAddToCollection = async (book: GalleryBook) => {
    setAddingIds(prev => new Set(prev).add(book._id));
    try {
      const response = await fetch('/api/books/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ book }),
      });

      if (!response.ok) throw new Error("Failed to add book");
      
      setAddingIds(prev => {
        const next = new Set(prev);
        next.delete(book._id);
        return next;
      });
      setAddedIds(prev => new Set(prev).add(book._id));
    } catch (err) {
      console.error(err);
      setAddingIds(prev => {
        const next = new Set(prev);
        next.delete(book._id);
        return next;
      });
    }
  };

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-[#111111]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#a3a3a3]"></div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <main className="min-h-screen bg-[#111111] text-[#e5e5e5] pb-24 font-sans selection:bg-blue-500/30 overflow-x-hidden flex">
      <Sidebar userName={session.user?.name} />
      
      <div className="ml-64 flex-1">
        <div className="max-w-[1400px] mx-auto px-8 lg:px-12 py-12 space-y-12">
          <div className="mb-8 border-b border-[#2d2d2d] pb-6">
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Explore Library</h1>
            <p className="text-[#a3a3a3] max-w-2xl text-sm">
              Discover predefined books and add them right to your personal collection to track your progress and notes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {GALLERY_BOOKS.map(book => (
              <div key={book._id} className="bg-[#191919] border border-[#2d2d2d] rounded-2xl overflow-hidden hover:border-[#3d3d3d] transition-all flex flex-col items-start group">
                <div className="w-full h-48 bg-[#202020] border-b border-[#2d2d2d] relative flex items-center justify-center overflow-hidden">
                  {book.coverImage ? (
                    <Image 
                      src={book.coverImage} 
                      alt={book.title} 
                      fill 
                      className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                    />
                  ) : (
                    <span className="text-[#3d3d3d] font-bold text-xs">NO COVER</span>
                  )}
                </div>
                
                <div className="p-5 flex-1 w-full flex flex-col">
                  <h3 className="text-white font-bold text-lg leading-tight mb-1">{book.title}</h3>
                  <p className="text-[#a3a3a3] text-xs mb-3 font-medium">By {book.author}</p>
                  
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {book.genre.map(g => {
                      const color = getGenreColor(g);
                      return (
                        <span key={g} className={`px-2 py-0.5 rounded text-[10px] font-medium border ${color.bg} ${color.text} ${color.border}`}>
                          {g}
                        </span>
                      );
                    })}
                  </div>
                  
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <span className="text-xs text-[#737373]">{book.totalPages} Pages</span>
                    
                    <button 
                      onClick={() => handleAddToCollection(book)}
                      disabled={addingIds.has(book._id) || addedIds.has(book._id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        addedIds.has(book._id) 
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
                    >
                      {addingIds.has(book._id) ? (
                         <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : addedIds.has(book._id) ? (
                        <><FiCheck /> Added</>
                      ) : (
                        <><FiPlus /> Add to Collection</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
