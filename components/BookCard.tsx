import { useState } from "react";
import { Book } from "@/lib/types";
import { FiBookOpen, FiEdit2, FiTrash2, FiCheck, FiX } from "react-icons/fi";

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
        headers: {
          "Content-Type": "application/json",
        },
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
        headers: {
          "Content-Type": "application/json",
        },
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
    <div className="bg-zinc-900 rounded-2xl shadow-xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-all duration-300 group flex flex-col h-full">
      {/* Book Cover */}
      <div className="h-48 bg-zinc-950 flex items-center justify-center relative overflow-hidden">
        {book.coverImage ? (
          <img
            src={book.coverImage}
            alt={`${book.title} cover`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
          />
        ) : (
          <div className="text-zinc-700 group-hover:scale-110 transition-transform duration-500">
            <FiBookOpen size={56} opacity={0.5} />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-zinc-900 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-zinc-800">
          <div
            className={`h-full transition-all duration-500 ${
              progress === 100 ? "bg-emerald-500" : "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Book Info */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 pr-2">
            <h3 className="font-bold text-zinc-100 text-lg leading-tight mb-1 line-clamp-1">{book.title}</h3>
            <p className="text-sm font-medium text-zinc-400">{book.author}</p>
          </div>
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-1.5 bg-zinc-800 text-zinc-400 rounded-md hover:text-white hover:bg-zinc-700 transition-colors"
              title="Edit progress"
            >
              <FiEdit2 size={14} />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 bg-zinc-800 text-zinc-400 rounded-md hover:text-red-400 hover:bg-red-950 transition-colors"
              title="Delete book"
            >
              <FiTrash2 size={14} />
            </button>
          </div>
        </div>

        {/* Progress Section */}
        <div className="mb-6 flex-1">
          {isEditing ? (
            <div className="flex items-center space-x-2 bg-zinc-950 p-2 rounded-lg border border-zinc-800">
              <input
                type="number"
                min="0"
                max={book.totalPages}
                value={currentPage}
                onChange={(e) => setCurrentPage(Number(e.target.value))}
                className="w-16 px-2 py-1 bg-zinc-900 border border-zinc-700 text-white rounded text-sm focus:outline-none focus:border-blue-500"
                disabled={isUpdating}
              />
              <span className="text-sm font-medium text-zinc-500">/ {book.totalPages}</span>
              <div className="flex ml-auto space-x-1">
                <button
                  onClick={handlePageUpdate}
                  className="p-1.5 text-emerald-400 hover:bg-emerald-400/10 rounded"
                  disabled={isUpdating}
                  title="Save progress"
                >
                  <FiCheck size={16} />
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setCurrentPage(book.readingProgress?.currentPage || 0);
                  }}
                  className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded"
                  disabled={isUpdating}
                  title="Cancel"
                >
                  <FiX size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-zinc-400">
                  <span className="text-zinc-200">{book.readingProgress?.currentPage || 0}</span> / {book.totalPages} pages
                </div>
                <div className="text-sm font-bold text-blue-400">
                  {progress}%
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status Buttons */}
        <div className="flex space-x-2 mt-auto pt-4 border-t border-zinc-800/50">
          <button
            onClick={() => handleStatusChange("to-read")}
            className={`flex-1 text-xs font-bold py-2 rounded-lg transition-colors ${
              book.status === "to-read"
                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300"
            }`}
          >
            To Read
          </button>
          <button
            onClick={() => handleStatusChange("in-progress")}
            className={`flex-1 text-xs font-bold py-2 rounded-lg transition-colors ${
              book.status === "in-progress"
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300"
            }`}
          >
            Reading
          </button>
          <button
            onClick={() => handleStatusChange("completed")}
            className={`flex-1 text-xs font-bold py-2 rounded-lg transition-colors ${
              book.status === "completed"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300"
            }`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
