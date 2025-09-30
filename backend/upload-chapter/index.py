import json
import os
import base64
import zipfile
import io
from typing import Dict, Any
from PIL import Image
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def stitch_images(image_files):
    images = []
    for img_data in image_files:
        img = Image.open(io.BytesIO(img_data))
        if img.mode != 'RGB':
            img = img.convert('RGB')
        images.append(img)
    
    if not images:
        raise ValueError('No images found in archive')
    
    max_width = max(img.width for img in images)
    total_height = sum(img.height for img in images)
    
    stitched = Image.new('RGB', (max_width, total_height))
    
    y_offset = 0
    for img in images:
        x_offset = (max_width - img.width) // 2
        stitched.paste(img, (x_offset, y_offset))
        y_offset += img.height
    
    output = io.BytesIO()
    stitched.save(output, format='JPEG', quality=85, optimize=True)
    output.seek(0)
    
    return base64.b64encode(output.getvalue()).decode('utf-8')

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Загрузка главы из архива с автоматической склейкой страниц
    Args: event - dict с httpMethod, body с multipart/form-data
          context - объект с request_id
    Returns: HTTP response с результатом загрузки
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
    
    try:
        body = event.get('body', '')
        is_base64 = event.get('isBase64Encoded', False)
        
        if is_base64:
            body = base64.b64decode(body)
        
        content_type = event.get('headers', {}).get('content-type', '')
        
        boundary = None
        for part in content_type.split(';'):
            if 'boundary=' in part:
                boundary = part.split('boundary=')[1].strip()
                break
        
        if not boundary:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid multipart request'}),
                'isBase64Encoded': False
            }
        
        parts = body.split(f'--{boundary}'.encode())
        
        form_data = {}
        archive_data = None
        
        for part in parts:
            if b'Content-Disposition' not in part:
                continue
            
            headers_body = part.split(b'\r\n\r\n', 1)
            if len(headers_body) < 2:
                continue
            
            headers, content = headers_body
            content = content.rstrip(b'\r\n')
            
            headers_str = headers.decode('utf-8', errors='ignore')
            
            if 'name="manhwa_id"' in headers_str:
                form_data['manhwa_id'] = content.decode('utf-8').strip()
            elif 'name="chapter_number"' in headers_str:
                form_data['chapter_number'] = content.decode('utf-8').strip()
            elif 'name="title"' in headers_str:
                form_data['title'] = content.decode('utf-8').strip()
            elif 'name="archive"' in headers_str:
                archive_data = content
        
        if not archive_data or not form_data.get('manhwa_id') or not form_data.get('chapter_number'):
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing required fields'}),
                'isBase64Encoded': False
            }
        
        archive_file = io.BytesIO(archive_data)
        image_files = []
        
        with zipfile.ZipFile(archive_file, 'r') as zip_ref:
            for filename in sorted(zip_ref.namelist()):
                if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                    image_files.append(zip_ref.read(filename))
        
        if not image_files:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'No images found in archive'}),
                'isBase64Encoded': False
            }
        
        stitched_image_base64 = stitch_images(image_files)
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        try:
            cur.execute('''
                INSERT INTO t_p15993318_manhwa_reader_platfo.chapters (manhwa_id, chapter_number, title)
                VALUES ({}, {}, '{}')
                RETURNING id
            '''.format(
                int(form_data['manhwa_id']),
                int(form_data['chapter_number']),
                form_data.get('title', '').replace("'", "''")
            ))
            
            chapter_id = cur.fetchone()['id']
            
            cur.execute('''
                INSERT INTO t_p15993318_manhwa_reader_platfo.pages (chapter_id, page_number, image_url)
                VALUES ({}, 1, 'data:image/jpeg;base64,{}')
            '''.format(chapter_id, stitched_image_base64))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': True,
                    'chapter_id': chapter_id,
                    'images_processed': len(image_files)
                }),
                'isBase64Encoded': False
            }
        
        finally:
            cur.close()
            conn.close()
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
