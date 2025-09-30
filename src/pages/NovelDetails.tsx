import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

interface Volume {
  id: number;
  title: string;
  chapters: Chapter[];
}

interface Chapter {
  id: number;
  number: number;
  title: string;
  releaseDate: string;
  views: number;
  isNew?: boolean;
}

interface Novel {
  id: number;
  title: string;
  cover: string;
  rating: number;
  status: string;
  genres: string[];
  author: string;
  translator: string;
  type: string;
  description: string;
  totalChapters: number;
  totalViews: number;
  followers: number;
  volumes: Volume[];
  donationLinks?: {
    boosty?: string;
    vk?: string;
    patreon?: string;
  };
}

const MOCK_NOVEL: Novel = {
  id: 1,
  title: 'Всемогущий Маг',
  cover: 'https://picsum.photos/seed/novel1/400/600',
  rating: 9.2,
  status: 'ongoing',
  genres: ['Фэнтези', 'Приключения', 'Магия', 'Боевик'],
  author: 'Автор Произведения',
  translator: 'Команда переводчиков',
  type: 'Ранобэ',
  description: 'История о молодом маге, который получил невероятную силу и должен пройти путь от новичка до всемогущего волшебника. В мире, где магия правит всем, он столкнётся с множеством испытаний, предательством близких и великими битвами за будущее всего человечества.',
  totalChapters: 450,
  totalViews: 1234567,
  followers: 45678,
  volumes: [
    {
      id: 1,
      title: 'Том 1: Пробуждение',
      chapters: [
        { id: 1, number: 1, title: 'Начало пути', releaseDate: '2024-01-15', views: 15000 },
        { id: 2, number: 2, title: 'Первое испытание', releaseDate: '2024-01-16', views: 14000 },
        { id: 3, number: 3, title: 'Встреча с наставником', releaseDate: '2024-01-17', views: 13500, isNew: true },
      ]
    },
    {
      id: 2,
      title: 'Том 2: Обучение',
      chapters: [
        { id: 4, number: 4, title: 'Академия магии', releaseDate: '2024-01-20', views: 12000 },
        { id: 5, number: 5, title: 'Соперники', releaseDate: '2024-01-21', views: 11500 },
      ]
    }
  ],
  donationLinks: {
    boosty: 'https://boosty.to/example',
    vk: 'https://vk.com/donut/example'
  }
};

