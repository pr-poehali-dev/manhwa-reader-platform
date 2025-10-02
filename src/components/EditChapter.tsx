import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Badge } from '@/components/ui/badge';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const UPLOAD_BY_URL_API = 'https://functions.poehali.dev/13fb9333-8228-419c-87f0-3814e0eb716f';

interface EditChapterProps {
  chapterId: number;
  currentNumber: number;
  currentTitle: string;
  currentPages: string[];
  manhwaId: number;
  onSuccess?: () => void;
}

export default function EditChapter({
  chapterId,
  currentNumber,
  currentTitle,
  currentPages,
  manhwaId,
  onSuccess,
}: EditChapterProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [number, setNumber] = useState(currentNumber);
  const [title, setTitle] = useState(currentTitle);
  const [pages, setPages] = useState<string[]>(currentPages);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setPages((items) => {
        const oldIndex = items.findIndex((_, i) => i.toString() === active.id);
        const newIndex = items.findIndex((_, i) => i.toString() === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    setNewFiles(imageFiles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalPages = [...pages];

      if (newFiles.length > 0) {
        const newPageUrls = await Promise.all(
          newFiles.map(file => {
            return new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(file);
            });
          })
        );
        finalPages = [...finalPages, ...newPageUrls];
      }

      const response = await fetch(`${UPLOAD_BY_URL_API}/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chapter_id: chapterId,
          manhwa_id: manhwaId,
          chapter_number: number,
          title: title,
          pages: finalPages
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Успешно!',
          description: 'Глава обновлена',
        });
        
        setOpen(false);
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error(data.error || 'Ошибка обновления');
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось обновить главу',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const removePage = (index: number) => {
    setPages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Icon name="Edit" size={14} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать главу</DialogTitle>
          <DialogDescription>
            Измените номер, название или страницы главы
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="chapter-number">Номер главы</Label>
              <Input
                id="chapter-number"
                type="number"
                value={number}
                onChange={(e) => setNumber(parseInt(e.target.value) || 1)}
                disabled={loading}
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="chapter-title">Название главы</Label>
              <Input
                id="chapter-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Глава 1 - Начало"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>
                Страницы ({pages.length})
              </Label>
              <Badge variant="outline">
                Перетащите для изменения порядка
              </Badge>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={pages.map((_, i) => i.toString())}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-5 gap-2 max-h-[300px] overflow-y-auto p-2 border rounded-lg">
                  {pages.map((pageUrl, index) => (
                    <SortablePageItem
                      key={index}
                      id={index.toString()}
                      pageUrl={pageUrl}
                      index={index}
                      onRemove={() => removePage(index)}
                      disabled={loading}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-pages">Добавить новые страницы</Label>
            <Input
              id="add-pages"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              disabled={loading}
            />
            {newFiles.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Выбрано новых страниц: {newFiles.length}
              </p>
            )}
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

interface SortablePageItemProps {
  id: string;
  pageUrl: string;
  index: number;
  onRemove: () => void;
  disabled: boolean;
}

function SortablePageItem({ id, pageUrl, index, onRemove, disabled }: SortablePageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group cursor-move ${isDragging ? 'z-50' : ''}`}
      {...attributes}
      {...listeners}
    >
      <img
        src={pageUrl}
        alt={`Страница ${index + 1}`}
        className="w-full h-24 object-cover rounded border hover:ring-2 ring-primary transition-all"
      />
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
        <span className="text-white text-xs font-bold">#{index + 1}</span>
      </div>
      {!disabled && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
        >
          <Icon name="X" size={12} />
        </button>
      )}
      <div className="absolute top-1 left-1 bg-black/70 text-white px-1.5 py-0.5 rounded text-[10px] font-medium">
        <Icon name="GripVertical" size={10} className="inline" />
      </div>
    </div>
  );
}
