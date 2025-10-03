import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import ScrollToTop from '@/components/ScrollToTop';
import IndexHeader from '@/components/index/IndexHeader';
import IndexFilters from '@/components/index/IndexFilters';
import IndexSections from '@/components/index/IndexSections';
import IndexFooter from '@/components/index/IndexFooter';
import ManhwaCard from '@/components/index/ManhwaCard';

interface Manhwa {
  id: number;
  title: string;
  cover: string;
  chapters: number;
  rating: number;
  status: string;
  genre: string[];
  views: number;
  updated_at?: string;
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

export default function Index() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [contentType, setContentType] = useState<'manhwa' | 'novels'>('manhwa');
  const [searchQuery, setSearchQuery] = useState('');
  const [popularManhwa, setPopularManhwa] = useState<Manhwa[]>([]);
  const [currentlyReading, setCurrentlyReading] = useState<Manhwa[]>([]);
  const [recentlyUpdated, setRecentlyUpdated] = useState<Manhwa[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      setTheme('dark');
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.add('dark');
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
          views: m.views || 0
        }));
        
        const sortedByRating = [...manhwaData].sort((a, b) => b.rating - a.rating);
        const sortedByViews = [...manhwaData].sort((a, b) => b.views - a.views);
        const sortedByDate = [...manhwaData].sort((a, b) => 
          new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()
        );
        
        setPopularManhwa(sortedByRating.slice(0, 5));
        setCurrentlyReading(sortedByViews.slice(0, 12));
        setRecentlyUpdated(sortedByDate.slice(0, 8));
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
  };

  const allManhwa = [...popularManhwa, ...currentlyReading, ...recentlyUpdated];
  const filteredManhwa = allManhwa.filter(m => {
    const matchesSearch = searchQuery ? m.title.toLowerCase().includes(searchQuery.toLowerCase()) : true;
    const matchesGenres = selectedGenres.length > 0 ? selectedGenres.some(g => m.genre.includes(g)) : true;
    const matchesType = selectedType === 'all' ? true : m.status === selectedType;
    const matchesStatus = selectedStatus === 'all' ? true : m.status === selectedStatus;
    return matchesSearch && matchesGenres && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Icon name="Loader2" size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <IndexHeader
        theme={theme}
        contentType={contentType}
        onThemeToggle={toggleTheme}
        onContentTypeChange={setContentType}
      />

      <main className="container px-4 py-8 pb-24 lg:pb-8 space-y-12">
        <IndexFilters
          selectedGenres={selectedGenres}
          selectedType={selectedType}
          selectedStatus={selectedStatus}
          showFilters={showFilters}
          onGenreToggle={toggleGenre}
          onTypeChange={setSelectedType}
          onStatusChange={setSelectedStatus}
          onShowFiltersToggle={() => setShowFilters(!showFilters)}
          onReset={() => {
            setSelectedGenres([]);
            setSelectedType('all');
            setSelectedStatus('all');
          }}
        />

        {(searchQuery || selectedGenres.length > 0 || selectedType !== 'all' || selectedStatus !== 'all') ? (
          <section className="animate-in fade-in slide-in-bottom">
            <h2 className="text-2xl font-bold mb-6">
              {searchQuery ? 'Результаты поиска' : 'Отфильтрованные тайтлы'} ({filteredManhwa.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filteredManhwa.map((manhwa, index) => (
                <div key={manhwa.id} className="animate-in fade-in scale-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <ManhwaCard
                    manhwa={manhwa}
                    isBookmarked={bookmarks.has(manhwa.id)}
                    variant="default"
                    onCardClick={() => navigate(`/reader/${manhwa.id}`)}
                    onBookmarkToggle={(e) => toggleBookmark(manhwa.id, e)}
                  />
                </div>
              ))}
            </div>
          </section>
        ) : (
          <IndexSections
            popularManhwa={popularManhwa}
            recentlyUpdated={recentlyUpdated}
            currentlyReading={currentlyReading}
            bookmarks={bookmarks}
            onBookmarkToggle={toggleBookmark}
          />
        )}
      </main>

      <IndexFooter />
      <ScrollToTop />
    </div>
  );
}