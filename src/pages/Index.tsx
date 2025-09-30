import { useState, useEffect } from 'react';
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

export default function Index() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [manhwaList, setManhwaList] = useState<Manhwa[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchManhwa();
  }, [activeTab]);

  const fetchManhwa = async () => {
    setLoading(true);
    try {
      let url = API_URL;
      const params = new URLSearchParams();
      
      if (activeTab === 'popular') {
        params.append('sort', 'views');
      } else if (activeTab === 'new') {
        params.append('sort', 'new');
      } else if (activeTab === 'catalog') {
        params.append('sort', 'rating');
      }

      if (params.toString()) {
        url += '?' + params.toString();
      }

      const response = await fetch(url);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setManhwaList(data);
      }
    } catch (error) {
      console.error('Error fetching manhwa:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const filteredManhwa = manhwaList.filter(manhwa =>
    manhwa.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold text-primary">MANHWA READER</h1>
            
            <nav className="hidden md:flex items-center gap-1">
              {[
                { id: 'home', label: 'Главная', icon: 'Home' },
                { id: 'catalog', label: 'Каталог', icon: 'Grid2x2' },
                { id: 'popular', label: 'Популярное', icon: 'TrendingUp' },
                { id: 'new', label: 'Новинки', icon: 'Sparkles' },
                { id: 'bookmarks', label: 'Закладки', icon: 'Bookmark' }
              ].map(tab => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab(tab.id)}
                  className="gap-2"
                >
                  <Icon name={tab.icon as any} size={16} />
                  {tab.label}
                </Button>
              ))}
            </nav>
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
            
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              <Icon name={theme === 'light' ? 'Moon' : 'Sun'} size={20} />
            </Button>

            <Button variant="default" className="gap-2">
              <Icon name="Heart" size={18} />
              Донат
            </Button>

            <Button variant="ghost" size="icon">
              <Icon name="User" size={20} />
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

      <main className="container px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            {activeTab === 'home' && 'Главная'}
            {activeTab === 'catalog' && 'Каталог манхв'}
            {activeTab === 'popular' && 'Популярные манхвы'}
            {activeTab === 'new' && 'Новинки'}
            {activeTab === 'bookmarks' && 'Мои закладки'}
          </h2>
          <p className="text-muted-foreground">
            {filteredManhwa.length} манхв найдено
          </p>
        </div>

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
                    <span>{(manhwa.views / 1000000).toFixed(1)}M</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-card z-50">
        <div className="grid grid-cols-5 gap-1 p-2">
          {[
            { id: 'home', label: 'Главная', icon: 'Home' },
            { id: 'catalog', label: 'Каталог', icon: 'Grid2x2' },
            { id: 'popular', label: 'Топ', icon: 'TrendingUp' },
            { id: 'new', label: 'Новое', icon: 'Sparkles' },
            { id: 'bookmarks', label: 'Я', icon: 'User' }
          ].map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col h-auto py-2 px-1"
            >
              <Icon name={tab.icon as any} size={20} />
              <span className="text-xs mt-1">{tab.label}</span>
            </Button>
          ))}
        </div>
      </nav>
    </div>
  );
}