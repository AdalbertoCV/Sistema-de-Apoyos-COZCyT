from django.shortcuts import render, get_object_or_404
from common.views import BasePermissionAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from users.permisos import es_admin
from rest_framework import status
from .models import Convocatoria, Colores
from rest_framework.response import Response
from notificaciones.mensajes import Mensaje
from .serializers import ConfiguracionEstiloSerializer

class AbrirCerrarConvocatoria(BasePermissionAPIView):
    ''' 
    APIView con la lógica para abrir la convocatoria.
    '''

    permission_classes_list = [IsAuthenticated]
    permission_classes_update = [IsAuthenticated, es_admin]

    def get(self, request, *args, **kwargs):
        ''' 
        Método get para obtener el estado actual de la convocatoria
        '''

        data = {}

        convocatoria = Convocatoria.objects.all().first()

        if convocatoria:
            data['convocatoria_is_open'] = convocatoria.abierta
        else:
            data['convocatoria_is_open'] = False
        return Response(data, status = status.HTTP_200_OK)

    
    def put(self, request, *args, **kwargs):
        ''' 
        Método para la edición de el estado de una convocatoria
        '''
        data = {}
        try:

            data = {}
 
            estado = request.data.get('nuevo_estado')

            convocatoria = Convocatoria.objects.all().first()

            if convocatoria:
                convocatoria.abierta = estado
                convocatoria.save()
            else:
                convocatoria = Convocatoria.objects.create(
                    abierta = estado
                )

            Mensaje.success(data, 'Estado de la convocatoria actualizado.')
            return Response(data, status = status.HTTP_200_OK)
        except Exception as e:
            Mensaje.success(data, str(e))
            return Response (data, status = status.HTTP_400_BAD_REQUEST)
        

class ConfiguracionEstiloAPIView(BasePermissionAPIView):
    ''' 
    Clase para manjear la recuperación y edición de la configuración default
    '''

    permission_classes_list = [AllowAny]
    permission_classes_update = [IsAuthenticated, es_admin]

    def get(self, request):
        """Recupera la configuración por defecto (es_default=True)."""
        configuracion = get_object_or_404(Colores, es_default=True)
        serializer = ConfiguracionEstiloSerializer(configuracion)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        """Edita la configuración por defecto (es_default=True)."""
        configuracion = get_object_or_404(Colores, es_default=True)
        serializer = ConfiguracionEstiloSerializer(configuracion, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)