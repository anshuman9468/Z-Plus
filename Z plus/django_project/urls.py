from django.urls import path, include, re_path
from django.views.static import serve
from django.conf import settings
from django.http import FileResponse, HttpResponse
from pathlib import Path
import os

def serve_react_app(request, path=''):
    """Serve React app index.html for all non-API routes"""
    react_index = settings.REACT_APP_INDEX
    if react_index and react_index.exists():
        try:
            return FileResponse(open(react_index, 'rb'), content_type='text/html')
        except Exception as e:
            return HttpResponse(f'Error serving React app: {str(e)}', status=500)
    else:
        return HttpResponse(
            '<h1>React app not built</h1>'
            '<p>Please build the React app first:</p>'
            '<pre>cd "Z+ Website UI Design (1)" && npm run build</pre>'
            '<p>Or run the start script: <code>./start.sh</code> (Linux/Mac) or <code>start.bat</code> (Windows)</p>',
            status=503
        )

# Determine assets directory
assets_dir = settings.REACT_APP_DIR / 'assets'
if not assets_dir.exists():
    assets_dir = settings.REACT_APP_DIR

urlpatterns = [
    path('api/', include('ml_app.urls')),
    # Serve static files from React build
    re_path(r'^assets/(?P<path>.*)$', serve, {'document_root': assets_dir}),
    # Serve media files
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    # Serve React app for all other routes (SPA routing)
    re_path(r'^(?!api|assets|media|static).*$', serve_react_app),
]
