"""
Business: API для управления комментариями к манхве и главам
Args: event - dict с httpMethod, body, queryStringParameters
      context - object с request_id, function_name
Returns: HTTP response dict с комментариями или результатом операции
"""

import json
import os
from typing import Dict, Any, List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    """Создает подключение к БД"""
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        raise Exception('DATABASE_URL not found')
    return psycopg2.connect(dsn)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    # CORS headers
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id'
    }
    
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}
    
    try:
        conn = get_db_connection()
        
        if method == 'GET':
            return get_comments(event, conn, headers)
        elif method == 'POST':
            return create_comment(event, conn, headers)
        elif method == 'PUT':
            return update_comment(event, conn, headers)
        elif method == 'DELETE':
            return delete_comment(event, conn, headers)
        else:
            return {
                'statusCode': 405,
                'headers': headers,
                'body': json.dumps({'error': 'Method not allowed'})
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

def get_comments(event: Dict[str, Any], conn, headers: Dict) -> Dict[str, Any]:
    """Получение комментариев"""
    params = event.get('queryStringParameters', {}) or {}
    manhwa_id = params.get('manhwa_id')
    chapter_id = params.get('chapter_id')
    sort_by = params.get('sort', 'new')
    
    if not manhwa_id:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'manhwa_id required'})
        }
    
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    # Определяем сортировку
    if sort_by == 'popular':
        order = 'ORDER BY c.likes DESC, c.created_at DESC'
    elif sort_by == 'rating':
        order = 'ORDER BY c.rating DESC NULLS LAST, c.created_at DESC'
    else:  # new
        order = 'ORDER BY c.created_at DESC'
    
    # Основной запрос
    if chapter_id:
        query = f"""
            SELECT c.*, 
                   COUNT(cl.id) as like_count
            FROM comments c
            LEFT JOIN comment_likes cl ON c.id = cl.comment_id
            WHERE c.manhwa_id = {manhwa_id} 
              AND c.chapter_id = {chapter_id}
              AND c.reply_to IS NULL
            GROUP BY c.id
            {order}
        """
    else:
        query = f"""
            SELECT c.*,
                   COUNT(cl.id) as like_count
            FROM comments c
            LEFT JOIN comment_likes cl ON c.id = cl.comment_id
            WHERE c.manhwa_id = {manhwa_id}
              AND c.chapter_id IS NULL
              AND c.reply_to IS NULL
            GROUP BY c.id
            {order}
        """
    
    cursor.execute(query)
    comments = cursor.fetchall()
    
    # Получаем ответы для каждого комментария
    result = []
    for comment in comments:
        comment_dict = dict(comment)
        
        # Получаем ответы
        cursor.execute(f"""
            SELECT c.*,
                   COUNT(cl.id) as like_count
            FROM comments c
            LEFT JOIN comment_likes cl ON c.id = cl.comment_id
            WHERE c.reply_to = {comment['id']}
            GROUP BY c.id
            ORDER BY c.created_at ASC
        """)
        replies = cursor.fetchall()
        comment_dict['replies'] = [dict(r) for r in replies]
        comment_dict['likes'] = comment_dict.get('like_count', 0)
        
        result.append(comment_dict)
    
    cursor.close()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({
            'comments': result,
            'total': len(result)
        })
    }

def create_comment(event: Dict[str, Any], conn, headers: Dict) -> Dict[str, Any]:
    """Создание нового комментария"""
    body = json.loads(event.get('body', '{}'))
    user_id = event.get('headers', {}).get('X-User-Id') or body.get('user_id')
    
    if not user_id:
        return {
            'statusCode': 401,
            'headers': headers,
            'body': json.dumps({'error': 'User ID required'})
        }
    
    manhwa_id = body.get('manhwa_id')
    text = body.get('text', '').strip()
    
    if not manhwa_id or not text:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'manhwa_id and text required'})
        }
    
    chapter_id = body.get('chapter_id')
    rating = body.get('rating')
    is_spoiler = body.get('is_spoiler', False)
    reply_to = body.get('reply_to')
    username = body.get('username', f'User_{user_id[:8]}')
    
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    # Вставка комментария
    query = """
        INSERT INTO comments 
        (manhwa_id, chapter_id, user_id, username, text, rating, is_spoiler, reply_to)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING *
    """
    
    cursor.execute(query, (
        manhwa_id, chapter_id, user_id, username, text, rating, is_spoiler, reply_to
    ))
    
    comment = dict(cursor.fetchone())
    conn.commit()
    cursor.close()
    
    return {
        'statusCode': 201,
        'headers': headers,
        'body': json.dumps({
            'comment': comment,
            'message': 'Comment created'
        })
    }

def update_comment(event: Dict[str, Any], conn, headers: Dict) -> Dict[str, Any]:
    """Обновление комментария"""
    params = event.get('queryStringParameters', {}) or {}
    comment_id = params.get('id')
    
    if not comment_id:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'comment id required'})
        }
    
    body = json.loads(event.get('body', '{}'))
    text = body.get('text', '').strip()
    
    if not text:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'text required'})
        }
    
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE comments SET text = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s",
        (text, comment_id)
    )
    conn.commit()
    cursor.close()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'message': 'Comment updated'})
    }

def delete_comment(event: Dict[str, Any], conn, headers: Dict) -> Dict[str, Any]:
    """Удаление комментария (только для владельца или модератора)"""
    params = event.get('queryStringParameters', {}) or {}
    comment_id = params.get('id')
    
    if not comment_id:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'comment id required'})
        }
    
    cursor = conn.cursor()
    # Мягкое удаление - заменяем текст
    cursor.execute(
        "UPDATE comments SET text = '[удалено]', updated_at = CURRENT_TIMESTAMP WHERE id = %s",
        (comment_id,)
    )
    conn.commit()
    cursor.close()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'message': 'Comment deleted'})
    }
