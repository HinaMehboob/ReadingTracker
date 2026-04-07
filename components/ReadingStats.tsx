import { Stats } from "@/lib/types";

interface ReadingStatsProps {
  stats: Stats;
}

export default function ReadingStats({ stats }: ReadingStatsProps) {
  const { totalBooks, completedBooks, pagesRead } = stats;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Books */}
      <div className="bg-zinc-900 p-6 rounded-2xl shadow-xl border border-zinc-800 hover:border-zinc-700 transition-colors relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"></path></svg>
        </div>
        <div className="relative z-10">
          <h3 className="text-sm font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Total Library</h3>
          <div className="flex items-end space-x-3">
            <p className="text-4xl font-black text-white">{totalBooks}</p>
            <p className="text-sm font-medium text-zinc-500 mb-1 tracking-wide">Books</p>
          </div>
        </div>
      </div>
      
      {/* Completed Books */}
      <div className="bg-zinc-900 p-6 rounded-2xl shadow-xl border border-zinc-800 hover:border-zinc-700 transition-colors relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-emerald-500">
          <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
        </div>
        <div className="relative z-10">
          <h3 className="text-sm font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Completed</h3>
          <div className="flex items-end space-x-3">
            <p className="text-4xl font-black text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">{completedBooks}</p>
            <p className="text-sm font-medium text-emerald-900 mb-1 tracking-wide">Finished</p>
          </div>
        </div>
      </div>
      
      {/* Pages Read */}
      <div className="bg-zinc-900 p-6 rounded-2xl shadow-xl border border-zinc-800 hover:border-zinc-700 transition-colors relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-blue-500">
          <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path></svg>
        </div>
        <div className="relative z-10">
          <h3 className="text-sm font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Pages Read</h3>
          <div className="flex items-end space-x-3">
            <p className="text-4xl font-black text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.3)]">{pagesRead}</p>
            <p className="text-sm font-medium text-blue-900 mb-1 tracking-wide">Total</p>
          </div>
        </div>
      </div>
    </div>
  );
}
