import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { mockTeamsAPI, Team } from '@/lib/mockTeams';
import { useAuth } from '@/contexts/AuthContext';

interface EditTeamProps {
  team: Team;
  onSuccess?: () => void;
}

export default function EditTeam({ team, onSuccess }: EditTeamProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(team.name);
  const [description, setDescription] = useState(team.description);
  const [avatarUrl, setAvatarUrl] = useState(team.avatar_url);
  const { toast } = useToast();
  const { user } = useAuth();

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
      const updatedTeam = await mockTeamsAPI.updateTeam(team.id, user.id, {
        name: name.trim(),
        description: description.trim(),
        avatar_url: avatarUrl.trim()
      });

      if (updatedTeam) {
        toast({
          title: 'Успешно!',
          description: 'Команда обновлена',
        });
        
        setOpen(false);
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось обновить команду',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Icon name="Edit" size={14} />
          Редактировать
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Редактировать команду</DialogTitle>
          <DialogDescription>
            Измените информацию о вашей команде
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="team-name">Название команды</Label>
            <Input
              id="team-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Awesome Team"
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="team-description">Описание</Label>
            <Textarea
              id="team-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Опишите вашу команду..."
              disabled={loading}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="team-avatar">URL аватара</Label>
            <Input
              id="team-avatar"
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.png"
              disabled={loading}
            />
            {avatarUrl && (
              <div className="mt-2">
                <img 
                  src={avatarUrl} 
                  alt="Preview" 
                  className="w-20 h-20 rounded-lg object-cover border"
                  onError={(e) => {
                    e.currentTarget.src = 'https://api.dicebear.com/7.x/shapes/svg?seed=' + team.name;
                  }}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading && <Icon name="Loader2" size={16} className="animate-spin" />}
              {loading ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
