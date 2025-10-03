"""
Business: Бот-модератор для управления контентом сайта - парсинг глав, обновление карточек, мониторинг
Args: event - dict с httpMethod, body для команд бота
      context - object с request_id
Returns: HTTP response с результатом выполнения команды
"""

import json
import os
import re
from typing import Dict, Any, List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

def get_db_connection():
    """Создает подключение к БД"""
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        raise Exception('DATABASE_URL not found')
    return psycopg2.connect(dsn)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'POST')
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key'
    }
    
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}
    
    # Проверка прав модератора
    admin_key = event.get('headers', {}).get('X-Admin-Key')
    if not admin_key or admin_key != os.environ.get('ADMIN_KEY', 'default_key'):
        return {
            'statusCode': 403,
            'headers': headers,
            'body': json.dumps({'error': 'Forbidden: Invalid admin key'})
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        command = body.get('command')
        
        if not command:
            return get_bot_help(headers)
        
        conn = get_db_connection()
        
        # Маршрутизация команд
        if command == 'parse_chapters':
            return parse_chapters_from_url(body, conn, headers)
        elif command == 'update_manhwa':
            return update_manhwa_info(body, conn, headers)
        elif command == 'monitor_site':
            return monitor_site_health(body, conn, headers)
        elif command == 'add_chapter':
            return add_chapter_manually(body, conn, headers)
        elif command == 'update_cover':
            return update_cover_image(body, conn, headers)
        elif command == 'sync_chapters':
            return sync_chapters_from_source(body, conn, headers)
        elif command == 'get_stats':
            return get_site_statistics(conn, headers)
        elif command == 'help':
            return get_bot_help(headers)
        else:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': f'Unknown command: {command}. Use "help" for list of commands'})
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }
    finally:
        if 'conn' in locals():
            conn.close()

def get_bot_help(headers: Dict) -> Dict[str, Any]:
    """Справка по командам бота"""
    commands = {
        'parse_chapters': {
            'description': 'Парсинг глав с внешнего источника',
            'params': {
                'manhwa_id': 'ID манхвы в БД',
                'source_url': 'URL источника (remanga.org, etc)',
                'start_chapter': 'С какой главы начать (опционально)',
                'end_chapter': 'До какой главы (опционально)'
            },
            'example': {
                'command': 'parse_chapters',
                'manhwa_id': 1,
                'source_url': 'https://remanga.org/manga/solo-leveling',
                'start_chapter': 1,
                'end_chapter': 10
            }
        },
        'add_chapter': {
            'description': 'Добавить главу вручную',
            'params': {
                'manhwa_id': 'ID манхвы',
                'chapter_number': 'Номер главы',
                'title': 'Название главы',
                'pages': 'Массив URL страниц'
            },
            'example': {
                'command': 'add_chapter',
                'manhwa_id': 1,
                'chapter_number': 15,
                'title': 'Глава 15: Пробуждение',
                'pages': ['url1.jpg', 'url2.jpg', 'url3.jpg']
            }
        },
        'update_manhwa': {
            'description': 'Обновить информацию о манхве',
            'params': {
                'manhwa_id': 'ID манхвы',
                'title': 'Новое название (опционально)',
                'description': 'Описание (опционально)',
                'cover_url': 'URL обложки (опционально)',
                'status': 'Статус (ongoing/completed)',
                'genres': 'Массив жанров'
            }
        },
        'update_cover': {
            'description': 'Обновить обложку манхвы',
            'params': {
                'manhwa_id': 'ID манхвы',
                'cover_url': 'URL новой обложки'
            }
        },
        'sync_chapters': {
            'description': 'Синхронизировать главы с источником',
            'params': {
                'manhwa_id': 'ID манхвы',
                'source_url': 'URL источника'
            }
        },
        'monitor_site': {
            'description': 'Проверить здоровье сайта',
            'params': {}
        },
        'get_stats': {
            'description': 'Получить статистику сайта',
            'params': {}
        }
    }
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({
            'bot': 'Moderator Bot v1.0',
            'description': 'Бот для управления контентом manhwa сайта',
            'commands': commands
        }, ensure_ascii=False, indent=2)
    }

