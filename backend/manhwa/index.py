'''
Business: API для работы с манхвами - получение списка, фильтрация, поиск
Args: event - dict с httpMethod, queryStringParameters
      context - объект с атрибутами request_id, function_name
Returns: HTTP response с JSON данными манхв
'''

import json
import os
import psycopg2
from typing import Dict, Any, List, Optional

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
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
    
    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        resource = params.get('resource', '')
        search = params.get('search', '')
        sort_by = params.get('sort', 'rating')
        limit = int(params.get('limit', '50'))
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        if resource == 'genres':
            cur.execute('SELECT id, name FROM genres ORDER BY name')
            rows = cur.fetchall()
            genres = [{'id': row[0], 'name': row[1]} for row in rows]
            cur.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'genres': genres}, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        query = '''
            SELECT 
                m.id, m.title, m.cover_url, m.description, 
                m.rating, m.status, m.views,
                COALESCE(
                    json_agg(
                        DISTINCT g.name
                    ) FILTER (WHERE g.name IS NOT NULL), 
                    '[]'
                ) as genres,
                COUNT(DISTINCT c.id) as chapters_count
            FROM manhwa m
            LEFT JOIN manhwa_genres mg ON m.id = mg.manhwa_id
            LEFT JOIN genres g ON mg.genre_id = g.id
            LEFT JOIN chapters c ON m.id = c.manhwa_id
        '''
        
        where_clause = ''
        if search:
            where_clause = f" WHERE LOWER(m.title) LIKE LOWER('%{search}%')"
        
        query += where_clause
        query += ' GROUP BY m.id, m.title, m.cover_url, m.description, m.rating, m.status, m.views'
        
        if sort_by == 'rating':
            query += ' ORDER BY m.rating DESC'
        elif sort_by == 'views':
            query += ' ORDER BY m.views DESC'
        elif sort_by == 'new':
            query += ' ORDER BY m.created_at DESC'
        
        query += f' LIMIT {limit}'
        
        cur.execute(query)
        rows = cur.fetchall()
        
        manhwa_list: List[Dict[str, Any]] = []
        for row in rows:
            manhwa_list.append({
                'id': row[0],
                'title': row[1],
                'cover': row[2],
                'description': row[3],
                'rating': float(row[4]) if row[4] else 0.0,
                'status': row[5],
                'views': row[6],
                'genre': row[7],
                'chapters': row[8]
            })
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(manhwa_list, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }