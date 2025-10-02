import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import UploadByUrl from '@/components/UploadByUrl';
import BulkUploadChapters from '@/components/BulkUploadChapters';
import EditChapter from '@/components/EditChapter';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Chapter {
  id: number;
  number: number;
  title: string;
  date: string;
  team: string;
}

interface Comment {
  id: number;
  author: string;
  text: string;
  date: string;
  likes: number;
}

const MOCK_MANHWA = {
  id: 1,
  title: 'Solo Leveling',
  alternativeTitles: ['Поднятие уровня в одиночку', '나 혼자만 레벨업'],
  cover: 'https://picsum.photos/seed/solo/400/600',
  rating: 9.5,
  userRatings: 15234,
  status: 'ongoing',
  type: 'Манхва',
  author: 'Chugong',
  artist: 'DUBU',
  year: 2018,
  description: 'Десять лет назад, после того как "Врата", соединяющие реальный мир с монстрами, открылись, некоторые из обычных людей получили силу охотиться на монстров внутри "Врат". Они известны как "Охотники". Однако не все Охотники сильны. Меня зовут Сун Джин-У, охотник Е-ранга. Я тот, кого люди называют "слабейшим охотником человечества"...',
  genres: ['Боевик', 'Фэнтези', 'Приключения', 'Драма'],
  chapters: 179,
  views: 5234567,
  bookmarks: 145230,
  donationLinks: {
    boosty: 'https://boosty.to/example',
    vk: 'https://vk.com/donut/example'
  }
};

const MOCK_CHAPTERS: Chapter[] = Array.from({ length: 179 }, (_, i) => ({
  id: 179 - i,
  number: 179 - i,
  title: `Глава ${179 - i}`,
  date: new Date(Date.now() - i * 86400000 * 3).toLocaleDateString('ru-RU'),
  team: i % 3 === 0 ? 'ReManga Team' : 'MangaLib'
}));

const MOCK_COMMENTS: Comment[] = [
  { id: 1, author: 'Читатель123', text: 'Лучшая манхва которую я читал! Сюжет просто огонь 🔥', date: '2 часа назад', likes: 42 },
  { id: 2, author: 'MangaFan', text: 'Когда следующая глава выйдет? Не могу дождаться!', date: '5 часов назад', likes: 18 },
  { id: 3, author: 'АнонимныйЧитатель', text: 'Арт великолепный, но хотелось бы побольше развития персонажей', date: '1 день назад', likes: 7 },
];

const SIMILAR_MANHWA = [
  { id: 2, title: 'The Beginning After The End', cover: 'https://picsum.photos/seed/tbate/300/400', rating: 9.2 },
  { id: 3, title: 'Omniscient Reader', cover: 'https://picsum.photos/seed/orv/300/400', rating: 9.4 },
  { id: 4, title: 'Second Life Ranker', cover: 'https://picsum.photos/seed/slr/300/400', rating: 8.9 },
  { id: 5, title: 'Tomb Raider King', cover: 'https://picsum.photos/seed/trk/300/400', rating: 8.7 },
];

const getUserId = () => {
  let userId = localStorage.getItem('manhwa_user_id');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('manhwa_user_id', userId);
  }
  return userId;
};