def add_chapter_manually(body: Dict, conn, headers: Dict) -> Dict[str, Any]:
    """Добавление главы вручную"""
    manhwa_id = body.get('manhwa_id')
    chapter_number = body.get('chapter_number')
    title = body.get('title', f'Глава {chapter_number}')
    pages = body.get('pages', [])
    
    if not manhwa_id or not chapter_number:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'manhwa_id and chapter_number required'})
        }
    
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    # Проверяем существование манхвы
    cursor.execute(f"SELECT id, title FROM manhwa WHERE id = {manhwa_id}")
    manhwa = cursor.fetchone()
    
    if not manhwa:
        return {
            'statusCode': 404,
            'headers': headers,
            'body': json.dumps({'error': 'Manhwa not found'})
        }
    
    # Проверяем дубликаты
    cursor.execute(
        f"SELECT id FROM chapters WHERE manhwa_id = {manhwa_id} AND chapter_number = {chapter_number}"
    )
    existing = cursor.fetchone()
    
    if existing:
        return {
            'statusCode': 409,
            'headers': headers,
            'body': json.dumps({'error': f'Chapter {chapter_number} already exists'})
        }
    
    # Вставляем главу
    cursor.execute(
        """INSERT INTO chapters (manhwa_id, chapter_number, title, created_at) 
           VALUES (%s, %s, %s, CURRENT_TIMESTAMP) RETURNING id""",
        (manhwa_id, chapter_number, title)
    )
    chapter_id = cursor.fetchone()['id']
    
    # Добавляем страницы
    pages_added = 0
    for idx, page_url in enumerate(pages, start=1):
        cursor.execute(
            """INSERT INTO pages (chapter_id, page_number, image_url) 
               VALUES (%s, %s, %s)""",
            (chapter_id, idx, page_url)
        )
        pages_added += 1
    
    conn.commit()
    cursor.close()
    
    return {
        'statusCode': 201,
        'headers': headers,
        'body': json.dumps({
            'message': f'Chapter {chapter_number} added successfully',
            'chapter_id': chapter_id,
            'pages_added': pages_added,
            'manhwa': dict(manhwa)
        })
    }

def update_manhwa_info(body: Dict, conn, headers: Dict) -> Dict[str, Any]:
    """Обновление информации о манхве"""
    manhwa_id = body.get('manhwa_id')
    
    if not manhwa_id:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'manhwa_id required'})
        }
    
    cursor = conn.cursor()
    updates = []
    values = []
    
    if 'title' in body:
        updates.append('title = %s')
        values.append(body['title'])
    
    if 'description' in body:
        updates.append('description = %s')
        values.append(body['description'])
    
    if 'cover_url' in body:
        updates.append('cover_url = %s')
        values.append(body['cover_url'])
    
    if 'status' in body:
        updates.append('status = %s')
        values.append(body['status'])
    
    if 'rating' in body:
        updates.append('rating = %s')
        values.append(body['rating'])
    
    if not updates:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'No fields to update'})
        }
    
    values.append(manhwa_id)
    query = f"UPDATE manhwa SET {', '.join(updates)} WHERE id = %s"
    
    cursor.execute(query, values)
    conn.commit()
    cursor.close()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({
            'message': 'Manhwa updated successfully',
            'updated_fields': list(body.keys())
        })
    }

def update_cover_image(body: Dict, conn, headers: Dict) -> Dict[str, Any]:
    """Обновление обложки"""
    manhwa_id = body.get('manhwa_id')
    cover_url = body.get('cover_url')
    
    if not manhwa_id or not cover_url:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'manhwa_id and cover_url required'})
        }
    
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE manhwa SET cover_url = %s WHERE id = %s",
        (cover_url, manhwa_id)
    )
    conn.commit()
    cursor.close()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'message': 'Cover updated successfully'})
    }

