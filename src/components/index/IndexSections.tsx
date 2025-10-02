import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import ManhwaCard from './ManhwaCard';

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

interface IndexSectionsProps {
  popularManhwa: Manhwa[];
  recentlyUpdated: Manhwa[];
  currentlyReading: Manhwa[];
  bookmarks: Set<number>;
  onBookmarkToggle: (id: number, e: React.MouseEvent) => void;
}

export default function IndexSections({
  popularManhwa,
  recentlyUpdated,
  currentlyReading,
  bookmarks,
  onBookmarkToggle
}: IndexSectionsProps) {
  const navigate = useNavigate();

  return (
    <>
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-secondary">
              <Icon name="TrendingUp" size={28} className="text-white" />
            </div>
            Популярные тайтлы
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {popularManhwa.map((manhwa) => (
            <ManhwaCard
              key={manhwa.id}
              manhwa={manhwa}
              isBookmarked={bookmarks.has(manhwa.id)}
              variant="detailed"
              onCardClick={() => navigate(`/manhwa/${manhwa.id}`)}
              onBookmarkToggle={(e) => onBookmarkToggle(manhwa.id, e)}
            />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
              <Icon name="Clock" size={24} className="text-white" />
            </div>
            Недавно обновлённые
          </h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {recentlyUpdated.map((manhwa) => (
            <ManhwaCard
              key={manhwa.id}
              manhwa={manhwa}
              isBookmarked={bookmarks.has(manhwa.id)}
              variant="compact"
              showNewBadge={true}
              onCardClick={() => navigate(`/reader/${manhwa.id}`)}
              onBookmarkToggle={(e) => onBookmarkToggle(manhwa.id, e)}
            />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
              <Icon name="Flame" size={24} className="text-white" />
            </div>
            Сейчас читают
          </h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {currentlyReading.map((manhwa) => (
            <ManhwaCard
              key={manhwa.id}
              manhwa={manhwa}
              isBookmarked={bookmarks.has(manhwa.id)}
              variant="default"
              showGenres={true}
              showStats={true}
              onCardClick={() => navigate(`/reader/${manhwa.id}`)}
              onBookmarkToggle={(e) => onBookmarkToggle(manhwa.id, e)}
            />
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-2xl p-8 border border-primary/20 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Icon name="Sparkles" size={28} className="text-primary" />
              Рекомендации для вас
            </h2>
            <p className="text-muted-foreground mt-1">
              Персональные подборки на основе ваших предпочтений
            </p>
          </div>
          <Button onClick={() => navigate('/recommendations')} className="gap-2">
            Все рекомендации
            <Icon name="ArrowRight" size={16} />
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {currentlyReading.slice(0, 5).map((manhwa) => (
            <Card 
              key={manhwa.id} 
              className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105"
              onClick={() => navigate(`/manhwa/${manhwa.id}`)}
            >
              <div className="aspect-[2/3] relative overflow-hidden">
                <img
                  src={manhwa.cover}
                  alt={manhwa.title}
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                />
                <Badge className="absolute top-2 right-2 bg-green-600 text-white text-xs">
                  95% совпадение
                </Badge>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              
              <CardContent className="p-3">
                <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                  {manhwa.title}
                </h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Icon name="Sparkles" size={10} />
                  Похоже на ваши любимые
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}