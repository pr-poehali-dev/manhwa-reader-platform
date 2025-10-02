export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
export type BadgeCategory = 'reading' | 'social' | 'leaderboard' | 'streak' | 'special';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
  category: BadgeCategory;
  condition: string;
  unlockedAt?: Date;
}

export interface BadgeRequirement {
  type: 'chapters' | 'comments' | 'likes' | 'streak' | 'rank_week' | 'rank_month' | 'rank_all';
  value: number;
  operator: '>=' | '>' | '=' | '<=' | '<';
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
  category: BadgeCategory;
  requirements: BadgeRequirement[];
}

class BadgeServiceClass {
  private badges: BadgeDefinition[] = [
    {
      id: 'champion_week',
      name: 'Чемпион недели',
      description: '1 место в недельном рейтинге',
      icon: '👑',
      rarity: 'epic',
      category: 'leaderboard',
      requirements: [{ type: 'rank_week', value: 1, operator: '=' }]
    },
    {
      id: 'champion_month',
      name: 'Чемпион месяца',
      description: '1 место в месячном рейтинге',
      icon: '🏆',
      rarity: 'legendary',
      category: 'leaderboard',
      requirements: [{ type: 'rank_month', value: 1, operator: '=' }]
    },
    {
      id: 'champion_all',
      name: 'Легенда сообщества',
      description: '1 место в общем рейтинге',
      icon: '⭐',
      rarity: 'mythic',
      category: 'leaderboard',
      requirements: [{ type: 'rank_all', value: 1, operator: '=' }]
    },
    {
      id: 'top3_week',
      name: 'Призёр недели',
      description: 'Топ-3 в недельном рейтинге',
      icon: '🥉',
      rarity: 'rare',
      category: 'leaderboard',
      requirements: [{ type: 'rank_week', value: 3, operator: '<=' }]
    },
    {
      id: 'top3_month',
      name: 'Призёр месяца',
      description: 'Топ-3 в месячном рейтинге',
      icon: '🥈',
      rarity: 'epic',
      category: 'leaderboard',
      requirements: [{ type: 'rank_month', value: 3, operator: '<=' }]
    },
    {
      id: 'top10_all',
      name: 'Топ-10',
      description: 'Топ-10 в общем рейтинге',
      icon: '🔥',
      rarity: 'rare',
      category: 'leaderboard',
      requirements: [{ type: 'rank_all', value: 10, operator: '<=' }]
    },
    {
      id: 'reader_novice',
      name: 'Новичок',
      description: 'Прочитано 10 глав',
      icon: '📖',
      rarity: 'common',
      category: 'reading',
      requirements: [{ type: 'chapters', value: 10, operator: '>=' }]
    },
    {
      id: 'reader_enthusiast',
      name: 'Энтузиаст',
      description: 'Прочитано 100 глав',
      icon: '📚',
      rarity: 'rare',
      category: 'reading',
      requirements: [{ type: 'chapters', value: 100, operator: '>=' }]
    },
    {
      id: 'reader_master',
      name: 'Мастер чтения',
      description: 'Прочитано 500 глав',
      icon: '🎓',
      rarity: 'epic',
      category: 'reading',
      requirements: [{ type: 'chapters', value: 500, operator: '>=' }]
    },
    {
      id: 'reader_legend',
      name: 'Легенда чтения',
      description: 'Прочитано 1000 глав',
      icon: '👨‍🎓',
      rarity: 'legendary',
      category: 'reading',
      requirements: [{ type: 'chapters', value: 1000, operator: '>=' }]
    },
    {
      id: 'social_active',
      name: 'Активный комментатор',
      description: 'Оставлено 50 комментариев',
      icon: '💬',
      rarity: 'common',
      category: 'social',
      requirements: [{ type: 'comments', value: 50, operator: '>=' }]
    },
    {
      id: 'social_expert',
      name: 'Эксперт общения',
      description: 'Оставлено 200 комментариев',
      icon: '💭',
      rarity: 'rare',
      category: 'social',
      requirements: [{ type: 'comments', value: 200, operator: '>=' }]
    },
    {
      id: 'social_influencer',
      name: 'Влиятельный критик',
      description: 'Оставлено 500 комментариев',
      icon: '🗣️',
      rarity: 'epic',
      category: 'social',
      requirements: [{ type: 'comments', value: 500, operator: '>=' }]
    },
    {
      id: 'likes_popular',
      name: 'Популярный',
      description: 'Получено 100 лайков',
      icon: '❤️',
      rarity: 'rare',
      category: 'social',
      requirements: [{ type: 'likes', value: 100, operator: '>=' }]
    },
    {
      id: 'likes_celebrity',
      name: 'Знаменитость',
      description: 'Получено 500 лайков',
      icon: '💖',
      rarity: 'epic',
      category: 'social',
      requirements: [{ type: 'likes', value: 500, operator: '>=' }]
    },
    {
      id: 'streak_week',
      name: 'Недельная серия',
      description: '7 дней подряд',
      icon: '🔥',
      rarity: 'common',
      category: 'streak',
      requirements: [{ type: 'streak', value: 7, operator: '>=' }]
    },
    {
      id: 'streak_month',
      name: 'Месячная серия',
      description: '30 дней подряд',
      icon: '⚡',
      rarity: 'rare',
      category: 'streak',
      requirements: [{ type: 'streak', value: 30, operator: '>=' }]
    },
    {
      id: 'streak_quarter',
      name: 'Квартальная серия',
      description: '90 дней подряд',
      icon: '💫',
      rarity: 'epic',
      category: 'streak',
      requirements: [{ type: 'streak', value: 90, operator: '>=' }]
    },
    {
      id: 'streak_year',
      name: 'Годовая серия',
      description: '365 дней подряд',
      icon: '🌟',
      rarity: 'legendary',
      category: 'streak',
      requirements: [{ type: 'streak', value: 365, operator: '>=' }]
    }
  ];