def get_site_statistics(conn, headers: Dict) -> Dict[str, Any]:
    """Статистика сайта"""
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    stats = {}
    
    # Количество манхвы
    cursor.execute("SELECT COUNT(*) as total FROM manhwa")
    stats['total_manhwa'] = cursor.fetchone()['total']
    
    # Количество глав
    cursor.execute("SELECT COUNT(*) as total FROM chapters")
    stats['total_chapters'] = cursor.fetchone()['total']
    
    # Количество страниц
    cursor.execute("SELECT COUNT(*) as total FROM pages")
    stats['total_pages'] = cursor.fetchone()['total']
    
    # Количество комментариев
    cursor.execute("SELECT COUNT(*) as total FROM comments")
    stats['total_comments'] = cursor.fetchone()['total']
    
    # Популярные манхвы
    cursor.execute("""
        SELECT id, title, views, rating 
        FROM manhwa 
        ORDER BY views DESC 
        LIMIT 5
    """)
    stats['top_manhwa'] = [dict(r) for r in cursor.fetchall()]
    
    # Последние обновления
    cursor.execute("""
        SELECT m.title, c.chapter_number, c.created_at
        FROM chapters c
        JOIN manhwa m ON c.manhwa_id = m.id
        ORDER BY c.created_at DESC
        LIMIT 10
    """)
    stats['recent_chapters'] = [dict(r) for r in cursor.fetchall()]
    
    cursor.close()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps(stats, default=str)
    }

def monitor_site_health(body: Dict, conn, headers: Dict) -> Dict[str, Any]:
    """Мониторинг здоровья сайта"""
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    health = {
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'checks': []
    }
    
    # Проверка подключения к БД
    try:
        cursor.execute("SELECT 1")
        health['checks'].append({
            'name': 'database',
            'status': 'ok',
            'message': 'Database connection successful'
        })
    except Exception as e:
        health['status'] = 'unhealthy'
        health['checks'].append({
            'name': 'database',
            'status': 'error',
            'message': str(e)
        })
    
    # Проверка манхвы без глав
    cursor.execute("""
        SELECT m.id, m.title 
        FROM manhwa m
        LEFT JOIN chapters c ON m.id = c.manhwa_id
        WHERE c.id IS NULL
    """)
    manhwa_no_chapters = cursor.fetchall()
    
    if manhwa_no_chapters:
        health['checks'].append({
            'name': 'content_check',
            'status': 'warning',
            'message': f'{len(manhwa_no_chapters)} manhwa without chapters',
            'details': [dict(m) for m in manhwa_no_chapters]
        })
    else:
        health['checks'].append({
            'name': 'content_check',
            'status': 'ok',
            'message': 'All manhwa have chapters'
        })
    
    # Проверка глав без страниц
    cursor.execute("""
        SELECT c.id, c.chapter_number, m.title
        FROM chapters c
        JOIN manhwa m ON c.manhwa_id = m.id
        LEFT JOIN pages p ON c.id = p.chapter_id
        WHERE p.id IS NULL
    """)
    chapters_no_pages = cursor.fetchall()
    
    if chapters_no_pages:
        health['checks'].append({
            'name': 'pages_check',
            'status': 'warning',
            'message': f'{len(chapters_no_pages)} chapters without pages',
            'details': [dict(c) for c in chapters_no_pages]
        })
    else:
        health['checks'].append({
            'name': 'pages_check',
            'status': 'ok',
            'message': 'All chapters have pages'
        })
    
    cursor.close()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps(health, default=str, ensure_ascii=False, indent=2)
    }

def parse_chapters_from_url(body: Dict, conn, headers: Dict) -> Dict[str, Any]:
    """Парсинг глав с внешнего источника (заглушка для расширения)"""
    return {
        'statusCode': 501,
        'headers': headers,
        'body': json.dumps({
            'message': 'Feature in development',
            'note': 'Используйте add_chapter для ручного добавления глав. Парсинг требует дополнительных библиотек (beautifulsoup4, requests)'
        })
    }

def sync_chapters_from_source(body: Dict, conn, headers: Dict) -> Dict[str, Any]:
    """Синхронизация глав с источником"""
    return {
        'statusCode': 501,
        'headers': headers,
        'body': json.dumps({
            'message': 'Feature in development',
            'note': 'Используйте add_chapter для добавления новых глав'
        })
    }
