import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { mockTeamsAPI } from '@/lib/mockTeams';
import { useToast } from '@/hooks/use-toast';

const UPLOADS_API = 'https://functions.poehali.dev/80df506b-6764-4bb1-a3ad-652c4be9e920';

const getUserId = () => {
  let userId = localStorage.getItem('manhwa_user_id');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('manhwa_user_id', userId);
  }
  return userId;
};

export default function CreateTeam() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    avatar_url: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите в аккаунт для создания команды',
        variant: 'destructive'
      });
      navigate('/teams');
    }
  }, [isAuthenticated, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Ошибка',
        description: 'Необходима авторизация',
        variant: 'destructive'
      });
      return;
    }
    
    setLoading(true);

    try {
      const team = await mockTeamsAPI.createTeam(
        formData.name,
        formData.description,
        formData.avatar_url,
        user
      );

      toast({
        title: 'Успешно!',
        description: `Команда "${team.name}" создана`,
      });
      
      navigate('/teams');
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось создать команду',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-xl font-bold">Создать команду</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="container max-w-2xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Users" size={24} />
              Регистрация команды переводчиков
            </CardTitle>
            <CardDescription>
              Создайте свою команду для перевода и загрузки манхвы
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Название команды <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Например: Dream Team"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Расскажите о вашей команде..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar_url">Ссылка на аватар</Label>
                <Input
                  id="avatar_url"
                  type="url"
                  value={formData.avatar_url}
                  onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                  placeholder="https://example.com/avatar.png"
                />
                {formData.avatar_url && (
                  <div className="mt-2">
                    <img 
                      src={formData.avatar_url} 
                      alt="Preview" 
                      className="w-20 h-20 rounded-lg object-cover border"
                      onError={(e) => {
                        e.currentTarget.src = 'https://api.dicebear.com/7.x/shapes/svg?seed=' + formData.name;
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2 hidden">
                <Input
                  id="discord_url"
                  type="url"
                  value={formData.discord_url}
                  onChange={(e) => setFormData({ ...formData, discord_url: e.target.value })}
                  placeholder="https://discord.gg/..."
                />
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
                  disabled={loading || !formData.name}
                  className="flex-1 gap-2"
                >
                  {loading ? (
                    <>
                      <Icon name="Loader2" size={16} className="animate-spin" />
                      Создание...
                    </>
                  ) : (
                    <>
                      <Icon name="Plus" size={16} />
                      Создать команду
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