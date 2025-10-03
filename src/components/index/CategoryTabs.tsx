import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const CATEGORIES = [
  { id: 'all', label: 'Все', icon: 'LayoutGrid' },
  { id: 'popular', label: 'Популярное', icon: 'TrendingUp' },
  { id: 'new', label: 'Новинки', icon: 'Sparkles' },
  { id: 'updated', label: 'Обновлённые', icon: 'Clock' },
  { id: 'top_rated', label: 'Топ рейтинг', icon: 'Star' },
  { id: 'reading', label: 'Читаю', icon: 'BookOpen' },
  { id: 'bookmarks', label: 'Закладки', icon: 'Bookmark' },
  { id: 'finished', label: 'Прочитано', icon: 'CheckCircle2' }
];

export default function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {CATEGORIES.map((category) => (
        <Button
          key={category.id}
          variant={activeCategory === category.id ? 'default' : 'outline'}
          size="sm"
          onClick={() => onCategoryChange(category.id)}
          className={`
            flex-shrink-0 gap-2 transition-all theme-transition
            ${activeCategory === category.id 
              ? 'bg-gradient-to-r from-primary to-secondary shadow-lg' 
              : 'hover:border-primary/50'
            }
          `}
        >
          <Icon name={category.icon as any} size={16} />
          {category.label}
        </Button>
      ))}
    </div>
  );
}
