import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';

export default function IndexFooter() {
  const navigate = useNavigate();

  return (
    <>
      <footer className="bg-card border-t mt-16">
        <div className="container px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4 text-primary">MANHWA READER</h3>
              <p className="text-sm text-muted-foreground">
                Лучший сервис для чтения манхвы, манги и маньхуа онлайн
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Каталог</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary cursor-pointer" onClick={() => navigate('/catalog')}>Все тайтлы</li>
                <li className="hover:text-primary cursor-pointer">Популярное</li>
                <li className="hover:text-primary cursor-pointer">Новинки</li>
                <li className="hover:text-primary cursor-pointer" onClick={() => navigate('/schedule')}>Расписание</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Сообщество</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary cursor-pointer" onClick={() => navigate('/teams')}>Команды переводчиков</li>
                <li className="hover:text-primary cursor-pointer" onClick={() => navigate('/upload')}>Загрузить тайтл</li>
                <li className="hover:text-primary cursor-pointer">Правила</li>
                <li className="hover:text-primary cursor-pointer">FAQ</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Поддержка</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary cursor-pointer">Донат</li>
                <li className="hover:text-primary cursor-pointer">Связаться</li>
                <li className="hover:text-primary cursor-pointer">Реклама</li>
                <li className="hover:text-primary cursor-pointer">API</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2024 MANHWA READER. Платформа для фан-переводов.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <span className="hover:text-primary cursor-pointer" onClick={() => navigate('/terms')}>
                Пользовательское соглашение
              </span>
              <span className="hover:text-primary cursor-pointer" onClick={() => navigate('/dmca')}>
                DMCA / Авторские права
              </span>
            </div>
          </div>
        </div>
      </footer>
      
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t">
        <div className="grid grid-cols-5 h-16">
          <button
            onClick={() => navigate('/')}
            className="flex flex-col items-center justify-center gap-1 hover:bg-accent transition-colors"
          >
            <Icon name="Home" size={20} />
            <span className="text-xs">Главная</span>
          </button>
          
          <button
            onClick={() => navigate('/catalog')}
            className="flex flex-col items-center justify-center gap-1 hover:bg-accent transition-colors"
          >
            <Icon name="BookOpen" size={20} />
            <span className="text-xs">Каталог</span>
          </button>
          
          <button
            onClick={() => navigate('/schedule')}
            className="flex flex-col items-center justify-center gap-1 hover:bg-accent transition-colors"
          >
            <Icon name="Calendar" size={20} />
            <span className="text-xs">Расписание</span>
          </button>
          
          <button
            onClick={() => navigate('/teams')}
            className="flex flex-col items-center justify-center gap-1 hover:bg-accent transition-colors"
          >
            <Icon name="Users" size={20} />
            <span className="text-xs">Команды</span>
          </button>
          
          <button
            onClick={() => navigate('/upload')}
            className="flex flex-col items-center justify-center gap-1 hover:bg-accent transition-colors"
          >
            <Icon name="Upload" size={20} />
            <span className="text-xs">Загрузить</span>
          </button>
        </div>
      </nav>
    </>
  );
}
