import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

const BOT_API = 'YOUR_BOT_URL_HERE'; // Замените после деплоя

export default function ModeratorPanel() {
  const [adminKey, setAdminKey] = useState(localStorage.getItem('admin_key') || '');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Формы для разных команд
  const [addChapterForm, setAddChapterForm] = useState({
    manhwa_id: '',
    chapter_number: '',
    title: '',
    pages: ''
  });

  const [updateManhwaForm, setUpdateManhwaForm] = useState({
    manhwa_id: '',
    title: '',
    description: '',
    cover_url: '',
    status: 'ongoing'
  });

  const executeCommand = async (command: string, data: any = {}) => {
    if (!adminKey) {
      alert('Введите Admin Key!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(BOT_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': adminKey
        },
        body: JSON.stringify({
          command,
          ...data
        })
      });

      const result = await res.json();
      setResponse(result);
      
      if (res.ok) {
        alert('✅ Команда выполнена успешно!');
      }
    } catch (error) {
      setResponse({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const handleAddChapter = () => {
    const pages = addChapterForm.pages
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    executeCommand('add_chapter', {
      manhwa_id: parseInt(addChapterForm.manhwa_id),
      chapter_number: parseInt(addChapterForm.chapter_number),
      title: addChapterForm.title,
      pages
    });
  };

  const handleUpdateManhwa = () => {
    const data: any = {
      manhwa_id: parseInt(updateManhwaForm.manhwa_id)
    };

    if (updateManhwaForm.title) data.title = updateManhwaForm.title;
    if (updateManhwaForm.description) data.description = updateManhwaForm.description;
    if (updateManhwaForm.cover_url) data.cover_url = updateManhwaForm.cover_url;
    if (updateManhwaForm.status) data.status = updateManhwaForm.status;

    executeCommand('update_manhwa', data);
  };

  const saveAdminKey = () => {
    localStorage.setItem('admin_key', adminKey);
    alert('✅ Admin Key сохранён');
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Icon name="Bot" size={36} className="text-primary" />
              Панель модератора
            </h1>
            <p className="text-muted-foreground mt-1">
              Управление контентом сайта через бота
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/')}>
            <Icon name="ArrowLeft" size={16} className="mr-2" />
            На главную
          </Button>
        </div>

        {/* Admin Key */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Key" size={20} />
              Ключ доступа
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Введите Admin Key"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="flex-1"
              />
              <Button onClick={saveAdminKey}>
                <Icon name="Save" size={16} className="mr-2" />
                Сохранить
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Ключ сохраняется в браузере. Запросите его у администратора сайта.
            </p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Быстрые команды */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Zap" size={20} />
                Быстрые команды
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => executeCommand('get_stats')}
                disabled={loading}
              >
                <Icon name="BarChart3" size={16} className="mr-2" />
                Статистика сайта
              </Button>
              
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => executeCommand('monitor_site')}
                disabled={loading}
              >
                <Icon name="Activity" size={16} className="mr-2" />
                Проверить здоровье сайта
              </Button>

              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => executeCommand('help')}
                disabled={loading}
              >
                <Icon name="HelpCircle" size={16} className="mr-2" />
                Справка по командам
              </Button>
            </CardContent>
          </Card>

          {/* Добавить главу */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="FilePlus" size={20} />
                Добавить главу
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="ID манхвы"
                type="number"
                value={addChapterForm.manhwa_id}
                onChange={(e) => setAddChapterForm({...addChapterForm, manhwa_id: e.target.value})}
              />
              <Input
                placeholder="Номер главы"
                type="number"
                value={addChapterForm.chapter_number}
                onChange={(e) => setAddChapterForm({...addChapterForm, chapter_number: e.target.value})}
              />
              <Input
                placeholder="Название главы"
                value={addChapterForm.title}
                onChange={(e) => setAddChapterForm({...addChapterForm, title: e.target.value})}
              />
              <Textarea
                placeholder="URL страниц (по одному на строку)"
                value={addChapterForm.pages}
                onChange={(e) => setAddChapterForm({...addChapterForm, pages: e.target.value})}
                className="min-h-32"
              />
              <Button 
                className="w-full" 
                onClick={handleAddChapter}
                disabled={loading}
              >
                <Icon name="Upload" size={16} className="mr-2" />
                Добавить главу
              </Button>
            </CardContent>
          </Card>

          {/* Обновить манхву */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Edit" size={20} />
                Обновить манхву
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="ID манхвы"
                type="number"
                value={updateManhwaForm.manhwa_id}
                onChange={(e) => setUpdateManhwaForm({...updateManhwaForm, manhwa_id: e.target.value})}
              />
              <Input
                placeholder="Новое название (опционально)"
                value={updateManhwaForm.title}
                onChange={(e) => setUpdateManhwaForm({...updateManhwaForm, title: e.target.value})}
              />
              <Textarea
                placeholder="Описание (опционально)"
                value={updateManhwaForm.description}
                onChange={(e) => setUpdateManhwaForm({...updateManhwaForm, description: e.target.value})}
              />
              <Input
                placeholder="URL обложки (опционально)"
                value={updateManhwaForm.cover_url}
                onChange={(e) => setUpdateManhwaForm({...updateManhwaForm, cover_url: e.target.value})}
              />
              <select
                className="w-full p-2 border rounded"
                value={updateManhwaForm.status}
                onChange={(e) => setUpdateManhwaForm({...updateManhwaForm, status: e.target.value})}
              >
                <option value="ongoing">Онгоинг</option>
                <option value="completed">Завершён</option>
                <option value="frozen">Заморожен</option>
              </select>
              <Button 
                className="w-full"
                onClick={handleUpdateManhwa}
                disabled={loading}
              >
                <Icon name="Save" size={16} className="mr-2" />
                Обновить
              </Button>
            </CardContent>
          </Card>

          {/* Результат */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Terminal" size={20} />
                Результат команды
                {loading && <Icon name="Loader2" size={16} className="animate-spin ml-auto" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {response ? (
                <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96 text-sm">
                  {JSON.stringify(response, null, 2)}
                </pre>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Выполните команду чтобы увидеть результат
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Инструкции */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="BookOpen" size={20} />
              Инструкции
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Badge>1</Badge>
                Добавление глав
              </h4>
              <p className="text-sm text-muted-foreground">
                Заполните ID манхвы, номер главы и вставьте URL страниц (по одному на строку). 
                Страницы будут добавлены в том порядке, в котором вы их указали.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Badge>2</Badge>
                Обновление информации
              </h4>
              <p className="text-sm text-muted-foreground">
                Укажите ID манхвы и заполните только те поля, которые хотите обновить. 
                Пустые поля будут проигнорированы.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Badge>3</Badge>
                Мониторинг
              </h4>
              <p className="text-sm text-muted-foreground">
                Проверяйте здоровье сайта регулярно. Бот покажет манхвы без глав, 
                главы без страниц и другие проблемы.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
