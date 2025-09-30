import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const ADMIN_API = 'https://functions.poehali.dev/1ab888c8-0270-437a-bbf3-b616e3ae9dca';
const UPLOAD_API = 'https://functions.poehali.dev/13fb9333-8228-419c-87f0-3814e0eb716f';
const UPLOADS_API = 'https://functions.poehali.dev/80df506b-6764-4bb1-a3ad-652c4be9e920';

const getUserId = () => {
  let userId = localStorage.getItem('manhwa_user_id');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('manhwa_user_id', userId);
  }
  return userId;
};

interface Upload {
  id: number;
  title: string;
  cover_url: string;
  description: string;
  author: string;
  uploaded_by: string;
  team_name: string;
  moderation_status: string;
  moderation_notes: string;
  created_at: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [pendingUploads, setPendingUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [manhwaForm, setManhwaForm] = useState({
    title: '',
    description: '',
    cover_url: '',
    genres: ''
  });

  const [chapterForm, setChapterForm] = useState({
    manhwa_id: '',
    chapter_number: '',
    title: '',
    archive: null as File | null
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPendingUploads();
  }, []);

  const fetchPendingUploads = async () => {
    try {
      const response = await fetch(`${UPLOADS_API}?status=pending`);
      const data = await response.json();
      setPendingUploads(data.uploads || []);
    } catch (error) {
      console.error('Error fetching uploads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModeration = async (uploadId: number, status: string, notes: string = '') => {
    try {
      const response = await fetch(UPLOADS_API, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': getUserId()
        },
        body: JSON.stringify({
          upload_id: uploadId,
          action: 'moderate',
          moderation_status: status,
          moderation_notes: notes
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Успешно!',
          description: status === 'approved' ? 'Тайтл одобрен' : 'Тайтл отклонён'
        });
        fetchPendingUploads();
      } else {
        throw new Error(data.error || 'Ошибка модерации');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось изменить статус',
        variant: 'destructive'
      });
    }
  };

  const handleAddManhwa = async () => {
    if (!manhwaForm.title) {
      toast({
        title: 'Ошибка',
        description: 'Введите название манхвы',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    try {
      const response = await fetch(ADMIN_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_manhwa',
          title: manhwaForm.title,
          description: manhwaForm.description,
          cover_url: manhwaForm.cover_url,
          genres: manhwaForm.genres.split(',').map(g => g.trim()).filter(Boolean)
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Успешно!',
          description: `Манхва добавлена с ID: ${data.manhwa_id}`
        });
        setManhwaForm({ title: '', description: '', cover_url: '', genres: '' });
      } else {
        throw new Error(data.error || 'Ошибка добавления');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось добавить манхву',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUploadChapter = async () => {
    if (!chapterForm.manhwa_id || !chapterForm.chapter_number || !chapterForm.archive) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля и выберите архив',
        variant: 'destructive'
      });
      return;
    }

    if (chapterForm.archive.size > 200 * 1024 * 1024) {
      toast({
        title: 'Ошибка',
        description: 'Размер архива не должен превышать 200 МБ',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('manhwa_id', chapterForm.manhwa_id);
      formData.append('chapter_number', chapterForm.chapter_number);
      formData.append('title', chapterForm.title);
      formData.append('archive', chapterForm.archive);

      const response = await fetch(UPLOAD_API, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Успешно!',
          description: `Глава ${chapterForm.chapter_number} загружена и обработана`
        });
        setChapterForm({ manhwa_id: '', chapter_number: '', title: '', archive: null });
      } else {
        throw new Error(data.error || 'Ошибка загрузки');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось загрузить главу',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <h1 className="text-2xl font-bold">Админ-панель</h1>
          </div>
          <Badge variant="destructive">Admin</Badge>
        </div>
      </header>

      <main className="container px-4 py-8 max-w-6xl">
        <Tabs defaultValue="moderation" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="moderation" className="gap-2">
              <Icon name="Shield" size={16} />
              Модерация
              {pendingUploads.length > 0 && (
                <Badge variant="destructive" className="ml-2">{pendingUploads.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="manhwa" className="gap-2">
              <Icon name="Plus" size={16} />
              Добавить манхву
            </TabsTrigger>
            <TabsTrigger value="chapter" className="gap-2">
              <Icon name="Upload" size={16} />
              Загрузить главу
            </TabsTrigger>
          </TabsList>

          <TabsContent value="moderation" className="space-y-4 mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Icon name="Loader2" size={32} className="animate-spin text-primary" />
              </div>
            ) : pendingUploads.length === 0 ? (
              <Card className="p-12">
                <div className="flex flex-col items-center text-center gap-4">
                  <Icon name="CheckCircle" size={48} className="text-green-500" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Нет загрузок на модерации</h3>
                    <p className="text-muted-foreground">
                      Все тайтлы проверены!
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {pendingUploads.map((upload) => (
                  <Card key={upload.id}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <img
                          src={upload.cover_url}
                          alt={upload.title}
                          className="w-24 h-32 object-cover rounded"
                        />
                        <div className="flex-1 space-y-2">
                          <h3 className="font-bold text-lg">{upload.title}</h3>
                          {upload.author && (
                            <p className="text-sm text-muted-foreground">
                              Автор: {upload.author}
                            </p>
                          )}
                          {upload.team_name && (
                            <Badge variant="secondary" className="text-xs">
                              <Icon name="Users" size={12} className="mr-1" />
                              {upload.team_name}
                            </Badge>
                          )}
                          <p className="text-sm line-clamp-3">{upload.description}</p>
                          <p className="text-xs text-muted-foreground">
                            Загружено: {new Date(upload.created_at).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleModeration(upload.id, 'approved')}
                          className="flex-1 gap-2"
                        >
                          <Icon name="Check" size={16} />
                          Одобрить
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            const notes = prompt('Причина отклонения:');
                            if (notes !== null) {
                              handleModeration(upload.id, 'rejected', notes);
                            }
                          }}
                          className="flex-1 gap-2"
                        >
                          <Icon name="X" size={16} />
                          Отклонить
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="manhwa" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Plus" size={24} />
                  Добавить новую манхву
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Название *</Label>
                  <Input
                    id="title"
                    placeholder="Название манхвы"
                    value={manhwaForm.title}
                    onChange={(e) => setManhwaForm({ ...manhwaForm, title: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    placeholder="Краткое описание сюжета"
                    value={manhwaForm.description}
                    onChange={(e) => setManhwaForm({ ...manhwaForm, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="cover">URL обложки</Label>
                  <Input
                    id="cover"
                    placeholder="https://example.com/cover.jpg"
                    value={manhwaForm.cover_url}
                    onChange={(e) => setManhwaForm({ ...manhwaForm, cover_url: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="genres">Жанры (через запятую)</Label>
                  <Input
                    id="genres"
                    placeholder="Боевик, Фэнтези, Драма"
                    value={manhwaForm.genres}
                    onChange={(e) => setManhwaForm({ ...manhwaForm, genres: e.target.value })}
                  />
                </div>

                <Button onClick={handleAddManhwa} disabled={uploading} className="w-full">
                  {uploading ? 'Добавление...' : 'Добавить манхву'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chapter" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Upload" size={24} />
                  Загрузить главу
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="manhwa_id">ID манхвы *</Label>
                  <Input
                    id="manhwa_id"
                    type="number"
                    placeholder="1"
                    value={chapterForm.manhwa_id}
                    onChange={(e) => setChapterForm({ ...chapterForm, manhwa_id: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="chapter_number">Номер главы *</Label>
                  <Input
                    id="chapter_number"
                    type="number"
                    placeholder="1"
                    value={chapterForm.chapter_number}
                    onChange={(e) => setChapterForm({ ...chapterForm, chapter_number: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="chapter_title">Название главы</Label>
                  <Input
                    id="chapter_title"
                    placeholder="Глава 1: Начало"
                    value={chapterForm.title}
                    onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="archive">Архив с изображениями * (до 200 МБ)</Label>
                  <Input
                    id="archive"
                    type="file"
                    accept=".zip,.rar,.7z"
                    onChange={(e) => setChapterForm({ ...chapterForm, archive: e.target.files?.[0] || null })}
                  />
                  {chapterForm.archive && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Выбран файл: {chapterForm.archive.name} ({(chapterForm.archive.size / 1024 / 1024).toFixed(2)} МБ)
                    </p>
                  )}
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <Icon name="Info" size={16} className="inline mr-2" />
                    После загрузки все страницы будут автоматически склеены в один длинный лист для удобного чтения
                  </p>
                </div>

                <Button onClick={handleUploadChapter} disabled={uploading} className="w-full">
                  {uploading ? 'Загрузка и обработка...' : 'Загрузить главу'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
