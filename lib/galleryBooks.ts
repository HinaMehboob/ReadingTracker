export interface GalleryBook {
  _id: string; // Fake ID for the gallery
  title: string;
  author: string;
  description: string;
  genre: string[];
  totalPages: number;
  fileUrl: string;       // User must provide links to their PDFs
  coverImage?: string;   // User must provide links to their cover images
}

export const GALLERY_BOOKS: GalleryBook[] = [
  {
    _id: "gallery-1",
    title: "Example Mock Book 1",
    author: "Author Name",
    description: "This is a placeholder for a pre-stored book. Please replace the fileUrl below.",
    genre: ["Fiction", "Classic"],
    totalPages: 300,
    fileUrl: "https://your-supabase-url.com/book1.pdf", // TODO: Update this
    coverImage: "https://your-supabase-url.com/cover1.jpg" // TODO: Update this
  },
  {
    _id: "gallery-2",
    title: "Example Mock Book 2",
    author: "Author Name",
    description: "This is a placeholder for a pre-stored book. Please replace the fileUrl below.",
    genre: ["Non-Fiction", "Science"],
    totalPages: 250,
    fileUrl: "https://your-supabase-url.com/book2.pdf", // TODO: Update this
    coverImage: "https://your-supabase-url.com/cover2.jpg" // TODO: Update this
  },
  // Add up to 20 books here following this exact structure!
];