export default function ManhwaDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [userRating, setUserRating] = useState(0);
  const [readingStatus, setReadingStatus] = useState('none');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

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

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: comments.length + 1,
        author: 'Вы',
        text: newComment,
        date: 'Только что',
        likes: 0
      };
      setComments([comment, ...comments]);
      setNewComment('');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <h1 className="text-xl font-bold truncate max-w-[200px] md:max-w-none">{MOCK_MANHWA.title}</h1>
          </div>

          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            <Icon name={theme === 'light' ? 'Moon' : 'Sun'} size={20} />
          </Button>
        </div>
      </header>

      <main className="container px-4 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-[300px_1fr] gap-8 mb-8">
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <img
                src={MOCK_MANHWA.cover}
                alt={MOCK_MANHWA.title}
                className="w-full aspect-[2/3] object-cover"
              />
            </Card>

            <div className="space-y-2">
              <Button className="w-full gap-2" size="lg" onClick={() => navigate(`/reader/${id}`)}>
                <Icon name="BookOpen" size={20} />
                Читать
              </Button>

              <Button
                variant={isBookmarked ? 'default' : 'outline'}
                className="w-full gap-2"
                onClick={() => setIsBookmarked(!isBookmarked)}
              >
                <Icon name={isBookmarked ? 'BookmarkCheck' : 'Bookmark'} size={20} />
                {isBookmarked ? 'В закладках' : 'В закладки'}
              </Button>

              <Select value={readingStatus} onValueChange={setReadingStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Статус чтения" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Не читаю</SelectItem>
                  <SelectItem value="reading">Читаю</SelectItem>
                  <SelectItem value="planned">Запланировано</SelectItem>
                  <SelectItem value="completed">Прочитано</SelectItem>
                  <SelectItem value="dropped">Брошено</SelectItem>
                </SelectContent>
              </Select>

              <UploadByUrl 
                manhwaId={Number(id)} 
                onSuccess={() => window.location.reload()}
              />
            </div>

            {MOCK_MANHWA.donationLinks && (
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
                  {MOCK_MANHWA.donationLinks.boosty && (
                    <a 
                      href={MOCK_MANHWA.donationLinks.boosty}
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
                  
                  {MOCK_MANHWA.donationLinks.vk && (
                    <a 
                      href={MOCK_MANHWA.donationLinks.vk}
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
                </div>

                <p className="text-[10px] text-muted-foreground mt-3 leading-tight">
                  Переход на внешние платформы. Все транзакции проходят через них.
                </p>
              </Card>
            )}

            <Card>
              <CardHeader>
                <h3 className="font-bold">Ваша оценка</h3>
              </CardHeader>
              <CardContent>
                <div className="flex gap-1 justify-center">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setUserRating(rating)}
                      className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
                        userRating >= rating
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
                {userRating > 0 && (
                  <p className="text-center mt-2 text-sm text-muted-foreground">
                    Вы оценили на {userRating}/10
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{MOCK_MANHWA.title}</h1>
              <p className="text-muted-foreground mb-4">
                {MOCK_MANHWA.alternativeTitles.join(' / ')}
              </p>

              <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <Icon name="Info" size={18} className="text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">
                      Фанатский перевод
                    </p>
                    <p className="text-xs text-amber-800 dark:text-amber-400 mt-1">
                      Это неофициальный перевод, выполненный энтузиастами. Не является официальным изданием.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Icon name="Star" size={24} className="text-yellow-500" />
                  <span className="text-2xl font-bold">{MOCK_MANHWA.rating}</span>
                  <span className="text-muted-foreground">({MOCK_MANHWA.userRatings.toLocaleString()} оценок)</span>
                </div>
                <Badge variant={MOCK_MANHWA.status === 'ongoing' ? 'default' : 'secondary'}>
                  {MOCK_MANHWA.status === 'ongoing' ? 'Выходит' : 'Завершён'}
                </Badge>
                <Badge variant="outline">{MOCK_MANHWA.type}</Badge>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {MOCK_MANHWA.genres.map((genre) => (
                  <Badge key={genre} variant="secondary">{genre}</Badge>
                ))}
              </div>
            </div>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-bold">Информация</h3>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Автор</p>
                  <p className="font-semibold">{MOCK_MANHWA.author}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Художник</p>
                  <p className="font-semibold">{MOCK_MANHWA.artist}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Год выпуска</p>
                  <p className="font-semibold">{MOCK_MANHWA.year}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Глав</p>
                  <p className="font-semibold">{MOCK_MANHWA.chapters}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Просмотров</p>
                  <p className="font-semibold">{MOCK_MANHWA.views.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">В закладках</p>
                  <p className="font-semibold">{MOCK_MANHWA.bookmarks.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-bold">Описание</h3>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{MOCK_MANHWA.description}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="chapters" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chapters">
              <Icon name="List" size={16} className="mr-2" />
              Главы ({MOCK_CHAPTERS.length})
            </TabsTrigger>
            <TabsTrigger value="comments">
              <Icon name="MessageCircle" size={16} className="mr-2" />
              Комментарии ({comments.length})
            </TabsTrigger>
            <TabsTrigger value="similar">
              <Icon name="Sparkles" size={16} className="mr-2" />
              Похожие
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chapters" className="space-y-4">
            <div className="flex gap-2">
              <UploadByUrl manhwaId={Number(id)} />
              <BulkUploadChapters manhwaId={Number(id)} />
            </div>
            
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {MOCK_CHAPTERS.map((chapter) => (
                    <div
                      key={chapter.id}
                      className="flex items-center justify-between p-4 hover:bg-accent transition-colors group"
                    >
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => navigate(`/reader/${id}?chapter=${chapter.number}`)}
                      >
                        <p className="font-semibold">{chapter.title}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Icon name="Users" size={14} />
                            {chapter.team}
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon name="Calendar" size={14} />
                            {chapter.date}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <EditChapter
                            chapterId={chapter.id}
                            currentNumber={chapter.number}
                            currentTitle={chapter.title}
                            currentPages={[
                              'https://picsum.photos/seed/ch1p1/800/1200',
                              'https://picsum.photos/seed/ch1p2/800/1200',
                              'https://picsum.photos/seed/ch1p3/800/1200',
                            ]}
                            manhwaId={Number(id)}
                          />
                        </div>
                        <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            <Card>
              <CardHeader>
                <h3 className="font-bold">Оставить комментарий</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  placeholder="Напишите ваше мнение о тайтле..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={4}
                />
                <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                  <Icon name="Send" size={16} className="mr-2" />
                  Отправить
                </Button>
              </CardContent>
            </Card>

            {comments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold">{comment.author}</p>
                      <p className="text-xs text-muted-foreground">{comment.date}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Icon name="ThumbsUp" size={16} />
                      {comment.likes}
                    </Button>
                  </div>
                  <p className="text-muted-foreground">{comment.text}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="similar">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {SIMILAR_MANHWA.map((manhwa) => (
                <Card
                  key={manhwa.id}
                  className="cursor-pointer hover:shadow-lg transition-all overflow-hidden group"
                  onClick={() => navigate(`/manhwa/${manhwa.id}`)}
                >
                  <div className="aspect-[2/3] relative overflow-hidden">
                    <img
                      src={manhwa.cover}
                      alt={manhwa.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <Badge variant="destructive" className="absolute top-2 right-2">
                      <Icon name="Star" size={12} className="mr-1" />
                      {manhwa.rating}
                    </Badge>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-sm line-clamp-2">{manhwa.title}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}