"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Book } from '@/lib/types';
import { FiClock, FiGrid } from 'react-icons/fi';
import { getGenreColor } from '@/lib/colors';

export default function TrackerChart({ books }: { books: Book[] }) {
  // Chart 1 Logic (Status) - Mapped dynamically by current progress to remain in sync with BookCards
  const getProgress = (b: Book) => b.readingProgress && b.totalPages > 0 
    ? (b.readingProgress.currentPage / b.totalPages) * 100 
    : 0;

  const completed = books.filter(b => getProgress(b) >= 100).length;
  const reading = books.filter(b => getProgress(b) > 0 && getProgress(b) < 100).length;
  const toRead = books.filter(b => getProgress(b) === 0).length;
  const total = books.length;
  
  const statusData = [
    { name: 'Completed', value: completed, color: '#10b981' },
    { name: 'Reading', value: reading, color: '#3b82f6' },
    { name: 'To Read', value: toRead, color: '#d946ef' }
  ].filter(d => d.value > 0);

  if (statusData.length === 0) {
    statusData.push({ name: 'Empty', value: 1, color: '#3f3f46' });
  }

  // Chart 2 Logic (Categories/Genres)
  const categoryCounts: Record<string, number> = {};
  books.forEach(book => {
    if (book.genre && book.genre.length > 0) {
      book.genre.forEach(g => {
        const cat = g.trim();
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
    } else {
      categoryCounts['Uncategorized'] = (categoryCounts['Uncategorized'] || 0) + 1;
    }
  });

  const categoryData = Object.entries(categoryCounts)
    .map(([name, value]) => ({
      name,
      value,
      color: getGenreColor(name).chart
    }))
    .filter(d => d.value > 0);

  if (categoryData.length === 0) {
    categoryData.push({ name: 'Empty', value: 1, color: '#3f3f46' });
  }

  return (
    <div className="flex flex-col space-y-6 h-full">
      {/* Chart 1: Status */}
      <div className="bg-[#191919] border border-[#2d2d2d] rounded-xl p-6 relative flex flex-col min-h-[300px]">
        <div className="flex items-center space-x-2 text-[#a3a3a3] mb-6">
          <FiClock size={16} />
          <h2 className="text-sm font-medium">Status Chart</h2>
        </div>

        <div className="flex-1 flex items-center justify-center relative min-h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                stroke="none"
                dataKey="value"
                paddingAngle={2}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-4xl font-semibold text-white">{total}</span>
            <span className="text-xs text-[#a3a3a3] mt-1">Total</span>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          {total > 0 && statusData.map(d => (
            <div key={d.name} className="flex items-center text-xs text-[#a3a3a3]">
              <div className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: d.color }}></div>
              {d.name}
            </div>
          ))}
        </div>
      </div>

      {/* Chart 2: Categories */}
      <div className="bg-[#191919] border border-[#2d2d2d] rounded-xl p-6 relative flex flex-col min-h-[300px]">
        <div className="flex items-center space-x-2 text-[#a3a3a3] mb-6">
          <FiGrid size={16} />
          <h2 className="text-sm font-medium">Categories Chart</h2>
        </div>

        <div className="flex-1 flex items-center justify-center relative min-h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                stroke="none"
                dataKey="value"
                paddingAngle={2}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
             <span className="text-3xl font-semibold text-white">{Object.keys(categoryCounts).length}</span>
             <span className="text-[10px] text-[#a3a3a3] mt-1">Genres</span>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          {total > 0 && categoryData.map(d => (
            <div key={d.name} className="flex items-center text-[11px] text-[#a3a3a3]">
              <div className="w-2 h-2 rounded-full mr-1.5 shrink-0" style={{ backgroundColor: d.color }}></div>
              {d.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
