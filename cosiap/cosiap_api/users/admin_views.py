# Archivo con la funcionalidad necesaria para la gestión de administradores en la API
# Autores: Adalberto Cerrillo Vázquez, Rafael Uribe Caldera
# Versión: 1.0
from rest_framework.views import APIView
from .serializers import AdminSerializer 
from .permisos import es_admin
from .models import Usuario, Solicitante
from .views import enviar_correo_verificacion
from rest_framework import status
from rest_framework.response import Response
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from .tokens import account_activation_token
from django.utils.encoding import force_bytes
from common.views import BasePermissionAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from notificaciones.mensajes import Mensaje


class AdminAPIView(BasePermissionAPIView):
    ''' 
    Clase de APIView para el manejo de los usuarios administradores
    '''
    permission_classes_list = [IsAuthenticated, es_admin]
    permission_classes_create = [IsAuthenticated, es_admin]
    permission_classes_update = [IsAuthenticated, es_admin]

    
    def get(self, request, *args, **kwargs):
        ''' 
        Método get para obtener la lista de los administradores del sistema
        '''
        queryset = Usuario.objects.filter(is_staff=True)
        serializer = AdminSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        ''' 
        Método post para la creación de un nuevo usuario administrador.
        '''

        response_data = {}
        email = request.data.get("email")
        try:
            email_exist = Usuario.objects.get(email=email)
        except Usuario.DoesNotExist:
            email_exist = None
        if email_exist is None:
            serializer = AdminSerializer(data=request.data)
            if serializer.is_valid():
                usuario_nuevo = serializer.save(is_active = False)
                usuario_nuevo.set_password(request.data.get('password'))
                uid = urlsafe_base64_encode(force_bytes(usuario_nuevo.pk))
                token = account_activation_token.make_token(usuario_nuevo)
                enviar_correo_verificacion(usuario_nuevo.email, uid, token)
                Mensaje.success(response_data, 'Creación del administrador exitosa.')
                return Response(response_data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            Mensaje.error(response_data, 'Este email ya esta en uso por otro usuario.')
            return Response(response_data, status = status.HTTP_400_BAD_REQUEST)

    def put(self, request, *args, **kwargs):
        '''
        Método put para la actualziación de un admin 
        '''

        data = {}
        try:
            id = kwargs['pk']
            admin = Usuario.objects.get(pk = id)
            serializer = AdminSerializer(admin, request.data, partial = True)
            if serializer.is_valid():
                serializer.save()
                Mensaje.success(data, 'Administrador actualizado exitosamente.')
                return Response(data, status=status.HTTP_200_OK)
            else:
                # Si la validación falla, devolvemos el error con el estado 400
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            Mensaje.error(data, str(e))
            return Response(data, status = status.HTTP_400_BAD_REQUEST)
