import os
from pathlib import Path
from dotenv import load_dotenv
import dj_database_url
from datetime import timedelta

load_dotenv()
BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-local-dev-key-change-in-production')
DEBUG = os.environ.get('DEBUG','False')=='True'
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS','localhost,127.0.0.1,.railway.app,.up.railway.app').split(',')
AUTH_USER_MODEL = 'core.User'
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_q',
    'core',
    'donations'
]
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware'
]
ROOT_URLCONF = 'config.urls'
TEMPLATES = [{
    'BACKEND': 'django.template.backends.django.DjangoTemplates',
    'DIRS': [],
    'APP_DIRS': True,
    'OPTIONS': {
        'context_processors': [
            'django.template.context_processors.debug',
            'django.template.context_processors.request',
            'django.contrib.auth.context_processors.auth',
            'django.contrib.messages.context_processors.messages',
        ],
    },
}]
WSGI_APPLICATION = 'config.wsgi.application'
DATABASES = {
    'default': dj_database_url.config(default=f'sqlite:///{BASE_DIR}/db.sqlite3', conn_max_age=600)
}
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': ('rest_framework_simplejwt.authentication.JWTAuthentication',),
    'DEFAULT_PERMISSION_CLASSES': ('rest_framework.permissions.IsAuthenticated',)
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True
}

CORS_ALLOWED_ORIGINS = [o.strip() for o in os.environ.get('CORS_ALLOWED_ORIGINS','http://localhost:5173,http://localhost:3000').split(',') if o.strip()]
CORS_ALLOWED_ORIGIN_REGEXES = [r"^https://.*\.vercel\.app$"]
CORS_ALLOW_CREDENTIALS = True

EMAIL_BACKEND_TYPE = os.environ.get('EMAIL_BACKEND_TYPE','gmail')
if EMAIL_BACKEND_TYPE=='sendgrid':
    EMAIL_BACKEND='sendgrid_backend.SendgridBackend'
    SENDGRID_API_KEY=os.environ.get('SENDGRID_API_KEY')
else:
    EMAIL_BACKEND='django.core.mail.backends.smtp.EmailBackend'
    EMAIL_HOST=os.environ.get('EMAIL_HOST','smtp.gmail.com')
    EMAIL_PORT=587
    EMAIL_USE_TLS=True
    EMAIL_HOST_USER=os.environ.get('EMAIL_HOST_USER')
    EMAIL_HOST_PASSWORD=os.environ.get('EMAIL_HOST_PASSWORD')
    
DEFAULT_FROM_EMAIL=os.environ.get('DEFAULT_FROM_EMAIL', os.environ.get('EMAIL_HOST_USER', 'noreply@foodbridge.app'))

STATIC_URL='/static/'
STATIC_ROOT=BASE_DIR/'staticfiles'
STATICFILES_STORAGE='whitenoise.storage.CompressedManifestStaticFilesStorage'
MEDIA_URL='/media/'
MEDIA_ROOT=BASE_DIR/'media'

Q_CLUSTER={'name':'foodbridge','workers':2,'timeout':90,'retry':120,'orm':'default'}
FRONTEND_URL=os.environ.get('FRONTEND_URL','http://localhost:5173')
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
