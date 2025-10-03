import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';

interface Comment {
  id: number;
  user_id: string;
  username: string;
  avatar?: string;
  text: string;
  rating?: number;
  likes: number;
  created_at: string;
  replies?: Comment[];
  is_spoiler?: boolean;
}

interface CommentSectionProps {
  manhwaId: number;
  chapterId?: number;
}

export default function CommentSection({ manhwaId, chapterId }: CommentSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0);
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'new' | 'popular' | 'rating'>('new');

  useEffect(() => {
    fetchComments();
  }, [manhwaId, chapterId, sortBy]);

  const fetchComments = async () => {
    try {
      const url = chapterId 
        ? `/api/comments?manhwa_id=${manhwaId}&chapter_id=${chapterId}&sort=${sortBy}`
        : `/api/comments?manhwa_id=${manhwaId}&sort=${sortBy}`;
      
      const response = await fetch(url);
      const data = await response.json();
      setComments(data.comments || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!newComment.trim() || !isAuthenticated) return;

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manhwa_id: manhwaId,
          chapter_id: chapterId,
          text: newComment,
          rating: chapterId ? undefined : rating,
          is_spoiler: isSpoiler,
          reply_to: replyTo
        })
      });

      if (response.ok) {
        setNewComment('');
        setRating(0);
        setIsSpoiler(false);
        setReplyTo(null);
        fetchComments();
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleLike = async (commentId: number) => {
    if (!isAuthenticated) return;

    try {
      await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST'
      });
      fetchComments();
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    if (days < 7) return `${days} д назад`;
    return date.toLocaleDateString('ru-RU');
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <Card className={`p-4 ${isReply ? 'ml-12 mt-2' : ''}`}>
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
            {comment.username[0].toUpperCase()}
          </div>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold">{comment.username}</span>
            <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
            {comment.rating && (
              <Badge variant="secondary" className="ml-auto">
                <Icon name="Star" size={12} className="mr-1" />
                {comment.rating}/10
              </Badge>
            )}
          </div>

          {comment.is_spoiler ? (
            <details className="mb-2">
              <summary className="cursor-pointer text-sm text-muted-foreground flex items-center gap-1">
                <Icon name="Eye" size={14} />
                Спойлер (нажмите чтобы показать)
              </summary>
              <p className="mt-2 whitespace-pre-wrap">{comment.text}</p>
            </details>
          ) : (
            <p className="mb-3 whitespace-pre-wrap">{comment.text}</p>
          )}

          <div className="flex items-center gap-4 text-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleLike(comment.id)}
              className="h-8 gap-1"
            >
              <Icon name="ThumbsUp" size={14} />
              {comment.likes > 0 && comment.likes}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyTo(comment.id)}
              className="h-8 gap-1"
            >
              <Icon name="MessageCircle" size={14} />
              Ответить
            </Button>
          </div>

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-2">
              {comment.replies.map(reply => (
                <CommentItem key={reply.id} comment={reply} isReply />
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Icon name="MessageSquare" size={28} />
          Комментарии ({comments.length})
        </h2>

        <div className="flex gap-2">
          {(['new', 'popular', 'rating'] as const).map(sort => (
            <Button
              key={sort}
              variant={sortBy === sort ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy(sort)}
            >
              {sort === 'new' && 'Новые'}
              {sort === 'popular' && 'Популярные'}
              {sort === 'rating' && 'По рейтингу'}
            </Button>
          ))}
        </div>
      </div>

      {isAuthenticated ? (
        <Card className="p-4">
          {replyTo && (
            <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Icon name="CornerDownRight" size={14} />
              Ответ на комментарий
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyTo(null)}
              >
                Отменить
              </Button>
            </div>
          )}

          <Textarea
            placeholder="Написать комментарий..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="mb-3 min-h-24"
          />

          {!chapterId && (
            <div className="mb-3">
              <label className="text-sm font-medium mb-2 block">Ваша оценка</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(star => (
                  <Button
                    key={star}
                    variant={rating >= star ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setRating(star)}
                    className="w-10"
                  >
                    {star}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={isSpoiler}
                onChange={(e) => setIsSpoiler(e.target.checked)}
                className="rounded"
              />
              <Icon name="Eye" size={14} />
              Спойлер
            </label>

            <Button onClick={handleSubmit} disabled={!newComment.trim()}>
              <Icon name="Send" size={16} className="mr-2" />
              Отправить
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-6 text-center">
          <Icon name="Lock" size={32} className="mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">Войдите чтобы оставлять комментарии</p>
        </Card>
      )}

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <Icon name="Loader2" size={32} className="animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : comments.length === 0 ? (
          <Card className="p-8 text-center">
            <Icon name="MessageCircle" size={48} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">Пока нет комментариев. Будьте первым!</p>
          </Card>
        ) : (
          comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        )}
      </div>
    </div>
  );
}
