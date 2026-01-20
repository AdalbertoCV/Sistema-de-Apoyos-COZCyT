# Archivo con la vista para manejar las solicitudes
# Autores: Adalberto Cerrillo Vázquez
# Versión: 1.0

from dynamic_tables.views import DynamicTableAPIView 
from dynamic_formats.models import DynamicFormat
from .models import Solicitud
from users.permisos import es_admin, primer_login
from rest_framework.permissions import IsAuthenticated
from datetime import timedelta, datetime
from common.views import BasePermissionAPIView
from users.models import Solicitante
from .models import Solicitud, Convenio, Minuta
from notificaciones.mensajes import Mensaje
from rest_framework.response import Response
from rest_framework import status
from .serializer import SolicitudSerializer
from django.shortcuts import get_object_or_404
from dynamic_tables.views import ReporteAPIView
from rest_framework.permissions import AllowAny
from dynamic_tables.models import DynamicTableReport
from dynamic_tables.DynamicTable import DynamicTable
from dynamic_tables.views import Exportar_CSV
from modalidades.models import Modalidad
from django.db import transaction
from .respuestas_serializer import RespuestaSerializer 
from django.utils import timezone
from dynamic_forms.serializers import RespuestaFormularioSerializer
from dynamic_forms.models import Elemento, RegistroFormulario, RegistroSeccion, Respuesta, RDocumento
from django.core.exceptions import ValidationError 


class SolicitudAPIView(DynamicTableAPIView):
    '''
    Clase para el manejo de la lista de solicitudes y la aplicación de sus filtros

    '''   
    permission_classes_list = [IsAuthenticated]

    model_class = Solicitud
    model_name = 'Solicitud'
    columns = '__all__'
    exclude_columns = []
    filters = {
        'timestamp': {
            'gte': [(datetime.now() - timedelta(days=5*30)).strftime('%Y-%m-%d')]
        }
    }
    non_editable_fields = ["id","minuta__id","convenio__id","modalidad__id","modalidad__dynamic_form__id","timestamp","solicitante__id",
    "solicitante__is_superuser","solicitante__is_staff","solicitante__municipio__id","solicitante__municipio__estado__id",
    "solicitante__datos_bancarios__id","registro_formulario__id"]
    dynamic_form_exist = True


