import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import LazyImage from '@/components/LazyImage';
import { useNavigate } from 'react-router-dom';

interface Manhwa {
  id: number;
  title: string;
  cover: string;
  chapters: number;
  rating: number;
  status: string;
  genre: string[];
  views: number;
  year?: number;
  author?: string;
}

interface CatalogGridProps {
  manhwaList: Manhwa[];
  bookmarks: Set<number>;
  selectedGenres: string[];
  onBookmarkToggle: (id: number, e: React.MouseEvent) => void;
  onGenreToggle: (genre: string) => void;
  onResetFilters: () => void;
}

export default function CatalogGrid({
  manhwaList,
  bookmarks,
  selectedGenres,
  onBookmarkToggle,
  onGenreToggle,
  onResetFilters
}: CatalogGridProps) {
  const navigate = useNavigate();

  if (manhwaList.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Icon name="SearchX" size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-xl font-bold mb-2">Ничего не найдено</h3>
          <p className="text-muted-foreground mb-4">
            Попробуйте изменить параметры фильтрации
          </p>
          <Button onClick={onResetFilters}>
            Сбросить фильтры
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {selectedGenres.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Активные жанры:</span>
          {selectedGenres.map(genre => (
            <Badge
              key={genre}
              variant="default"
              className="cursor-pointer"
              onClick={() => onGenreToggle(genre)}
            >
              {genre}
              <Icon name="X" size={12} className="ml-1" />
            </Badge>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {manhwaList.map((manhwa) => (
          <Card 
            key={manhwa.id} 
            className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105"
            onClick={() => navigate(`/manhwa/${manhwa.id}`)}
          >
            <div className="aspect-[3/4] relative overflow-hidden">
              <LazyImage
                src={manhwa.cover}
                alt={manhwa.title}
                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute top-2 right-2 flex flex-col gap-1">
                <Button
                  size="icon"
                  variant={bookmarks.has(manhwa.id) ? 'default' : 'secondary'}
                  className="h-8 w-8"
                  onClick={(e) => onBookmarkToggle(manhwa.id, e)}
                >
                  <Icon name={bookmarks.has(manhwa.id) ? 'BookmarkCheck' : 'Bookmark'} size={16} />
                </Button>
                <Badge variant="destructive" className="text-xs font-bold">
                  <Icon name="Star" size={12} className="mr-1" />
                  {manhwa.rating}
                </Badge>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Button
                size="sm"
                className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/reader/${manhwa.id}`);
                }}
              >
                <Icon name="BookOpen" size={16} />
                Читать
              </Button>
            </div>
            
            <CardContent className="p-3">
              <h3 className="font-semibold text-sm mb-2 line-clamp-2 min-h-[40px]">
                {manhwa.title}
              </h3>
              
              <div className="flex flex-wrap gap-1 mb-2">
                {manhwa.genre.slice(0, 2).map((genre) => (
                  <Badge key={genre} variant="secondary" className="text-xs">
                    {genre}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Icon name="BookText" size={14} />
                  <span>{manhwa.chapters} гл.</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon name="Eye" size={14} />
                  <span>{manhwa.views}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}