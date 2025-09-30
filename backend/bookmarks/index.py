import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для работы с закладками пользователей
    Args: event - dict с httpMethod, queryStringParameters, body
          context - объект с request_id
    Returns: HTTP response с данными закладок
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = event.get('headers', {})
    user_id = headers.get('x-user-id') or headers.get('X-User-Id')
    
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'User ID required in X-User-Id header'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            cur.execute('''
                SELECT b.id, b.manhwa_id, b.chapter_id, b.created_at,
                       m.title, m.cover_url, m.rating,
                       c.chapter_number, c.title as chapter_title
                FROM t_p15993318_manhwa_reader_platfo.bookmarks b
                JOIN t_p15993318_manhwa_reader_platfo.manhwa m ON b.manhwa_id = m.id
                LEFT JOIN t_p15993318_manhwa_reader_platfo.chapters c ON b.chapter_id = c.id
                WHERE b.user_id = '{}'
                ORDER BY b.created_at DESC
            '''.format(user_id.replace("'", "''")))
            
            bookmarks = cur.fetchall()
            
            result = []
            for bookmark in bookmarks:
                result.append({
                    'id': bookmark['id'],
                    'manhwa_id': bookmark['manhwa_id'],
                    'manhwa_title': bookmark['title'],
                    'cover': bookmark['cover_url'],
                    'rating': float(bookmark['rating']) if bookmark['rating'] else 0,
                    'chapter_id': bookmark['chapter_id'],
                    'chapter_number': bookmark['chapter_number'],
                    'chapter_title': bookmark['chapter_title'],
                    'created_at': bookmark['created_at'].isoformat() if bookmark['created_at'] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'bookmarks': result}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            manhwa_id = body_data.get('manhwa_id')
            chapter_id = body_data.get('chapter_id')
            
            if not manhwa_id:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'manhwa_id is required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute('''
                INSERT INTO t_p15993318_manhwa_reader_platfo.bookmarks (user_id, manhwa_id, chapter_id)
                VALUES ('{}', {}, {})
                ON CONFLICT (user_id, manhwa_id) 
                DO UPDATE SET chapter_id = EXCLUDED.chapter_id
                RETURNING id
            '''.format(
                user_id.replace("'", "''"),
                int(manhwa_id),
                int(chapter_id) if chapter_id else 'NULL'
            ))
            
            bookmark_id = cur.fetchone()['id']
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True, 'bookmark_id': bookmark_id}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters') or {}
            manhwa_id = params.get('manhwa_id')
            
            if not manhwa_id:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'manhwa_id is required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute('''
                DELETE FROM t_p15993318_manhwa_reader_platfo.bookmarks
                WHERE user_id = '{}' AND manhwa_id = {}
            '''.format(user_id.replace("'", "''"), int(manhwa_id)))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()
