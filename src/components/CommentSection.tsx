import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Comment, mockCommentsAPI } from '@/lib/mockComments';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import CommentItem from './CommentItem';
import AuthDialog from './AuthDialog';

interface CommentSectionProps {
  manhwaId: number;
  chapterId: number;
}

export default function CommentSection({ manhwaId, chapterId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadComments();
  }, [manhwaId, chapterId]);

  const loadComments = async () => {
    try {
      const data = await mockCommentsAPI.getComments(manhwaId, chapterId);
      setComments(data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите, чтобы оставить комментарий',
        variant: 'destructive'
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Комментарий не может быть пустым',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);

    try {
      await mockCommentsAPI.addComment(
        manhwaId,
        chapterId,
        newComment,
        user,
        replyingTo || undefined
      );

      toast({
        title: 'Успешно!',
        description: replyingTo ? 'Ответ добавлен' : 'Комментарий добавлен',
      });

      setNewComment('');
      setReplyingTo(null);
      loadComments();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить комментарий',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = (parentId: number) => {
    if (!isAuthenticated) {
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите, чтобы ответить на комментарий',
        variant: 'destructive'
      });
      return;
    }
    setReplyingTo(parentId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalComments = comments.reduce((count, comment) => {
    return count + 1 + (comment.replies?.length || 0);
  }, 0);

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="MessageCircle" size={24} />
            <span>Комментарии</span>
            <span className="text-muted-foreground text-base font-normal">
              ({totalComments})
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            {replyingTo && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon name="CornerDownRight" size={14} />
                <span>Ответ на комментарий</span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2"
                  onClick={() => setReplyingTo(null)}
                >
                  <Icon name="X" size={14} />
                </Button>
              </div>
            )}
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {user.username.charAt(0).toUpperCase()}
              </div>
              
              <div className="flex-1 space-y-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={replyingTo ? 'Напишите ответ...' : 'Поделитесь своими мыслями о главе...'}
                  className="min-h-[100px] resize-none"
                  disabled={submitting}
                />
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {newComment.length} / 1000 символов
                  </span>
                  
                  <div className="flex gap-2">
                    {replyingTo && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setReplyingTo(null);
                          setNewComment('');
                        }}
                        disabled={submitting}
                      >
                        Отмена
                      </Button>
                    )}
                    <Button
                      type="submit"
                      size="sm"
                      className="gap-2"
                      disabled={submitting || !newComment.trim()}
                    >
                      {submitting && <Icon name="Loader2" size={14} className="animate-spin" />}
                      {submitting ? 'Отправка...' : replyingTo ? 'Ответить' : 'Отправить'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="text-center py-8 border border-dashed rounded-lg">
            <Icon name="MessageCircle" size={48} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              Войдите, чтобы оставлять комментарии
            </p>
            <AuthDialog trigger={
              <Button className="gap-2">
                <Icon name="User" size={16} />
                Войти
              </Button>
            } />
          </div>
        )}

        <div className="border-t pt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Icon name="Loader2" size={32} className="animate-spin text-primary" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="MessageCircle" size={48} className="mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">
                Пока нет комментариев. Станьте первым!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onReply={handleReply}
                  onUpdate={loadComments}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
