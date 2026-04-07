import { useState } from 'react';
import { FiX, FiUpload, FiBookOpen } from 'react-icons/fi';
import { supabase } from '@/lib/supabase'; // Make sure this path is correct!

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookAdded: () => void;
}

export default function AddBookModal({ isOpen, onClose, onBookAdded }: AddBookModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    totalPages: '',
    genre: '',
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [bookFile, setBookFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImage(e.target.files[0]);
    }
  };

  const handleBookUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBookFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.author || !formData.totalPages || !bookFile) {
      setError('Title, author, total pages, and book file are required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 1. Upload the book file directly to Supabase Storage
      let bookFileUrl = '';
      if (bookFile) {
        const fileExt = bookFile.name.split('.').pop();
        const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('UPLOADS') // Using the 'UPLOADS' bucket we set up
          .upload(fileName, bookFile);

        if (uploadError) throw new Error(`Book upload failed: ${uploadError.message}`);

        const { data: publicUrlData } = supabase.storage
          .from('UPLOADS')
          .getPublicUrl(fileName);
          
        bookFileUrl = publicUrlData.publicUrl;
      }

      // 2. Upload the cover image directly to Supabase Storage
      let coverImageUrl = '';
      if (coverImage) {
        const fileExt = coverImage.name.split('.').pop();
        const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('UPLOADS')
          .upload(fileName, coverImage);

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('UPLOADS')
            .getPublicUrl(fileName);
          coverImageUrl = publicUrlData.publicUrl;
        }
      }

      // 3. Create the book record in the database
      const bookData = {
        ...formData,
        totalPages: parseInt(formData.totalPages),
        genre: formData.genre ? formData.genre.split(',').map(g => g.trim()) : [],
        fileUrl: bookFileUrl,
        coverImage: coverImageUrl || undefined,
      };

      const response = await fetch('/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add book');
      }

      // Reset form and close modal
      setFormData({
        title: '',
        author: '',
        description: '',
        totalPages: '',
        genre: '',
      });
      setCoverImage(null);
      setBookFile(null);
      onBookAdded();
      onClose();
    } catch (err) {
      console.error('Error adding book:', err);
      setError(err instanceof Error ? err.message : 'Failed to add book');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Add New Book</h2>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-1 rounded-md hover:bg-zinc-800 transition-colors"
              disabled={isLoading}
            >
              <FiX size={24} />
            </button>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-zinc-300 mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
                disabled={isLoading}
                placeholder="The Great Gatsby"
              />
            </div>

            <div>
              <label htmlFor="author" className="block text-sm font-medium text-zinc-300 mb-1.5">
                Author <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
                disabled={isLoading}
                placeholder="F. Scott Fitzgerald"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-zinc-300 mb-1.5">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={isLoading}
                placeholder="A story of the roaring twenties..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="totalPages" className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Total Pages <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="totalPages"
                  name="totalPages"
                  value={formData.totalPages}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  disabled={isLoading}
                  placeholder="250"
                />
              </div>

              <div>
                <label htmlFor="genre" className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Genres (csv)
                </label>
                <input
                  type="text"
                  id="genre"
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                  placeholder="Fiction, Drama"
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Cover Image
                </label>
                <label
                  htmlFor="cover-upload"
                  className="w-full flex flex-col items-center px-4 py-6 bg-zinc-950 text-blue-500 rounded-xl border-2 border-dashed border-zinc-800 cursor-pointer hover:bg-zinc-900 transition-colors"
                >
                  <FiUpload className="w-8 h-8 mb-2" />
                  <span className="text-sm font-medium text-zinc-400">
                    {coverImage ? coverImage.name : 'Upload cover (optional)'}
                  </span>
                  <input
                    id="cover-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isLoading}
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Book File <span className="text-red-500">*</span>
                </label>
                <label
                  htmlFor="book-upload"
                  className="w-full flex flex-col items-center px-4 py-6 bg-zinc-950 text-indigo-500 rounded-xl border-2 border-dashed border-zinc-800 cursor-pointer hover:bg-zinc-900 transition-colors"
                >
                  <FiBookOpen className="w-8 h-8 mb-2" />
                  <span className="text-sm font-medium text-zinc-400">
                    {bookFile ? bookFile.name : 'Upload PDF or EPUB'}
                  </span>
                  <input
                    id="book-upload"
                    type="file"
                    accept=".pdf,.epub,.mobi"
                    onChange={handleBookUpload}
                    className="hidden"
                    required
                    disabled={isLoading}
                  />
                </label>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-3 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors focus:outline-none"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-blue-500 disabled:opacity-50 transition-all flex items-center justify-center min-w-[120px]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Add Book'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}