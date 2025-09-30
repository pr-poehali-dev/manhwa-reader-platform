import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

interface Manhwa {
  id: number;
  title: string;
  cover: string;
  chapters: number;
  rating: number;
  status: string;
  genre: string[];
  views: number;
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
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [searchQuery, setSearchQuery] = useState('');
  const [popularManhwa, setPopularManhwa] = useState<Manhwa[]>([]);
  const [currentlyReading, setCurrentlyReading] = useState<Manhwa[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());
  const navigate = useNavigate();

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
          views: m.views || 0
        }));
        
        const sortedByRating = [...manhwaData].sort((a, b) => b.rating - a.rating);
        const sortedByViews = [...manhwaData].sort((a, b) => b.views - a.views);
        
        setPopularManhwa(sortedByRating.slice(0, 5));
        setCurrentlyReading(sortedByViews.slice(0, 12));
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

  const allManhwa = [...popularManhwa, ...currentlyReading];
  const filteredManhwa = searchQuery 
    ? allManhwa.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : allManhwa;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Icon name="Loader2" size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold text-primary cursor-pointer" onClick={() => navigate('/')}>
              MANHWA READER
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative hidden md:block">
              <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Поиск манхв..."
                className="w-64 pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/upload')}
              className="gap-2 hidden sm:flex"
            >
              <Icon name="Upload" size={16} />
              Загрузить
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/teams')}
              className="gap-2 hidden sm:flex"
            >
              <Icon name="Users" size={16} />
              Команды
            </Button>
            
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              <Icon name={theme === 'light' ? 'Moon' : 'Sun'} size={20} />
            </Button>

            <Button variant="default" className="gap-2 hidden sm:flex">
              <Icon name="Heart" size={18} />
              Донат
            </Button>

            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
              <Icon name="Settings" size={20} />
            </Button>
          </div>
        </div>

        <div className="md:hidden border-t">
          <div className="container px-4 py-2">
            <div className="relative">
              <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Поиск манхв..."
                className="w-full pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="container px-4 py-8 space-y-12">
        {searchQuery ? (
          <section>
            <h2 className="text-2xl font-bold mb-6">Результаты поиска</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filteredManhwa.map((manhwa) => (
                <Card 
                  key={manhwa.id} 
                  className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105"
                  onClick={() => navigate(`/reader/${manhwa.id}`)}
                >
                  <div className="aspect-[3/4] relative overflow-hidden">
                    <img
                      src={manhwa.cover}
                      alt={manhwa.title}
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                      <Button
                        size="icon"
                        variant={bookmarks.has(manhwa.id) ? 'default' : 'secondary'}
                        className="h-8 w-8"
                        onClick={(e) => toggleBookmark(manhwa.id, e)}
                      >
                        <Icon name={bookmarks.has(manhwa.id) ? 'BookmarkCheck' : 'Bookmark'} size={16} />
                      </Button>
                      <Badge variant="destructive" className="text-xs font-bold">
                        <Icon name="Star" size={12} className="mr-1" />
                        {manhwa.rating}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-sm line-clamp-2 min-h-[40px]">
                      {manhwa.title}
                    </h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ) : (
          <>
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <Icon name="TrendingUp" size={32} className="text-primary" />
                  Популярные тайтлы
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {popularManhwa.map((manhwa) => (
                  <Card 
                    key={manhwa.id} 
                    className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105"
                    onClick={() => navigate(`/reader/${manhwa.id}`)}
                  >
                    <div className="aspect-[3/4] relative overflow-hidden">
                      <img
                        src={manhwa.cover}
                        alt={manhwa.title}
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 flex flex-col gap-1">
                        <Button
                          size="icon"
                          variant={bookmarks.has(manhwa.id) ? 'default' : 'secondary'}
                          className="h-8 w-8"
                          onClick={(e) => toggleBookmark(manhwa.id, e)}
                        >
                          <Icon name={bookmarks.has(manhwa.id) ? 'BookmarkCheck' : 'Bookmark'} size={16} />
                        </Button>
                        <Badge variant="destructive" className="text-xs font-bold">
                          <Icon name="Star" size={12} className="mr-1" />
                          {manhwa.rating}
                        </Badge>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="font-bold text-white text-lg mb-2 line-clamp-2">
                          {manhwa.title}
                        </h3>
                        <div className="flex items-center gap-2 text-white/90 text-sm">
                          <Icon name="Eye" size={14} />
                          <span>{manhwa.views.toLocaleString()}</span>
                          <span className="mx-2">•</span>
                          <Icon name="BookText" size={14} />
                          <span>{manhwa.chapters} гл.</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <Icon name="Flame" size={28} className="text-orange-500" />
                  Сейчас читают
                </h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {currentlyReading.map((manhwa) => (
                  <Card 
                    key={manhwa.id} 
                    className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105"
                    onClick={() => navigate(`/reader/${manhwa.id}`)}
                  >
                    <div className="aspect-[3/4] relative overflow-hidden">
                      <img
                        src={manhwa.cover}
                        alt={manhwa.title}
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 flex flex-col gap-1">
                        <Button
                          size="icon"
                          variant={bookmarks.has(manhwa.id) ? 'default' : 'secondary'}
                          className="h-8 w-8"
                          onClick={(e) => toggleBookmark(manhwa.id, e)}
                        >
                          <Icon name={bookmarks.has(manhwa.id) ? 'BookmarkCheck' : 'Bookmark'} size={16} />
                        </Button>
                        <Badge variant="destructive" className="text-xs font-bold">
                          <Icon name="Star" size={12} className="mr-1" />
                          {manhwa.rating}
                        </Badge>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <Button
                        size="sm"
                        className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/reader/${manhwa.id}`);
                        }}
                      >
                        <Icon name="BookOpen" size={16} />
                        Читать
                      </Button>
                    </div>
                    
                    <CardContent className="p-3">
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2 min-h-[40px]">
                        {manhwa.title}
                      </h3>
                      
                      <div className="flex flex-wrap gap-1 mb-2">
                        {manhwa.genre.slice(0, 2).map((genre) => (
                          <Badge key={genre} variant="secondary" className="text-xs">
                            {genre}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Icon name="BookText" size={14} />
                          <span>{manhwa.chapters} гл.</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Icon name="Eye" size={14} />
                          <span>{manhwa.views}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
