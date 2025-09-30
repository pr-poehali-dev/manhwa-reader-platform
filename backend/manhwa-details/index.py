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
    Business: API для получения детальной информации о манхве и её главах
    Args: event - dict с httpMethod, queryStringParameters (manhwa_id, chapter_id)
          context - объект с request_id
    Returns: HTTP response с данными манхвы и глав
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    params = event.get('queryStringParameters') or {}
    manhwa_id = params.get('manhwa_id')
    chapter_id = params.get('chapter_id')
    
    if not manhwa_id:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'manhwa_id is required'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute('''
            SELECT m.id, m.title, m.description, m.cover_url, m.rating, 
                   m.status, m.views,
                   ARRAY_AGG(DISTINCT mg.genre) FILTER (WHERE mg.genre IS NOT NULL) as genres
            FROM t_p15993318_manhwa_reader_platfo.manhwa m
            LEFT JOIN t_p15993318_manhwa_reader_platfo.manhwa_genres mg ON m.id = mg.manhwa_id
            WHERE m.id = {}
            GROUP BY m.id
        '''.format(int(manhwa_id)))
        
        manhwa = cur.fetchone()
        
        if not manhwa:
            return {
                'statusCode': 404,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Manhwa not found'}),
                'isBase64Encoded': False
            }
        
        cur.execute('''
            SELECT c.id, c.chapter_number, c.title, c.created_at
            FROM t_p15993318_manhwa_reader_platfo.chapters c
            WHERE c.manhwa_id = {}
            ORDER BY c.chapter_number
        '''.format(int(manhwa_id)))
        
        chapters = cur.fetchall()
        
        result = {
            'id': manhwa['id'],
            'title': manhwa['title'],
            'description': manhwa['description'],
            'cover': manhwa['cover_url'],
            'rating': float(manhwa['rating']) if manhwa['rating'] else 0,
            'status': manhwa['status'],
            'views': manhwa['views'],
            'genre': manhwa['genres'] if manhwa['genres'] else [],
            'chapters': [
                {
                    'id': ch['id'],
                    'number': ch['chapter_number'],
                    'title': ch['title']
                } for ch in chapters
            ]
        }
        
        if chapter_id:
            cur.execute('''
                SELECT p.id, p.page_number, p.image_url
                FROM t_p15993318_manhwa_reader_platfo.pages p
                WHERE p.chapter_id = {}
                ORDER BY p.page_number
            '''.format(int(chapter_id)))
            
            pages = cur.fetchall()
            result['pages'] = [
                {
                    'id': p['id'],
                    'number': p['page_number'],
                    'url': p['image_url']
                } for p in pages
            ]
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()