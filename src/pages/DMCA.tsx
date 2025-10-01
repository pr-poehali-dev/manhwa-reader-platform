import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';

export default function DMCA() {
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
            <CardTitle className="text-3xl">Защита авторских прав (DMCA)</CardTitle>
            <CardDescription>
              Процедура подачи жалоб на нарушение авторских прав
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Icon name="Shield" size={24} className="text-primary" />
                Наша позиция
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                MANHWA READER уважает права интеллектуальной собственности и соблюдает положения 
                Закона РФ «Об авторском праве и смежных правах» № 5351-1 от 09.07.1993 г., 
                а также статьи 1225-1551 части четвертой Гражданского кодекса РФ.
              </p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Icon name="AlertTriangle" size={20} className="text-amber-500" />
                Важное уведомление
              </h4>
              <p className="text-sm text-muted-foreground">
                Платформа не размещает контент самостоятельно. Весь контент загружается пользователями. 
                Мы являемся хостинг-провайдером и не несем ответственности за контент, размещенный третьими лицами.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Icon name="FileText" size={24} className="text-primary" />
                Процедура подачи жалобы
              </h3>
              <p className="text-muted-foreground mb-4">
                Если вы правообладатель и считаете, что ваши права нарушены, направьте официальное 
                уведомление с следующей информацией:
              </p>

              <div className="space-y-4">
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">1. Идентификация правообладателя</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• Полное наименование организации или ФИО физического лица</li>
                      <li>• Контактные данные (адрес, телефон, email)</li>
                      <li>• Реквизиты документа, подтверждающего полномочия</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">2. Идентификация нарушенного произведения</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• Название произведения</li>
                      <li>• Автор и правообладатель</li>
                      <li>• Доказательства наличия прав (свидетельство, договор, лицензия)</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">3. Идентификация нарушающего материала</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• Прямая ссылка на страницу с контентом</li>
                      <li>• Описание нарушения (несанкционированное размещение, искажение и т.д.)</li>
                      <li>• Скриншоты или другие доказательства</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">4. Заявление о добросовестности</h4>
                    <p className="text-sm text-muted-foreground">
                      «Настоящим подтверждаю, что информация в данном уведомлении является точной, 
                      и заявляю под страхом ответственности за лжесвидетельство, что я являюсь 
                      правообладателем или уполномочен действовать от имени правообладателя.»
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Icon name="Mail" size={24} className="text-primary" />
                Куда направлять жалобу
              </h3>
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <p className="text-sm">
                      <strong>Email:</strong> <a href="mailto:dmca@manhwareader.com" className="text-primary hover:underline">dmca@manhwareader.com</a>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Уведомление должно быть направлено в письменной форме с электронной подписью 
                      или скан-копией подписанного документа.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Icon name="Clock" size={24} className="text-primary" />
                Сроки рассмотрения
              </h3>
              <div className="space-y-3">
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Icon name="CheckCircle2" size={20} className="text-green-500 mt-0.5" />
                      <div>
                        <p className="font-semibold mb-1">Экспресс-рассмотрение (24 часа)</p>
                        <p className="text-sm text-muted-foreground">
                          При наличии всех необходимых документов и явном нарушении
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Icon name="Calendar" size={20} className="text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-semibold mb-1">Стандартное рассмотрение (до 7 дней)</p>
                        <p className="text-sm text-muted-foreground">
                          При необходимости дополнительной проверки и запроса документов
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Icon name="Scale" size={24} className="text-primary" />
                Последствия подачи ложной жалобы
              </h3>
              <Card className="bg-red-500/10 border-red-500/20">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Подача заведомо ложного уведомления влечет ответственность в соответствии со 
                    статьей 128.1 УК РФ (клевета) и статьей 151 ГК РФ (компенсация морального вреда). 
                    Все заявления проверяются на достоверность. При выявлении мошенничества информация 
                    передается в правоохранительные органы.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Icon name="Users" size={24} className="text-primary" />
                Права пользователей, разместивших контент
              </h3>
              <p className="text-muted-foreground mb-3">
                При получении жалобы пользователь, разместивший контент, будет уведомлен и 
                получит право на подачу встречного заявления в течение 14 дней, если считает 
                жалобу необоснованной.
              </p>
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <p className="text-sm font-semibold mb-2">Встречное заявление должно содержать:</p>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Обоснование законности размещения (наличие лицензии, добросовестное использование)</li>
                    <li>• Доказательства прав на размещение</li>
                    <li>• Контактные данные для связи</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground text-center">
                Администрация MANHWA READER стремится к балансу между защитой прав правообладателей 
                и обеспечением доступа пользователей к легальному контенту.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
