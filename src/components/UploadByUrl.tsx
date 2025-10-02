import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

const UPLOAD_BY_URL_API = 'https://functions.poehali.dev/13fb9333-8228-419c-87f0-3814e0eb716f';

interface UploadByUrlProps {
  manhwaId: number;
  onSuccess?: () => void;
}

export default function UploadByUrl({ manhwaId, onSuccess }: UploadByUrlProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState('');
  const [chapterNumber, setChapterNumber] = useState('');
  const [title, setTitle] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url || !chapterNumber) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(UPLOAD_BY_URL_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url,
          manhwa_id: manhwaId,
          chapter_number: parseInt(chapterNumber),
          title: title || `Глава ${chapterNumber}`
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Успешно!',
          description: data.message || `Глава ${chapterNumber} загружена (${data.images_count} изображений)`
        });
        
        setUrl('');
        setChapterNumber('');
        setTitle('');
        setOpen(false);
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error(data.error || 'Ошибка загрузки');
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось загрузить главу',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Icon name="Link" size={16} />
          Загрузить по ссылке
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Загрузка главы по ссылке</DialogTitle>
          <DialogDescription>
            Поддерживаются ссылки на посты из ВКонтакте и Boosty с изображениями
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">
              Ссылка на пост <span className="text-destructive">*</span>
            </Label>
            <Input
              id="url"
              placeholder="https://vk.com/wall-123456_789 или https://boosty.to/username/posts/abc123"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Примеры: vk.com/wall-123456_789 или boosty.to/username/posts/abc123
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="chapter">
                Номер главы <span className="text-destructive">*</span>
              </Label>
              <Input
                id="chapter"
                type="number"
                min="1"
                placeholder="50"
                value={chapterNumber}
                onChange={(e) => setChapterNumber(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Название (опционально)</Label>
              <Input
                id="title"
                placeholder="Глава 50 - Битва"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Icon name="Info" size={16} className="text-primary" />
                Как это работает?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>1. Скопируйте ссылку на пост с изображениями глав из ВК или Boosty</p>
              <p>2. Вставьте ссылку в поле выше</p>
              <p>3. Укажите номер главы</p>
              <p>4. Система автоматически извлечёт все изображения из поста</p>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
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
              {loading ? 'Загрузка...' : 'Загрузить главу'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}