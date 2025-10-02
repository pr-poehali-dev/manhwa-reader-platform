import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

const API_URL = 'https://functions.poehali.dev/4e8cb1b6-88f9-43e5-89db-ab75bfa82345';
const UPLOADS_API = 'https://functions.poehali.dev/80df506b-6764-4bb1-a3ad-652c4be9e920';

const getUserId = () => {
  let userId = localStorage.getItem('manhwa_user_id');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('manhwa_user_id', userId);
  }
  return userId;
};

interface Genre {
  id: number;
  name: string;
}

interface Team {
  id: number;
  name: string;
}

export default function UploadManhwa() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  
  const [formData, setFormData] = useState({
    title: '',
    alternative_titles: '',
    description: '',
    cover_url: '',
    author: '',
    artist: '',
    status: 'ongoing',
    release_year: new Date().getFullYear(),
    team_id: '',
    donationBoosty: '',
    donationVK: ''
  });

  useEffect(() => {
    fetchGenres();
    fetchTeams();
  }, []);

  const fetchGenres = async () => {
    try {
      const response = await fetch(`${API_URL}/genres`);
      const data = await response.json();
      setGenres(data.genres || []);
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await fetch(`${UPLOADS_API}?resource=teams`);
      const data = await response.json();
      setTeams(data.teams || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setCoverPreview(base64);
        setFormData({ ...formData, cover_url: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        team_id: formData.team_id && formData.team_id !== 'none' ? parseInt(formData.team_id) : null,
        genre_ids: selectedGenres
      };

      const response = await fetch(UPLOADS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': getUserId()
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        alert('Манхва успешно загружена! После модерации она появится в каталоге.');
        navigate('/');
      } else {
        alert(data.error || 'Ошибка при загрузке манхвы');
      }
    } catch (error) {
      console.error('Error uploading manhwa:', error);
      alert('Ошибка при загрузке манхвы');
    } finally {
      setLoading(false);
    }
  };

  const toggleGenre = (genreId: number) => {
    setSelectedGenres(prev =>
      prev.includes(genreId)
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <Icon name="ArrowLeft" size={20} />
            Назад
          </Button>
          <h1 className="text-xl font-bold">Загрузить манхву</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="container max-w-2xl px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Upload" size={24} />
                Добавить новый тайтл
              </CardTitle>
              <CardDescription>
                Заполните информацию о манхве. После модерации она появится в каталоге
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Название <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Например: Башня Бога"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alternative_titles">Альтернативные названия</Label>
                <Input
                  id="alternative_titles"
                  value={formData.alternative_titles}
                  onChange={(e) => setFormData({ ...formData, alternative_titles: e.target.value })}
                  placeholder="Tower of God, 신의 탑"
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Обложка <span className="text-destructive">*</span>
                </Label>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      className="flex-1"
                    />
                  </div>
                  <div className="text-sm text-muted-foreground text-center">или</div>
                  <Input
                    id="cover_url"
                    type="url"
                    value={formData.cover_url.startsWith('data:') ? '' : formData.cover_url}
                    onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
                    placeholder="Вставьте ссылку на обложку"
                  />
                  {(coverPreview || formData.cover_url) && (
                    <div className="mt-2">
                      <img
                        src={coverPreview || formData.cover_url}
                        alt="Предпросмотр обложки"
                        className="w-32 h-48 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Краткое описание сюжета..."
                  rows={5}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="author">Автор</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="SIU"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="artist">Художник</Label>
                  <Input
                    id="artist"
                    value={formData.artist}
                    onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                    placeholder="SIU"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Статус</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger id="status">
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
                  <Label htmlFor="release_year">Год выхода</Label>
                  <Input
                    id="release_year"
                    type="number"
                    value={formData.release_year}
                    onChange={(e) => setFormData({ ...formData, release_year: parseInt(e.target.value) })}
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="team_id">Команда (опционально)</Label>
                <Select
                  value={formData.team_id}
                  onValueChange={(value) => setFormData({ ...formData, team_id: value })}
                >
                  <SelectTrigger id="team_id">
                    <SelectValue placeholder="Выберите команду" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Без команды</SelectItem>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id.toString()}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Жанры</Label>
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre) => (
                    <Button
                      key={genre.id}
                      type="button"
                      variant={selectedGenres.includes(genre.id) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleGenre(genre.id)}
                    >
                      {genre.name}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Heart" size={24} className="text-primary" />
                Ссылки на донаты (необязательно)
              </CardTitle>
              <CardDescription>
                Добавьте ссылки на ваши страницы донатов. Все платежи проходят через внешние платформы — безопасно и без налоговых рисков для сервиса.
              </CardDescription>
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
                <Label htmlFor="vk_donat" className="flex items-center gap-2">
                  <Icon name="ExternalLink" size={16} />
                  VK Донат
                </Label>
                <Input
                  id="vk_donat"
                  value={formData.donationVK}
                  onChange={(e) => setFormData({ ...formData, donationVK: e.target.value })}
                  placeholder="https://vk.com/donut/ваша-группа"
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

          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3 mb-4">
                <Icon name="Info" size={24} className="text-blue-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold mb-2">Хотите получать донаты легально?</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Узнайте, как настроить уровни подписки, ранний доступ к главам и оформиться как самозанятый без налоговых рисков.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/translator-guide')}
                  >
                    <Icon name="BookOpen" size={16} className="mr-2" />
                    Открыть гайд для переводчиков
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex-1"
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !formData.title || !formData.cover_url}
                  className="flex-1 gap-2"
                >
                  {loading ? (
                    <>
                      <Icon name="Loader2" size={16} className="animate-spin" />
                      Загрузка...
                    </>
                  ) : (
                    <>
                      <Icon name="Upload" size={16} />
                      Загрузить манхву
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </main>
    </div>
  );
}