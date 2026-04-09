import { useState } from "react";
import { Book } from "@/lib/types";
import BookCard from "./BookCard";
import AddBookModal from "./AddBookModal";
import { FiBookOpen, FiClock, FiCheckCircle, FiPlus, FiGrid, FiSearch, FiX } from "react-icons/fi";
interface BookListProps {
  books: Book[];
  onUpdate: (book: Book) => void;
  onRefresh: () => void;
}

export default function BookList({ books, onUpdate, onRefresh }: BookListProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBooks = books.filter(book => {
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      if (book.title.toLowerCase().includes(lowerSearch) || book.author.toLowerCase().includes(lowerSearch)) {
        return true;
      }
      return false;
    }

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
      {/* Category Tabs */}
      <div className="flex space-x-1 px-4 py-3 border-b border-[#2d2d2d] overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <Tab icon={<FiGrid />} label="All Books" active={activeTab === 'all'} onClick={() => setActiveTab('all')} />
        <Tab icon={<FiCheckCircle />} label="Finished Books" active={activeTab === 'finished'} onClick={() => setActiveTab('finished')} />
        <Tab icon={<FiBookOpen />} label="Currently Reading" active={activeTab === 'reading'} onClick={() => setActiveTab('reading')} />
        <Tab icon={<FiClock />} label="To Read Books" active={activeTab === 'to-read'} onClick={() => setActiveTab('to-read')} />
      </div>

      {/* Search & Actions Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2d2d2d] bg-[#141414]">
         {/* Search Bar */}
         <div className="relative group flex items-center bg-[#111111] border border-[#2d2d2d] rounded px-2.5 py-1.5 focus-within:border-[#3b82f6] transition-colors w-full max-w-md mr-4">
           <FiSearch className="text-[#a3a3a3] group-focus-within:text-[#3b82f6]" size={14} />
           <input
             type="text"
             placeholder="Search all books..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="bg-transparent text-xs text-white placeholder-[#a3a3a3] ml-2 w-full outline-none"
           />
           {searchTerm && (
             <button onClick={() => setSearchTerm('')} className="text-[#a3a3a3] hover:text-white ml-1">
               <FiX size={14} />
             </button>
           )}
         </div>
         
         <button
           onClick={() => setIsAddModalOpen(true)}
           className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#2563eb] text-white text-xs font-semibold rounded hover:bg-[#1d4ed8] transition-colors shrink-0 whitespace-nowrap"
         >
           <span>Add New Book</span>
           <FiPlus size={12} />
         </button>
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
