export interface Book {
  _id: string;
  title: string;
  author: string;
  description?: string;
  coverImage?: string;
  fileUrl: string;
  totalPages: number;
  genre: string[];
  status: 'to-read' | 'in-progress' | 'completed';
  userId: string;
  createdAt: string;
  updatedAt: string;
  readingProgress?: ReadingProgress;
}

export interface ReadingProgress {
  _id: string;
  bookId: string;
  userId: string;
  currentPage: number;
  lastRead: string;
  completed: boolean;
  notes: Note[];
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  _id: string;
  pageNumber: number;
  content: string;
  createdAt: string;
}

export interface Stats {
  totalBooks: number;
  completedBooks: number;
  pagesRead: number;
}
