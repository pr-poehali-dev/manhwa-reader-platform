import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '@/components/NotificationBell';
import SearchWithAutocomplete from '@/components/SearchWithAutocomplete';

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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent cursor-pointer" onClick={() => navigate('/')}>
              MANHWA READER
            </h1>
            <div className="hidden sm:flex items-center gap-1 bg-muted rounded-lg p-1">
              <Button
                variant={contentType === 'manhwa' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  onContentTypeChange('manhwa');
                  navigate('/');
                }}
                className="text-xs"
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
                className="text-xs"
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
          
          <NotificationBell />
          
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