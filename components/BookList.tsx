import { useState } from "react";
import { Book } from "@/lib/types";
import BookCard from "./BookCard";
import AddBookModal from "./AddBookModal";

interface BookListProps {
  books: Book[];
  onUpdate: (book: Book) => void;
  onRefresh: () => void;
}

export default function BookList({ books, onUpdate, onRefresh }: BookListProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleBookUpdate = (updatedBook: Book) => {
    onUpdate(updatedBook);
  };

  const handleBookAdded = () => {
    setIsAddModalOpen(false);
    onRefresh();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-white tracking-tight">My Library</h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 bg-blue-600 shadow-lg shadow-blue-500/20 text-white text-sm font-bold rounded-lg hover:bg-blue-500 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 focus:ring-blue-500"
        >
          + Add Book
        </button>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/50 rounded-2xl border-2 border-dashed border-zinc-800 backdrop-blur-sm">
          <div className="mx-auto h-16 w-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
            <svg
              className="h-8 w-8 text-zinc-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h3 className="mt-2 text-lg font-bold text-zinc-200">Your library is empty</h3>
          <p className="mt-2 text-sm font-medium text-zinc-500 max-w-sm mx-auto">Get started by adding your first book to track your reading journey.</p>
          <div className="mt-8">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-6 py-3 border border-transparent shadow-lg shadow-blue-500/10 text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-500 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-blue-500"
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add Your First Book
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book) => (
            <div key={book._id} className="h-full">
              <BookCard
                book={book}
                onUpdate={handleBookUpdate}
                onRefresh={onRefresh}
              />
            </div>
          ))}
        </div>
      )}

      <AddBookModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onBookAdded={handleBookAdded}
      />
    </div>
  );
}
