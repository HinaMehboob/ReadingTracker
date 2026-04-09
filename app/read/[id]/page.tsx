"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Book } from "@/lib/types";
import { FiArrowLeft, FiList, FiZoomIn, FiZoomOut, FiChevronLeft, FiChevronRight, FiCheck, FiType, FiEdit2, FiSun, FiMoon, FiSend, FiMaximize2, FiMinimize2 } from "react-icons/fi";
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
  const [scale, setScale] = useState<number>(1.0);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  
  // Note State
  const editorRef = useRef<HTMLDivElement>(null);
  const [saveStatus, setSaveStatus] = useState<"Auto-saved" | "Saving..." | "">("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Chat State
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Keyboard controls for navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default arrow key behavior when focused on input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch(e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          changePage(-1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          changePage(1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          // Scroll up the PDF container
          const pdfContainer = document.querySelector('.custom-scrollbar');
          if (pdfContainer) {
            pdfContainer.scrollTop -= 100;
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          // Scroll down the PDF container
          const pdfContainer2 = document.querySelector('.custom-scrollbar');
          if (pdfContainer2) {
            pdfContainer2.scrollTop += 100;
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [numPages]);

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = { role: 'user' as const, content: chatInput.trim() };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error connecting to the AI. Check your API key or connection.' }]);
    } finally {
      setIsChatLoading(false);
    }
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

      {/* CENTER COLUMN: Reader Engine */}
      <div className="flex-1 flex flex-col bg-[#161616] relative">
         {/* Layout Master Header */}
         <div className="h-20 flex items-center justify-between px-8 border-b border-[#2d2d2d] bg-[#151515] shrink-0 sticky top-0 z-10 mx-6 mt-6 rounded-2xl shadow-xl">
            
            {/* Left Header Section */}
            <div className="flex items-center space-x-6 z-20 relative">
               <Link href="/" className="flex items-center justify-center w-10 h-10 bg-[#111111] hover:bg-[#1f1f1f] border border-[#2d2d2d] rounded-full text-[#a3a3a3] hover:text-white transition-colors cursor-pointer group" title="Back to Library">
                  <FiArrowLeft className="group-hover:-translate-x-0.5 transition-transform" size={18} />
               </Link>
               <h1 className="text-white font-bold text-lg leading-tight tracking-tight flex items-center max-w-[200px] xl:max-w-[400px]">
                  <span className="w-1.5 h-6 bg-[#10b981] rounded-full mr-4 inline-block shrink-0"></span>
                  <span className="truncate" title={book.title}>{book.title}</span>
               </h1>
            </div>

            {/* Center Section: Pagination */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center space-x-4 bg-[#111111] px-5 py-2.5 rounded-full border border-[#2d2d2d] shadow-inner font-mono">
               <button disabled={pageNumber <= 1} onClick={() => changePage(-1)} className="text-[#a3a3a3] hover:text-white disabled:opacity-30 transition-colors"><FiChevronLeft size={16} /></button>
               <span className="text-[10px] font-bold tracking-widest text-[#a3a3a3]">
                 PAGE <span className="text-white">{pageNumber}</span> OF {numPages || '--'}
               </span>
               <button disabled={pageNumber >= numPages} onClick={() => changePage(1)} className="text-[#a3a3a3] hover:text-white disabled:opacity-30 transition-colors"><FiChevronRight size={16} /></button>
            </div>

            {/* Right Section: Tools */}
            <div className="flex items-center space-x-6 text-[#a3a3a3] z-20 relative">
                <div className="hidden lg:block w-px h-6 bg-[#2d2d2d]"></div>
                
                <div className="flex items-center space-x-4">
                   <button onClick={() => setScale(s => Math.max(0.5, +(s - 0.1).toFixed(1)))} className="hover:text-white transition-colors" title="Zoom Out"><FiZoomOut size={16}/></button>
                   <span className="text-[11px] font-semibold w-10 text-center text-white">{Math.round(scale * 100)}%</span>
                   <button onClick={() => setScale(s => Math.min(1.5, +(s + 0.1).toFixed(1)))} className="hover:text-white transition-colors" title="Zoom In"><FiZoomIn size={16}/></button>
                </div>

                <div className="w-px h-6 bg-[#2d2d2d]"></div>

                <button onClick={() => setIsSidebarVisible(!isSidebarVisible)} className="w-9 h-9 rounded-full flex items-center justify-center bg-[#111111] border border-[#2d2d2d] hover:bg-[#1f1f1f] hover:text-white transition-colors" title="Toggle Sidebar">
                  {isSidebarVisible ? <FiChevronRight size={14}/> : <FiChevronLeft size={14}/>}
                </button>

                <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-9 h-9 rounded-full flex items-center justify-center bg-[#111111] border border-[#2d2d2d] hover:bg-[#1f1f1f] hover:text-white transition-colors" title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}>
                  {isDarkMode ? <FiSun size={14}/> : <FiMoon size={14}/>}
                </button>
            </div>
         </div>

          {/* PDF Render Canvas inside deep dark mode container */}
          <div className={`flex-1 overflow-y-auto px-2 pb-8 pt-4 flex justify-center custom-scrollbar ${!isDarkMode && 'bg-[#e5e5e5] rounded-b-2xl mix-blend-screen'}`}>
             {book.fileUrl ? (
                <div className={`${isDarkMode ? 'pdf-dark-mode' : 'bg-white ring-1 ring-black/5'} transition-all duration-300 w-full max-w-full h-fit flex justify-center`}>
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

      {/* RIGHT COLUMN: Auto-syncing Notes & Chatbot */}
      {isSidebarVisible && (
      <div className="w-[320px] lg:w-[380px] bg-[#111111] border-l border-[#2d2d2d] flex flex-col shrink-0 p-6 z-10 gap-6 overflow-hidden animate-in slide-in-from-right duration-300">
         
         {/* TOP HALF: Notes Engine */}
         {!isChatExpanded && (
           <div className="flex-1 flex flex-col min-h-0 animate-in fade-in duration-300">
               <div className="mb-4 shrink-0 flex items-center justify-between">
                  <h2 className="text-[#a3a3a3] text-[10px] font-bold tracking-widest uppercase items-center flex">
                     <FiEdit2 className="mr-1.5 stroke-[2px]" size={12} /> NOTES & THOUGHTS
                  </h2>
                  <span className="text-[#10b981] text-[10px] font-bold tracking-widest">{saveStatus}</span>
               </div>

               <div className="flex-1 bg-[#151515] border border-[#2d2d2d] rounded-2xl flex flex-col overflow-hidden shadow-2xl min-h-0">
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
                    placeholder="Type your insights here..."
                    className="rich-text-editor flex-1 overflow-y-auto p-5 text-sm text-[#d4d4d4] focus:outline-none leading-loose custom-scrollbar"
                  ></div>
               </div>
           </div>
         )}

         {/* BOTTOM HALF: AI Chatbot */}
         <div className="flex-1 flex flex-col min-h-0 transition-all duration-300">
             <div className="mb-4 shrink-0">
                <button onClick={() => setIsChatExpanded(!isChatExpanded)} className="text-[#a3a3a3] hover:text-white flex items-center text-[10px] font-bold tracking-widest uppercase transition-colors" title={isChatExpanded ? "Restore Size" : "Expand Chat"}>
                   {isChatExpanded ? <FiMinimize2 className="mr-1.5 stroke-[2px]" size={14} /> : <FiMaximize2 className="mr-1.5 stroke-[2px]" size={14} />}
                   AI READING ASSISTANT
                </button>
             </div>

             <div className="flex-1 bg-[#151515] border border-[#2d2d2d] rounded-2xl flex flex-col overflow-hidden shadow-2xl min-h-0 relative">
                {/* Chat Message History */}
                <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                   {messages.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-center px-4 animate-in fade-in duration-500">
                         <div className="w-10 h-10 rounded-full bg-[#10b981]/10 flex items-center justify-center mb-3">
                            <FiType className="text-[#10b981] stroke-[3px]" size={18} />
                         </div>
                         <p className="text-xs text-[#737373] leading-relaxed">Ask me for a summary, word definition, or conceptual explanation while you read.</p>
                      </div>
                   )}
                   
                   {messages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 fade-in duration-300`}>
                         <div className={`max-w-[85%] rounded-xl px-4 py-3 text-[13px] leading-relaxed break-words ${
                            msg.role === 'user' 
                            ? 'bg-[#10b981] text-emerald-950 rounded-br-none font-medium selection:bg-black/20' 
                            : 'bg-[#222222] border border-[#2d2d2d] text-[#d4d4d4] rounded-bl-none shadow-sm'
                         }`}>
                            {msg.content.split('\n').map((line, j) => {
                               // Inline Markdown Bold Parser
                               const parts = line.split(/(\*\*.*?\*\*)/g);
                               return (
                                  <p key={j} className="mb-1.5 last:mb-0">
                                     {parts.map((p, k) => 
                                        p.startsWith('**') && p.endsWith('**') 
                                        ? <strong key={k} className="font-bold text-white tracking-wide">{p.slice(2, -2)}</strong> 
                                        : <span key={k}>{p}</span>
                                     )}
                                  </p>
                               )
                            })}
                         </div>
                      </div>
                   ))}
                   
                   {isChatLoading && (
                      <div className="flex justify-start">
                         <div className="bg-[#222222] border border-[#2d2d2d] rounded-xl rounded-bl-none px-4 py-3 shadow-sm">
                            <div className="flex space-x-1.5 items-center justify-center h-4">
                               <div className="w-1.5 h-1.5 bg-[#525252] rounded-full animate-bounce"></div>
                               <div className="w-1.5 h-1.5 bg-[#525252] rounded-full animate-bounce" style={{animationDelay:'150ms'}}></div>
                               <div className="w-1.5 h-1.5 bg-[#525252] rounded-full animate-bounce" style={{animationDelay:'300ms'}}></div>
                            </div>
                         </div>
                      </div>
                   )}
                </div>

                {/* Chat Input Field */}
                <form onSubmit={handleSendMessage} className="shrink-0 border-t border-[#2d2d2d] p-3 bg-[#1a1a1a]">
                   <div className="relative flex items-center">
                      <input 
                         type="text" 
                         value={chatInput}
                         onChange={e => setChatInput(e.target.value)}
                         placeholder="Ask AI anything..."
                         disabled={isChatLoading}
                         className="w-full bg-[#111111] border border-[#2d2d2d] text-sm text-[#e5e5e5] placeholder:text-[#525252] rounded-full pl-4 pr-[46px] py-2.5 outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/50 transition-all disabled:opacity-50"
                      />
                      <button 
                         type="submit" 
                         disabled={!chatInput.trim() || isChatLoading}
                         className="absolute right-1.5 p-1.5 bg-[#10b981] hover:bg-emerald-400 text-emerald-950 rounded-full transition-colors disabled:opacity-50 disabled:bg-[#333333] disabled:text-[#737373]"
                      >
                         <FiSend size={15} className="-ml-[1px]" />
                      </button>
                   </div>
                </form>
             </div>
         </div>
      </div>
      )}
    </div>
  );
}
