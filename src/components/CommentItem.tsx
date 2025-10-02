import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { Comment, mockCommentsAPI } from '@/lib/mockComments';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface CommentItemProps {
  comment: Comment;
  onReply?: (parentId: number) => void;
  onUpdate?: () => void;
  depth?: number;
}

export default function CommentItem({ comment, onReply, onUpdate, depth = 0 }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReplies, setShowReplies] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const userReaction = user ? mockCommentsAPI.getUserReaction(comment.id, user.id) : null;

  const handleReact = async (type: 'like' | 'dislike') => {
    if (!user) {
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите, чтобы оценивать комментарии',
        variant: 'destructive'
      });
      return;
    }

    try {
      await mockCommentsAPI.reactToComment(comment.id, user.id, type, user.username);
      if (onUpdate) onUpdate();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось оценить комментарий',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = async () => {
    if (!user) return;

    try {
      const updated = await mockCommentsAPI.updateComment(comment.id, user.id, editContent);
      
      if (updated) {
        toast({
          title: 'Обновлено',
          description: 'Комментарий изменён',
        });
        setIsEditing(false);
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить комментарий',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    
    if (!confirm('Удалить комментарий?')) return;

    try {
      const success = await mockCommentsAPI.deleteComment(comment.id, user.id);
      
      if (success) {
        toast({
          title: 'Удалено',
          description: 'Комментарий удалён',
        });
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить комментарий',
        variant: 'destructive'
      });
    }
  };

  const timeAgo = formatDistanceToNow(new Date(comment.created_at), {
    addSuffix: true,
    locale: ru
  });

  return (
    <div className={`${depth > 0 ? 'ml-8 mt-3' : ''}`}>
      <div className="group border border-border/50 rounded-lg p-4 hover:bg-accent/50 transition-colors">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {comment.username.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm">{comment.username}</span>
              <span className="text-xs text-muted-foreground">{timeAgo}</span>
              {comment.updated_at && (
                <span className="text-xs text-muted-foreground italic">(изменено)</span>
              )}
            </div>
            
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[80px]"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleEdit}>
                    Сохранить
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                    Отмена
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {comment.content}
              </p>
            )}
            
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant={userReaction === 'like' ? 'default' : 'ghost'}
                  className="h-7 px-2 gap-1"
                  onClick={() => handleReact('like')}
                >
                  <Icon name="ThumbsUp" size={14} />
                  <span className="text-xs">{comment.likes}</span>
                </Button>
                <Button
                  size="sm"
                  variant={userReaction === 'dislike' ? 'destructive' : 'ghost'}
                  className="h-7 px-2 gap-1"
                  onClick={() => handleReact('dislike')}
                >
                  <Icon name="ThumbsDown" size={14} />
                  <span className="text-xs">{comment.dislikes}</span>
                </Button>
              </div>
              
              {depth < 3 && onReply && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 gap-1"
                  onClick={() => onReply(comment.id)}
                >
                  <Icon name="Reply" size={14} />
                  <span className="text-xs">Ответить</span>
                </Button>
              )}
              
              {user && user.id === comment.user_id && (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 gap-1"
                    onClick={() => setIsEditing(true)}
                  >
                    <Icon name="Edit" size={14} />
                    <span className="text-xs">Изменить</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 gap-1 text-destructive hover:text-destructive"
                    onClick={handleDelete}
                  >
                    <Icon name="Trash2" size={14} />
                    <span className="text-xs">Удалить</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 gap-1 text-xs ml-8"
            onClick={() => setShowReplies(!showReplies)}
          >
            <Icon name={showReplies ? 'ChevronUp' : 'ChevronDown'} size={14} />
            {showReplies ? 'Скрыть' : 'Показать'} ответы ({comment.replies.length})
          </Button>
          
          {showReplies && (
            <div className="space-y-2">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  onUpdate={onUpdate}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}