import { useState, useRef, useEffect } from 'react';
import { FiX, FiUpload, FiBookOpen, FiMenu, FiSearch } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';
import { DEFAULT_GENRE_COLORS, getGenreColor } from '@/lib/colors';

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
  });
  
  // Custom multi-select Notion genre state
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [isGenreOpen, setIsGenreOpen] = useState(false);
  const [genreSearch, setGenreSearch] = useState('');
  
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [bookFile, setBookFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsGenreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setCoverImage(e.target.files[0]);
  };

  const handleBookUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setBookFile(e.target.files[0]);
  };

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
    setGenreSearch('');
  };

  const availableOptions = Object.keys(DEFAULT_GENRE_COLORS)
    .filter(g => g.toLowerCase().includes(genreSearch.toLowerCase()));

  const showCreateOption = genreSearch.trim().length > 0 && 
    !Object.keys(DEFAULT_GENRE_COLORS).some(g => g.toLowerCase() === genreSearch.toLowerCase().trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.author || !formData.totalPages || !bookFile) {
      setError('Title, author, total pages, and book file are required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let bookFileUrl = '';
      if (bookFile) {
        const fileExt = bookFile.name.split('.').pop();
        const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('UPLOADS')
          .upload(fileName, bookFile);

        if (uploadError) throw new Error(`Book upload failed: ${uploadError.message}`);
        const { data: publicUrlData } = supabase.storage.from('UPLOADS').getPublicUrl(fileName);
        bookFileUrl = publicUrlData.publicUrl;
      }

      let coverImageUrl = '';
      if (coverImage) {
        const fileExt = coverImage.name.split('.').pop();
        const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('UPLOADS')
          .upload(fileName, coverImage);

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage.from('UPLOADS').getPublicUrl(fileName);
          coverImageUrl = publicUrlData.publicUrl;
        }
      }

      const bookData = {
        ...formData,
        totalPages: parseInt(formData.totalPages),
        genre: selectedGenres, // Map the array directly
        fileUrl: bookFileUrl,
        coverImage: coverImageUrl || undefined,
      };

      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add book');
      }

      setFormData({ title: '', author: '', description: '', totalPages: '' });
      setSelectedGenres([]);
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
      <div className="bg-[#191919] border border-[#2d2d2d] rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl custom-scrollbar">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Add New Book</h2>
            <button
              onClick={onClose}
              className="text-[#a3a3a3] hover:text-white p-1 rounded-md hover:bg-[#2d2d2d] transition-colors"
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
              <label htmlFor="title" className="block text-sm font-medium text-[#a3a3a3] mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-[#111111] border border-[#2d2d2d] rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500"
                required disabled={isLoading} placeholder="The Great Gatsby"
              />
            </div>

            <div>
              <label htmlFor="author" className="block text-sm font-medium text-[#a3a3a3] mb-1.5">
                Author <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-[#111111] border border-[#2d2d2d] rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500"
                required disabled={isLoading} placeholder="F. Scott Fitzgerald"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="totalPages" className="block text-sm font-medium text-[#a3a3a3] mb-1.5">
                  Total Pages <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="totalPages"
                  name="totalPages"
                  value={formData.totalPages}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-2 bg-[#111111] border border-[#2d2d2d] rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500"
                  required disabled={isLoading} placeholder="250"
                />
              </div>

              <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-medium text-[#a3a3a3] mb-1.5">Genres</label>
                <div 
                  onClick={() => !isLoading && setIsGenreOpen(true)}
                  className="w-full min-h-[42px] px-3 py-1.5 bg-[#111111] border border-[#2d2d2d] rounded-xl cursor-text flex flex-wrap gap-1.5 items-center"
                >
                  {selectedGenres.length === 0 ? (
                    <span className="text-zinc-600 px-1 text-sm">Select...</span>
                  ) : (
                    selectedGenres.map(g => {
                      const color = getGenreColor(g);
                      return (
                        <span key={g} className={`${color.bg} ${color.text} border ${color.border} px-1.5 py-0.5 rounded text-[11px] font-medium flex items-center`}>
                           {g}
                           <button onClick={(e) => { e.stopPropagation(); toggleGenre(g); }} className="ml-1 opacity-70 hover:opacity-100"><FiX size={10}/></button>
                        </span>
                      );
                    })
                  )}
                </div>

                {/* The Notion style Custom Selector Popup */}
                {isGenreOpen && (
                  <div className="absolute top-[calc(100%+4px)] left-0 w-[240px] max-w-[280px] z-50 bg-[#252528] border border-[#3f3f46] rounded-md shadow-xl overflow-hidden text-sm flex flex-col max-h-[300px]">
                    <div className="flex items-center px-3 border-b border-[#3f3f46]">
                       <FiSearch className="text-[#a3a3a3] mr-2" size={14} />
                       <input 
                         type="text" 
                         autoFocus
                         className="flex-1 bg-transparent text-white outline-none py-2 text-xs placeholder-[#737373]" 
                         placeholder="Search for an option..."
                         value={genreSearch}
                         onChange={e => setGenreSearch(e.target.value)}
                       />
                    </div>
                    
                    <div className="text-[10px] uppercase font-bold text-[#737373] px-3 py-1.5 bg-[#202020]">
                      Select an option {showCreateOption ? 'or create one' : ''}
                    </div>

                    <div className="flex-1 overflow-y-auto px-1 py-1 custom-scrollbar">
                      {showCreateOption && (
                        <div 
                          className="flex items-center px-2 py-1.5 hover:bg-[#3f3f46] rounded cursor-pointer group"
                          onClick={() => toggleGenre(genreSearch.trim())}
                        >
                          <span className="text-xs text-white">Create <strong className="font-semibold px-2 py-0.5 bg-[#3f3f46] group-hover:bg-[#191919] rounded ml-1">"{genreSearch}"</strong></span>
                        </div>
                      )}
                      
                      {availableOptions.map(gOption => {
                         const titleCase = gOption.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                         const isSelected = selectedGenres.includes(titleCase);
                         if (isSelected) return null; // Hide already selected from list

                         const color = getGenreColor(gOption);
                         return (
                           <div 
                             key={gOption}
                             className="flex items-center px-2 py-1.5 hover:bg-[#3f3f46] rounded cursor-pointer group transition-colors"
                             onClick={() => toggleGenre(titleCase)}
                           >
                             <FiMenu className="text-[#737373] mr-2 hidden group-hover:block" size={12} />
                             <span className="text-[#737373] mr-2 group-hover:hidden px-[6px]">≡</span>
                             <span className={`${color.bg} ${color.text} border ${color.border} px-1.5 py-[1px] rounded text-[11px] font-medium`}>
                               {titleCase}
                             </span>
                           </div>
                         );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-[#a3a3a3] mb-1.5">Description (Initial Note)</label>
              <textarea
                id="description" name="description" value={formData.description} onChange={handleChange} rows={2}
                className="w-full px-4 py-2 bg-[#111111] border border-[#2d2d2d] rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 resize-none font-sans"
                disabled={isLoading} placeholder="Any thoughts..."
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#a3a3a3] mb-1.5">Cover Image</label>
                <label className="w-full flex flex-col items-center px-4 py-5 bg-[#111111]/50 text-blue-500 rounded-xl border border-dashed border-[#3f3f46] cursor-pointer hover:bg-[#191919] transition-colors">
                  <span className="text-xs font-semibold text-[#a3a3a3] mb-1">
                    {coverImage ? coverImage.name : 'Click to upload cover image'}
                  </span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isLoading} />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#a3a3a3] mb-1.5">Book File <span className="text-red-500">*</span></label>
                <label className="w-full flex flex-col items-center px-4 py-5 bg-[#111111]/50 text-indigo-500 rounded-xl border border-dashed border-[#3f3f46] cursor-pointer hover:bg-[#191919] transition-colors">
                  <span className="text-xs font-semibold text-[#a3a3a3] mb-1">
                    {bookFile ? bookFile.name : 'Click to upload PDF or EPUB'}
                  </span>
                  <input type="file" accept=".pdf,.epub,.mobi" onChange={handleBookUpload} className="hidden" required disabled={isLoading} />
                </label>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-3 pt-4 border-t border-[#2d2d2d]">
              <button
                type="button" onClick={onClose} disabled={isLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium text-[#a3a3a3] hover:text-white hover:bg-[#2d2d2d] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit" disabled={isLoading}
                className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all min-w-[100px] flex items-center justify-center"
              >
                {isLoading ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Add Book'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}