class SolicitarAPIView(BasePermissionAPIView):
    ''' 
    Clase para manejar la lógica de la creación y edición de solicitudes
    '''
    
    permission_classes_create = [IsAuthenticated, primer_login]
    permission_classes_update = [IsAuthenticated, primer_login]

    def post(self, request, *args, **kwargs):
        ''' 
        Método POST para la creación de una nueva solicitud contestando el formulario correspondiente
        '''
        data = {}

        try:
            user = request.user
            solicitante = Solicitante.objects.get(id=user.id)
            monto_solicitado = request.data.get("monto_solicitado")
            modalidad = Modalidad.objects.get(id=request.data.get('modalidad_id'))

            # Obtener el año y mes actual
            fecha_actual = timezone.now()
            año_actual = fecha_actual.year
            mes_actual = fecha_actual.month

            # Determinar el semestre en curso
            if mes_actual <= 6:
                semestre_inicio = datetime(año_actual, 1, 1)  # Primer semestre
                semestre_fin = datetime(año_actual, 6, 30)
            else:
                semestre_inicio = datetime(año_actual, 7, 1)  # Segundo semestre
                semestre_fin = datetime(año_actual, 12, 31)

            # Contar cuántas solicitudes ha hecho el solicitante en el semestre actual
            solicitudes_del_semestre = Solicitud.objects.filter(
                solicitante=solicitante,
                timestamp__range=(semestre_inicio, semestre_fin)
            ).count()

            if solicitudes_del_semestre >= 2:
                Mensaje.error(data, 'No puedes registrar más de dos solicitudes en el mismo semestre.')
                return Response(data, status=status.HTTP_400_BAD_REQUEST)

            with transaction.atomic():
                nueva_solicitud = Solicitud.objects.create(
                    solicitante=solicitante,
                    monto_solicitado=monto_solicitado,
                    modalidad=modalidad,
                    status='Pendiente'
                )
                nueva_solicitud.solicitud_n = nueva_solicitud.id
                nueva_solicitud.save()
                registro_formulario = nueva_solicitud.registro_formulario

                # Procesar las respuestas enviadas
                respuestas = self._extract_respuestas_from_formdata(request.data)
                for respuesta in respuestas:
                    serializer = RespuestaSerializer(data=respuesta, context={'registro_formulario': registro_formulario})
                    if serializer.is_valid(raise_exception=True):
                        serializer.save()

            # Respuesta exitosa
            Mensaje.success(data, 'Solicitud y respuestas registradas exitosamente.')
            return Response(data, status=status.HTTP_201_CREATED)

        except Exception as e:
            Mensaje.error(data, str(e))
            return Response(data, status=status.HTTP_400_BAD_REQUEST)

    def _extract_respuestas_from_formdata(self, data):
        """
        Extrae las respuestas en el formato esperado de FormData, sin asumir que los índices son consecutivos.
        """
        respuestas = []

        # Buscar todas las claves que coinciden con el patrón 'respuestas' en el FormData
        for key in data.keys():
            # Extraer el índice del patrón 'respuestas[X][seccion_id]' donde X es el índice
            if "respuestas" in key and "seccion_id" in key:
                # Extraer el índice usando regex o split
                index = key.split('[')[1].split(']')[0]

                # Crear la respuesta correspondiente
                respuesta = {
                    'seccion_id': data.get(f"respuestas[{index}][seccion_id]"),
                    'elemento_id': data.get(f"respuestas[{index}][elemento_id]"),
                }

                # Agregar valor_texto solo si está presente
                if f"respuestas[{index}][valor_texto]" in data:
                    respuesta['valor_texto'] = data.get(f"respuestas[{index}][valor_texto]")

                # Agregar valor_file solo si está presente
                if f"respuestas[{index}][valor_file]" in data:
                    respuesta['valor_file'] = data.get(f"respuestas[{index}][valor_file]")

                respuestas.append(respuesta)

        return respuestas


    def put(self, request, *args, **kwargs):
        ''' 
        Método PUT para la edición de una solicitud existente
        '''
        data = {}

        try:
            user = request.user
            solicitante = Solicitante.objects.get(id=user.id)
            solicitud_id = kwargs['pk']
            monto_solicitado = request.data.get("monto_solicitado")

            try:
                solicitud = Solicitud.objects.get(id=solicitud_id, solicitante=solicitante)
            except Solicitud.DoesNotExist:
                Mensaje.error(data, 'La solicitud no existe o no tienes permisos para editarla.')
                return Response(data, status=status.HTTP_404_NOT_FOUND)

            if solicitud.status in ['Aprobado', 'Rechazado']:
                Mensaje.error(data, f'No puedes realizar cambios en esta solicitud dado que su estatus es {solicitud.status}')
                return Response(data, status=status.HTTP_400_BAD_REQUEST)

            with transaction.atomic():
                solicitud.monto_solicitado = monto_solicitado
                solicitud.status = 'Pendiente'
                solicitud.save()

                registro_formulario = solicitud.registro_formulario

                # Procesar las respuestas enviadas
                respuestas = self._extract_respuestas_from_formdata(request.data)
                for respuesta in respuestas:
                    serializer = RespuestaSerializer(data=respuesta, context={'registro_formulario': registro_formulario})

                    if serializer.is_valid(raise_exception=True):
                        # Verificar si la respuesta ya existe
                        elemento_id = respuesta.get('elemento_id')
                        registro_seccion_id = respuesta.get('seccion_id')
                        try:
                            respuesta_instance = Respuesta.objects.get(
                                registro_seccion__registro_formulario=registro_formulario,
                                registro_seccion__seccion_id=registro_seccion_id,
                                elemento_id=elemento_id
                            )
                            # Actualizar la respuesta existente
                            serializer.update(respuesta_instance, serializer.validated_data)
                        except Respuesta.DoesNotExist:
                            # Crear una nueva respuesta
                            serializer.save()

            # Respuesta exitosa
            Mensaje.success(data, 'Solicitud actualizada exitosamente.')
            return Response(data, status=status.HTTP_200_OK)

        except Solicitante.DoesNotExist:
            Mensaje.error(data, 'Solicitante no encontrado.')
            return Response(data, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            Mensaje.error(data, str(e))
            return Response(data, status=status.HTTP_400_BAD_REQUEST)




class SubirConvenio(BasePermissionAPIView):
    '''
    Clase para permitir la subida de un convenio firmado en una solicitud aprobada.
    '''

    permission_classes_update = [IsAuthenticated]
    permission_classes_list = [IsAuthenticated]


    def get(self, request, *args, **kwargs):
        '''
        Método para recuperar el formato default de los convenios
        '''
        data = {}
        try:
            formato = DynamicFormat.objects.get(nombre="formato_convenio_default")
            data["formato_default"] = formato.id
            return Response(data, status= status.HTTP_200_OK)
        except Exception as e: 
            Mensaje.error(data, str(e))
            return Response(data, status = status.HTTP_400_BAD_REQUEST)

    def put(self, request, *args, **kwargs):
        ''' 
        Método put para la edción del campo convenio
        '''
        data = {}

        try:
            solicitud_id = kwargs['pk']
            solicitante = Solicitante.objects.get(id= request.user.id)
            solicitud = Solicitud.objects.get(id= solicitud_id, solicitante= solicitante)
            if solicitud.status == 'Aprobado':
                convenio_file = request.data.get('convenio', None)
                convenio = Convenio.objects.create(archivo=convenio_file)
                convenio.save()
                solicitud.convenio = convenio
                solicitud.save()
                Mensaje.success(data, 'Convenio subido exitosamente.')
                return Response(data, status= status.HTTP_200_OK)
            else:
                Mensaje.error(data, "No se puede subir un convenio en una solicitud no aprobada.")
                return Response(data, status = status.HTTP_400_BAD_REQUEST )

        except Exception as e:
            Mensaje.error(data, str(e))
            return Response(data, status = status.HTTP_400_BAD_REQUEST)


class SubirMinuta(BasePermissionAPIView):
    '''
    Clase para permitir la subida de una minuta a una solicitud
    '''

    permission_classes_update = [IsAuthenticated, es_admin]
    
    def put(self, request, *args, **kwargs):
        ''' 
        Método put para la edción del campo minuta
        '''
        data = {}

        try:
            solicitud_id = kwargs['pk']
            solicitud = Solicitud.objects.get(id= solicitud_id)
            
            minuta_file = request.data.get('minuta', None)
            minuta = Minuta.objects.create(archivo=minuta_file)
            minuta.save()
            solicitud.minuta = minuta
            solicitud.save()
            Mensaje.success(data, 'Minuta actualizada exitosamente.')
            return Response(data, status= status.HTTP_200_OK)
        except Exception as e:
            Mensaje.error(data, str(e))
            return Response(data, status = status.HTTP_400_BAD_REQUEST)


class HistorialAPIVIew(BasePermissionAPIView):
    '''
    APIView con la funcionalidad para ver el historial de apoyos de un solicitante 
    '''

    permission_classes_list = [IsAuthenticated]

    def get(self, request, *args, **kwargs ):
        ''' 
        Método get para obtener la lista de solicitudes realizadas
        '''

        response_data = {}

        if request.user.is_staff:
            if 'pk' in kwargs:
                solicitante = get_object_or_404(Solicitante, pk = kwargs['pk'])
        else:
            uid = request.user.pk
            solicitante = Solicitante.objects.get(pk=uid)

        # obtenemos las solicitudes 
        solicitudes = Solicitud.objects.filter(solicitante=solicitante)

        if not solicitudes:
            Mensaje.error(response_data, 'No existen solicitudes en el historial.')
            return Response(response_data,  status=status.HTTP_204_NO_CONTENT)

        serializer = SolicitudSerializer(solicitudes, many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)


class ReportesSolicitudesAPIView(ReporteAPIView):
    ''' 
    Clase con herencia de ReporteAPI view, para obtener los reportes exclusivamente del modelo solicitud.
    '''
    
    def get(self, request, *args, **kwargs):
        ''' 
        Método GET para obtener una lista de reportes de solicitudes
        o un reporte en caso de recibir un pk
        '''

        # indicamos el nombre del modelo.
        model = 'Solicitud'

        if 'pk' in kwargs:
            instance = get_object_or_404(DynamicTableReport, pk=kwargs['pk'])
            serializer = DynamicTable(instance)
            return Response(serializer.data)

        queryset = DynamicTableReport.objects.filter(model_name= model)
        serializer = DynamicTable(queryset, many=True)
        return Response(serializer.data)


class ExportarReporteSolicitudes(Exportar_CSV):
    '''
    Clase que hereda de Exportar_CSV de tablas dinámicas
    especializando la exportación para solicitudes.
    '''
    model_class = Solicitud


class CalificarDocumento(BasePermissionAPIView):
    ''' 
    APIView para dar retroalimentación a un documento enviado a la solicitud.
    '''
    permission_classes_update = [IsAuthenticated, es_admin]

    def put(self, request, *args, **kwargs):
        '''
        Método para calificar uno o varios documentos a la vez de una solicitud.

        Espera una lista de dicts en el formato check_documents = [{"id_respuesta":"n","nuevo_status":"status", "nueva_observacion": "observacion" }]
        '''
        data = {}

        try:
            id_solicitud = kwargs['pk']
            respuestas_calificar = request.data.get('check_documents')
            if not respuestas_calificar:
                raise ValueError("No se proporcionaron documentos para calificar.")

            # Obtener el registro_formulario de la solicitud
            solicitud = get_object_or_404(Solicitud, pk=id_solicitud)
            registro_formulario_solicitud = solicitud.registro_formulario

            for respuesta_data in respuestas_calificar:
                id_respuesta = respuesta_data.get("id_respuesta")
                nuevo_status = respuesta_data.get("nuevo_status")
                nueva_observacion = respuesta_data.get("nueva_observacion")
                
                # Verificar que los datos necesarios están presentes
                if not id_respuesta or not nuevo_status:
                    raise ValueError("El 'id_respuesta' y 'nuevo_status' son obligatorios para cada documento.")

                # Obtener la respuesta del documento
                respuesta = get_object_or_404(RDocumento, pk=id_respuesta)

                # Validar que la respuesta pertenece a la solicitud dada
                if respuesta.registro_seccion.registro_formulario != registro_formulario_solicitud:
                    raise ValidationError("La respuesta no pertenece a la solicitud proporcionada.")

                # Validar el nuevo status
                if nuevo_status not in RDocumento.Status.values:
                    raise ValueError(f"El status '{nuevo_status}' no es válido.")

                # Actualizar el status del documento
                respuesta.status = nuevo_status
                respuesta.observacion = nueva_observacion
                respuesta.save()

            data['mensaje'] = "Documentos calificados correctamente."
            return Response(data, status=status.HTTP_200_OK)
        
        except Exception as e:
            Mensaje.error(data, str(e))
            return Response(data, status=status.HTTP_400_BAD_REQUEST)

