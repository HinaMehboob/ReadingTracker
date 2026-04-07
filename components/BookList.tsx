import { useState } from "react";
import { Book } from "@/lib/types";
import BookCard from "./BookCard";
import AddBookModal from "./AddBookModal";
import { FiBookOpen, FiClock, FiCheckCircle, FiSettings, FiPlus, FiGrid } from "react-icons/fi";

interface BookListProps {
  books: Book[];
  onUpdate: (book: Book) => void;
  onRefresh: () => void;
}

export default function BookList({ books, onUpdate, onRefresh }: BookListProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const filteredBooks = books.filter(book => {
    if (activeTab === 'all') return true;
    
    const progress = book.readingProgress && book.totalPages > 0 
      ? (book.readingProgress.currentPage / book.totalPages) * 100 
      : 0;

    if (activeTab === 'reading') return progress > 0 && progress < 100;
    if (activeTab === 'to-read') return progress === 0;
    if (activeTab === 'finished') return progress >= 100;
    
    return true;
  });

  return (
    <div className="bg-[#191919] border border-[#2d2d2d] rounded-xl overflow-hidden flex flex-col h-full min-h-[600px]">
      {/* Notion style tabs header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2d2d2d] overflow-x-auto scx">
        <div className="flex space-x-1 shrink-0 pr-4">
          <Tab icon={<FiGrid />} label="All Books" active={activeTab === 'all'} onClick={() => setActiveTab('all')} />
          <Tab icon={<FiCheckCircle />} label="Finished Books" active={activeTab === 'finished'} onClick={() => setActiveTab('finished')} />
          <Tab icon={<FiBookOpen />} label="Currently Reading" active={activeTab === 'reading'} onClick={() => setActiveTab('reading')} />
          <Tab icon={<FiClock />} label="To Read Books" active={activeTab === 'to-read'} onClick={() => setActiveTab('to-read')} />
        </div>
        <div className="flex items-center justify-end flex-grow shrink-0 space-x-4 pl-4 sticky right-0 bg-[#191919] min-w-max pb-0.5">
           <div className="flex text-[#a3a3a3] space-x-3">
             <FiSettings size={14} className="hover:text-white cursor-pointer"/>
           </div>
           <button
             onClick={() => setIsAddModalOpen(true)}
             className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#2563eb] text-white text-xs font-semibold rounded hover:bg-[#1d4ed8] transition-colors"
           >
             <span>Add New Book</span>
             <FiPlus size={12} />
           </button>
        </div>
      </div>

      {/* Grid Layout Content */}
      <div className="p-6 flex-1 overflow-y-auto">
        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredBooks.map(book => (
              <BookCard key={book._id} book={book} onUpdate={onUpdate} onRefresh={onRefresh} />
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-[#525252] min-h-[400px]">
             <FiBookOpen size={48} className="mb-4 opacity-50" />
             <p className="text-sm font-medium">No books found in this category.</p>
          </div>
        )}
      </div>

      <AddBookModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onBookAdded={onRefresh} />
    </div>
  );
}

function Tab({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-medium transition-colors shrink-0 ${
        active ? 'bg-[#2d2d2d] text-[#f5f5f5]' : 'text-[#a3a3a3] hover:bg-[#2d2d2d] hover:text-[#d4d4d4]'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