  getRarityColor(rarity: BadgeRarity): string {
    const colors: Record<BadgeRarity, string> = {
      common: 'text-gray-400',
      rare: 'text-blue-400',
      epic: 'text-purple-400',
      legendary: 'text-orange-400',
      mythic: 'text-pink-400'
    };
    return colors[rarity];
  }

  getRarityBgColor(rarity: BadgeRarity): string {
    const colors: Record<BadgeRarity, string> = {
      common: 'bg-gray-500/10',
      rare: 'bg-blue-500/10',
      epic: 'bg-purple-500/10',
      legendary: 'bg-orange-500/10',
      mythic: 'bg-pink-500/10'
    };
    return colors[rarity];
  }

  getRarityBorderColor(rarity: BadgeRarity): string {
    const colors: Record<BadgeRarity, string> = {
      common: 'border-gray-500/20',
      rare: 'border-blue-500/20',
      epic: 'border-purple-500/20',
      legendary: 'border-orange-500/20',
      mythic: 'border-pink-500/20'
    };
    return colors[rarity];
  }

  getRarityName(rarity: BadgeRarity): string {
    const names: Record<BadgeRarity, string> = {
      common: 'Обычный',
      rare: 'Редкий',
      epic: 'Эпический',
      legendary: 'Легендарный',
      mythic: 'Мифический'
    };
    return names[rarity];
  }

  checkRequirement(req: BadgeRequirement, value: number): boolean {
    switch (req.operator) {
      case '>=': return value >= req.value;
      case '>': return value > req.value;
      case '=': return value === req.value;
      case '<=': return value <= req.value;
      case '<': return value < req.value;
      default: return false;
    }
  }

  checkBadgeUnlocked(
    badge: BadgeDefinition,
    stats: {
      chapters: number;
      comments: number;
      likes: number;
      streak: number;
      rankWeek: number;
      rankMonth: number;
      rankAll: number;
    }
  ): boolean {
    return badge.requirements.every(req => {
      let value = 0;
      switch (req.type) {
        case 'chapters': value = stats.chapters; break;
        case 'comments': value = stats.comments; break;
        case 'likes': value = stats.likes; break;
        case 'streak': value = stats.streak; break;
        case 'rank_week': value = stats.rankWeek; break;
        case 'rank_month': value = stats.rankMonth; break;
        case 'rank_all': value = stats.rankAll; break;
      }
      return this.checkRequirement(req, value);
    });
  }

  getUserBadges(stats: {
    chapters: number;
    comments: number;
    likes: number;
    streak: number;
    rankWeek: number;
    rankMonth: number;
    rankAll: number;
  }): Badge[] {
    return this.badges
      .filter(badge => this.checkBadgeUnlocked(badge, stats))
      .map(badge => ({
        ...badge,
        condition: badge.requirements.map(r => 
          `${this.getRequirementName(r.type)} ${r.operator} ${r.value}`
        ).join(', '),
        unlockedAt: new Date()
      }))
      .sort((a, b) => {
        const rarityOrder: Record<BadgeRarity, number> = {
          mythic: 5,
          legendary: 4,
          epic: 3,
          rare: 2,
          common: 1
        };
        return rarityOrder[b.rarity] - rarityOrder[a.rarity];
      });
  }

  getAvailableBadges(): BadgeDefinition[] {
    return this.badges;
  }

  getBadgesByCategory(category: BadgeCategory): BadgeDefinition[] {
    return this.badges.filter(b => b.category === category);
  }

  getBadgeProgress(
    badge: BadgeDefinition,
    stats: {
      chapters: number;
      comments: number;
      likes: number;
      streak: number;
      rankWeek: number;
      rankMonth: number;
      rankAll: number;
    }
  ): { current: number; required: number; percentage: number } {
    const req = badge.requirements[0];
    let current = 0;
    switch (req.type) {
      case 'chapters': current = stats.chapters; break;
      case 'comments': current = stats.comments; break;
      case 'likes': current = stats.likes; break;
      case 'streak': current = stats.streak; break;
      case 'rank_week': current = stats.rankWeek; break;
      case 'rank_month': current = stats.rankMonth; break;
      case 'rank_all': current = stats.rankAll; break;
    }
    
    const percentage = Math.min(100, (current / req.value) * 100);
    return { current, required: req.value, percentage };
  }

  private getRequirementName(type: BadgeRequirement['type']): string {
    const names: Record<BadgeRequirement['type'], string> = {
      chapters: 'Главы',
      comments: 'Комментарии',
      likes: 'Лайки',
      streak: 'Серия дней',
      rank_week: 'Место за неделю',
      rank_month: 'Место за месяц',
      rank_all: 'Общее место'
    };
    return names[type];
  }
}

export const BadgeService = new BadgeServiceClass();
