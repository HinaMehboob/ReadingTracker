"use client";

import { useSearchParams } from "next/navigation";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

export default function ReaderPage() {
  const searchParams = useSearchParams();
  const pdfUrl = searchParams.get("url");

  const handlePageChange = (e: any) => {
    if (pdfUrl) {
      localStorage.setItem(`progress-${pdfUrl}`, e.currentPage.toString());
    }
  };

  if (!pdfUrl)
    return (
      <div className="p-10 text-white font-mono text-xs uppercase">
        Loading PDF Reader...
      </div>
    );

  return (
    <div className="h-screen w-full bg-black flex flex-col">
      <div className="p-4 bg-[#111] border-b border-gray-800 flex justify-between items-center">
        <button
          onClick={() => window.history.back()}
          className="text-[10px] text-gray-500 hover:text-white uppercase font-bold tracking-widest"
        >
          ← Back to Dashboard
        </button>
      </div>
      <div className="flex-1">
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
          <Viewer
            fileUrl={pdfUrl}
            onPageChange={handlePageChange}
            initialPage={parseInt(
              localStorage.getItem(`progress-${pdfUrl}`) || "0"
            )}
          />
        </Worker>
      </div>
    </div>
  );
}
