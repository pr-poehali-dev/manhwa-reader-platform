import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';
import { Card } from '@/components/ui/card';
import ProtectedImage from '@/components/ProtectedImage';
import CommentSection from '@/components/CommentSection';
import { userStatsService } from '@/services/userStatsService';
import '@/styles/reader.css';

const MOCK_CHAPTERS = Array.from({ length: 145 }, (_, i) => ({
  id: i + 1,
  title: `Глава ${i + 1}`,
  pages: Array.from({ length: 40 }, (_, p) => ({
    id: p + 1,
    url: 'https://v3.fal.media/files/rabbit/Exk-Or9IWGWFNw_y6zO4q_output.png'
  }))
}));

export default function Reader() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentChapter, setCurrentChapter] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const chapter = MOCK_CHAPTERS[currentChapter - 1];
  const totalPages = chapter?.pages.length || 0;

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        nextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        prevPage();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, currentChapter]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const nextPage = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      if (currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
      } else if (currentChapter < MOCK_CHAPTERS.length) {
        userStatsService.markChapterAsRead(1, Number(id) || 1, currentChapter);
        setCurrentChapter(currentChapter + 1);
        setCurrentPage(1);
      }
      setIsTransitioning(false);
    }, 150);
  };

  const prevPage = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else if (currentChapter > 1) {
        setCurrentChapter(currentChapter - 1);
        setCurrentPage(MOCK_CHAPTERS[currentChapter - 2].pages.length);
      }
      setIsTransitioning(false);
    }, 150);
  };

  return (
    <div className="min-h-screen bg-background reader-page">
      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/40 transition-all duration-300 ${
          showControls ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <Icon name="ArrowLeft" size={20} />
            </Button>
            
            <div className="hidden md:block">
              <h1 className="font-bold">Возвращение Мастера Меча</h1>
              <p className="text-sm text-muted-foreground">
                Глава {currentChapter} - Страница {currentPage} из {totalPages}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={currentChapter.toString()}
              onValueChange={(value) => {
                setCurrentChapter(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MOCK_CHAPTERS.map((ch) => (
                  <SelectItem key={ch.id} value={ch.id.toString()}>
                    Глава {ch.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              <Icon name={theme === 'light' ? 'Moon' : 'Sun'} size={20} />
            </Button>

            <Button variant="ghost" size="icon">
              <Icon name="Bookmark" size={20} />
            </Button>

            <Button variant="ghost" size="icon">
              <Icon name="Settings" size={20} />
            </Button>
          </div>
        </div>
      </header>

      <main
        className="pt-16 pb-24 min-h-screen flex flex-col items-center justify-center cursor-pointer select-none bg-muted/30"
        onClick={() => setShowControls(!showControls)}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="max-w-5xl w-full px-2 md:px-4">
          <div className={`page-transition ${isTransitioning ? 'transitioning' : ''}`}>
            <ProtectedImage
              src={chapter?.pages[currentPage - 1]?.url || ''}
              alt={`Страница ${currentPage}`}
              className="w-full h-auto rounded-xl shadow-2xl"
            />
          </div>
        </div>
      </main>

      <footer
        className={`fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/40 transition-all duration-300 ${
          showControls ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="container px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={prevPage}
              disabled={currentPage === 1 && currentChapter === 1}
              className="hover:bg-primary/10 hover:border-primary"
            >
              <Icon name="ChevronLeft" size={20} />
            </Button>

            <div className="flex-1">
              <Slider
                value={[currentPage]}
                min={1}
                max={totalPages}
                step={1}
                onValueChange={(value) => setCurrentPage(value[0])}
                className="cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Страница {currentPage}</span>
                <span>{totalPages} страниц</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={nextPage}
              disabled={currentPage === totalPages && currentChapter === MOCK_CHAPTERS.length}
              className="hover:bg-primary/10 hover:border-primary"
            >
              <Icon name="ChevronRight" size={20} />
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (currentChapter > 1) {
                  setCurrentChapter(currentChapter - 1);
                  setCurrentPage(1);
                }
              }}
              disabled={currentChapter === 1}
              className="gap-2 hover:bg-primary/10 hover:border-primary"
            >
              <Icon name="ChevronLeft" size={16} />
              Предыдущая глава
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (currentChapter < MOCK_CHAPTERS.length) {
                  setCurrentChapter(currentChapter + 1);
                  setCurrentPage(1);
                }
              }}
              disabled={currentChapter === MOCK_CHAPTERS.length}
              className="gap-2 hover:bg-primary/10 hover:border-primary"
            >
              Следующая глава
              <Icon name="ChevronRight" size={16} />
            </Button>
          </div>
        </div>
      </footer>

      <div className="container max-w-4xl mx-auto px-4 pb-12">
        <CommentSection 
          manhwaId={Number(id) || 1} 
          chapterId={currentChapter} 
        />
      </div>
    </div>
  );
}