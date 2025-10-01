import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Manhwa {
  id: number;
  title: string;
  cover: string;
  chapters: number;
  rating: number;
  status: string;
  genre: string[];
  views: number;
  updated_at?: string;
}

interface ManhwaCardProps {
  manhwa: Manhwa;
  isBookmarked: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  showGenres?: boolean;
  showStats?: boolean;
  showNewBadge?: boolean;
  onCardClick: () => void;
  onBookmarkToggle: (e: React.MouseEvent) => void;
}

export default function ManhwaCard({
  manhwa,
  isBookmarked,
  variant = 'default',
  showGenres = false,
  showStats = false,
  showNewBadge = false,
  onCardClick,
  onBookmarkToggle
}: ManhwaCardProps) {
  if (variant === 'compact') {
    return (
      <Card 
        className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105"
        onClick={onCardClick}
      >
        <div className="aspect-[3/4] relative overflow-hidden">
          <img
            src={manhwa.cover}
            alt={manhwa.title}
            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2">
            <Button
              size="icon"
              variant={isBookmarked ? 'default' : 'secondary'}
              className="h-8 w-8"
              onClick={onBookmarkToggle}
            >
              <Icon name={isBookmarked ? 'BookmarkCheck' : 'Bookmark'} size={16} />
            </Button>
          </div>
          {showNewBadge && (
            <Badge className="absolute top-2 left-2 bg-green-600 text-white text-xs">
              <Icon name="Sparkles" size={10} className="mr-1" />
              NEW
            </Badge>
          )}
        </div>
        
        <CardContent className="p-2">
          <h3 className="font-semibold text-xs line-clamp-2">
            {manhwa.title}
          </h3>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'detailed') {
    return (
      <Card 
        className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105"
        onClick={onCardClick}
      >
        <div className="aspect-[3/4] relative overflow-hidden">
          <img
            src={manhwa.cover}
            alt={manhwa.title}
            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            <Button
              size="icon"
              variant={isBookmarked ? 'default' : 'secondary'}
              className="h-8 w-8"
              onClick={onBookmarkToggle}
            >
              <Icon name={isBookmarked ? 'BookmarkCheck' : 'Bookmark'} size={16} />
            </Button>
            <Badge variant="destructive" className="text-xs font-bold">
              <Icon name="Star" size={12} className="mr-1" />
              {manhwa.rating}
            </Badge>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-bold text-white text-lg mb-2 line-clamp-2">
              {manhwa.title}
            </h3>
            <div className="flex items-center gap-2 text-white/90 text-sm">
              <Icon name="Eye" size={14} />
              <span>{manhwa.views.toLocaleString()}</span>
              <span className="mx-2">•</span>
              <Icon name="BookText" size={14} />
              <span>{manhwa.chapters} гл.</span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105"
      onClick={onCardClick}
    >
      <div className="aspect-[3/4] relative overflow-hidden">
        <img
          src={manhwa.cover}
          alt={manhwa.title}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <Button
            size="icon"
            variant={isBookmarked ? 'default' : 'secondary'}
            className="h-8 w-8"
            onClick={onBookmarkToggle}
          >
            <Icon name={isBookmarked ? 'BookmarkCheck' : 'Bookmark'} size={16} />
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
            onCardClick();
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
        
        {showGenres && (
          <div className="flex flex-wrap gap-1 mb-2">
            {manhwa.genre.slice(0, 2).map((genre) => (
              <Badge key={genre} variant="secondary" className="text-xs">
                {genre}
              </Badge>
            ))}
          </div>
        )}

        {showStats && (
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
        )}
      </CardContent>
    </Card>
  );
}
