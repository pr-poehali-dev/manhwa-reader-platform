import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const UPLOAD_BY_URL_API = 'https://functions.poehali.dev/13fb9333-8228-419c-87f0-3814e0eb716f';

interface BulkUploadChaptersProps {
  manhwaId: number;
  onSuccess?: () => void;
}

interface Chapter {
  number: number;
  title: string;
  files: File[];
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export default function BulkUploadChapters({ manhwaId, onSuccess }: BulkUploadChaptersProps) {
  const [open, setOpen] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [uploading, setUploading] = useState(false);
  const [currentUpload, setCurrentUpload] = useState(0);
  const { toast } = useToast();

  const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(f => f.type.startsWith('image/'));

    const chapterMap = new Map<number, File[]>();

    imageFiles.forEach(file => {
      const match = file.webkitRelativePath.match(/chapter[_\s-]?(\d+)/i) || 
                    file.name.match(/(?:ch|chapter|глава)[_\s-]?(\d+)/i);
      
      if (match) {
        const chapterNum = parseInt(match[1]);
        if (!chapterMap.has(chapterNum)) {
          chapterMap.set(chapterNum, []);
        }
        chapterMap.get(chapterNum)!.push(file);
      }
    });

    const newChapters: Chapter[] = Array.from(chapterMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([number, files]) => ({
        number,
        title: `Глава ${number}`,
        files: files.sort((a, b) => a.name.localeCompare(b.name)),
        status: 'pending' as const,
      }));

    setChapters(newChapters);

    if (newChapters.length === 0) {
      toast({
        title: 'Главы не найдены',
        description: 'Убедитесь, что папки/файлы содержат номера глав (например: chapter_1, ch1, глава_1)',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Главы обнаружены',
        description: `Найдено ${newChapters.length} глав с ${imageFiles.length} изображениями`,
      });
    }
  };

