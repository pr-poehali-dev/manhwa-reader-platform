import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

interface ScheduleItem {
  id: number;
  title: string;
  cover: string;
  dayOfWeek: number;
  time: string;
  team: string;
}

const DAYS = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

const MOCK_SCHEDULE: ScheduleItem[] = [
  { id: 1, title: 'Solo Leveling', cover: 'https://picsum.photos/seed/1/300/400', dayOfWeek: 0, time: '12:00', team: 'ReManga Team' },
  { id: 2, title: 'Omniscient Reader', cover: 'https://picsum.photos/seed/2/300/400', dayOfWeek: 0, time: '15:00', team: 'MangaLib' },
  { id: 3, title: 'The Beginning After The End', cover: 'https://picsum.photos/seed/3/300/400', dayOfWeek: 1, time: '10:00', team: 'Manga Fox' },
  { id: 4, title: 'Tower of God', cover: 'https://picsum.photos/seed/4/300/400', dayOfWeek: 2, time: '14:00', team: 'Webtoon' },
  { id: 5, title: 'The God of High School', cover: 'https://picsum.photos/seed/5/300/400', dayOfWeek: 3, time: '16:00', team: 'Manga Plus' },
];

export default function Schedule() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const scheduleByDay = DAYS.map((day, index) => ({
    day,
    items: MOCK_SCHEDULE.filter(item => item.dayOfWeek === index)
  }));

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <h1 className="text-2xl font-bold text-primary">Расписание выхода глав</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              <Icon name={theme === 'light' ? 'Moon' : 'Sun'} size={20} />
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-8">
        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {DAYS.map((day, index) => (
              <Button
                key={day}
                variant={selectedDay === index ? 'default' : 'outline'}
                onClick={() => setSelectedDay(index)}
                className="whitespace-nowrap"
              >
                {day}
                {index === (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1) && (
                  <Badge variant="secondary" className="ml-2 text-xs">Сегодня</Badge>
                )}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {scheduleByDay.map((daySchedule, dayIndex) => (
            dayIndex === selectedDay && (
              <div key={daySchedule.day}>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Icon name="Calendar" size={24} />
                  {daySchedule.day}
                </h2>
                
                {daySchedule.items.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                      <Icon name="CalendarOff" size={48} className="mx-auto mb-4 opacity-50" />
                      <p>На этот день релизов не запланировано</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {daySchedule.items.map((item) => (
                      <Card 
                        key={item.id}
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => navigate(`/reader/${item.id}`)}
                      >
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <img
                              src={item.cover}
                              alt={item.title}
                              className="w-20 h-28 object-cover rounded"
                            />
                            <div className="flex-1">
                              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Icon name="Clock" size={16} />
                                  <span>{item.time}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Icon name="Users" size={16} />
                                  <span>{item.team}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <Button size="sm" className="gap-2">
                                <Icon name="BookOpen" size={16} />
                                Читать
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )
          ))}
        </div>
      </main>
    </div>
  );
}
