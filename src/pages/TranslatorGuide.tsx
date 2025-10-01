import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function TranslatorGuide() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <h1 className="text-xl font-bold text-primary">
              Гайд для переводчиков
            </h1>
          </div>

          <Button variant="ghost" size="icon" onClick={() => {
            const newTheme = theme === 'light' ? 'dark' : 'light';
            setTheme(newTheme);
            localStorage.setItem('theme', newTheme);
            if (newTheme === 'dark') {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          }}>
            <Icon name={theme === 'light' ? 'Moon' : 'Sun'} size={20} />
          </Button>
        </div>
      </header>

      <main className="container max-w-4xl px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
            <Icon name="BookText" size={40} className="text-primary" />
          </div>
          <h2 className="text-3xl font-bold">Как получать донаты легально</h2>
          <p className="text-muted-foreground text-lg">
            Полное руководство по монетизации переводов без налоговых рисков
          </p>
        </div>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="ShieldCheck" size={24} className="text-green-500" />
              Безопасная система донатов
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Icon name="Check" size={20} className="text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Внешние платформы</p>
                  <p className="text-sm text-muted-foreground">
                    Все платежи идут через Boosty и VK Донат — платформа не обрабатывает деньги
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Icon name="Check" size={20} className="text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Нет налоговых рисков для сайта</p>
                  <p className="text-sm text-muted-foreground">
                    Платформа только размещает ссылки, вся ответственность на донат-сервисах
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Icon name="Check" size={20} className="text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Вы управляете доступом</p>
                  <p className="text-sm text-muted-foreground">
                    Настраивайте уровни подписки и ранний доступ к главам самостоятельно
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Briefcase" size={24} className="text-primary" />
              Самозанятость: Пошаговая инструкция
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Badge>Шаг 1</Badge>
                    <span>Регистрация в качестве самозанятого</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <p className="text-muted-foreground">
                    Самозанятость (НПД) — упрощённый налоговый режим с минимальной отчётностью.
                  </p>
                  
                  <div className="space-y-2">
                    <p className="font-semibold">Способы регистрации:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Приложение «Мой налог» (iOS/Android)</li>
                      <li>Через Госуслуги</li>
                      <li>Личный кабинет на nalog.gov.ru</li>
                      <li>Через банк (Сбер, Тинькофф и др.)</li>
                    </ul>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <p className="text-sm font-semibold mb-2">Что нужно для регистрации:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Паспорт гражданина РФ</li>
                      <li>ИНН (получите бесплатно в налоговой)</li>
                      <li>Фото для приложения</li>
                    </ul>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Регистрация бесплатная, занимает 5-10 минут. Отказать могут только если вы уже ИП или на другом налоговом режиме.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Badge>Шаг 2</Badge>
                    <span>Налоговые ставки и лимиты</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center space-y-2">
                          <p className="text-3xl font-bold text-primary">4%</p>
                          <p className="text-sm text-muted-foreground">
                            От доходов с физлиц (большинство донатов)
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center space-y-2">
                          <p className="text-3xl font-bold text-primary">6%</p>
                          <p className="text-sm text-muted-foreground">
                            От доходов с юрлиц и ИП
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                    <p className="font-semibold mb-2 flex items-center gap-2">
                      <Icon name="AlertTriangle" size={16} className="text-amber-500" />
                      Важные лимиты:
                    </p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Максимальный доход: <strong>2,4 млн руб/год</strong></li>
                      <li>• Нельзя нанимать сотрудников</li>
                      <li>• Нельзя перепродавать чужие товары</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Badge>Шаг 3</Badge>
                    <span>Как платить налоги с донатов</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <p className="text-muted-foreground">
                    Процесс максимально простой — всё делается через приложение «Мой налог».
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold">1</span>
                      </div>
                      <div>
                        <p className="font-semibold">Получили донат</p>
                        <p className="text-sm text-muted-foreground">
                          Деньги пришли на карту через Boosty или VK
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold">2</span>
                      </div>
                      <div>
                        <p className="font-semibold">Формируете чек</p>
                        <p className="text-sm text-muted-foreground">
                          В приложении «Мой налог» → «Новая продажа» → вводите сумму
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold">3</span>
                      </div>
                      <div>
                        <p className="font-semibold">Налог рассчитывается автоматически</p>
                        <p className="text-sm text-muted-foreground">
                          Приложение само считает 4% и формирует уведомление
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold">4</span>
                      </div>
                      <div>
                        <p className="font-semibold">Оплачиваете до 28 числа</p>
                        <p className="text-sm text-muted-foreground">
                          Налог за текущий месяц платите до 28 числа следующего месяца
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <p className="text-sm font-semibold mb-1">💡 Совет:</p>
                    <p className="text-sm text-muted-foreground">
                      Откладывайте сразу 5% с каждого доната в отдельный счёт — так точно хватит на налоги
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Badge>Шаг 4</Badge>
                    <span>Настройка уровней подписки</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <p className="text-muted-foreground">
                    На платформах Boosty и VK Донат можно настроить платные подписки с разными уровнями доступа.
                  </p>

                  <div className="space-y-4">
                    <Card>
                      <CardContent className="pt-6 space-y-2">
                        <div className="flex items-center gap-2">
                          <Icon name="Gift" size={20} className="text-blue-500" />
                          <p className="font-semibold">Базовый уровень (100-300₽)</p>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-7">
                          <li>Доступ к закрытому чату</li>
                          <li>Ваше имя в титрах</li>
                          <li>Ранний доступ на 1 день</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6 space-y-2">
                        <div className="flex items-center gap-2">
                          <Icon name="Star" size={20} className="text-purple-500" />
                          <p className="font-semibold">Продвинутый уровень (500-800₽)</p>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-7">
                          <li>Всё из базового</li>
                          <li>Ранний доступ на 3-7 дней</li>
                          <li>Голосование за приоритет переводов</li>
                          <li>Эксклюзивные посты о процессе</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6 space-y-2">
                        <div className="flex items-center gap-2">
                          <Icon name="Crown" size={20} className="text-amber-500" />
                          <p className="font-semibold">VIP уровень (1000₽+)</p>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-7">
                          <li>Всё из продвинутого</li>
                          <li>Ранний доступ на 14 дней</li>
                          <li>Персональная благодарность</li>
                          <li>Влияние на выбор новых проектов</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Badge>Шаг 5</Badge>
                    <span>Управление ранним доступом</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <p className="text-muted-foreground">
                    Как организовать ранний доступ к главам для донатеров:
                  </p>

                  <div className="space-y-3">
                    <div className="bg-muted rounded-lg p-4">
                      <p className="font-semibold mb-2">Вариант 1: Через Boosty/VK</p>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                        <li>Публикуете главу на Boosty для подписчиков</li>
                        <li>Через 3-14 дней публикуете на основной платформе</li>
                        <li>Подписчики получают доступ раньше всех</li>
                      </ol>
                    </div>

                    <div className="bg-muted rounded-lg p-4">
                      <p className="font-semibold mb-2">Вариант 2: Отдельная публикация</p>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                        <li>Создаёте закрытый канал/чат для донатеров</li>
                        <li>Публикуете главы там раньше времени</li>
                        <li>Потом выкладываете на основной платформе</li>
                      </ol>
                    </div>

                    <div className="bg-muted rounded-lg p-4">
                      <p className="font-semibold mb-2">Вариант 3: Дополнительный контент</p>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                        <li>Основные главы бесплатно для всех</li>
                        <li>Бонусные главы/эпилоги только для донатеров</li>
                        <li>Артбуки, заметки переводчика, озвучки</li>
                      </ol>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="AlertCircle" size={24} className="text-amber-500" />
              Важные моменты
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <p className="font-semibold">⚠️ Не забывайте про налоги</p>
              <p className="text-sm text-muted-foreground">
                Даже с небольших донатов нужно платить налог. Штраф за неуплату — до 40% от суммы.
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-semibold">📊 Ведите учёт</p>
              <p className="text-sm text-muted-foreground">
                Фиксируйте все поступления. Приложение «Мой налог» показывает историю, но лучше дублировать в таблице.
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-semibold">💰 Выводите деньги официально</p>
              <p className="text-sm text-muted-foreground">
                Используйте Boosty и VK — они автоматически переводят на вашу карту. Не принимайте переводы «как другу».
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-semibold">📝 Указывайте правильные услуги</p>
              <p className="text-sm text-muted-foreground">
                В чеке пишите: «Информационные услуги», «Литературный перевод» или «Контент для подписчиков».
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="HelpCircle" size={24} />
              Полезные ссылки
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a 
              href="https://npd.nalog.ru/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <div>
                <p className="font-semibold">Официальный сайт НПД</p>
                <p className="text-sm text-muted-foreground">nalog.gov.ru</p>
              </div>
              <Icon name="ExternalLink" size={20} />
            </a>

            <a 
              href="https://boosty.to/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <div>
                <p className="font-semibold">Boosty</p>
                <p className="text-sm text-muted-foreground">Платформа для донатов</p>
              </div>
              <Icon name="ExternalLink" size={20} />
            </a>

            <a 
              href="https://vk.com/donut" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <div>
                <p className="font-semibold">VK Донат</p>
                <p className="text-sm text-muted-foreground">Донаты через ВКонтакте</p>
              </div>
              <Icon name="ExternalLink" size={20} />
            </a>
          </CardContent>
        </Card>

        <div className="flex justify-center gap-4">
          <Button onClick={() => navigate('/upload')} size="lg">
            <Icon name="Upload" size={20} className="mr-2" />
            Загрузить манхву
          </Button>
          <Button onClick={() => navigate('/upload-novel')} variant="outline" size="lg">
            <Icon name="BookText" size={20} className="mr-2" />
            Загрузить новеллу
          </Button>
        </div>
      </main>
    </div>
  );
}
