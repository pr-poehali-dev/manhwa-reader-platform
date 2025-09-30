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
    Business: API для управления манхвами - получение списка, поиск, детали
    Args: event - dict с httpMethod, queryStringParameters
          context - объект с request_id
    Returns: HTTP response с данными манхв
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
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            search = params.get('search', '')
            sort_by = params.get('sort', 'views')
            
            query = '''
                SELECT m.id, m.title, m.description, m.cover_url, m.rating, 
                       m.status, m.views, m.created_at,
                       COALESCE(COUNT(DISTINCT c.id), 0) as chapters_count,
                       ARRAY_AGG(DISTINCT mg.genre) FILTER (WHERE mg.genre IS NOT NULL) as genres
                FROM t_p15993318_manhwa_reader_platfo.manhwa m
                LEFT JOIN t_p15993318_manhwa_reader_platfo.chapters c ON m.id = c.manhwa_id
                LEFT JOIN t_p15993318_manhwa_reader_platfo.manhwa_genres mg ON m.id = mg.manhwa_id
            '''
            
            if search:
                query += " WHERE LOWER(m.title) LIKE LOWER('%{}%')".format(search.replace("'", "''"))
            
            query += ' GROUP BY m.id'
            
            if sort_by == 'rating':
                query += ' ORDER BY m.rating DESC'
            elif sort_by == 'new':
                query += ' ORDER BY m.created_at DESC'
            else:
                query += ' ORDER BY m.views DESC'
            
            query += ' LIMIT 50'
            
            cur.execute(query)
            manhwa_list = cur.fetchall()
            
            result = []
            for manhwa in manhwa_list:
                result.append({
                    'id': manhwa['id'],
                    'title': manhwa['title'],
                    'description': manhwa['description'],
                    'cover': manhwa['cover_url'],
                    'rating': float(manhwa['rating']) if manhwa['rating'] else 0,
                    'status': manhwa['status'],
                    'views': manhwa['views'],
                    'chapters': manhwa['chapters_count'],
                    'genre': manhwa['genres'] if manhwa['genres'] else []
                })
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'manhwa': result}),
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