import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import ScrollToTop from '@/components/ScrollToTop';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

const GENRES = [
  'Боевик', 'Романтика', 'Фэнтези', 'Драма', 'Комедия',
  'Приключения', 'Психология', 'Школа', 'Сёнэн', 'Сёдзё',
  'Сэйнэн', 'Повседневность', 'Меха', 'Ужасы', 'Детектив',
  'Спорт', 'Музыка', 'Игры', 'Научная фантастика', 'Триллер'
];

const TYPE_FILTERS = [
  { label: 'Все типы', value: 'all' },
  { label: 'Манхва', value: 'manhwa' },
  { label: 'Манга', value: 'manga' },
  { label: 'Маньхуа', value: 'manhua' },
  { label: 'Западный комикс', value: 'comic' },
  { label: 'Рукомикс', value: 'russian' }
];

const STATUS_FILTERS = [
  { label: 'Все статусы', value: 'all' },
  { label: 'Онгоинг', value: 'ongoing' },
  { label: 'Завершён', value: 'completed' },
  { label: 'Заморожен', value: 'frozen' },
  { label: 'Заброшен', value: 'abandoned' }
];

const SORT_OPTIONS = [
  { label: 'По рейтингу', value: 'rating' },
  { label: 'По просмотрам', value: 'views' },
  { label: 'По названию', value: 'title' },
  { label: 'По дате обновления', value: 'updated' },
  { label: 'По году выпуска', value: 'year' },
  { label: 'По количеству глав', value: 'chapters' }
];

const YEARS = Array.from({ length: 30 }, (_, i) => 2024 - i);

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

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
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
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <h1 className="text-2xl font-bold text-primary">Каталог манхвы</h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative hidden md:block">
              <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Поиск по названию..."
                className="w-64 pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              <Icon name={theme === 'light' ? 'Moon' : 'Sun'} size={20} />
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6">
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          <aside className={`space-y-4 ${!showFilters && 'hidden lg:block'}`}>
            <Card className="sticky top-20">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <Icon name="SlidersHorizontal" size={20} />
                    Фильтры
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="text-xs"
                  >
                    Сбросить
                  </Button>
                </div>

                <div className="md:hidden">
                  <div className="relative">
                    <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Поиск..."
                      className="w-full pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Сортировка</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Тип</label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPE_FILTERS.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Статус</label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_FILTERS.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Год выпуска</label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Все года" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все года</SelectItem>
                      {YEARS.map(year => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">
                    Минимальный рейтинг: {minRating}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={minRating}
                    onChange={(e) => setMinRating(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0</span>
                    <span>5</span>
                    <span>10</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">
                    Жанры ({selectedGenres.length})
                  </label>
                  <div className="flex flex-wrap gap-1 max-h-64 overflow-y-auto">
                    {GENRES.map(genre => (
                      <Badge
                        key={genre}
                        variant={selectedGenres.includes(genre) ? 'default' : 'outline'}
                        className="cursor-pointer text-xs"
                        onClick={() => toggleGenre(genre)}
                      >
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
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

            {selectedGenres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Активные жанры:</span>
                {selectedGenres.map(genre => (
                  <Badge
                    key={genre}
                    variant="default"
                    className="cursor-pointer"
                    onClick={() => toggleGenre(genre)}
                  >
                    {genre}
                    <Icon name="X" size={12} className="ml-1" />
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">
                Показано {startIndex + 1}-{Math.min(endIndex, sortedManhwa.length)} из {sortedManhwa.length}
                <span className="ml-2 hidden sm:inline">•</span>
                <span className="sm:ml-2 block sm:inline">Страница {currentPage} из {totalPages}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">На странице:</span>
                <Select 
                  value={itemsPerPage.toString()} 
                  onValueChange={(value) => {
                    setItemsPerPage(parseInt(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[100px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {paginatedManhwa.map((manhwa) => (
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

            {sortedManhwa.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Icon name="SearchX" size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-bold mb-2">Ничего не найдено</h3>
                  <p className="text-muted-foreground mb-4">
                    Попробуйте изменить параметры фильтрации
                  </p>
                  <Button onClick={resetFilters}>
                    Сбросить фильтры
                  </Button>
                </CardContent>
              </Card>
            )}

            {totalPages > 1 && sortedManhwa.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                    >
                      <Icon name="ChevronsLeft" size={16} />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <Icon name="ChevronLeft" size={16} />
                    </Button>

                    {getPageNumbers().map((page, index) => (
                      page === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                          ...
                        </span>
                      ) : (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(page as number)}
                          className="min-w-[40px]"
                        >
                          {page}
                        </Button>
                      )
                    ))}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <Icon name="ChevronRight" size={16} />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      <Icon name="ChevronsRight" size={16} />
                    </Button>
                  </div>

                  <div className="text-center mt-3 text-sm text-muted-foreground">
                    Перейти на страницу:{' '}
                    <Input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={currentPage}
                      onChange={(e) => {
                        const page = parseInt(e.target.value);
                        if (page >= 1 && page <= totalPages) {
                          handlePageChange(page);
                        }
                      }}
                      className="inline-block w-20 h-8 text-center mx-2"
                    />
                    из {totalPages}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <ScrollToTop />
    </div>
  );
}