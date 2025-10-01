import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <h1 
            className="text-2xl font-bold text-primary cursor-pointer" 
            onClick={() => navigate('/')}
          >
            MANHWA READER
          </h1>
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <Icon name="ArrowLeft" size={20} className="mr-2" />
            Назад
          </Button>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Пользовательское соглашение</CardTitle>
            <CardDescription>
              Условия использования платформы MANHWA READER
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3">1. Общие положения</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  1.1. Настоящее Пользовательское соглашение (далее — «Соглашение») регулирует 
                  отношения между администрацией платформы MANHWA READER (далее — «Платформа») 
                  и пользователями сервиса.
                </p>
                <p>
                  1.2. Используя Платформу, вы подтверждаете, что полностью прочитали, поняли и 
                  согласны соблюдать условия настоящего Соглашения.
                </p>
                <p>
                  1.3. Если вы не согласны с условиями Соглашения, пожалуйста, прекратите использование Платформы.
                </p>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Icon name="Info" size={20} className="text-blue-500" />
                Важно
              </h4>
              <p className="text-sm text-muted-foreground">
                Платформа является хостинг-провайдером пользовательского контента и не создает, 
                не проверяет и не одобряет материалы, загружаемые пользователями.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">2. Характер платформы</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  2.1. MANHWA READER является платформой для <strong>фан-переводов и любительского контента</strong>.
                </p>
                <p>
                  2.2. Весь контент на Платформе создается и размещается пользователями на добровольной основе.
                </p>
                <p>
                  2.3. Платформа не заключает авторских договоров и не приобретает права на размещаемые произведения.
                </p>
                <p>
                  2.4. Мы НЕ размещаем официальные лицензионные переводы без явного разрешения правообладателей.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">3. Права и обязанности пользователей</h3>
              
              <Card className="bg-muted/50 mb-4">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2 text-green-600 flex items-center gap-2">
                    <Icon name="CheckCircle2" size={20} />
                    Вы МОЖЕТЕ:
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>✓ Читать и просматривать фан-переводы манхвы и новелл</li>
                    <li>✓ Размещать собственные фан-переводы некоммерческих произведений</li>
                    <li>✓ Указывать ссылки на донаты для поддержки переводчиков</li>
                    <li>✓ Взаимодействовать с сообществом в рамках закона</li>
                    <li>✓ Сообщать о нарушениях авторских прав</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-red-500/10 border-red-500/20">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2 text-red-600 flex items-center gap-2">
                    <Icon name="XCircle" size={20} />
                    Вы НЕ МОЖЕТЕ:
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>✗ Размещать официальные лицензионные переводы без разрешения</li>
                    <li>✗ Заявлять права собственности на чужие произведения</li>
                    <li>✗ Размещать материалы, нарушающие законодательство РФ</li>
                    <li>✗ Использовать автоматические средства для массовой загрузки (парсинг)</li>
                    <li>✗ Размещать вредоносный код или спам</li>
                    <li>✗ Продавать доступ к контенту (только добровольные донаты)</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">4. Авторские права и ответственность</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  4.1. Пользователь, загружающий контент, самостоятельно несет ответственность за 
                  соблюдение авторских прав.
                </p>
                <p>
                  4.2. Платформа соблюдает законодательство РФ об авторских правах (ГК РФ часть 4, 
                  статьи 1225-1551).
                </p>
                <p>
                  4.3. При получении обоснованной жалобы правообладателя материал будет удален 
                  в соответствии с процедурой DMCA.
                </p>
                <p>
                  4.4. Платформа действует как хостинг-провайдер и освобождается от ответственности 
                  за контент пользователей согласно статье 1253.1 ГК РФ.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">5. Правила размещения контента</h3>
              <div className="space-y-3">
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">5.1. Обязательные указания</h4>
                    <p className="text-sm text-muted-foreground">
                      При загрузке контента обязательно указывайте автора оригинального произведения, 
                      источник и тип перевода (любительский/фан-перевод).
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">5.2. Дисклеймер</h4>
                    <p className="text-sm text-muted-foreground">
                      Все загружаемые переводы автоматически помечаются как «фан-перевод» 
                      с указанием: «Данный перевод выполнен энтузиастами и не является официальным».
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">5.3. Запрещенный контент</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Запрещено размещать материалы, содержащие:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• Детскую порнографию (статья 242.1 УК РФ)</li>
                      <li>• Призывы к терроризму и экстремизму (статья 205.2 УК РФ)</li>
                      <li>• Распространение наркотиков (статья 228.1 УК РФ)</li>
                      <li>• Разжигание ненависти (статья 282 УК РФ)</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">6. Монетизация и донаты</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  6.1. Платформа НЕ собирает платежи и НЕ является посредником в финансовых операциях.
                </p>
                <p>
                  6.2. Переводчики могут размещать ссылки на внешние платформы для добровольных пожертвований 
                  (Boosty, VK Донат и др.).
                </p>
                <p>
                  6.3. Все донаты осуществляются напрямую между пользователями через внешние сервисы.
                </p>
                <p>
                  6.4. Переводчики самостоятельно несут ответственность за уплату налогов 
                  с полученных донатов (самозанятость, ИП и т.д.).
                </p>
                <p>
                  6.5. Платформа НЕ несет ответственности за налоговые обязательства пользователей.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">7. Конфиденциальность</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  7.1. Мы собираем минимальные данные: идентификатор пользователя (случайная строка), 
                  загруженный контент.
                </p>
                <p>
                  7.2. Мы НЕ собираем персональные данные (ФИО, паспорта, адреса) без явного согласия.
                </p>
                <p>
                  7.3. Данные пользователей не передаются третьим лицам, кроме случаев, 
                  предусмотренных законом (запрос правоохранительных органов).
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">8. Ограничение ответственности</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  8.1. Платформа предоставляется «как есть» без каких-либо гарантий.
                </p>
                <p>
                  8.2. Мы не несем ответственности за:
                </p>
                <ul className="ml-6 space-y-1">
                  <li>• Качество и точность фан-переводов</li>
                  <li>• Действия пользователей и их соблюдение законов</li>
                  <li>• Технические сбои и недоступность сервиса</li>
                  <li>• Потерю данных или контента</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">9. Модерация и удаление контента</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  9.1. Администрация имеет право удалить контент без предупреждения в случае:
                </p>
                <ul className="ml-6 space-y-1">
                  <li>• Нарушения законодательства РФ</li>
                  <li>• Обоснованной жалобы правообладателя</li>
                  <li>• Нарушения условий настоящего Соглашения</li>
                </ul>
                <p>
                  9.2. Пользователь может подать апелляцию на удаление в течение 14 дней.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">10. Изменение условий</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  10.1. Администрация оставляет за собой право изменять условия Соглашения.
                </p>
                <p>
                  10.2. Пользователи будут уведомлены о существенных изменениях за 7 дней.
                </p>
                <p>
                  10.3. Продолжение использования Платформы после изменений означает согласие с новыми условиями.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">11. Применимое право</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  11.1. Настоящее Соглашение регулируется законодательством Российской Федерации.
                </p>
                <p>
                  11.2. Все споры решаются в соответствии с законодательством РФ.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">12. Контакты</h3>
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <p className="text-sm">
                      <strong>Общие вопросы:</strong> <a href="mailto:support@manhwareader.com" className="text-primary hover:underline">support@manhwareader.com</a>
                    </p>
                    <p className="text-sm">
                      <strong>Жалобы на авторские права:</strong> <a href="mailto:dmca@manhwareader.com" className="text-primary hover:underline">dmca@manhwareader.com</a>
                    </p>
                    <p className="text-sm">
                      <strong>Для правообладателей:</strong> <a href="/dmca" className="text-primary hover:underline">Процедура DMCA</a>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                <strong>Дата последнего обновления:</strong> 1 октября 2025 года
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
