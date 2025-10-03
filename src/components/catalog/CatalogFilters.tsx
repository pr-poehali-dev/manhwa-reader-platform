import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const GENRES = [
  'Боевик', 'Романтика', 'Фэнтези', 'Драма', 'Комедия',
  'Приключения', 'Психология', 'Школа', 'Сёнэн', 'Сёдзё',
  'Сэйнэн', 'Повседневность', 'Меха', 'Ужасы', 'Детектив',
  'Боевые искусства', 'Гарем', 'Гендерная интрига', 'Демоны',
  'Додзинси', 'Исекай', 'История', 'Киберпанк', 'Космос',
  'Магия', 'Машины', 'Музыка', 'Пародия', 'Постапокалиптика',
  'Реинкарнация', 'Самураи', 'Спорт', 'Супергерои', 'Триллер',
  'Вампиры', 'Военное', 'Выживание', 'Игры', 'Зомби',
  'Криминал', 'Мистика', 'Научная фантастика', 'Полиция',
  'Тайны', 'Трагедия', 'Фантастика', 'Этти', 'Экшен'
];

const TYPE_FILTERS = [
  { label: 'Все типы', value: 'all' },
  { label: 'Манхва', value: 'manhwa' },
  { label: 'Манга', value: 'manga' },
  { label: 'Маньхуа', value: 'manhua' },
  { label: 'Западный комикс', value: 'comic' },
  { label: 'Рукомикс', value: 'russian' }
];

const STATUS_FILTERS = [
  { label: 'Все статусы', value: 'all' },
  { label: 'Онгоинг', value: 'ongoing' },
  { label: 'Завершён', value: 'completed' },
  { label: 'Заморожен', value: 'frozen' },
  { label: 'Заброшен', value: 'abandoned' }
];

const SORT_OPTIONS = [
  { label: 'По рейтингу', value: 'rating' },
  { label: 'По просмотрам', value: 'views' },
  { label: 'По названию', value: 'title' },
  { label: 'По дате обновления', value: 'updated' },
  { label: 'По году выпуска', value: 'year' },
  { label: 'По количеству глав', value: 'chapters' }
];

const YEARS = Array.from({ length: 30 }, (_, i) => 2024 - i);

interface CatalogFiltersProps {
  searchQuery: string;
  selectedGenres: string[];
  selectedType: string;
  selectedStatus: string;
  selectedYear: string;
  sortBy: string;
  minRating: number;
  onSearchChange: (value: string) => void;
  onGenreToggle: (genre: string) => void;
  onTypeChange: (type: string) => void;
  onStatusChange: (status: string) => void;
  onYearChange: (year: string) => void;
  onSortChange: (sort: string) => void;
  onRatingChange: (rating: number) => void;
  onReset: () => void;
}

export default function CatalogFilters({
  searchQuery,
  selectedGenres,
  selectedType,
  selectedStatus,
  selectedYear,
  sortBy,
  minRating,
  onSearchChange,
  onGenreToggle,
  onTypeChange,
  onStatusChange,
  onYearChange,
  onSortChange,
  onRatingChange,
  onReset
}: CatalogFiltersProps) {
  return (
    <Card className="sticky top-20">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Icon name="SlidersHorizontal" size={20} />
            Фильтры
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-xs"
          >
            Сбросить
          </Button>
        </div>

        <div className="md:hidden">
          <div className="relative">
            <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск..."
              className="w-full pl-10"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold mb-2 block">Сортировка</label>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-semibold mb-2 block">Тип</label>
          <Select value={selectedType} onValueChange={onTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPE_FILTERS.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-semibold mb-2 block">Статус</label>
          <Select value={selectedStatus} onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map(status => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-semibold mb-2 block">Год выпуска</label>
          <Select value={selectedYear} onValueChange={onYearChange}>
            <SelectTrigger>
              <SelectValue placeholder="Все года" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все года</SelectItem>
              {YEARS.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-semibold mb-2 block">
            Минимальный рейтинг: {minRating}
          </label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={minRating}
            onChange={(e) => onRatingChange(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold mb-2 block">
            Жанры ({selectedGenres.length})
          </label>
          <div className="flex flex-wrap gap-1 max-h-64 overflow-y-auto">
            {GENRES.map(genre => (
              <Badge
                key={genre}
                variant={selectedGenres.includes(genre) ? 'default' : 'outline'}
                className="cursor-pointer text-xs"
                onClick={() => onGenreToggle(genre)}
              >
                {genre}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}