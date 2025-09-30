import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const GENRES = [
  'Фэнтези', 'Сянься', 'Романтика', 'Боевые искусства', 
  'Приключения', 'Магия', 'Драма', 'Комедия', 'Исэкай', 
  'Психология', 'Школа', 'Детектив'
];

export default function UploadNovel() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    translator: '',
    type: 'ranobe',
    status: 'ongoing',
    description: '',
    coverImage: null as File | null,
    selectedGenres: [] as string[],
    donationBoosty: '',
    donationVK: '',
    donationPatreon: ''
  });

  const [volumes, setVolumes] = useState([
    { id: 1, title: '', chapters: [{ id: 1, title: '', content: '' }] }
  ]);

  const handleGenreToggle = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      selectedGenres: prev.selectedGenres.includes(genre)
        ? prev.selectedGenres.filter(g => g !== genre)
        : [...prev.selectedGenres, genre]
    }));
  };

  const addVolume = () => {
    setVolumes([...volumes, {
      id: volumes.length + 1,
      title: '',
      chapters: [{ id: 1, title: '', content: '' }]
    }]);
  };

  const addChapter = (volumeIndex: number) => {
    const newVolumes = [...volumes];
    newVolumes[volumeIndex].chapters.push({
      id: newVolumes[volumeIndex].chapters.length + 1,
      title: '',
      content: ''
    });
    setVolumes(newVolumes);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.author || formData.selectedGenres.length === 0) {
      toast.error('Заполните обязательные поля');
      return;
    }

    toast.success('Новелла успешно загружена!');
    navigate('/novels');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <h1 className="text-xl font-bold text-primary">
              Загрузить новеллу
            </h1>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="BookText" size={24} />
                Основная информация
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Название новеллы *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Введите название"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author">Автор оригинала *</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="Имя автора"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="translator">Переводчик/Команда</Label>
                  <Input
                    id="translator"
                    value={formData.translator}
                    onChange={(e) => setFormData({ ...formData, translator: e.target.value })}
                    placeholder="Ваш ник или название команды"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Тип произведения</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ranobe">Ранобэ</SelectItem>
                      <SelectItem value="webnovel">Веб-новелла</SelectItem>
                      <SelectItem value="novel">Новелла</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Статус выхода</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ongoing">Выходит</SelectItem>
                    <SelectItem value="completed">Завершён</SelectItem>
                    <SelectItem value="hiatus">На паузе</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Напишите краткое описание сюжета"
                  rows={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Жанры *</Label>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map((genre) => (
                    <Badge
                      key={genre}
                      variant={formData.selectedGenres.includes(genre) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => handleGenreToggle(genre)}
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Выбрано: {formData.selectedGenres.length} жанров
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover">Обложка</Label>
                <Input
                  id="cover"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.files?.[0] || null })}
                />
                <p className="text-xs text-muted-foreground">
                  Рекомендуемый размер: 600x900px
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Heart" size={24} className="text-primary" />
                Ссылки на донаты (необязательно)
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Добавьте ссылки на ваши страницы донатов. Все платежи проходят через внешние платформы — безопасно и без налоговых рисков для сервиса.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="boosty" className="flex items-center gap-2">
                  <Icon name="ExternalLink" size={16} />
                  Boosty
                </Label>
                <Input
                  id="boosty"
                  value={formData.donationBoosty}
                  onChange={(e) => setFormData({ ...formData, donationBoosty: e.target.value })}
                  placeholder="https://boosty.to/ваш-ник"
                  type="url"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vk" className="flex items-center gap-2">
                  <Icon name="ExternalLink" size={16} />
                  VK Донат
                </Label>
                <Input
                  id="vk"
                  value={formData.donationVK}
                  onChange={(e) => setFormData({ ...formData, donationVK: e.target.value })}
                  placeholder="https://vk.com/donut/ваша-группа"
                  type="url"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="patreon" className="flex items-center gap-2">
                  <Icon name="ExternalLink" size={16} />
                  Patreon
                </Label>
                <Input
                  id="patreon"
                  value={formData.donationPatreon}
                  onChange={(e) => setFormData({ ...formData, donationPatreon: e.target.value })}
                  placeholder="https://patreon.com/ваш-ник"
                  type="url"
                />
              </div>

              <div className="bg-card/50 rounded-lg p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <Icon name="ShieldCheck" size={20} className="text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm">Безопасность</h4>
                    <p className="text-xs text-muted-foreground">
                      Читатели переходят на ваши страницы на внешних платформах. 
                      Мы не обрабатываем платежи и не храним финансовую информацию.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Icon name="Info" size={20} className="text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm">Рекомендации</h4>
                    <p className="text-xs text-muted-foreground">
                      Используйте платформы с юридическим лицом в РФ (Boosty, VK) 
                      или зарегистрируйтесь как самозанятый для работы с зарубежными сервисами.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Icon name="BookMarked" size={24} />
                  Тома и главы
                </CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addVolume}>
                  <Icon name="Plus" size={16} className="mr-2" />
                  Добавить том
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {volumes.map((volume, volumeIndex) => (
                <Card key={volume.id}>
                  <CardHeader>
                    <Input
                      placeholder={`Название тома ${volume.id}`}
                      value={volume.title}
                      onChange={(e) => {
                        const newVolumes = [...volumes];
                        newVolumes[volumeIndex].title = e.target.value;
                        setVolumes(newVolumes);
                      }}
                    />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {volume.chapters.map((chapter, chapterIndex) => (
                      <div key={chapter.id} className="space-y-2 p-4 border rounded-lg">
                        <Input
                          placeholder={`Глава ${chapterIndex + 1}: Название`}
                          value={chapter.title}
                          onChange={(e) => {
                            const newVolumes = [...volumes];
                            newVolumes[volumeIndex].chapters[chapterIndex].title = e.target.value;
                            setVolumes(newVolumes);
                          }}
                        />
                        <Textarea
                          placeholder="Текст главы..."
                          value={chapter.content}
                          onChange={(e) => {
                            const newVolumes = [...volumes];
                            newVolumes[volumeIndex].chapters[chapterIndex].content = e.target.value;
                            setVolumes(newVolumes);
                          }}
                          rows={6}
                        />
                      </div>
                    ))}
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => addChapter(volumeIndex)}
                      className="w-full"
                    >
                      <Icon name="Plus" size={16} className="mr-2" />
                      Добавить главу в этот том
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">
              Отмена
            </Button>
            <Button type="submit" className="flex-1">
              <Icon name="Upload" size={20} className="mr-2" />
              Опубликовать новеллу
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
