import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const ADMIN_API = 'https://functions.poehali.dev/1ab888c8-0270-437a-bbf3-b616e3ae9dca';
const UPLOAD_API = 'https://functions.poehali.dev/13fb9333-8228-419c-87f0-3814e0eb716f';

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
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

      <main className="container px-4 py-8 max-w-4xl">
        <div className="space-y-8">
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
        </div>
      </main>
    </div>
  );
}