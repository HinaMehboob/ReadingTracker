"use client";

import Link from "next/link";
import { Progress } from "../../components/ui/progress";
import { Badge } from "../../components/ui/badge";

const CATEGORY_COLORS: Record<string, string> = {
  "Self-help": "bg-purple-900/30 text-purple-400",
  "Personal Development": "bg-green-900/30 text-green-400",
  Psychological: "bg-pink-900/30 text-pink-400",
  Science: "bg-blue-900/30 text-blue-400",
  Default: "bg-gray-800 text-gray-400",
};

export function BookCard({
  id,
  title,
  author,
  progress,
  categories,
  status,
  pdfUrl,
}: any) {
  return (
    <Link href={`/reader/${id}?url=${encodeURIComponent(pdfUrl)}`}>
      <div className="bg-[#1a1a1a] p-5 rounded-xl border border-gray-800 hover:border-blue-600/50 transition-all cursor-pointer group flex flex-col h-[340px]">
        <div className="flex-1 bg-gradient-to-br from-black to-gray-900 rounded-lg mb-4 flex items-center justify-center border border-gray-800 overflow-hidden">
          <span className="text-[10px] text-gray-600 uppercase font-black tracking-[0.3em]">
            Cover
          </span>
        </div>

        <div className="space-y-1 mb-4">
          <Badge
            variant="secondary"
            className="bg-blue-600/20 text-blue-400 text-[9px] px-2 py-0 font-bold uppercase"
          >
            {status}
          </Badge>
          <h3 className="font-bold text-sm truncate group-hover:text-blue-400 transition-colors">
            {title}
          </h3>
          <p className="text-[10px] text-gray-500 uppercase font-bold">
            {author}
          </p>
        </div>

        <div className="space-y-1 mb-4">
          <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5 bg-gray-900" />
        </div>

        <div className="flex flex-wrap gap-1 mt-auto">
          {categories.map((cat: string) => (
            <Badge
              key={cat}
              className={`${
                CATEGORY_COLORS[cat] || CATEGORY_COLORS.Default
              } text-[8px] px-1.5 py-0 border-none`}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>
    </Link>
  );
}
