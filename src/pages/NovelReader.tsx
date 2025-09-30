import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Chapter {
  id: number;
  number: number;
  title: string;
  content: string;
}

const MOCK_CHAPTER: Chapter = {
  id: 1,
  number: 1,
  title: 'Начало пути',
  content: `Солнце медленно поднималось над горизонтом, окрашивая небо в оттенки розового и золотого. Юный Эрен стоял на краю обрыва, смотря на бескрайние просторы, которые открывались перед ним.

"Сегодня всё изменится," — прошептал он, сжимая в руке древний амулет, который достался ему от деда.

Магическая академия располагалась в самом сердце королевства, и путь туда был долгим и опасным. Но Эрен был готов. Годы тренировок и подготовки привели его к этому моменту.

Внезапно, воздух вокруг него начал искриться. Амулет засветился ярким светом, и Эрен почувствовал, как невероятная сила наполняет его тело. Это было началом чего-то великого.

"Так вот каково это — чувствовать настоящую магию," — подумал он, наблюдая за тем, как искры магической энергии танцуют вокруг его рук.

Позади него раздались шаги. Обернувшись, Эрен увидел высокого мужчину в тёмном плаще. Его глаза светились необычным серебристым светом.

"Ты тот самый мальчик, о котором говорят пророчества?" — спросил незнакомец, изучающе глядя на Эрена.

"Я просто хочу научиться магии," — ответил Эрен, инстинктивно готовясь к бою.

"Магия — это не просто сила. Это ответственность. Ты готов принять её?" — Незнакомец улыбнулся и протянул руку. — "Меня зовут Мастер Альдрих. И если ты действительно серьёзно настроен, я стану твоим наставником."

Это была встреча, которая изменила всё. Эрен ещё не знал, что его ждёт впереди, но он был готов принять любой вызов.

Путешествие началось.`;
};

export default function NovelReader() {
  const { novelId, chapterNumber } = useParams();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState<Chapter>(MOCK_CHAPTER);
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [fontFamily, setFontFamily] = useState('serif');
  const [readerTheme, setReaderTheme] = useState<'light' | 'dark' | 'sepia'>('dark');
  const [showSettings, setShowSettings] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const savedSettings = localStorage.getItem('readerSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setFontSize(settings.fontSize || 18);
      setLineHeight(settings.lineHeight || 1.8);
      setFontFamily(settings.fontFamily || 'serif');
      setReaderTheme(settings.readerTheme || 'dark');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('readerSettings', JSON.stringify({
      fontSize,
      lineHeight,
      fontFamily,
      readerTheme
    }));
  }, [fontSize, lineHeight, fontFamily, readerTheme]);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollProgress = (scrollTop / (documentHeight - windowHeight)) * 100;
      setProgress(Math.min(Math.round(scrollProgress), 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const themeStyles = {
    light: {
      bg: 'bg-white',
      text: 'text-gray-900',
      card: 'bg-gray-50'
    },
    dark: {
      bg: 'bg-gray-950',
      text: 'text-gray-100',
      card: 'bg-gray-900'
    },
    sepia: {
      bg: 'bg-[#f4ecd8]',
      text: 'text-[#5c4a3a]',
      card: 'bg-[#e8dcc4]'
    }
  };

  const currentTheme = themeStyles[readerTheme];

  return (
    <div className={`min-h-screen ${currentTheme.bg} ${currentTheme.text} transition-colors duration-300`}>
      <header className={`sticky top-0 z-50 w-full border-b ${currentTheme.card} backdrop-blur`}>
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(`/novel/${novelId}`)}
            >
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <span className="text-sm font-medium hidden sm:inline">
              Глава {chapter.number}: {chapter.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium hidden sm:inline">
              {progress}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Icon name="Settings" size={20} />
            </Button>
          </div>
        </div>

        <div className="h-1 bg-muted">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {showSettings && (
        <Card className={`fixed top-16 right-4 z-40 p-4 w-80 ${currentTheme.card} shadow-xl`}>
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Icon name="Settings" size={20} />
            Настройки чтения
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Размер шрифта: {fontSize}px
              </label>
              <Slider
                value={[fontSize]}
                onValueChange={(value) => setFontSize(value[0])}
                min={14}
                max={28}
                step={1}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Межстрочный интервал: {lineHeight}
              </label>
              <Slider
                value={[lineHeight]}
                onValueChange={(value) => setLineHeight(value[0])}
                min={1.2}
                max={2.5}
                step={0.1}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Шрифт
              </label>
              <Select value={fontFamily} onValueChange={setFontFamily}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="serif">Serif</SelectItem>
                  <SelectItem value="sans">Sans-serif</SelectItem>
                  <SelectItem value="mono">Monospace</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Тема
              </label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={readerTheme === 'light' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setReaderTheme('light')}
                >
                  <Icon name="Sun" size={16} />
                </Button>
                <Button
                  variant={readerTheme === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setReaderTheme('dark')}
                >
                  <Icon name="Moon" size={16} />
                </Button>
                <Button
                  variant={readerTheme === 'sepia' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setReaderTheme('sepia')}
                >
                  <Icon name="BookOpen" size={16} />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      <main className="container max-w-3xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Глава {chapter.number}
          </h1>
          <h2 className="text-xl text-muted-foreground">
            {chapter.title}
          </h2>
        </div>

        <div
          className="prose prose-lg max-w-none"
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: lineHeight,
            fontFamily: fontFamily === 'serif' ? 'Georgia, serif' : 
                        fontFamily === 'sans' ? 'system-ui, sans-serif' : 
                        'monospace'
          }}
        >
          {chapter.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="mb-6">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-12 flex items-center justify-between pt-8 border-t">
          <Button
            variant="outline"
            onClick={() => navigate(`/novel-reader/${novelId}/${parseInt(chapterNumber || '1') - 1}`)}
            disabled={parseInt(chapterNumber || '1') <= 1}
          >
            <Icon name="ChevronLeft" size={20} className="mr-2" />
            Предыдущая
          </Button>

          <Button
            onClick={() => navigate(`/novel/${novelId}`)}
            variant="outline"
          >
            <Icon name="List" size={20} className="mr-2" />
            Все главы
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate(`/novel-reader/${novelId}/${parseInt(chapterNumber || '1') + 1}`)}
          >
            Следующая
            <Icon name="ChevronRight" size={20} className="ml-2" />
          </Button>
        </div>
      </main>

      <Button
        className="fixed bottom-8 right-8 rounded-full w-12 h-12 shadow-lg"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <Icon name="ArrowUp" size={20} />
      </Button>
    </div>
  );
}
