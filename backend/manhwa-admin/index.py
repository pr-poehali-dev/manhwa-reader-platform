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
    Business: API для добавления и управления манхвами, главами и страницами
    Args: event - dict с httpMethod, body для POST запросов
          context - объект с request_id
    Returns: HTTP response с результатом операции
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    action = body_data.get('action')
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        if action == 'add_manhwa':
            title = body_data.get('title')
            description = body_data.get('description', '')
            cover_url = body_data.get('cover_url', '')
            genres = body_data.get('genres', [])
            
            if not title:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'title is required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute('''
                INSERT INTO t_p15993318_manhwa_reader_platfo.manhwa (title, description, cover_url)
                VALUES ('{}', '{}', '{}')
                RETURNING id
            '''.format(
                title.replace("'", "''"),
                description.replace("'", "''"),
                cover_url.replace("'", "''")
            ))
            
            manhwa_id = cur.fetchone()['id']
            
            for genre in genres:
                cur.execute('''
                    INSERT INTO t_p15993318_manhwa_reader_platfo.manhwa_genres (manhwa_id, genre)
                    VALUES ({}, '{}')
                '''.format(manhwa_id, genre.replace("'", "''")))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True, 'manhwa_id': manhwa_id}),
                'isBase64Encoded': False
            }
        
        elif action == 'add_chapter':
            manhwa_id = body_data.get('manhwa_id')
            chapter_number = body_data.get('chapter_number')
            title = body_data.get('title', '')
            pages = body_data.get('pages', [])
            
            if not manhwa_id or not chapter_number:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'manhwa_id and chapter_number are required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute('''
                INSERT INTO t_p15993318_manhwa_reader_platfo.chapters (manhwa_id, chapter_number, title)
                VALUES ({}, {}, '{}')
                RETURNING id
            '''.format(int(manhwa_id), int(chapter_number), title.replace("'", "''")))
            
            chapter_id = cur.fetchone()['id']
            
            for idx, page_url in enumerate(pages, 1):
                cur.execute('''
                    INSERT INTO t_p15993318_manhwa_reader_platfo.pages (chapter_id, page_number, image_url)
                    VALUES ({}, {}, '{}')
                '''.format(chapter_id, idx, page_url.replace("'", "''")))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True, 'chapter_id': chapter_id}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid action'}),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()