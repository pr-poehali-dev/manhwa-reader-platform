export interface UserStats {
  userId: number;
  commentsCount: number;
  likesGiven: number;
  likesReceived: number;
  chaptersRead: number;
  manhwaCompleted: number;
  readingStreak: number;
  lastActiveDate: string;
  joinDate: string;
  totalReadingTime: number;
}

export interface ReadingProgress {
  userId: number;
  manhwaId: number;
  chapterId: number;
  progress: number;
  lastReadAt: string;
}

const STATS_STORAGE_KEY = 'manhwa_user_stats';
const PROGRESS_STORAGE_KEY = 'manhwa_reading_progress';

class UserStatsService {
  private stats: Map<number, UserStats> = new Map();
  private readingProgress: ReadingProgress[] = [];

  constructor() {
    this.loadStats();
    this.loadProgress();
  }

  private loadStats(): void {
    const stored = localStorage.getItem(STATS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      this.stats = new Map(Object.entries(parsed).map(([key, value]) => [Number(key), value as UserStats]));
    }
  }

  private saveStats(): void {
    const obj = Object.fromEntries(this.stats.entries());
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(obj));
    window.dispatchEvent(new CustomEvent('user-stats-updated'));
  }

  private loadProgress(): void {
    const stored = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (stored) {
      this.readingProgress = JSON.parse(stored);
    }
  }

  private saveProgress(): void {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(this.readingProgress));
  }

  getStats(userId: number): UserStats {
    if (!this.stats.has(userId)) {
      this.stats.set(userId, {
        userId,
        commentsCount: 0,
        likesGiven: 0,
        likesReceived: 0,
        chaptersRead: 0,
        manhwaCompleted: 0,
        readingStreak: 0,
        lastActiveDate: new Date().toISOString(),
        joinDate: new Date().toISOString(),
        totalReadingTime: 0
      });
      this.saveStats();
    }
    return this.stats.get(userId)!;
  }

  incrementComments(userId: number): void {
    const stats = this.getStats(userId);
    stats.commentsCount++;
    this.updateLastActive(userId);
    this.saveStats();
  }

  incrementLikesGiven(userId: number): void {
    const stats = this.getStats(userId);
    stats.likesGiven++;
    this.updateLastActive(userId);
    this.saveStats();
  }

  incrementLikesReceived(userId: number): void {
    const stats = this.getStats(userId);
    stats.likesReceived++;
    this.saveStats();
  }

  markChapterAsRead(userId: number, manhwaId: number, chapterId: number): void {
    const stats = this.getStats(userId);
    
    const existingProgress = this.readingProgress.find(
      p => p.userId === userId && p.manhwaId === manhwaId && p.chapterId === chapterId
    );

    if (!existingProgress) {
      this.readingProgress.push({
        userId,
        manhwaId,
        chapterId,
        progress: 100,
        lastReadAt: new Date().toISOString()
      });
      stats.chaptersRead++;
      this.updateReadingStreak(userId);
      this.saveProgress();
    } else {
      existingProgress.lastReadAt = new Date().toISOString();
      this.saveProgress();
    }

    this.updateLastActive(userId);
    this.saveStats();
  }

  updateReadingTime(userId: number, minutes: number): void {
    const stats = this.getStats(userId);
    stats.totalReadingTime += minutes;
    this.saveStats();
  }

  private updateLastActive(userId: number): void {
    const stats = this.getStats(userId);
    stats.lastActiveDate = new Date().toISOString();
  }

  private updateReadingStreak(userId: number): void {
    const stats = this.getStats(userId);
    const lastActive = new Date(stats.lastActiveDate);
    const today = new Date();
    
    const daysDiff = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) {
      return;
    } else if (daysDiff === 1) {
      stats.readingStreak++;
    } else {
      stats.readingStreak = 1;
    }
  }

  getReadingProgress(userId: number, manhwaId: number): ReadingProgress[] {
    return this.readingProgress.filter(
      p => p.userId === userId && p.manhwaId === manhwaId
    ).sort((a, b) => b.chapterId - a.chapterId);
  }

  getTotalManhwaRead(userId: number): number {
    const manhwaIds = new Set(
      this.readingProgress
        .filter(p => p.userId === userId)
        .map(p => p.manhwaId)
    );
    return manhwaIds.size;
  }

  getRecentActivity(userId: number, limit: number = 10): ReadingProgress[] {
    return this.readingProgress
      .filter(p => p.userId === userId)
      .sort((a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime())
      .slice(0, limit);
  }

  getAchievements(userId: number): { name: string; description: string; unlocked: boolean; icon: string }[] {
    const stats = this.getStats(userId);
    
    return [
      {
        name: 'Первый комментарий',
        description: 'Оставьте свой первый комментарий',
        unlocked: stats.commentsCount >= 1,
        icon: 'MessageCircle'
      },
      {
        name: 'Активный читатель',
        description: 'Прочитайте 10 глав',
        unlocked: stats.chaptersRead >= 10,
        icon: 'BookOpen'
      },
      {
        name: 'Книжный червь',
        description: 'Прочитайте 100 глав',
        unlocked: stats.chaptersRead >= 100,
        icon: 'Library'
      },
      {
        name: 'Популярный автор',
        description: 'Получите 50 лайков',
        unlocked: stats.likesReceived >= 50,
        icon: 'Heart'
      },
      {
        name: 'Неделя подряд',
        description: 'Читайте 7 дней подряд',
        unlocked: stats.readingStreak >= 7,
        icon: 'Flame'
      },
      {
        name: 'Марафонец',
        description: 'Читайте 30 дней подряд',
        unlocked: stats.readingStreak >= 30,
        icon: 'Trophy'
      },
      {
        name: 'Ценитель',
        description: 'Поставьте 100 лайков',
        unlocked: stats.likesGiven >= 100,
        icon: 'ThumbsUp'
      },
      {
        name: 'Коллекционер',
        description: 'Читайте 10 разных манхв',
        unlocked: this.getTotalManhwaRead(userId) >= 10,
        icon: 'Sparkles'
      }
    ];
  }
}

export const userStatsService = new UserStatsService();
