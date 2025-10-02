import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BadgeService, type Badge as BadgeType } from '@/services/BadgeService';
import Icon from '@/components/ui/icon';

interface BadgeCardProps {
  badge: BadgeType;
  progress?: { current: number; required: number; percentage: number };
  unlocked?: boolean;
}

export default function BadgeCard({ badge, progress, unlocked = true }: BadgeCardProps) {
  return (
    <Card 
      className={`relative overflow-hidden transition-all hover:scale-105 ${
        unlocked 
          ? `${BadgeService.getRarityBgColor(badge.rarity)} ${BadgeService.getRarityBorderColor(badge.rarity)}` 
          : 'opacity-60 grayscale'
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="text-4xl shrink-0">
            {badge.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-sm truncate">
                {badge.name}
              </h4>
              <Badge 
                variant="outline" 
                className={`text-xs ${BadgeService.getRarityColor(badge.rarity)}`}
              >
                {BadgeService.getRarityName(badge.rarity)}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {badge.description}
            </p>
            
            {!unlocked && progress && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Прогресс</span>
                  <span className="font-medium">{progress.current} / {progress.required}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${BadgeService.getRarityBgColor(badge.rarity)}`}
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
              </div>
            )}
            
            {unlocked && badge.unlockedAt && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Icon name="Check" size={12} className="text-green-500" />
                Получено {badge.unlockedAt.toLocaleDateString('ru-RU')}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
