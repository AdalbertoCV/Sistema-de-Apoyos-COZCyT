from common.views import BasePermissionAPIView
from rest_framework import response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from users.permisos import es_admin
from rest_framework.views import APIView
from rest_framework.response import Response
from modalidades.models import Modalidad
from modalidades.serializers import ModalidadSerializer
from notificaciones.mensajes import Mensaje
from django.shortcuts import get_object_or_404


class ModalidadAPIView(BasePermissionAPIView):
    '''
    Clase que maneja las solicitudes de los recursos de Modalidad

    Tipos de solicitud:
    - GET (Obtiene toda la lista de modalidades o una modalidad específica)
    - POST (Crea una nueva modalidad)
    - PUT (Actualizar los datos de alguna modalidad existente)
    - DELETE (Si bien no se permiten eliminar las modalidades, este método la archivará en su lugar)
    '''

    permission_classes_delete = [IsAuthenticated, es_admin]
    permission_classes_update = [IsAuthenticated, es_admin]
    permission_classes_create = [IsAuthenticated, es_admin]
    permission_classes_list = [AllowAny]

    def get(self, request, pk=None):
        #si hay existe el argumento pk en el request, enviamos solo un objeto
        if pk:
            modalidad = get_object_or_404(Modalidad,pk=pk)
            serializer = ModalidadSerializer(modalidad)
        else:
            #excluimos las modalidades archivadas
            modalidades = Modalidad.objects.filter(archivado=False)
            #Si el usuario no es administrador, enviamos solo las modalidades que se pueden mostrar
            if request.user.is_staff == False:
                modalidades = modalidades.filter(mostrar=True)
            serializer = ModalidadSerializer(modalidades, many=True)
        response_data = {'data': serializer.data}        
        return Response(response_data, status=status.HTTP_200_OK)

    def post(self, request):               
        # Verificar el tipo de contenido del request        
        serializer = ModalidadSerializer(data=request.data)        
        if serializer.is_valid():                             
            serializer.save()
            response_data = {'data': serializer.data}
            Mensaje.success(response_data, 'Modalidad creada con éxito.')            
            return Response(response_data, status=status.HTTP_201_CREATED)
        else:
            response_data = {'errors': serializer.errors}
            Mensaje.warning(response_data, 'No se pudo crear la modalidad.')
            Mensaje.error(response_data, serializer.errors)            
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        modalidad = get_object_or_404(Modalidad,pk=pk)
        serializer = ModalidadSerializer(modalidad, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            response_data = {'data': serializer.data}
            Mensaje.success(response_data, 'Modalidad modificada con éxito.')
            return Response(response_data, status=status.HTTP_200_OK)
        else:
            response_data = {'errors': serializer.errors}
            Mensaje.warning(response_data, 'No se pudo modificar la modalidad.')
            Mensaje.error(response_data, serializer.errors)
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        modalidad = get_object_or_404(Modalidad,pk=pk)
        modalidad.archivado = True
        modalidad.save()
        response_data = {}
        Mensaje.success(response_data, 'Modalidad archivada con éxito.')
        return Response(response_data, status=status.HTTP_204_NO_CONTENT) 