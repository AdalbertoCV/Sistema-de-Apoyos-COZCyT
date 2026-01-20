from rest_framework import permissions
from .models import Solicitante

# Funcionalidad para verificar que el usuario que realiza la eliminación sea un admin
class es_admin(permissions.BasePermission):
    message = 'El usuario no tiene los permisos para esta acción.'
    # método para determinar que un usuario tiene permisos
    def has_permission( self, request, view):
        return request.user and request.user.is_superuser

# Clase para verificar que el usuario que va a ingresar tenga sus datos completos
class primer_login(permissions.BasePermission):
    message = 'El usuario requiere completar su información.'
    # método para determinar si se requiere o no un primer login
    def has_permission(self, request, view):
        # obtenemos al usuario de la request
        usuario = request.user
        # verificamos que el usuario no sea un administrador
        if not usuario.is_staff:
            # tratamos de extraer su objeto de solicitante
            try: 
                solicitante = Solicitante.objects.get(id=usuario.id)
            # si no se encontró
            except Solicitante.DoesNotExist:
                # No se da acceso a la plataforma, por tanto se requiere el primer login
                return False
            # en caso de que se encuentre al solicitante, si tiene sus datos completos, tendrá acceso
            # si no los tiene completos, se requiere primer login
            return solicitante.datos_completos
        else:
            # Si es admin, tiene acceso
            return True



