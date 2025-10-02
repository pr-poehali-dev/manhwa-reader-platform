import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EditManhwaProps {
  manhwaId: number;
  currentTitle: string;
  currentDescription?: string;
  currentCover?: string;
  currentStatus?: string;
  onSuccess?: () => void;
}

export default function EditManhwa({
  manhwaId,
  currentTitle,
  currentDescription = '',
  currentCover = '',
  currentStatus = 'ongoing',
  onSuccess,
}: EditManhwaProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(currentTitle);
  const [description, setDescription] = useState(currentDescription);
  const [cover, setCover] = useState(currentCover);
  const [status, setStatus] = useState(currentStatus);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: 'Успешно!',
        description: 'Тайтл обновлен',
      });
      
      setOpen(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось обновить тайтл',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Icon name="Edit" size={14} />
          Редактировать
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать тайтл</DialogTitle>
          <DialogDescription>
            Измените информацию о манхве
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="manhwa-title">Название</Label>
            <Input
              id="manhwa-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Solo Leveling"
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="manhwa-description">Описание</Label>
            <Textarea
              id="manhwa-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Описание тайтла..."
              disabled={loading}
              rows={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="manhwa-cover">URL обложки</Label>
            <Input
              id="manhwa-cover"
              type="url"
              value={cover}
              onChange={(e) => setCover(e.target.value)}
              placeholder="https://example.com/cover.jpg"
              disabled={loading}
            />
            {cover && (
              <div className="mt-2">
                <img 
                  src={cover} 
                  alt="Preview" 
                  className="w-32 h-48 rounded-lg object-cover border"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/300x450/1a1a1a/666?text=No+Image';
                  }}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="manhwa-status">Статус</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="manhwa-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ongoing">Выходит</SelectItem>
                <SelectItem value="completed">Завершён</SelectItem>
                <SelectItem value="hiatus">Перерыв</SelectItem>
                <SelectItem value="cancelled">Отменён</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading && <Icon name="Loader2" size={16} className="animate-spin" />}
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
