"""
WSGI config for cosiap_api project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

from channels.auth import AuthMiddlewareStack
from django.urls import re_path
from .consumers import NotificacionConsumer

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cosiap_api.settings')

django_asgi_app = get_asgi_application()

websocket_urlpatterns = [
    re_path(r'ws/notificaciones/$', NotificacionConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})
