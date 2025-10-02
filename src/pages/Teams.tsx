import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { mockTeamsAPI, Team as MockTeam } from '@/lib/mockTeams';
import { useAuth } from '@/contexts/AuthContext';
import EditTeam from '@/components/EditTeam';
import AuthDialog from '@/components/AuthDialog';

const UPLOADS_API = 'https://functions.poehali.dev/80df506b-6764-4bb1-a3ad-652c4be9e920';

interface Team {
  id: number;
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  website_url: string;
  discord_url: string;
  member_count: number;
  manhwa_count: number;
  created_at: string;
}

export default function Teams() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<MockTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const data = await mockTeamsAPI.getTeams();
      setTeams(data.teams || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = () => {
    if (!isAuthenticated) {
      return;
    }
    navigate('/create-team');
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
          <h1 className="text-xl font-bold">Команды переводчиков</h1>
          {isAuthenticated ? (
            <Button
              onClick={handleCreateTeam}
              size="sm"
              className="gap-2"
            >
              <Icon name="Plus" size={16} />
              Создать
            </Button>
          ) : (
            <AuthDialog trigger={
              <Button size="sm" className="gap-2">
                <Icon name="Plus" size={16} />
                Создать
              </Button>
            } />
          )}
        </div>
      </header>

      <main className="container px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Icon name="Loader2" size={32} className="animate-spin text-primary" />
          </div>
        ) : teams.length === 0 ? (
          <Card className="p-12">
            <div className="flex flex-col items-center text-center gap-4">
              <Icon name="Users" size={48} className="text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Команд пока нет</h3>
                <p className="text-muted-foreground mb-4">
                  Создайте первую команду переводчиков
                </p>
                <Button onClick={() => navigate('/create-team')} className="gap-2">
                  <Icon name="Plus" size={16} />
                  Создать команду
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <Card key={team.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {team.avatar_url ? (
                      <img
                        src={team.avatar_url}
                        alt={team.name}
                        className="w-16 h-16 rounded-lg object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://api.dicebear.com/7.x/shapes/svg?seed=' + team.name;
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon name="Users" size={32} className="text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg mb-1 truncate">{team.name}</h3>
                      <div className="flex gap-2 mb-3">
                        <Badge variant="secondary" className="text-xs">
                          <Icon name="Users" size={12} className="mr-1" />
                          {team.member_count || 0}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {team.description && (
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                      {team.description}
                    </p>
                  )}

                  <div className="flex gap-2 mt-4">
                    {user && team.creator_id === user.id && (
                      <EditTeam team={team} onSuccess={fetchTeams} />
                    )}
                        <Icon name="MessageCircle" size={14} />
                        Discord
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}