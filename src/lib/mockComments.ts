import { User } from './mockAuth';
import { notificationService } from '@/services/notificationService';
import { userStatsService } from '@/services/userStatsService';

export interface Comment {
  id: number;
  chapter_id: number;
  manhwa_id: number;
  user_id: number;
  username: string;
  user_avatar?: string;
  content: string;
  likes: number;
  dislikes: number;
  created_at: string;
  updated_at?: string;
  parent_id?: number;
  replies?: Comment[];
}

export interface CommentReaction {
  comment_id: number;
  user_id: number;
  type: 'like' | 'dislike';
}

const STORAGE_COMMENTS_KEY = 'manhwa_comments';
const STORAGE_REACTIONS_KEY = 'manhwa_comment_reactions';

let mockComments: Comment[] = [];
let mockReactions: CommentReaction[] = [];
let nextCommentId = 1;

const loadFromStorage = () => {
  try {
    const commentsData = localStorage.getItem(STORAGE_COMMENTS_KEY);
    const reactionsData = localStorage.getItem(STORAGE_REACTIONS_KEY);
    
    if (commentsData) {
      mockComments = JSON.parse(commentsData);
      nextCommentId = Math.max(...mockComments.map(c => c.id), 0) + 1;
    }
    
    if (reactionsData) {
      mockReactions = JSON.parse(reactionsData);
    }
  } catch (e) {
    console.error('Failed to load comments from storage', e);
  }
};

const saveToStorage = () => {
  try {
    localStorage.setItem(STORAGE_COMMENTS_KEY, JSON.stringify(mockComments));
    localStorage.setItem(STORAGE_REACTIONS_KEY, JSON.stringify(mockReactions));
  } catch (e) {
    console.error('Failed to save comments to storage', e);
  }
};

loadFromStorage();

const buildCommentTree = (comments: Comment[]): Comment[] => {
  const commentMap = new Map<number, Comment>();
  const rootComments: Comment[] = [];

  comments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  comments.forEach(comment => {
    const commentWithReplies = commentMap.get(comment.id)!;
    
    if (comment.parent_id) {
      const parent = commentMap.get(comment.parent_id);
      if (parent) {
        parent.replies!.push(commentWithReplies);
      }
    } else {
      rootComments.push(commentWithReplies);
    }
  });

  return rootComments;
};

export const mockCommentsAPI = {
  getComments: async (manhwaId: number, chapterId?: number): Promise<Comment[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filtered = mockComments.filter(c => c.manhwa_id === manhwaId);
    
    if (chapterId !== undefined) {
      filtered = filtered.filter(c => c.chapter_id === chapterId);
    }

    const commentsWithReactions = filtered.map(comment => {
      const likes = mockReactions.filter(r => r.comment_id === comment.id && r.type === 'like').length;
      const dislikes = mockReactions.filter(r => r.comment_id === comment.id && r.type === 'dislike').length;
      
      return {
        ...comment,
        likes,
        dislikes
      };
    });

    const sorted = commentsWithReactions.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return buildCommentTree(sorted);
  },

  addComment: async (
    manhwaId: number,
    chapterId: number,
    content: string,
    user: User,
    parentId?: number
  ): Promise<Comment> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const comment: Comment = {
      id: nextCommentId++,
      chapter_id: chapterId,
      manhwa_id: manhwaId,
      user_id: user.id,
      username: user.username,
      content: content.trim(),
      likes: 0,
      dislikes: 0,
      created_at: new Date().toISOString(),
      parent_id: parentId
    };
    
    mockComments.push(comment);
    saveToStorage();
    
    userStatsService.incrementComments(user.id);
    
    if (parentId) {
      const parentComment = mockComments.find(c => c.id === parentId);
      if (parentComment && parentComment.user_id !== user.id) {
        notificationService.createNotification({
          userId: parentComment.user_id,
          type: 'comment_reply',
          fromUser: {
            id: user.id,
            name: user.username
          },
          commentId: comment.id,
          manhwaId,
          chapterId,
          manhwaTitle: 'Solo Leveling',
          message: `ответил(а) на ваш комментарий: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`
        });
      }
    }
    
    return comment;
  },

  updateComment: async (commentId: number, userId: number, content: string): Promise<Comment | null> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const comment = mockComments.find(c => c.id === commentId);
    
    if (!comment || comment.user_id !== userId) {
      return null;
    }
    
    comment.content = content.trim();
    comment.updated_at = new Date().toISOString();
    
    saveToStorage();
    
    return comment;
  },

  deleteComment: async (commentId: number, userId: number): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const comment = mockComments.find(c => c.id === commentId);
    
    if (!comment || comment.user_id !== userId) {
      return false;
    }
    
    mockComments = mockComments.filter(c => c.id !== commentId && c.parent_id !== commentId);
    mockReactions = mockReactions.filter(r => r.comment_id !== commentId);
    
    saveToStorage();
    
    return true;
  },

  reactToComment: async (
    commentId: number,
    userId: number,
    type: 'like' | 'dislike',
    username?: string
  ): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const comment = mockComments.find(c => c.id === commentId);
    if (!comment) return false;
    
    const existingReaction = mockReactions.find(
      r => r.comment_id === commentId && r.user_id === userId
    );
    
    const isNewLike = !existingReaction && type === 'like';
    const isChangedToLike = existingReaction && existingReaction.type !== 'like' && type === 'like';
    
    if (existingReaction) {
      if (existingReaction.type === type) {
        mockReactions = mockReactions.filter(
          r => !(r.comment_id === commentId && r.user_id === userId)
        );
      } else {
        existingReaction.type = type;
      }
    } else {
      mockReactions.push({
        comment_id: commentId,
        user_id: userId,
        type
      });
    }
    
    saveToStorage();
    
    if (type === 'like' && !existingReaction) {
      userStatsService.incrementLikesGiven(userId);
    }
    
    if ((isNewLike || isChangedToLike) && comment.user_id !== userId && username) {
      userStatsService.incrementLikesReceived(comment.user_id);
      
      notificationService.createNotification({
        userId: comment.user_id,
        type: 'like',
        fromUser: {
          id: userId,
          name: username
        },
        commentId: comment.id,
        manhwaId: comment.manhwa_id,
        chapterId: comment.chapter_id,
        manhwaTitle: 'Solo Leveling',
        message: `оценил(а) ваш комментарий: "${comment.content.substring(0, 50)}${comment.content.length > 50 ? '...' : ''}"`
      });
    }
    
    return true;
  },

  getUserReaction: (commentId: number, userId: number): 'like' | 'dislike' | null => {
    const reaction = mockReactions.find(
      r => r.comment_id === commentId && r.user_id === userId
    );
    
    return reaction ? reaction.type : null;
  }
};