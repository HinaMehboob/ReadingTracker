import { useState } from "react";
import { Book } from "@/lib/types";
import { FiTrash2, FiCheck, FiX } from "react-icons/fi";
import { getGenreColor } from "@/lib/colors";
import Link from "next/link";

interface BookCardProps {
  book: Book;
  onUpdate: (book: Book) => void;
  onRefresh: () => void;
}

export default function BookCard({ book, onUpdate, onRefresh }: BookCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(book.readingProgress?.currentPage || 0);
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePageUpdate = async () => {
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: book._id,
          currentPage: Number(currentPage),
          completed: Number(currentPage) >= book.totalPages,
        }),
      });

      if (!response.ok) throw new Error("Failed to update progress");

      const updatedProgress = await response.json();
      onUpdate({
        ...book,
        readingProgress: updatedProgress,
        status: updatedProgress.completed ? "completed" : "in-progress",
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating progress:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = async (status: Book['status']) => {
    try {
      const response = await fetch(`/api/books/${book._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      const updatedBook = await response.json();
      onUpdate(updatedBook);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this book?")) return;

    try {
      const response = await fetch(`/api/books/${book._id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete book");
      onRefresh();
    } catch (error) {
      console.error("Error deleting book:", error);
    }
  };

  const progress = book.readingProgress
    ? Math.min(Math.round((book.readingProgress.currentPage / book.totalPages) * 100), 100)
    : 0;

  return (
    <div className="bg-[#202020] rounded-xl border border-[#2d2d2d] overflow-hidden hover:border-[#3f3f46] transition-colors group flex flex-col h-full">
      {/* Cover Image */}
      <Link href={`/read/${book._id}`} className="block h-[180px] bg-[#111111] relative flex items-center justify-center p-3 cursor-pointer group/wrap">
        {book.coverImage ? (
          <img src={book.coverImage} alt={book.title} className="max-w-full max-h-full object-contain drop-shadow-md rounded-[2px] transition-transform group-hover/wrap:scale-105" />
        ) : (
          <div className="text-[#a3a3a3] text-xs flex flex-col items-center">
             <span className="mb-1 opacity-50">Click to</span>
             <span className="font-semibold text-white">Read Book</span>
          </div>
        )}
        
        {/* Subtle Delete Trashcan overlay */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(); }} className="p-1.5 bg-[#191919] border border-[#3f3f46] text-[#ef4444] rounded hover:bg-[#7f1d1d] hover:text-white transition-colors">
            <FiTrash2 size={14} />
          </button>
        </div>
      </Link>

      <div className="p-5 flex flex-col flex-1">
        {/* Title and Settings */}
        <Link href={`/read/${book._id}`} className="hover:underline decoration-[#a3a3a3] underline-offset-2">
           <h3 className="font-bold text-[#f5f5f5] leading-snug mb-2 line-clamp-2">{book.title}</h3>
        </Link>
        
        {/* Render Genre tags automatically as Notion pills */}
        {book.genre && book.genre.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 mb-2 mt-1">
            {book.genre.map((gen, idx) => {
              const color = getGenreColor(gen);
              return (
              <span key={idx} className={`${color.bg} ${color.text} font-medium px-2 py-[2.5px] rounded text-[10px] whitespace-nowrap border ${color.border}/50 tracking-wide shadow-sm hover:opacity-80 transition-opacity`}>
                {gen}
              </span>
            )})}
          </div>
        ) : null}

        <p className="text-xs font-medium text-[#a3a3a3] mb-5 line-clamp-1">{book.author}</p>

        {/* Progress Tracker Bar */}
        <div className="mb-6 group/progress cursor-pointer relative" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? (
            <div className="flex items-center space-x-2 bg-[#191919] p-2 rounded border border-[#2d2d2d] absolute inset-x-0 -top-3 z-10">
              <input
                type="number"
                min="0"
                max={book.totalPages}
                value={currentPage}
                onChange={(e) => setCurrentPage(Number(e.target.value))}
                onClick={(e) => e.stopPropagation()}
                className="w-16 bg-[#2d2d2d] text-white text-xs px-2 py-1 rounded outline-none"
              />
              <span className="text-[11px] text-[#a3a3a3]">/ {book.totalPages} pages</span>
              <button onClick={(e) => { e.stopPropagation(); handlePageUpdate(); }} className="text-[#34d399] p-1"><FiCheck size={14}/></button>
              <button onClick={(e) => { e.stopPropagation(); setIsEditing(false); }} className="text-[#a3a3a3] p-1 hover:text-white"><FiX size={14}/></button>
            </div>
          ) : (
            <>
               <div className="text-[11px] text-[#a3a3a3] mb-1.5 font-bold tracking-wide text-left">{progress.toFixed(0)}%</div>
               {/* Thicker progress bar based on visual markup rules */}
               <div className="w-full bg-[#2d2d2d] h-[6px] rounded-full overflow-hidden">
                 <div className={`h-full ${progress === 100 ? 'bg-[#10b981]' : 'bg-[#3b82f6]'}`} style={{ width: `${progress}%` }} />
               </div>
            </>
          )}
        </div>

        {/* Single Automatic Status Pill based on Reading Progress */}
        <div className="mt-auto flex justify-start w-full pt-4">
          {progress === 0 ? (
            <div className="inline-block px-2 py-[3px] bg-[#2d2d2d] text-[#8a8a8a] text-[9.5px] font-bold rounded-sm shadow-sm tracking-widest uppercase border border-[#3f3f46]">
              To Read
            </div>
          ) : progress < 100 ? (
            <div className="inline-block px-2 py-[3px] bg-[#1e3a8a]/70 text-blue-300 text-[9.5px] font-bold rounded-sm shadow-sm tracking-widest uppercase border border-blue-900/50">
              Reading
            </div>
          ) : (
            <div className="inline-block px-2 py-[3px] bg-[#064e3b]/70 text-emerald-400 text-[9.5px] font-bold rounded-sm shadow-sm tracking-widest uppercase border border-emerald-900/50">
              Finished
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
