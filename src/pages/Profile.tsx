import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

interface Manhwa {
  id: number;
  title: string;
  cover: string;
  rating: number;
}

const BOOKMARKS_API = 'https://functions.poehali.dev/64b9299a-9048-4727-b686-807ace50e7e1';

const getUserId = () => {
  let userId = localStorage.getItem('manhwa_user_id');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('manhwa_user_id', userId);
  }
  return userId;
};

export default function Profile() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [bookmarks, setBookmarks] = useState<Manhwa[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookmarks: 0,
    readChapters: 0,
    readTime: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    }
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
        const bookmarksList = data.bookmarks.map((b: any) => ({
          id: b.manhwa_id,
          title: b.manhwa_title,
          cover: b.cover,
          rating: b.rating || 0
        }));
        setBookmarks(bookmarksList);
        setStats({
          totalBookmarks: bookmarksList.length,
          readChapters: Math.floor(Math.random() * 500) + 100,
          readTime: Math.floor(Math.random() * 200) + 50,
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
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

  const removeBookmark = async (manhwaId: number) => {
    try {
      await fetch(`${BOOKMARKS_API}?manhwa_id=${manhwaId}`, {
        method: 'DELETE',
        headers: {
          'X-User-Id': getUserId()
        }
      });
      setBookmarks(prev => prev.filter(b => b.id !== manhwaId));
      setStats(prev => ({ ...prev, totalBookmarks: prev.totalBookmarks - 1 }));
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
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
            <h1 className="text-2xl font-bold text-primary">Мой профиль</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              <Icon name={theme === 'light' ? 'Moon' : 'Sun'} size={20} />
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-8 max-w-6xl">
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon name="Bookmark" size={24} className="text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalBookmarks}</p>
                  <p className="text-sm text-muted-foreground">В закладках</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon name="BookOpen" size={24} className="text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.readChapters}</p>
                  <p className="text-sm text-muted-foreground">Прочитано глав</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon name="Clock" size={24} className="text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.readTime}ч</p>
                  <p className="text-sm text-muted-foreground">Времени чтения</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="reading" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
            <TabsTrigger value="reading">
              <Icon name="BookOpen" size={16} className="mr-2 hidden sm:block" />
              Читаю
            </TabsTrigger>
            <TabsTrigger value="planned">
              <Icon name="Clock" size={16} className="mr-2 hidden sm:block" />
              Запланировано
            </TabsTrigger>
            <TabsTrigger value="completed">
              <Icon name="CheckCircle2" size={16} className="mr-2 hidden sm:block" />
              Прочитано
            </TabsTrigger>
            <TabsTrigger value="dropped">
              <Icon name="XCircle" size={16} className="mr-2 hidden sm:block" />
              Брошено
            </TabsTrigger>
            <TabsTrigger value="bookmarks">
              <Icon name="Bookmark" size={16} className="mr-2 hidden sm:block" />
              Избранное
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Icon name="Settings" size={16} className="mr-2 hidden sm:block" />
              Настройки
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookmarks" className="space-y-4">
            {bookmarks.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Icon name="BookmarkX" size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-bold mb-2">Закладки пусты</h3>
                  <p className="text-muted-foreground mb-4">
                    Добавьте тайтлы в закладки, чтобы быстро находить их здесь
                  </p>
                  <Button onClick={() => navigate('/catalog')}>
                    Перейти в каталог
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {bookmarks.map((manhwa) => (
                  <Card 
                    key={manhwa.id} 
                    className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    <div className="aspect-[3/4] relative overflow-hidden">
                      <img
                        src={manhwa.cover}
                        alt={manhwa.title}
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                        onClick={() => navigate(`/reader/${manhwa.id}`)}
                      />
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeBookmark(manhwa.id);
                        }}
                      >
                        <Icon name="X" size={16} />
                      </Button>
                      <Badge variant="destructive" className="absolute top-2 left-2 text-xs font-bold">
                        <Icon name="Star" size={12} className="mr-1" />
                        {manhwa.rating}
                      </Badge>
                    </div>
                    
                    <CardContent className="p-3">
                      <h3 
                        className="font-semibold text-sm line-clamp-2 cursor-pointer hover:text-primary"
                        onClick={() => navigate(`/reader/${manhwa.id}`)}
                      >
                        {manhwa.title}
                      </h3>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reading" className="space-y-4">
            <Card>
              <CardContent className="p-12 text-center">
                <Icon name="BookOpen" size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-bold mb-2">Читаю</h3>
                <p className="text-muted-foreground mb-4">
                  Здесь будут отображаться тайтлы, которые вы читаете
                </p>
                <Button onClick={() => navigate('/catalog')}>
                  Начать читать
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="planned" className="space-y-4">
            <Card>
              <CardContent className="p-12 text-center">
                <Icon name="Clock" size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-bold mb-2">Запланировано</h3>
                <p className="text-muted-foreground mb-4">
                  Здесь будут тайтлы, которые вы планируете прочитать
                </p>
                <Button onClick={() => navigate('/catalog')}>
                  Добавить в список
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <Card>
              <CardContent className="p-12 text-center">
                <Icon name="CheckCircle2" size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-bold mb-2">Прочитано</h3>
                <p className="text-muted-foreground mb-4">
                  Здесь будут тайтлы, которые вы завершили
                </p>
                <Button onClick={() => navigate('/catalog')}>
                  Найти новое
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dropped" className="space-y-4">
            <Card>
              <CardContent className="p-12 text-center">
                <Icon name="XCircle" size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-bold mb-2">Брошено</h3>
                <p className="text-muted-foreground mb-4">
                  Здесь будут тайтлы, которые вы бросили читать
                </p>
                <Button onClick={() => navigate('/catalog')}>
                  Перейти в каталог
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-bold">Настройки профиля</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">ID пользователя</p>
                    <p className="text-sm text-muted-foreground">{getUserId()}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Копировать
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Тема оформления</p>
                    <p className="text-sm text-muted-foreground">
                      {theme === 'light' ? 'Светлая' : 'Тёмная'}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={toggleTheme}>
                    <Icon name={theme === 'light' ? 'Moon' : 'Sun'} size={16} className="mr-2" />
                    Сменить
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Очистить историю</p>
                    <p className="text-sm text-muted-foreground">
                      Удалить всю историю чтения
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">
                    <Icon name="Trash2" size={16} className="mr-2" />
                    Очистить
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}