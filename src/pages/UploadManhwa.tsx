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
  
  const [formData, setFormData] = useState({
    title: '',
    alternative_titles: '',
    description: '',
    cover_url: '',
    author: '',
    artist: '',
    status: 'ongoing',
    release_year: new Date().getFullYear(),
    team_id: ''
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        team_id: formData.team_id ? parseInt(formData.team_id) : null,
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
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                <Label htmlFor="cover_url">
                  Ссылка на обложку <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cover_url"
                  type="url"
                  value={formData.cover_url}
                  onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
                  placeholder="https://example.com/cover.jpg"
                  required
                />
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
                    <SelectItem value="">Без команды</SelectItem>
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
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
