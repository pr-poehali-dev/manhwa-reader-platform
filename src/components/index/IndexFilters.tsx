import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

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
  { label: 'Все', value: 'all' },
  { label: 'Манхва', value: 'manhwa' },
  { label: 'Манга', value: 'manga' },
  { label: 'Маньхуа', value: 'manhua' },
  { label: 'Западный комикс', value: 'comic' },
  { label: 'Рукомикс', value: 'russian' }
];

const STATUS_FILTERS = [
  { label: 'Все', value: 'all' },
  { label: 'Онгоинг', value: 'ongoing' },
  { label: 'Завершён', value: 'completed' },
  { label: 'Заморожен', value: 'frozen' },
  { label: 'Заброшен', value: 'abandoned' }
];

interface IndexFiltersProps {
  selectedGenres: string[];
  selectedType: string;
  selectedStatus: string;
  showFilters: boolean;
  onGenreToggle: (genre: string) => void;
  onTypeChange: (type: string) => void;
  onStatusChange: (status: string) => void;
  onShowFiltersToggle: () => void;
  onReset: () => void;
}

export default function IndexFilters({
  selectedGenres,
  selectedType,
  selectedStatus,
  showFilters,
  onGenreToggle,
  onTypeChange,
  onStatusChange,
  onShowFiltersToggle,
  onReset
}: IndexFiltersProps) {
  return (
    <section className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Icon name="SlidersHorizontal" size={24} />
          Фильтры
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onShowFiltersToggle}
        >
          {showFilters ? 'Скрыть' : 'Показать'}
        </Button>
      </div>
      
      {showFilters && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-2">Жанры</h3>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((genre) => (
                <Badge
                  key={genre}
                  variant={selectedGenres.includes(genre) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => onGenreToggle(genre)}
                >
                  {genre}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Тип</h3>
              <div className="flex flex-wrap gap-2">
                {TYPE_FILTERS.map((type) => (
                  <Badge
                    key={type.value}
                    variant={selectedType === type.value ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => onTypeChange(type.value)}
                  >
                    {type.label}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold mb-2">Статус</h3>
              <div className="flex flex-wrap gap-2">
                {STATUS_FILTERS.map((status) => (
                  <Badge
                    key={status.value}
                    variant={selectedStatus === status.value ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => onStatusChange(status.value)}
                  >
                    {status.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          {(selectedGenres.length > 0 || selectedType !== 'all' || selectedStatus !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
            >
              Сбросить фильтры
            </Button>
          )}
        </div>
      )}
    </section>
  );
}