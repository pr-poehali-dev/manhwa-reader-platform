import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const BOT_API = 'YOUR_BOT_URL_HERE'; // Замените после деплоя

export default function AdminPanel() {
  const [adminKey, setAdminKey] = useState(localStorage.getItem('admin_key') || '');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [translatorRequests, setTranslatorRequests] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (adminKey) {
      loadData();
    }
  }, [adminKey]);

  const executeCommand = async (command: string, data: any = {}) => {
    if (!adminKey) {
      alert('Введите Admin Key!');
      return null;
    }

    setLoading(true);
    try {
      const res = await fetch(BOT_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': adminKey,
          'X-User-Id': user?.id || 'admin'
        },
        body: JSON.stringify({
          command,
          ...data
        })
      });

      const result = await res.json();
      
      if (res.ok) {
        return result;
      } else {
        alert(`❌ Ошибка: ${result.error || 'Unknown error'}`);
        return null;
      }
    } catch (error) {
      alert(`❌ Ошибка: ${error}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    const [statsRes, submissionsRes, requestsRes, historyRes] = await Promise.all([
      executeCommand('get_stats'),
      executeCommand('get_submissions'),
      executeCommand('get_translator_requests'),
      executeCommand('get_history', { limit: 20 })
    ]);

    if (statsRes) setStats(statsRes);
    if (submissionsRes) setSubmissions(submissionsRes.submissions || []);
    if (requestsRes) setTranslatorRequests(requestsRes.requests || []);
    if (historyRes) setHistory(historyRes.history || []);
  };

  const approveSubmission = async (submissionId: number) => {
    const result = await executeCommand('approve_submission', { submission_id: submissionId });
    if (result) {
      alert('✅ Заявка одобрена!');
      loadData();
    }
  };

  const rejectSubmission = async (submissionId: number) => {
    const reason = prompt('Причина отказа:');
    if (reason) {
      const result = await executeCommand('reject_submission', { 
        submission_id: submissionId, 
        reason 
      });
      if (result) {
        alert('✅ Заявка отклонена!');
        loadData();
      }
    }
  };

  const approveTranslator = async (requestId: number) => {
    const result = await executeCommand('approve_translator', { request_id: requestId });
    if (result) {
      alert('✅ Смена переводчика одобрена!');
      loadData();
    }
  };

  const rejectTranslator = async (requestId: number) => {
    const reason = prompt('Причина отказа:');
    if (reason) {
      const result = await executeCommand('reject_translator', { 
        request_id: requestId, 
        reason 
      });
      if (result) {
        alert('✅ Запрос отклонён!');
        loadData();
      }
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('ru-RU');
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Icon name="Shield" size={36} className="text-primary" />
              Админ-панель
            </h1>
            <p className="text-muted-foreground mt-1">
              Модерация контента и управление сайтом
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/moderator')}>
              <Icon name="Bot" size={16} className="mr-2" />
              Бот
            </Button>
            <Button variant="outline" onClick={() => navigate('/')}>
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              На главную
            </Button>
          </div>
        </div>

        {/* Статистика */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Тайтлов</p>
                    <p className="text-2xl font-bold">{stats.total_manhwa}</p>
                  </div>
                  <Icon name="BookOpen" size={32} className="text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Глав</p>
                    <p className="text-2xl font-bold">{stats.total_chapters}</p>
                  </div>
                  <Icon name="FileText" size={32} className="text-green-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Страниц</p>
                    <p className="text-2xl font-bold">{stats.total_pages}</p>
                  </div>
                  <Icon name="Image" size={32} className="text-blue-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Комментариев</p>
                    <p className="text-2xl font-bold">{stats.total_comments}</p>
                  </div>
                  <Icon name="MessageSquare" size={32} className="text-purple-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Табы */}
        <Tabs defaultValue="submissions" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="submissions">
              <Icon name="FileCheck" size={16} className="mr-2" />
              Заявки на тайтлы ({submissions.length})
            </TabsTrigger>
            <TabsTrigger value="translators">
              <Icon name="Users" size={16} className="mr-2" />
              Смена переводчиков ({translatorRequests.length})
            </TabsTrigger>
            <TabsTrigger value="history">
              <Icon name="History" size={16} className="mr-2" />
              История изменений
            </TabsTrigger>
          </TabsList>

          {/* Заявки на тайтлы */}
          <TabsContent value="submissions" className="space-y-4">
            {submissions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Icon name="CheckCircle2" size={48} className="mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">Нет заявок на модерацию</p>
                </CardContent>
              </Card>
            ) : (
              submissions.map((sub) => (
                <Card key={sub.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl">{sub.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Заявка от {sub.username} • {formatDate(sub.submitted_at)}
                        </p>
                      </div>
                      <Badge variant="secondary">Ожидает</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {sub.description && (
                      <div>
                        <p className="text-sm font-semibold mb-1">Описание:</p>
                        <p className="text-sm text-muted-foreground">{sub.description}</p>
                      </div>
                    )}

                    {sub.alternative_titles && (
                      <div>
                        <p className="text-sm font-semibold mb-1">Альтернативные названия:</p>
                        <p className="text-sm text-muted-foreground">{sub.alternative_titles}</p>
                      </div>
                    )}

                    {sub.source_url && (
                      <div>
                        <p className="text-sm font-semibold mb-1">Источник:</p>
                        <a 
                          href={sub.source_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          {sub.source_url}
                        </a>
                      </div>
                    )}

                    {sub.cover_url && (
                      <div>
                        <p className="text-sm font-semibold mb-1">Обложка:</p>
                        <img 
                          src={sub.cover_url} 
                          alt={sub.title}
                          className="w-32 h-48 object-cover rounded"
                        />
                      </div>
                    )}

                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={() => approveSubmission(sub.id)}
                        disabled={loading}
                        className="flex-1"
                      >
                        <Icon name="Check" size={16} className="mr-2" />
                        Одобрить
                      </Button>
                      <Button
                        onClick={() => rejectSubmission(sub.id)}
                        disabled={loading}
                        variant="destructive"
                        className="flex-1"
                      >
                        <Icon name="X" size={16} className="mr-2" />
                        Отклонить
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Запросы на смену переводчика */}
          <TabsContent value="translators" className="space-y-4">
            {translatorRequests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Icon name="CheckCircle2" size={48} className="mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">Нет запросов на смену переводчиков</p>
                </CardContent>
              </Card>
            ) : (
              translatorRequests.map((req) => (
                <Card key={req.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{req.manhwa_title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Запрос от {req.requesting_username} • {formatDate(req.submitted_at)}
                        </p>
                      </div>
                      <Badge variant="secondary">Ожидает</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {req.reason && (
                      <div>
                        <p className="text-sm font-semibold mb-1">Причина:</p>
                        <p className="text-sm text-muted-foreground">{req.reason}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={() => approveTranslator(req.id)}
                        disabled={loading}
                        className="flex-1"
                      >
                        <Icon name="Check" size={16} className="mr-2" />
                        Одобрить
                      </Button>
                      <Button
                        onClick={() => rejectTranslator(req.id)}
                        disabled={loading}
                        variant="destructive"
                        className="flex-1"
                      >
                        <Icon name="X" size={16} className="mr-2" />
                        Отклонить
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* История изменений */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Последние 20 изменений</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {history.map((h) => (
                    <div key={h.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                      <div className="p-2 bg-muted rounded-full">
                        <Icon 
                          name={
                            h.action === 'created' ? 'Plus' :
                            h.action === 'updated' ? 'Edit' :
                            h.action === 'deleted' ? 'Trash' : 'Activity'
                          } 
                          size={16} 
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-semibold">{h.user_id}</span>
                          {' '}
                          <Badge variant="outline" className="text-xs">
                            {h.action}
                          </Badge>
                          {' '}
                          {h.entity_type} #{h.entity_id}
                        </p>
                        {h.changes && (
                          <p className="text-xs text-muted-foreground mt-1">{h.changes}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(h.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