export default function NovelDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [novel, setNovel] = useState<Novel>(MOCK_NOVEL);
  const [isFollowing, setIsFollowing] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const toggleFollow = () => {
    setIsFollowing(!isFollowing);
    toast.success(isFollowing ? 'Удалено из избранного' : 'Добавлено в избранное');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <h1 className="text-xl font-bold text-primary cursor-pointer" onClick={() => navigate('/')}>
              MANHWA READER
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => {
              const newTheme = theme === 'light' ? 'dark' : 'light';
              setTheme(newTheme);
              localStorage.setItem('theme', newTheme);
              if (newTheme === 'dark') {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            }}>
              <Icon name={theme === 'light' ? 'Moon' : 'Sun'} size={20} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
              <Icon name="User" size={20} />
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[300px_1fr] gap-8">
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <img
                src={novel.cover}
                alt={novel.title}
                className="w-full aspect-[2/3] object-cover"
              />
            </Card>

            <div className="space-y-2">
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => navigate(`/novel-reader/${novel.id}/1`)}
              >
                <Icon name="BookOpen" size={20} className="mr-2" />
                Начать чтение
              </Button>

              <Button 
                variant={isFollowing ? 'secondary' : 'outline'}
                className="w-full"
                onClick={toggleFollow}
              >
                <Icon name={isFollowing ? 'Check' : 'Plus'} size={20} className="mr-2" />
                {isFollowing ? 'В избранном' : 'В избранное'}
              </Button>
            </div>

            {novel.donationLinks && (
              <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <div className="flex items-start gap-2 mb-3">
                  <Icon name="Heart" size={20} className="text-primary mt-0.5" />
                  <div>
                    <h3 className="font-bold text-sm">Поддержать переводчиков</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Донаты помогают команде продолжать работу
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {novel.donationLinks.boosty && (
                    <a 
                      href={novel.donationLinks.boosty}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <Icon name="ExternalLink" size={16} className="mr-2" />
                        Boosty
                      </Button>
                    </a>
                  )}
                  
                  {novel.donationLinks.vk && (
                    <a 
                      href={novel.donationLinks.vk}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <Icon name="ExternalLink" size={16} className="mr-2" />
                        VK Донат
                      </Button>
                    </a>
                  )}
                  
                  {novel.donationLinks.patreon && (
                    <a 
                      href={novel.donationLinks.patreon}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <Icon name="ExternalLink" size={16} className="mr-2" />
                        Patreon
                      </Button>
                    </a>
                  )}
                </div>

                <p className="text-[10px] text-muted-foreground mt-3 leading-tight">
                  Переход на внешние платформы. Все транзакции проходят через них.
                </p>
              </Card>
            )}

            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Рейтинг</span>
                <div className="flex items-center gap-1">
                  <Icon name="Star" size={16} className="text-yellow-500" />
                  <span className="font-bold">{novel.rating}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Просмотров</span>
                <span className="font-semibold">{novel.totalViews.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Читателей</span>
                <span className="font-semibold">{novel.followers.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Статус</span>
                <Badge variant={novel.status === 'ongoing' ? 'default' : 'secondary'}>
                  {novel.status === 'ongoing' ? 'Выходит' : 'Завершён'}
                </Badge>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-4">{novel.title}</h1>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {novel.genres.map((genre) => (
                  <Badge key={genre} variant="secondary">
                    {genre}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                <div>
                  <span className="text-muted-foreground">Автор:</span>
                  <p className="font-semibold">{novel.author}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Перевод:</span>
                  <p className="font-semibold">{novel.translator}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Тип:</span>
                  <p className="font-semibold">{novel.type}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Глав:</span>
                  <p className="font-semibold">{novel.totalChapters}</p>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                {novel.description}
              </p>
            </div>

            <Tabs defaultValue="chapters" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="chapters" className="flex-1">
                  <Icon name="List" size={16} className="mr-2" />
                  Главы
                </TabsTrigger>
                <TabsTrigger value="comments" className="flex-1">
                  <Icon name="MessageSquare" size={16} className="mr-2" />
                  Комментарии
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chapters" className="space-y-6 mt-6">
                {novel.volumes.map((volume) => (
                  <Card key={volume.id}>
                    <div className="p-4 bg-muted/50 border-b">
                      <h3 className="font-bold text-lg">{volume.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {volume.chapters.length} глав
                      </p>
                    </div>
                    
                    <CardContent className="p-0">
                      <div className="divide-y">
                        {volume.chapters.map((chapter) => (
                          <div
                            key={chapter.id}
                            className="p-4 hover:bg-accent cursor-pointer transition-colors group"
                            onClick={() => navigate(`/novel-reader/${novel.id}/${chapter.number}`)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">Глава {chapter.number}</span>
                                  {chapter.isNew && (
                                    <Badge variant="default" className="text-xs">
                                      NEW
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {chapter.title}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                                  <span>{new Date(chapter.releaseDate).toLocaleDateString('ru')}</span>
                                  <span className="flex items-center gap-1">
                                    <Icon name="Eye" size={12} />
                                    {chapter.views.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                              
                              <Icon 
                                name="ChevronRight" 
                                size={20} 
                                className="text-muted-foreground group-hover:text-foreground transition-colors"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="comments" className="mt-6">
                <Card className="p-8 text-center">
                  <Icon name="MessageSquare" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Комментарии скоро появятся
                  </p>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
