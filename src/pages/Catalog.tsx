import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import ScrollToTop from '@/components/ScrollToTop';
import CatalogHeader from '@/components/catalog/CatalogHeader';
import CatalogFilters from '@/components/catalog/CatalogFilters';
import CatalogGrid from '@/components/catalog/CatalogGrid';
import CatalogPagination from '@/components/catalog/CatalogPagination';

interface Manhwa {
  id: number;
  title: string;
  cover: string;
  chapters: number;
  rating: number;
  status: string;
  genre: string[];
  views: number;
  year?: number;
  author?: string;
}

const API_URL = 'https://functions.poehali.dev/4e8cb1b6-88f9-43e5-89db-ab75bfa82345';
const BOOKMARKS_API = 'https://functions.poehali.dev/64b9299a-9048-4727-b686-807ace50e7e1';

const getUserId = () => {
  let userId = localStorage.getItem('manhwa_user_id');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('manhwa_user_id', userId);
  }
  return userId;
};

export default function Catalog() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [searchQuery, setSearchQuery] = useState('');
  const [manhwaList, setManhwaList] = useState<Manhwa[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    }
    fetchManhwa();
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const response = await fetch(BOOKMARKS_API, {
        headers: {
          'X-User-Id': getUserId()
        }
      });
      const data = await response.json();
      
      if (data.bookmarks) {
        const bookmarkIds = new Set(data.bookmarks.map((b: any) => b.manhwa_id));
        setBookmarks(bookmarkIds);
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const toggleBookmark = async (manhwaId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const isBookmarked = bookmarks.has(manhwaId);
    
    try {
      if (isBookmarked) {
        await fetch(`${BOOKMARKS_API}?manhwa_id=${manhwaId}`, {
          method: 'DELETE',
          headers: {
            'X-User-Id': getUserId()
          }
        });
        setBookmarks(prev => {
          const newSet = new Set(prev);
          newSet.delete(manhwaId);
          return newSet;
        });
      } else {
        await fetch(BOOKMARKS_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': getUserId()
          },
          body: JSON.stringify({ manhwa_id: manhwaId })
        });
        setBookmarks(prev => new Set(prev).add(manhwaId));
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const fetchManhwa = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      
      if (data.manhwa) {
        const manhwaData = data.manhwa.map((m: any) => ({
          id: m.id,
          title: m.title,
          cover: m.cover_url,
          chapters: m.chapter_count || 0,
          rating: m.rating || 0,
          status: m.status || 'ongoing',
          genre: m.genres || [],
          views: m.views || 0,
          year: m.year || 2024,
          author: m.author || 'Неизвестен'
        }));
        
        setManhwaList(manhwaData);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching manhwa:', error);
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSelectedGenres([]);
    setSelectedType('all');
    setSelectedStatus('all');
    setSelectedYear('all');
    setMinRating(0);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const filteredManhwa = manhwaList.filter(m => {
    const matchesSearch = searchQuery ? m.title.toLowerCase().includes(searchQuery.toLowerCase()) : true;
    const matchesGenres = selectedGenres.length > 0 ? selectedGenres.some(g => m.genre.includes(g)) : true;
    const matchesType = selectedType === 'all' ? true : m.status === selectedType;
    const matchesStatus = selectedStatus === 'all' ? true : m.status === selectedStatus;
    const matchesYear = selectedYear === 'all' ? true : m.year === parseInt(selectedYear);
    const matchesRating = m.rating >= minRating;
    return matchesSearch && matchesGenres && matchesType && matchesStatus && matchesYear && matchesRating;
  });

  const sortedManhwa = [...filteredManhwa].sort((a, b) => {
    switch (sortBy) {
      case 'rating': return b.rating - a.rating;
      case 'views': return b.views - a.views;
      case 'title': return a.title.localeCompare(b.title);
      case 'updated': return b.id - a.id;
      case 'year': return (b.year || 0) - (a.year || 0);
      case 'chapters': return b.chapters - a.chapters;
      default: return 0;
    }
  });

  const totalPages = Math.ceil(sortedManhwa.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedManhwa = sortedManhwa.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Icon name="Loader2" size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CatalogHeader
        theme={theme}
        searchQuery={searchQuery}
        onThemeToggle={toggleTheme}
        onSearchChange={setSearchQuery}
      />

      <main className="container px-4 py-6">
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          <aside className={`space-y-4 ${!showFilters && 'hidden lg:block'}`}>
            <CatalogFilters
              searchQuery={searchQuery}
              selectedGenres={selectedGenres}
              selectedType={selectedType}
              selectedStatus={selectedStatus}
              selectedYear={selectedYear}
              sortBy={sortBy}
              minRating={minRating}
              onSearchChange={setSearchQuery}
              onGenreToggle={toggleGenre}
              onTypeChange={setSelectedType}
              onStatusChange={setSelectedStatus}
              onYearChange={setSelectedYear}
              onSortChange={setSortBy}
              onRatingChange={setMinRating}
              onReset={resetFilters}
            />
          </aside>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                Найдено: {sortedManhwa.length} {sortedManhwa.length === 1 ? 'тайтл' : 'тайтлов'}
              </h2>
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Icon name="SlidersHorizontal" size={16} className="mr-2" />
                Фильтры
              </Button>
            </div>

            <CatalogPagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={sortedManhwa.length}
              startIndex={startIndex}
              endIndex={endIndex}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />

            <CatalogGrid
              manhwaList={paginatedManhwa}
              bookmarks={bookmarks}
              selectedGenres={selectedGenres}
              onBookmarkToggle={toggleBookmark}
              onGenreToggle={toggleGenre}
              onResetFilters={resetFilters}
            />

            <CatalogPagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={sortedManhwa.length}
              startIndex={startIndex}
              endIndex={endIndex}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        </div>
      </main>
      <ScrollToTop />
    </div>
  );
}
