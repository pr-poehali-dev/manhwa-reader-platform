import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { mockTeamsAPI, Team, TeamMember } from '@/lib/mockTeams';
import { useAuth } from '@/contexts/AuthContext';
import { mockAuthAPI } from '@/lib/mockAuth';

interface ManageTeamMembersProps {
  team: Team;
  onSuccess?: () => void;
}

export default function ManageTeamMembers({ team, onSuccess }: ManageTeamMembersProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (open) {
      loadMembers();
    }
  }, [open]);

  const loadMembers = async () => {
    try {
      const teamData = await mockTeamsAPI.getTeam(team.id);
      if (teamData) {
        setMembers(teamData.members);
      }
    } catch (error) {
      console.error('Failed to load members:', error);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
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
      const invitedUser = mockAuthAPI.getStoredUser();
      
      if (!invitedUser) {
        toast({
          title: 'Пользователь не найден',
          description: 'Email не зарегистрирован в системе',
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }

      const success = await mockTeamsAPI.addMember(team.id, invitedUser, inviteRole);

      if (success) {
        toast({
          title: 'Участник добавлен!',
          description: `${invitedUser.username} добавлен в команду`,
        });
        
        setInviteEmail('');
        loadMembers();
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast({
          title: 'Ошибка',
          description: 'Пользователь уже в команде',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось добавить участника',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!user) return;

    try {
      await mockTeamsAPI.removeMember(team.id, memberId, user.id);
      
      toast({
        title: 'Участник удален',
        description: 'Участник исключен из команды',
      });
      
      loadMembers();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось удалить участника',
        variant: 'destructive'
      });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'creator':
        return 'default';
      case 'admin':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'creator':
        return 'Создатель';
      case 'admin':
        return 'Админ';
      default:
        return 'Участник';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Icon name="Users" size={14} />
          Участники ({members.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Управление участниками</DialogTitle>
          <DialogDescription>
            Пригласите новых участников или управляйте ролями существующих
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <form onSubmit={handleInvite} className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <h3 className="font-semibold flex items-center gap-2">
              <Icon name="UserPlus" size={16} />
              Пригласить участника
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email пользователя</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="user@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invite-role">Роль</Label>
                <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as 'admin' | 'member')}>
                  <SelectTrigger id="invite-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Участник</SelectItem>
                    <SelectItem value="admin">Администратор</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {loading && <Icon name="Loader2" size={16} className="animate-spin" />}
              {loading ? 'Приглашение...' : 'Пригласить'}
            </Button>
          </form>

          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Icon name="Users" size={16} />
              Текущие участники ({members.length})
            </h3>
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon name="User" size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{member.username}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={getRoleBadgeVariant(member.role)}>
                      {getRoleLabel(member.role)}
                    </Badge>
                    
                    {member.role !== 'creator' && user && team.creator_id === user.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Icon name="UserMinus" size={14} />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
