import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '@/components/NotificationBell';
import SearchWithAutocomplete from '@/components/SearchWithAutocomplete';
import AuthDialog from '@/components/AuthDialog';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface IndexHeaderProps {
  theme: 'light' | 'dark';
  contentType: 'manhwa' | 'novels';
  onThemeToggle: () => void;
  onContentTypeChange: (type: 'manhwa' | 'novels') => void;
}

export default function IndexHeader({ 
  theme, 
  contentType, 
  onThemeToggle, 
  onContentTypeChange 
}: IndexHeaderProps) {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/20 bg-background/95 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/95 shadow-lg shadow-primary/5">
      <div className="container flex h-20 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black bg-gradient-to-r from-primary via-pink-500 to-secondary bg-clip-text text-transparent cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate('/')}>
              MANHWA
            </h1>
            <div className="hidden sm:flex items-center gap-1 bg-gradient-to-r from-muted/50 to-muted/30 rounded-full p-1 backdrop-blur-sm border border-border/50">
              <Button
                variant={contentType === 'manhwa' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  onContentTypeChange('manhwa');
                  navigate('/');
                }}
                className={contentType === 'manhwa' ? 'text-xs rounded-full bg-gradient-to-r from-primary to-secondary' : 'text-xs rounded-full'}
              >
                <Icon name="BookImage" size={14} className="mr-1" />
                Манхва
              </Button>
              <Button
                variant={contentType === 'novels' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  onContentTypeChange('novels');
                  navigate('/novels');
                }}
                className={contentType === 'novels' ? 'text-xs rounded-full bg-gradient-to-r from-primary to-secondary' : 'text-xs rounded-full'}
              >
                <Icon name="BookText" size={14} className="mr-1" />
                Новеллы
              </Button>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/catalog')}
            >
              Каталог
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/leaderboard')}
              className="gap-1"
            >
              <Icon name="Trophy" size={14} />
              Рейтинг
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/recommendations')}
              className="gap-1"
            >
              <Icon name="Sparkles" size={14} />
              Рекомендации
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/schedule')}
            >
              Расписание
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/translator-guide')}
              className="gap-1"
            >
              <Icon name="Briefcase" size={14} />
              Для переводчиков
            </Button>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:block w-64">
            <SearchWithAutocomplete placeholder="Поиск манхв..." />
          </div>
          
          <div className="hidden lg:flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/upload')}
              className="gap-2"
            >
              <Icon name="Upload" size={16} />
              Загрузить
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/teams')}
              className="gap-2"
            >
              <Icon name="Users" size={16} />
              Команды
            </Button>
            
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Icon name="User" size={16} />
                    {user?.username}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Мой аккаунт</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <Icon name="User" size={14} className="mr-2" />
                    Профиль
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/teams')}>
                    <Icon name="Users" size={14} className="mr-2" />
                    Мои команды
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/achievements')}>
                    <Icon name="Trophy" size={14} className="mr-2" />
                    Достижения
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <Icon name="LogOut" size={14} className="mr-2" />
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <AuthDialog />
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/schedule')}
              className="gap-2"
            >
              <Icon name="Calendar" size={16} />
              Расписание
            </Button>
          </div>
          
          <NotificationBell userId={1} />
          
          <Button variant="ghost" size="icon" onClick={onThemeToggle}>
            <Icon name={theme === 'light' ? 'Moon' : 'Sun'} size={20} />
          </Button>

          <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
            <Icon name="User" size={20} />
          </Button>

          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <Icon name="Settings" size={20} />
          </Button>
        </div>
      </div>

      <div className="md:hidden border-t">
        <div className="container px-4 py-2">
          <SearchWithAutocomplete placeholder="Поиск манхв..." />
        </div>
      </div>
    </header>
  );
}