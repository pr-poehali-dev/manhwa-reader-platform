import json
import os
import re
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def create_slug(text: str) -> str:
    slug = text.lower()
    slug = re.sub(r'[^a-z0-9а-яё]+', '-', slug)
    slug = slug.strip('-')
    return slug

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для управления командами и загрузки пользовательских манхв
    Args: event - dict с httpMethod, body, queryStringParameters
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response dict с информацией о командах и загрузках
    '''
    method: str = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    resource = params.get('resource', 'uploads')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Database configuration missing'})
        }
    
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if resource == 'teams':
            return handle_teams(method, event, cursor, conn)
        else:
            return handle_uploads(method, event, cursor, conn)
    
    finally:
        cursor.close()
        conn.close()

def handle_teams(method: str, event: Dict[str, Any], cursor, conn) -> Dict[str, Any]:
    params = event.get('queryStringParameters') or {}
    
    if method == 'GET':
        team_id = params.get('team_id')
        
        if team_id:
            cursor.execute('''
                SELECT t.*, 
                       COUNT(DISTINCT tm.user_id) as member_count,
                       COUNT(DISTINCT uu.id) as manhwa_count
                FROM teams t
                LEFT JOIN team_members tm ON t.id = tm.team_id
                LEFT JOIN user_uploads uu ON t.id = uu.team_id
                WHERE t.id = %s
                GROUP BY t.id
            ''', (team_id,))
            team = cursor.fetchone()
            
            if not team:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Team not found'})
                }
            
            cursor.execute('''
                SELECT user_id, role, joined_at
                FROM team_members
                WHERE team_id = %s
                ORDER BY joined_at
            ''', (team_id,))
            members = cursor.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({
                    'team': dict(team),
                    'members': [dict(m) for m in members]
                }, default=str)
            }
        else:
            cursor.execute('''
                SELECT t.*, 
                       COUNT(DISTINCT tm.user_id) as member_count,
                       COUNT(DISTINCT uu.id) as manhwa_count
                FROM teams t
                LEFT JOIN team_members tm ON t.id = tm.team_id
                LEFT JOIN user_uploads uu ON t.id = uu.team_id
                GROUP BY t.id
                ORDER BY t.created_at DESC
            ''')
            teams = cursor.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'teams': [dict(t) for t in teams]}, default=str)
            }
    
    elif method == 'POST':
        user_id = event.get('headers', {}).get('X-User-Id') or event.get('headers', {}).get('x-user-id')
        if not user_id:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'User ID required'})
            }
        
        body = json.loads(event.get('body', '{}'))
        name = body.get('name', '').strip()
        description = body.get('description', '').strip()
        logo_url = body.get('logo_url', '').strip()
        website_url = body.get('website_url', '').strip()
        discord_url = body.get('discord_url', '').strip()
        
        if not name:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Team name is required'})
            }
        
        slug = create_slug(name)
        
        cursor.execute('''
            INSERT INTO teams (name, slug, description, logo_url, website_url, discord_url, created_by)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id, name, slug, description, logo_url, website_url, discord_url, created_at
        ''', (name, slug, description, logo_url, website_url, discord_url, user_id))
        
        team = cursor.fetchone()
        team_id = team['id']
        
        cursor.execute('''
            INSERT INTO team_members (team_id, user_id, role)
            VALUES (%s, %s, %s)
        ''', (team_id, user_id, 'owner'))
        
        conn.commit()
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'team': dict(team)}, default=str)
        }
    
    elif method == 'PUT':
        user_id = event.get('headers', {}).get('X-User-Id') or event.get('headers', {}).get('x-user-id')
        if not user_id:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'User ID required'})
            }
        
        body = json.loads(event.get('body', '{}'))
        team_id = body.get('team_id')
        
        if not team_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Team ID required'})
            }
        
        cursor.execute('''
            SELECT role FROM team_members
            WHERE team_id = %s AND user_id = %s
        ''', (team_id, user_id))
        
        member = cursor.fetchone()
        if not member or member['role'] not in ['owner', 'admin']:
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Only team owner or admin can update team'})
            }
        
        updates = []
        values = []
        
        if 'name' in body:
            updates.append('name = %s')
            values.append(body['name'])
        if 'description' in body:
            updates.append('description = %s')
            values.append(body['description'])
        if 'logo_url' in body:
            updates.append('logo_url = %s')
            values.append(body['logo_url'])
        if 'website_url' in body:
            updates.append('website_url = %s')
            values.append(body['website_url'])
        if 'discord_url' in body:
            updates.append('discord_url = %s')
            values.append(body['discord_url'])
        
        if not updates:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'No fields to update'})
            }
        
        values.append(team_id)
        query = f"UPDATE teams SET {', '.join(updates)} WHERE id = %s RETURNING *"
        cursor.execute(query, values)
        
        team = cursor.fetchone()
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'team': dict(team)}, default=str)
        }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({'error': 'Method not allowed'})
    }

def handle_uploads(method: str, event: Dict[str, Any], cursor, conn) -> Dict[str, Any]:
    params = event.get('queryStringParameters') or {}
    
    if method == 'GET':
        upload_id = params.get('upload_id')
        user_id = params.get('user_id')
        status = params.get('status', 'all')
        
        if upload_id:
            cursor.execute('''
                SELECT uu.*, t.name as team_name, t.slug as team_slug
                FROM user_uploads uu
                LEFT JOIN teams t ON uu.team_id = t.id
                WHERE uu.id = %s
            ''', (upload_id,))
            upload = cursor.fetchone()
            
            if not upload:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Upload not found'})
                }
            
            cursor.execute('''
                SELECT g.name
                FROM user_upload_genres uug
                JOIN genres g ON uug.genre_id = g.id
                WHERE uug.upload_id = %s
            ''', (upload_id,))
            genres = [row['name'] for row in cursor.fetchall()]
            
            result = dict(upload)
            result['genres'] = genres
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'upload': result}, default=str)
            }
        
        query = '''
            SELECT uu.*, t.name as team_name, t.slug as team_slug
            FROM user_uploads uu
            LEFT JOIN teams t ON uu.team_id = t.id
            WHERE 1=1
        '''
        query_params = []
        
        if user_id:
            query += ' AND uu.uploaded_by = %s'
            query_params.append(user_id)
        
        if status != 'all':
            query += ' AND uu.moderation_status = %s'
            query_params.append(status)
        
        query += ' ORDER BY uu.created_at DESC'
        
        cursor.execute(query, query_params)
        uploads = cursor.fetchall()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'uploads': [dict(u) for u in uploads]}, default=str)
        }
    
    elif method == 'POST':
        user_id = event.get('headers', {}).get('X-User-Id') or event.get('headers', {}).get('x-user-id')
        if not user_id:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'User ID required'})
            }
        
        body = json.loads(event.get('body', '{}'))
        
        title = body.get('title', '').strip()
        cover_url = body.get('cover_url', '').strip()
        
        if not title or not cover_url:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Title and cover_url are required'})
            }
        
        slug = create_slug(title)
        
        cursor.execute('''
            INSERT INTO user_uploads (
                title, alternative_titles, slug, description, cover_url,
                author, artist, status, release_year, uploaded_by, team_id
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
        ''', (
            title,
            body.get('alternative_titles', ''),
            slug,
            body.get('description', ''),
            cover_url,
            body.get('author', ''),
            body.get('artist', ''),
            body.get('status', 'ongoing'),
            body.get('release_year'),
            user_id,
            body.get('team_id')
        ))
        
        upload = cursor.fetchone()
        upload_id = upload['id']
        
        genre_ids = body.get('genre_ids', [])
        if genre_ids:
            for genre_id in genre_ids:
                cursor.execute('''
                    INSERT INTO user_upload_genres (upload_id, genre_id)
                    VALUES (%s, %s)
                    ON CONFLICT DO NOTHING
                ''', (upload_id, genre_id))
        
        conn.commit()
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'upload': dict(upload)}, default=str)
        }
    
    elif method == 'PUT':
        user_id = event.get('headers', {}).get('X-User-Id') or event.get('headers', {}).get('x-user-id')
        if not user_id:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'User ID required'})
            }
        
        body = json.loads(event.get('body', '{}'))
        upload_id = body.get('upload_id')
        action = body.get('action', 'update')
        
        if not upload_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Upload ID required'})
            }
        
        cursor.execute('''
            SELECT uploaded_by FROM user_uploads WHERE id = %s
        ''', (upload_id,))
        
        upload = cursor.fetchone()
        if not upload:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Upload not found'})
            }
        
        if action == 'moderate':
            moderation_status = body.get('moderation_status')
            moderation_notes = body.get('moderation_notes', '')
            
            if moderation_status not in ['approved', 'rejected', 'pending']:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Invalid moderation status'})
                }
            
            is_approved = moderation_status == 'approved'
            
            cursor.execute('''
                UPDATE user_uploads 
                SET moderation_status = %s, 
                    is_approved = %s,
                    moderation_notes = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING *
            ''', (moderation_status, is_approved, moderation_notes, upload_id))
            
            updated_upload = cursor.fetchone()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'upload': dict(updated_upload)}, default=str)
            }
        
        if upload['uploaded_by'] != user_id:
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Only uploader can update'})
            }
        
        updates = []
        values = []
        
        for field in ['title', 'alternative_titles', 'description', 'cover_url', 'author', 'artist', 'status', 'release_year']:
            if field in body:
                updates.append(f'{field} = %s')
                values.append(body[field])
        
        if not updates:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'No fields to update'})
            }
        
        updates.append('updated_at = CURRENT_TIMESTAMP')
        values.append(upload_id)
        
        query = f"UPDATE user_uploads SET {', '.join(updates)} WHERE id = %s RETURNING *"
        cursor.execute(query, values)
        
        updated_upload = cursor.fetchone()
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'upload': dict(updated_upload)}, default=str)
        }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({'error': 'Method not allowed'})
    }