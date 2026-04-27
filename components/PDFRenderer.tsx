"use client";

import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.4.296/build/pdf.worker.min.mjs';
}

interface PDFRendererProps {
  fileUrl: string;
  pageNumber: number;
  scale: number;
  onLoadSuccess: ({ numPages }: { numPages: number }) => void;
}

export default function PDFRenderer({ fileUrl, pageNumber, scale, onLoadSuccess }: PDFRendererProps) {
  return (
    <Document 
      file={fileUrl} 
      onLoadSuccess={onLoadSuccess}
      onLoadError={(err) => console.error("PDF Load Error:", err)}
      loading={<div className="text-[#a3a3a3] text-sm animate-pulse tracking-wide mt-32">Initializing Local Reading Engine...</div>}
      error={() => <div className="text-red-500 text-sm mt-32">Failed to load the document engine.</div>}
    >
      <Page 
        pageNumber={pageNumber} 
        scale={scale} 
        renderTextLayer={true} 
        renderAnnotationLayer={true}
        className="rounded-lg overflow-hidden border border-[#2d2d2d] drop-shadow-2xl" 
      />
    </Document>
  );
}
