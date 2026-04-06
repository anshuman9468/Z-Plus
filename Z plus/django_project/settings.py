from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'dev-key'
DEBUG = True
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.staticfiles',
    'corsheaders',
    'ml_app'
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
]

ROOT_URLCONF = 'django_project.urls'

TEMPLATES = []

WSGI_APPLICATION = 'django_project.wsgi.application'

MEDIA_ROOT = BASE_DIR / 'media'
MEDIA_URL = '/media/'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3'
    }
}

# ---------- ADD THESE -------------
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# React app build directory (will be set after building frontend)
REACT_APP_DIR = BASE_DIR.parent / 'Z+ Website UI Design (1)' / 'build'

# Static files directories
STATICFILES_DIRS = []
if (REACT_APP_DIR / 'assets').exists():
    STATICFILES_DIRS.append(REACT_APP_DIR / 'assets')
elif REACT_APP_DIR.exists():
    STATICFILES_DIRS.append(REACT_APP_DIR)

# For serving React app
REACT_APP_INDEX = None
if (REACT_APP_DIR / 'index.html').exists():
    REACT_APP_INDEX = REACT_APP_DIR / 'index.html'
# ----------------------------------

# CORS Settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = True  # For development only