  const uploadChapter = async (chapter: Chapter): Promise<boolean> => {
    try {
      const imageUrls = await Promise.all(
        chapter.files.map(file => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        })
      );

      const response = await fetch(UPLOAD_BY_URL_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          images: imageUrls,
          manhwa_id: manhwaId,
          chapter_number: chapter.number,
          title: chapter.title
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return true;
      } else {
        throw new Error(data.error || 'Ошибка загрузки');
      }
    } catch (error: any) {
      throw error;
    }
  };

  const handleBulkUpload = async () => {
    if (chapters.length === 0) {
      toast({
        title: 'Нет глав для загрузки',
        description: 'Выберите папку с главами',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    setCurrentUpload(0);

    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapters[i];
      
      setChapters(prev => prev.map((ch, idx) => 
        idx === i ? { ...ch, status: 'uploading' } : ch
      ));

      try {
        await uploadChapter(chapter);
        
        setChapters(prev => prev.map((ch, idx) => 
          idx === i ? { ...ch, status: 'success' } : ch
        ));
        
        setCurrentUpload(i + 1);
      } catch (error: any) {
        setChapters(prev => prev.map((ch, idx) => 
          idx === i ? { ...ch, status: 'error', error: error.message } : ch
        ));
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setUploading(false);

    const successCount = chapters.filter(ch => ch.status === 'success').length;
    const errorCount = chapters.filter(ch => ch.status === 'error').length;

    toast({
      title: 'Загрузка завершена',
      description: `Успешно: ${successCount}, Ошибок: ${errorCount}`,
      variant: errorCount > 0 ? 'destructive' : 'default'
    });

    if (successCount > 0 && onSuccess) {
      onSuccess();
    }
  };

  const removeChapter = (index: number) => {
    setChapters(prev => prev.filter((_, i) => i !== index));
  };

  const updateChapter = (index: number, updates: Partial<Chapter>) => {
    setChapters(prev => prev.map((ch, i) => 
      i === index ? { ...ch, ...updates } : ch
    ));
  };

  const handleBatchRename = () => {
    const template = prompt('Введите шаблон для названий (\nИспользуйте {n} для номера главы)\n\nПримеры:\n- Глава {n} - Начало\n- Chapter {n}: The Journey\n- Арк 1, Глава {n}', 'Глава {n}');
    
    if (template) {
      setChapters(prev => prev.map(ch => ({
        ...ch,
        title: template.replace('{n}', ch.number.toString())
      })));
      
      toast({
        title: 'Названия обновлены',
        description: `Применен шаблон к ${chapters.length} главам`,
      });
    }
  };

  const resetUpload = () => {
    setChapters([]);
    setCurrentUpload(0);
    setUploading(false);
  };

  const getStatusIcon = (status: Chapter['status']) => {
    switch (status) {
      case 'pending':
        return <Icon name="Clock" size={16} className="text-muted-foreground" />;
      case 'uploading':
        return <Icon name="Loader2" size={16} className="text-primary animate-spin" />;
      case 'success':
        return <Icon name="CheckCircle2" size={16} className="text-green-500" />;
      case 'error':
        return <Icon name="XCircle" size={16} className="text-destructive" />;
    }
  };

  const progress = chapters.length > 0 ? (currentUpload / chapters.length) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Icon name="FolderUp" size={16} />
          Массовая загрузка
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Массовая загрузка глав</DialogTitle>
          <DialogDescription>
            Загрузите несколько глав одновременно из папок на компьютере
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {chapters.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="folder-upload">
                      Выберите папку с главами
                    </Label>
                    <Input
                      id="folder-upload"
                      type="file"
                      onChange={handleFolderSelect}
                      disabled={uploading}
                      className="cursor-pointer"
                      webkitdirectory=""
                      directory=""
                      multiple
                    />
                  </div>

                  <Card className="bg-muted/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Icon name="Info" size={16} className="text-primary" />
                        Как структурировать папки?
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground space-y-2">
                      <p><strong>Вариант 1:</strong> Отдельные папки для каждой главы</p>
                      <div className="bg-background/50 rounded p-2 font-mono text-[10px]">
                        📁 manhwa/<br />
                        ├─ 📁 chapter_1/ → (page1.jpg, page2.jpg...)<br />
                        ├─ 📁 chapter_2/ → (page1.jpg, page2.jpg...)<br />
                        └─ 📁 chapter_3/ → (page1.jpg, page2.jpg...)
                      </div>
                      
                      <p className="pt-2"><strong>Вариант 2:</strong> Файлы с номерами глав в именах</p>
                      <div className="bg-background/50 rounded p-2 font-mono text-[10px]">
                        📁 manhwa/<br />
                        ├─ ch1_page1.jpg, ch1_page2.jpg<br />
                        ├─ ch2_page1.jpg, ch2_page2.jpg<br />
                        └─ глава_3_страница_1.jpg...
                      </div>

                      <p className="text-yellow-600 dark:text-yellow-500 pt-2 flex items-start gap-1">
                        <Icon name="AlertTriangle" size={12} className="mt-0.5" />
                        Названия должны содержать "chapter", "ch" или "глава" + номер
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    Обнаружено глав: {chapters.length}
                  </p>
                  <div className="flex gap-1">
                    {!uploading && chapters.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBatchRename}
                      >
                        <Icon name="Type" size={14} className="mr-1" />
                        Переименовать все
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetUpload}
                      disabled={uploading}
                    >
                      <Icon name="RotateCcw" size={14} className="mr-1" />
                      Сбросить
                    </Button>
                  </div>
                </div>

                {uploading && (
                  <div className="space-y-1">
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground text-center">
                      Загружено {currentUpload} из {chapters.length}
                    </p>
                  </div>
                )}
              </div>

              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-2">
                  {chapters.map((chapter, index) => (
                    <Card key={index} className="relative">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(chapter.status)}
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">
                                Глава {chapter.number}
                              </p>
                              {chapter.title !== `Глава ${chapter.number}` && (
                                <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                                  — {chapter.title}
                                </span>
                              )}
                              <Badge variant="secondary" className="text-xs">
                                {chapter.files.length} стр.
                              </Badge>
                            </div>
                            {chapter.error && (
                              <p className="text-xs text-destructive mt-1">
                                {chapter.error}
                              </p>
                            )}
                          </div>

                          {!uploading && (chapter.status === 'pending' || chapter.status === 'success' || chapter.status === 'error') && (
                            <div className="flex gap-1">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                  >
                                    <Icon name="Edit" size={14} />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80" align="end">
                                  <div className="space-y-3">
                                    <div className="space-y-1.5">
                                      <Label className="text-xs font-medium">
                                        Номер главы
                                      </Label>
                                      <Input
                                        type="number"
                                        value={chapter.number}
                                        onChange={(e) => updateChapter(index, {
                                          number: parseInt(e.target.value) || 1
                                        })}
                                        className="h-8"
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <Label className="text-xs font-medium">
                                        Название главы
                                      </Label>
                                      <Input
                                        value={chapter.title}
                                        onChange={(e) => updateChapter(index, {
                                          title: e.target.value
                                        })}
                                        placeholder="Глава 1 - Начало"
                                        className="h-8"
                                      />
                                    </div>
                                    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded text-xs">
                                      <Icon name="Image" size={14} className="text-muted-foreground" />
                                      <span className="text-muted-foreground">
                                        Страниц: {chapter.files.length}
                                      </span>
                                    </div>
                                  </div>
                                </PopoverContent>
                              </Popover>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeChapter(index)}
                              >
                                <Icon name="X" size={14} />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={uploading}
                  className="flex-1"
                >
                  {uploading ? 'Загрузка...' : 'Закрыть'}
                </Button>
                <Button
                  onClick={handleBulkUpload}
                  disabled={uploading || chapters.length === 0}
                  className="flex-1 gap-2"
                >
                  {uploading ? (
                    <>
                      <Icon name="Loader2" size={16} className="animate-spin" />
                      Загрузка...
                    </>
                  ) : (
                    <>
                      <Icon name="Upload" size={16} />
                      Загрузить {chapters.length} глав
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}