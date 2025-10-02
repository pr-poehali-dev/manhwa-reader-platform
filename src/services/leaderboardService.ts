import { userStatsService } from './userStatsService';

export interface LeaderboardEntry {
  userId: number;
  username: string;
  avatar?: string;
  score: number;
  chaptersRead: number;
  commentsCount: number;
  likesReceived: number;
  readingStreak: number;
  rank: number;
  change: number;
}

export type LeaderboardPeriod = 'week' | 'month' | 'allTime';
export type LeaderboardType = 'chapters' | 'comments' | 'likes' | 'streak';

class LeaderboardService {
  private mockUsers = [
    { id: 1, username: 'Александр', avatar: '🦸' },
    { id: 2, username: 'Мария', avatar: '👸' },
    { id: 3, username: 'Дмитрий', avatar: '🧙' },
    { id: 4, username: 'Анна', avatar: '🧝' },
    { id: 5, username: 'Иван', avatar: '🥷' },
    { id: 6, username: 'Елена', avatar: '🧚' },
    { id: 7, username: 'Максим', avatar: '🦹' },
    { id: 8, username: 'Ольга', avatar: '👩‍🎤' },
    { id: 9, username: 'Сергей', avatar: '🤴' },
    { id: 10, username: 'Наталья', avatar: '👰' },
    { id: 11, username: 'Андрей', avatar: '🕵️' },
    { id: 12, username: 'Екатерина', avatar: '💃' },
    { id: 13, username: 'Владимир', avatar: '🧛' },
    { id: 14, username: 'Татьяна', avatar: '🧜' },
    { id: 15, username: 'Алексей', avatar: '🦸‍♂️' }
  ];

  private generateMockStats(userId: number, period: LeaderboardPeriod) {
    const multiplier = period === 'week' ? 0.5 : period === 'month' ? 1 : 2;
    const base = Math.random() * 100;
    
    return {
      chaptersRead: Math.floor((50 + base) * multiplier),
      commentsCount: Math.floor((10 + base * 0.3) * multiplier),
      likesReceived: Math.floor((20 + base * 0.5) * multiplier),
      readingStreak: Math.floor(5 + Math.random() * 25)
    };
  }

  getLeaderboard(
    type: LeaderboardType = 'chapters',
    period: LeaderboardPeriod = 'week',
    limit: number = 100
  ): LeaderboardEntry[] {
    const entries: LeaderboardEntry[] = this.mockUsers.map(user => {
      const stats = this.generateMockStats(user.id, period);
      
      let score = 0;
      switch (type) {
        case 'chapters':
          score = stats.chaptersRead;
          break;
        case 'comments':
          score = stats.commentsCount;
          break;
        case 'likes':
          score = stats.likesReceived;
          break;
        case 'streak':
          score = stats.readingStreak;
          break;
      }
      
      return {
        userId: user.id,
        username: user.username,
        avatar: user.avatar,
        score,
        chaptersRead: stats.chaptersRead,
        commentsCount: stats.commentsCount,
        likesReceived: stats.likesReceived,
        readingStreak: stats.readingStreak,
        rank: 0,
        change: Math.floor(Math.random() * 10) - 5
      };
    });

    entries.sort((a, b) => b.score - a.score);

    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    const currentUserStats = userStatsService.getStats(1);
    let currentUserScore = 0;
    
    switch (type) {
      case 'chapters':
        currentUserScore = currentUserStats.chaptersRead;
        break;
      case 'comments':
        currentUserScore = currentUserStats.commentsCount;
        break;
      case 'likes':
        currentUserScore = currentUserStats.likesReceived;
        break;
      case 'streak':
        currentUserScore = currentUserStats.readingStreak;
        break;
    }

    const currentUserInList = entries.find(e => e.userId === 1);
    if (currentUserInList) {
      currentUserInList.score = currentUserScore;
      currentUserInList.chaptersRead = currentUserStats.chaptersRead;
      currentUserInList.commentsCount = currentUserStats.commentsCount;
      currentUserInList.likesReceived = currentUserStats.likesReceived;
      currentUserInList.readingStreak = currentUserStats.readingStreak;
    }

    entries.sort((a, b) => b.score - a.score);
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return entries.slice(0, limit);
  }

  getUserRank(userId: number, type: LeaderboardType = 'chapters', period: LeaderboardPeriod = 'week'): number {
    const leaderboard = this.getLeaderboard(type, period);
    const entry = leaderboard.find(e => e.userId === userId);
    return entry?.rank || 0;
  }

  getTopUsers(type: LeaderboardType = 'chapters', period: LeaderboardPeriod = 'week', limit: number = 10): LeaderboardEntry[] {
    return this.getLeaderboard(type, period, limit);
  }

  getScoreLabel(type: LeaderboardType): string {
    switch (type) {
      case 'chapters': return 'глав';
      case 'comments': return 'комм.';
      case 'likes': return 'лайков';
      case 'streak': return 'дней';
    }
  }

  getTypeIcon(type: LeaderboardType): string {
    switch (type) {
      case 'chapters': return 'BookOpen';
      case 'comments': return 'MessageCircle';
      case 'likes': return 'Heart';
      case 'streak': return 'Flame';
    }
  }

  getPeriodLabel(period: LeaderboardPeriod): string {
    switch (period) {
      case 'week': return 'За неделю';
      case 'month': return 'За месяц';
      case 'allTime': return 'За всё время';
    }
  }
}

export const leaderboardService = new LeaderboardService();
