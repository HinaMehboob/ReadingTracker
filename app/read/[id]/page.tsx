"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Book } from "@/lib/types";
import { FiArrowLeft, FiList, FiZoomIn, FiZoomOut, FiChevronLeft, FiChevronRight, FiCheck, FiType, FiEdit2 } from "react-icons/fi";
import Link from "next/link";
import dynamic from "next/dynamic";

const PDFRenderer = dynamic(() => import("@/components/PDFRenderer"), { 
  ssr: false, 
  loading: () => <div className="text-[#a3a3a3] text-sm animate-pulse pt-24 font-mono tracking-widest uppercase">Waking up secure document renderer...</div> 
});

export default function ReaderView() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  
  // PDF State
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  
  // Note State
  const editorRef = useRef<HTMLDivElement>(null);
  const [saveStatus, setSaveStatus] = useState<"Auto-saved" | "Saving..." | "">("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function fetchBook() {
      try {
        const res = await fetch(`/api/books/${id}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setBook(data);
        if (data.readingProgress?.currentPage) {
          setPageNumber(data.readingProgress.currentPage);
        }
        if (editorRef.current && data.description) {
           editorRef.current.innerHTML = data.description;
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchBook();
  }, [id]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  // Auto-Save Page Progress
  const syncPageProgress = async (newPage: number) => {
    if (!book) return; // Only sync if we have a book
    try {
      await fetch(`/api/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: book._id,
          currentPage: newPage,
          completed: newPage >= numPages,
        }),
      });
    } catch (err) {
      console.error("Failed to sync page", err);
    }
  };

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const newPage = prevPageNumber + offset;
      if (newPage < 1 || newPage > numPages) return prevPageNumber;
      syncPageProgress(newPage);
      return newPage;
    });
  };

  // Auto-Save Note Content
  const handleNoteInput = () => {
    setSaveStatus("Saving...");
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(async () => {
      if (!editorRef.current || !book) return;
      const htmlContent = editorRef.current.innerHTML;

      try {
        await fetch(`/api/books/${book._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: htmlContent }),
        });
        setSaveStatus("Auto-saved");
        setTimeout(() => setSaveStatus(""), 2000);
      } catch (err) {
        console.error("Failed to save note");
        setSaveStatus("Error saving");
      }
    }, 1000);
  };

  // Rich Text ExecCommands
  const formatText = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) editorRef.current.focus();
    handleNoteInput();
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-[#111111]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#10b981]"></div></div>;
  if (!book) return <div className="flex h-screen items-center justify-center bg-[#111111]"><h1 className="text-xl text-white">Book not found</h1></div>;

  return (
    <div className="flex h-screen w-full bg-[#111111] text-[#e5e5e5] overflow-hidden font-sans selection:bg-emerald-500/30">
      {/* Dynamic CSS wrapper for aggressive dark mode PDF simulation */}
      <style dangerouslySetInnerHTML={{__html: `
        .pdf-dark-mode canvas {
          filter: invert(100%) hue-rotate(180deg) brightness(85%) contrast(110%);
          border-radius: 8px;
        }
        .rich-text-editor:empty:before {
          content: attr(placeholder);
          color: #525252;
          pointer-events: none;
          display: block;
        }
      `}} />

      {/* LEFT COLUMN: Sidebar Navigation */}
      <div className="w-[260px] bg-[#111111] border-r border-[#2d2d2d] flex flex-col p-6 shrink-0 z-10">
         <h1 className="text-[#10b981] font-bold text-xl leading-tight mb-12 tracking-tight">
           {book.title}
         </h1>

         <div className="space-y-6">
           <Link href="/" className="flex items-center text-xs font-bold tracking-widest text-[#a3a3a3] hover:text-white transition-colors cursor-pointer group">
              <FiArrowLeft className="mr-3 group-hover:-translate-x-1 transition-transform" /> BACK TO LIBRARY
           </Link>

           <div className="flex items-center text-xs font-bold tracking-widest text-[#10b981] cursor-pointer border-l-2 border-[#10b981] pl-4 -ml-[2px] bg-[#1a2e26] py-2 rounded-r">
              <FiList className="mr-3" /> TABLE OF CONTENTS
           </div>
         </div>
      </div>

      {/* CENTER COLUMN: Reader Engine */}
      <div className="flex-1 flex flex-col bg-[#161616] relative">
         {/* Top PDF Toolbar */}
         <div className="h-16 flex items-center justify-between px-8 border-b border-[#2d2d2d] bg-[#151515] shrink-0 sticky top-0 z-10 mx-6 mt-6 rounded-2xl">
            <div className="flex items-center space-x-6 text-[#a3a3a3]">
               <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="hover:text-white"><FiZoomOut size={16}/></button>
               <span className="text-xs font-semibold">{Math.round(scale * 100)}%</span>
               <button onClick={() => setScale(s => Math.min(3, s + 0.1))} className="hover:text-white"><FiZoomIn size={16}/></button>
            </div>

            <div className="flex items-center space-x-4 bg-[#111111] px-4 py-1.5 rounded-full border border-[#2d2d2d]">
               <button disabled={pageNumber <= 1} onClick={() => changePage(-1)} className="text-[#a3a3a3] hover:text-white disabled:opacity-30"><FiChevronLeft size={16} /></button>
               <span className="text-[10px] font-bold tracking-widest text-[#a3a3a3]">
                 PAGE <span className="text-white">{pageNumber}</span> OF {numPages || '--'}
               </span>
               <button disabled={pageNumber >= numPages} onClick={() => changePage(1)} className="text-[#a3a3a3] hover:text-white disabled:opacity-30"><FiChevronRight size={16} /></button>
            </div>

            <div className="flex items-center text-[10px] font-bold tracking-widest text-[#10b981]">
               <FiCheck className="mr-1.5" size={12} /> AUTO-SAVED
            </div>
         </div>

         {/* PDF Render Canvas inside deep dark mode container */}
         <div className="flex-1 overflow-y-auto px-6 pb-12 pt-8 flex justify-center custom-scrollbar">
            {book.fileUrl ? (
               <div className="pdf-dark-mode shadow-2xl rounded-lg">
                 <PDFRenderer 
                   fileUrl={book.fileUrl} 
                   pageNumber={pageNumber}
                   scale={scale}
                   onLoadSuccess={onDocumentLoadSuccess}
                 />
               </div>
            ) : (
               <div className="text-[#525252] text-sm mt-32">Document file cannot be loaded or is corrupted.</div>
            )}
         </div>
      </div>

      {/* RIGHT COLUMN: Auto-syncing Notes */}
      <div className="w-[320px] lg:w-[380px] bg-[#111111] border-l border-[#2d2d2d] flex flex-col shrink-0 p-6 z-10">
         <div className="mb-6">
            <h2 className="text-[#a3a3a3] text-[10px] font-bold tracking-widest mb-1.5 uppercase">Notes & Thoughts</h2>
            <p className="text-[#525252] text-xs font-medium italic min-h-[16px]">{saveStatus}</p>
         </div>

         <div className="flex-1 bg-[#151515] border border-[#2d2d2d] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
            {/* Rich Text Toolbar */}
            <div className="h-12 border-b border-[#2d2d2d] flex items-center justify-between px-4 bg-[#1a1a1a] shrink-0">
               <div className="flex space-x-3 text-[#737373]">
                  <button onClick={() => formatText('bold')} className="hover:text-white transition-colors" title="Bold"><FiType size={14} className="stroke-[3px]"/></button>
                  <button onClick={() => formatText('italic')} className="hover:text-white transition-colors" title="Italic"><FiEdit2 size={14} /></button>
               </div>
               <div className="flex items-center space-x-2">
                  <button onClick={() => formatText('foreColor', '#10b981')} className="w-3.5 h-3.5 rounded-full bg-[#10b981] hover:scale-110 transition-transform cursor-pointer" title="Green Font"></button>
                  <button onClick={() => formatText('foreColor', '#f5f5f5')} className="w-3.5 h-3.5 rounded-full bg-[#f5f5f5] hover:scale-110 transition-transform cursor-pointer" title="White Font"></button>
                  <button onClick={() => formatText('foreColor', '#a855f7')} className="w-3.5 h-3.5 rounded-full bg-[#a855f7] hover:scale-110 transition-transform cursor-pointer" title="Purple Font"></button>
               </div>
            </div>

            {/* Editable Canvas */}
            <div 
              ref={editorRef}
              contentEditable
              onInput={handleNoteInput}
              suppressContentEditableWarning
              placeholder="Type your next insight here..."
              className="rich-text-editor flex-1 overflow-y-auto p-5 text-sm text-[#d4d4d4] focus:outline-none leading-loose custom-scrollbar"
              style={{ minHeight: '100px' }}
            >
               {/* Content injected via ref on mount */}
            </div>
         </div>
      </div>
    </div>
  );
}
