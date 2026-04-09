import Link from "next/link";
import { Book } from "@/lib/types";

interface FeaturedBookProps {
  books: Book[];
}

export default function FeaturedBook({ books }: FeaturedBookProps) {
  const readingBooks = books.filter(b => {
    const progress = b.readingProgress && b.totalPages > 0 
      ? (b.readingProgress.currentPage / b.totalPages) * 100 
      : 0;
    return progress > 0 && progress < 100;
  });

  if (readingBooks.length === 0) return null;

  const featured = readingBooks[0];
  const progress = featured.readingProgress && featured.totalPages > 0 
      ? (featured.readingProgress.currentPage / featured.totalPages) * 100 
      : 0;

  return (
    <div id="featured" className="bg-[#191919] border border-[#2d2d2d] rounded-xl overflow-hidden flex flex-col md:flex-row relative">
      <div className="md:w-[240px] h-[300px] bg-[#111111] flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-[#2d2d2d] shrink-0">
        {featured.coverImage ? (
          <img src={featured.coverImage} alt={featured.title} className="max-w-full max-h-full object-contain drop-shadow-lg rounded" />
        ) : (
          <div className="text-[#a3a3a3] text-sm flex flex-col items-center opacity-50">
             <span>No Cover</span>
          </div>
        )}
      </div>

      <div className="p-8 flex flex-col flex-1 justify-center relative">
        <div className="inline-block px-2 py-[3px] bg-[#1e3a8a]/70 text-blue-300 text-[10px] font-bold rounded-sm shadow-sm tracking-widest uppercase border border-blue-900/50 mb-4 self-start">
          Currently Reading
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2 leading-tight tracking-tight">{featured.title}</h2>
        <p className="text-sm text-[#a3a3a3] mb-8">{featured.author}</p>

        <div className="mb-8 max-w-md w-full">
           <div className="flex justify-between text-xs text-[#a3a3a3] mb-2 font-medium">
             <span>{Math.round(progress)}% Completed</span>
             <span>{featured.readingProgress?.currentPage} / {featured.totalPages} pages</span>
           </div>
           <div className="w-full bg-[#2d2d2d] h-2 rounded-full overflow-hidden">
             <div className="h-full bg-[#3b82f6]" style={{ width: `${progress}%` }} />
           </div>
        </div>

        <Link
          href={`/read/${featured._id}`}
          className="bg-[#2563eb] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#1d4ed8] transition-colors self-start shadow-sm border border-[#3b82f6]/50 inline-flex items-center space-x-2"
        >
          <span>Resume Reading</span>
          <span className="text-lg leading-none">&rarr;</span>
        </Link>
      </div>
    </div>
  );
}
