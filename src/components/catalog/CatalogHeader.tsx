import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import NotificationBell from '@/components/NotificationBell';
import { useNavigate } from 'react-router-dom';

interface CatalogHeaderProps {
  theme: 'light' | 'dark';
  searchQuery: string;
  onThemeToggle: () => void;
  onSearchChange: (value: string) => void;
}

export default function CatalogHeader({
  theme,
  searchQuery,
  onThemeToggle,
  onSearchChange
}: CatalogHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <h1 className="text-2xl font-bold text-primary">Каталог манхвы</h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative hidden md:block">
            <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск по названию..."
              className="w-64 pl-10"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          
          <NotificationBell />
          
          <Button variant="ghost" size="icon" onClick={onThemeToggle}>
            <Icon name={theme === 'light' ? 'Moon' : 'Sun'} size={20} />
          </Button>
        </div>
      </div>
    </header>
  );
}