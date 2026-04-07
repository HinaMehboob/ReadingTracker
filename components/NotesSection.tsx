import { useState } from "react";
import { Book } from "@/lib/types";
import { FiEdit3, FiMessageSquare, FiPlus, FiSave, FiX } from "react-icons/fi";

export default function NotesSection({ books, onUpdate }: { books: Book[], onUpdate: (book: Book) => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentText, setCurrentText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const startEditing = (book: Book) => {
    setEditingId(book._id);
    setCurrentText(book.description || "");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setCurrentText("");
  };

  const handleSave = async (bookId: string) => {
    try {
      setIsSaving(true);
      const response = await fetch(`/api/books/${bookId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: currentText }),
      });

      if (!response.ok) throw new Error("Failed to save note");

      const updatedBook = await response.json();
      onUpdate(updatedBook);
      setEditingId(null);
    } catch (error) {
      console.error("Error saving note:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-[#191919] border border-[#2d2d2d] rounded-xl p-6">
      <div className="flex items-center space-x-2 text-white mb-6">
        <FiEdit3 size={18} />
        <h2 className="text-lg font-bold">What came to my Mind?</h2>
      </div>

      <div className="flex items-center space-x-2 text-[#a3a3a3] mb-4">
        <FiMessageSquare size={14} />
        <h3 className="text-sm font-medium">Notes & Thoughts</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {books.map(book => {
          const isEditing = editingId === book._id;
          return (
          <div key={book._id} className="bg-[#202020] border border-[#2d2d2d] rounded-lg p-5 h-[240px] flex flex-col hover:border-[#3f3f46] transition-colors group relative shadow-sm">
            <h4 className="font-semibold text-white text-sm line-clamp-2 mb-3 shrink-0">{book.title}</h4>
            
            {isEditing ? (
              <div className="flex-1 flex flex-col min-h-0">
                <textarea
                  value={currentText}
                  onChange={(e) => setCurrentText(e.target.value)}
                  placeholder="Type your thoughts here..."
                  className="w-full flex-1 bg-[#111111] text-[#e5e5e5] text-xs p-2.5 rounded-md border border-[#3f3f46] focus:outline-none focus:border-blue-500/50 resize-none mb-3"
                  disabled={isSaving}
                />
                <div className="flex space-x-2 shrink-0">
                  <button onClick={() => handleSave(book._id)} disabled={isSaving} className="flex-1 flex items-center justify-center bg-blue-600/20 border border-blue-900/50 text-blue-400 font-medium text-xs py-1.5 rounded hover:bg-blue-600/30 disabled:opacity-50 transition-colors">
                    <FiSave size={12} className="mr-1.5" /> {isSaving ? "Saving..." : "Save"}
                  </button>
                  <button onClick={cancelEditing} disabled={isSaving} className="w-8 flex items-center justify-center bg-[#2d2d2d] text-[#a3a3a3] hover:bg-[#3f3f46] hover:text-white py-1.5 rounded transition-colors border border-transparent">
                    <FiX size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div 
                  className="text-[13px] text-[#a3a3a3] flex-1 overflow-y-auto leading-relaxed custom-scrollbar pr-1 format-notes"
                  dangerouslySetInnerHTML={{ __html: book.description || "No notes or thoughts written yet for this book. Start reflecting!" }}
                />
                <button onClick={() => startEditing(book)} className="w-full mt-4 py-2 flex justify-center items-center text-[#737373] text-xs font-semibold hover:bg-[#2d2d2d] hover:text-[#d4d4d4] rounded-md transition-all shrink-0 group-hover:border-[#3f3f46] border border-transparent">
                  <FiPlus size={12} className="mr-1.5" /> Add new thought
                </button>
              </>
            )}
          </div>
        )})}
      </div>
    </div>
  );
}
