from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from users.permisos import es_admin
import mimetypes
from django.http import FileResponse, JsonResponse
import os
from django.conf import settings

class BasePermissionAPIView(APIView):
    """
        Clase abstracta que maneja la verificación de los permisos de usuarios
        Es utilizada para no escribir permisos específicos en cada clase de usuario

        Herencia:
        - APIView (Heréda de la clase APIView básica)
    """
    # permisos para la creación de nuevos usuarios (POST)
    permission_classes_create = None
    # permisos para eliminar usuarios (DELETE)
    permission_classes_delete = None
    # permisos para listar o ver detalles de usuarios (GET)
    permission_classes_list = None
    # permisos para edición de usuarios (PUT)
    permission_classes_update = None

    def check_permissions(self, request):
        # definimos los permisos del metodo obteniendolos de los atributos, si no estan definidos los seteamos a None
        method_permissions = {
            'DELETE': getattr(self, 'permission_classes_delete', None),
            'GET': getattr(self, 'permission_classes_list', None),
            'POST': getattr(self, 'permission_classes_create', None),
            'PUT': getattr(self, 'permission_classes_update', None),
        }
        # si el metodo no esta definido se utilizaran los permissos globales de la clase
        permissions = method_permissions.get(request.method, None) or self.permission_classes
        for permission in permissions:
            if not permission().has_permission(request, self):
                self.permission_denied(request, message=getattr(permission, 'message', None))


def serve_file(file_url):
    """
    Lógica para servir un archivo de forma segura.
    """
    # Asegúrate de que la ruta base está bien configurada
    prefix = os.path.join(settings.MEDIA_ROOT)  # Cambia 'media/' a MEDIA_ROOT si es necesario
    file_path = os.path.join(prefix, file_url)

    # Verifica si el archivo existe
    if not os.path.isfile(file_path):
        raise Http404("Archivo no encontrado.")

    # Determina el tipo MIME del archivo
    mime_type, _ = mimetypes.guess_type(file_path)
    mime_type = mime_type or "application/octet-stream"

    try:
        with open(file_path, 'rb') as file:
            response = FileResponse(file, content_type=mime_type)
            filename = os.path.basename(file_url)
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            response['X-Sendfile'] = 'o'  # Esta línea puede ayudar en algunos servidores (Apache, Nginx, etc.)
            return response
    except Exception as e:
        raise Http404(f"Error al servir el archivo: {str(e)}")