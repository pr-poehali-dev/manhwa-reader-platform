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
  age_rating?: string;
  type?: string;
  translation_status?: string;
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
      className="group cursor-pointer overflow-hidden hover:shadow-2xl hover:shadow-primary/30 transition-all duration-500 hover:-translate-y-2 border-0 bg-gradient-to-b from-card to-card/50 backdrop-blur-sm"
      onClick={onCardClick}
    >
      <div className="aspect-[2/3] relative overflow-hidden">
        <img
          src={manhwa.cover}
          alt={manhwa.title}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          <Button
            size="icon"
            variant={isBookmarked ? 'default' : 'secondary'}
            className="h-9 w-9 backdrop-blur-md bg-background/90 border-0 shadow-xl hover:scale-110 transition-transform"
            onClick={onBookmarkToggle}
          >
            <Icon name={isBookmarked ? 'BookmarkCheck' : 'Bookmark'} size={18} />
          </Button>
        </div>

        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {showNewBadge && (
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold border-0 shadow-lg">
              <Icon name="Sparkles" size={12} className="mr-1" />
              NEW
            </Badge>
          )}
          {manhwa.age_rating && (
            <Badge variant="secondary" className="text-xs font-bold backdrop-blur-md bg-background/90">
              {manhwa.age_rating}
            </Badge>
          )}
          {manhwa.translation_status && (
            <Badge 
              className={`text-xs font-bold ${
                manhwa.translation_status === 'active' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {manhwa.translation_status === 'active' ? 'Переводится' : 'Завершён'}
            </Badge>
          )}
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
        
        <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="text-xs font-bold bg-gradient-to-r from-primary via-pink-500 to-secondary text-white border-0 shadow-lg">
              <Icon name="Star" size={12} className="mr-1" />
              {manhwa.rating}
            </Badge>
            <Badge variant="outline" className="text-xs text-white border-white/50 backdrop-blur-sm">
              {manhwa.status}
            </Badge>
          </div>
          
          <Button
            size="sm"
            className="w-full opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 gap-2 bg-gradient-to-r from-primary via-pink-500 to-secondary hover:shadow-2xl hover:shadow-primary/50 border-0 text-white font-semibold"
            onClick={(e) => {
              e.stopPropagation();
              onCardClick();
            }}
          >
            <Icon name="BookOpen" size={16} />
            Начать читать
          </Button>
        </div>
      </div>
      
      <CardContent className="p-4 space-y-3">
        <h3 className="font-bold text-base leading-tight line-clamp-2 min-h-[48px] group-hover:text-primary transition-colors">
          {manhwa.title}
        </h3>
        
        {showGenres && (
          <div className="flex flex-wrap gap-1.5">
            {manhwa.genre.slice(0, 3).map((genre) => (
              <Badge key={genre} variant="outline" className="text-xs border-primary/40 text-foreground/80 hover:bg-primary/10 transition-colors">
                {genre}
              </Badge>
            ))}
          </div>
        )}

        {showStats && (
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
            <div className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <Icon name="BookText" size={14} />
              <span className="font-medium">{manhwa.chapters} глав</span>
            </div>
            <div className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <Icon name="Eye" size={14} />
              <span className="font-medium">{(manhwa.views / 1000).toFixed(1)}K</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}