from django.shortcuts import render, get_object_or_404
from rest_framework.response import Response
from rest_framework import status
from dynamic_tables.DynamicTable import DynamicTable, Reporte
from dynamic_tables.DynamicTableDynamicForm import DynamicTableDynamicForm
from rest_framework.permissions import AllowAny, IsAuthenticated
from dynamic_tables.models import DynamicTableReport
from users.views import BasePermissionAPIView
from users.permisos import es_admin
from datetime import timedelta, datetime
from notificaciones.mensajes import Mensaje
from django.core.exceptions import ValidationError
import json
from users.models import Solicitante
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from solicitudes.models import Solicitud


class DynamicTableAPIView(BasePermissionAPIView):
    '''
    Clase abstracta para el manejo de tablas dinámicas
    '''

    permission_classes_update = [IsAuthenticated, es_admin]
    permission_classes_list = [IsAuthenticated, es_admin] 
    permission_classes_create = [IsAuthenticated, es_admin]
    permission_classes_delete = [IsAuthenticated, es_admin]

    model_name = None
    model_class = None
    columns = '__all__'
    exclude_columns = []
    search_query = ""
    filters = {}
    exclude_filters = {}
    # Lista con los campos que no pueden ser modificados mediante la solicitud put
    non_editable_fields = []

    dynamic_form_exist = False

    def check_user_permissions(self, user, pk):
        ''' 
        Verificamos el acceso de un usuario a una instancia en específico
        '''

        if not user.is_staff:
            solicitante = Solicitante.objects.get(id=user.id)
            if self.model_class == Solicitud:
                instance = get_object_or_404(self.model_class, pk=pk, solicitante = solicitante)
            else:
                if solicitante.id == pk:
                    instance = get_object_or_404(self.model_class, pk=solicitante.id)
                else:
                    instance = None 
        else:
            instance = get_object_or_404(self.model_class, pk=pk)
        return instance

    def get_configuracion_reporte(self, request):
        '''
        Creamos la configuración enviando los parámetros desde query params
        '''
        self.model_name = request.query_params.get('model_name', None)
        self.columns = request.query_params.get('columns', [])
        self.filters = self.parse_json_param(request.query_params.get('filters', '{}'))
        self.exclude_columns = request.query_params.get('exclude_columns', [])
        self.exclude_filters = self.parse_json_param(request.query_params.get('exclude_filters', '{}'))
        self.search_query = request.query_params.get('search_query', '')

        reporte = DynamicTableReport(
            model_name=self.model_name,
            columns=self.columns,
            filters=self.filters,
            exclude_columns=self.exclude_columns,
            exclude_filters=self.exclude_filters,
            search_query=self.search_query
        )

        return reporte

    def parse_json_param(self, param):
        '''Convierte un string JSON a un diccionario, si es posible.'''
        try:
            import json
            return json.loads(param)
        except (ValueError, TypeError):
            return {}
    

    def get_configuracion_reporte_id(self, request, reporte_id=None):
        '''
        Crear una configuración con los datos actuales de la request, sobrescribiendo los predeterminados si se proporcionan.
        '''
        try:
            if reporte_id:
                reporte_data = DynamicTableReport.objects.get(id=reporte_id)
                self.model_name = reporte_data.model_name
                self.columns = reporte_data.columns
                self.filters = reporte_data.filters
                self.exclude_columns = reporte_data.exclude_columns
                self.search_query = reporte_data.search_query
                self.exclude_filters = reporte_data.exclude_filters
                return reporte_data
            else:
                reporte_data = {
                    #'model_name': self.model_name,
                    'columns': self.columns,
                    'filters': self.filters,
                    'exclude_columns': self.exclude_columns,
                    'search_query': self.search_query,
                    'exclude_filters': self.exclude_filters
                }
                self.columns = reporte_data.get("columns", self.columns)
                self.filters = reporte_data.get("filters", self.filters)
                self.exclude_columns = reporte_data.get("exclude_columns", self.exclude_columns)
                self.search_query = reporte_data.get("search_query", self.search_query)
                self.exclude_filters = reporte_data.get("exclude_filters", self.exclude_filters)
                reporte_data["model_name"] = self.model_name
                return DynamicTableReport(**reporte_data)
        except Exception as e:
            data = {}
            Mensaje.error(data, str(e))
            return Response(data, status = status.HTTP_400_BAD_REQUEST)

    def get(self, request, pk=None):
        
        '''
        Método GET para obtener la lista de datos de acuerdo a la configuración
        '''

        response_data = {}
        user = request.user

        if pk is not None:
            try:
                instance = self.check_user_permissions(user, pk)
                if instance is not None:
                    if self.dynamic_form_exist:
                        serializer = DynamicTableDynamicForm(model_class=self.model_class)
                        instance_data = serializer.retrieve_instance_data(instance)
                        return Response(instance_data, status=status.HTTP_200_OK)
                    else:
                        serializer = DynamicTable(model_class=self.model_class)
                        instance_data = serializer.retrieve_instance_data(instance)
                        return Response(instance_data, status=status.HTTP_200_OK)
                else:
                    Mensaje.error(response_data, 'No tienes permisos para realizar esta acción.')
                    return Response(response_data, status = status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                Mensaje.error(response_data, str(e))
                return Response(response_data, status = status.HTTP_400_BAD_REQUEST)
        try:
            if user.is_staff:
                reporte_id = request.query_params.get('reporte_id', None)
                if reporte_id:
                    configuracion_reporte = self.get_configuracion_reporte_id(request, reporte_id)
                elif any(key in request.query_params for key in ['columns', 'filters', 'exclude_columns', 'exclude_filters', 'search_query']):
                    configuracion_reporte = self.get_configuracion_reporte(request)
                else:
                    configuracion_reporte = self.get_configuracion_reporte_id(request)
                if self.dynamic_form_exist:
                    serializer = DynamicTableDynamicForm(instance=configuracion_reporte, model_class=self.model_class)
                else:
                    serializer = DynamicTable(instance=configuracion_reporte,model_class=self.model_class)
                data = serializer.get_data(configuracion_reporte)
                available_columns = serializer.get_available_columns(configuracion_reporte)
                available_filters = serializer.get_available_filters(configuracion_reporte)
                response_data = {'data': data, 'available_filters': available_filters, 'available_columns': available_columns}
                return Response(response_data, status=status.HTTP_200_OK)
            else:
              Mensaje.error(response_data, 'No tienes permisos para realizar esta acción.')
              return Response(response_data, status=status.HTTP_400_BAD_REQUEST)  
        except Exception as e:
            Mensaje.error(response_data, str(e))
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

            

    def put(self, request, pk=None, *args, **kwargs):
        '''
        Permite a un admin modificar manualmente varias columnas de una fila en la tabla dinámica.
        '''
        response_data = {}
        user = request.user
        instance = None
        # Obtener la instancia del modelo por el id proporcionado en la URL o un 404 en caso de no existir
        if pk is not None:
            try:
                instance = self.check_user_permissions(user, pk)
                if instance is None:
                    Mensaje.error(response_data, 'No tienes permisos para realizar esta acción.')
                    return Response(response_data, status = status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                Mensaje.error(response_data, str(e))
                return Response(response_data, status = status.HTTP_400_BAD_REQUEST)

        # Obtener datos de actualización del request
        field_updates = request.data.get('field_updates', {})
        register_updates = request.data.get('register_updates', {})

        # Extraer la configuración, o si no fue enviada asignamos la predeterminada
        reporte_id = request.query_params.get('reporte_id', None)
        if reporte_id:
            configuracion = self.get_configuracion_reporte_id(request, reporte_id)
        elif any(key in request.query_params for key in ['columns', 'filters', 'exclude_columns', 'exclude_filters', 'search_query']):
            configuracion = self.get_configuracion_reporte(request)
        else:
            configuracion = self.get_configuracion_reporte_id(request)
        if self.dynamic_form_exist:
            serializer = DynamicTableDynamicForm(instance=configuracion,model_class=self.model_class)
        else:
            serializer = DynamicTable(instance=configuracion,model_class=self.model_class)

        if self.columns == "__all__":
            self.columns = list(serializer.get_available_columns(configuracion).keys())

        if field_updates and instance:
            # Caso donde se proporcionan actualizaciones individuales para un registro
            for column_name in field_updates:
                if column_name not in self.columns or column_name in self.non_editable_fields:
                    Mensaje.error(response_data, f"Modificación no permitida en la columna '{column_name}'.")
                    return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

            try:
                # Actualizar los valores de los campos del registro y guardar la instancia
                success = serializer.update_fields(instance, field_updates)

                if success:
                    Mensaje.success(response_data, 'Campos actualizados con éxito.')
                    return Response(response_data, status=status.HTTP_200_OK)
                else:
                    Mensaje.error(response_data, 'Ocurrió un error al actualizar algunos campos.')
                    return Response(response_data, status=status.HTTP_400_BAD_REQUEST)
            except ValidationError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        elif register_updates:
            # Caso donde se proporcionan actualizaciones para múltiples registros
            try:
                success = serializer.update_registers(register_updates, self.model_class)
                if success:
                    Mensaje.success(response_data, 'Registros actualizados con éxito.')
                    return Response(response_data, status=status.HTTP_200_OK)
                else:
                    Mensaje.error(response_data, 'Ocurrió un error al actualizar algunos registros.')
                    return Response(response_data, status=status.HTTP_400_BAD_REQUEST)
            except ValidationError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        else:
            Mensaje.error(response_data, 'No se proporcionaron datos de actualización.')
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)



    def delete(self, request, pk, *args, **kwargs):
        ''' 
        Método para elminar un registro de la tabla dinámica 

        '''

        response_data = {}
        modelo_eliminar = self.model_class

        instance = get_object_or_404(modelo_eliminar, pk=pk)
        instance.delete()

        Mensaje.success(response_data, 'Registro eliminado con éxito.')
        return Response(response_data, status=status.HTTP_204_NO_CONTENT)



class ReporteAPIView(BasePermissionAPIView):
    ''' 
    Clase para manejar la lógica de las configuraciónes de reportes en tablas dinámicas
    '''

    permission_classes_list = [IsAuthenticated, es_admin]
    permission_classes_create = [IsAuthenticated, es_admin]
    permission_classes_update = [IsAuthenticated, es_admin]
    permission_classes_delete = [IsAuthenticated, es_admin]


    def get(self, request, *args, **kwargs):
        ''' 
        Método GET para obtener una lista de reportes de tabla dinámica
        o un reporte en caso de recibir un pk
        '''
        if 'pk' in kwargs:
            instance = get_object_or_404(DynamicTableReport, pk=kwargs['pk'])
            serializer = Reporte(instance)
            return Response(serializer.data)

        queryset = DynamicTableReport.objects.all()
        serializer =Reporte(queryset, many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        '''
        Método POST para crear una nueva configuración de reporte
        '''
        response_data = {}
        serializer = Reporte(data=request.data)
        if serializer.is_valid():
            configuracion_reporte = serializer.save()
            Mensaje.success(response_data, 'Reporte creado con exito.')
            return Response(response_data, status=status.HTTP_200_OK)
        else:   
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk, *args, **kwargs):
        ''' 
        Método put para la actualización de una configuración de reporte.

        param pk: llave primaria del reporte a editar
        '''
        response_data = {}
        configuracion = get_object_or_404(DynamicTableReport, pk= pk)

        serializer = Reporte(instance=configuracion, data=request.data)
        if serializer.is_valid():
            # guardamos los cambios
            serializer.save()
            Mensaje.success(response_data, 'Reporte actualizado exitosamente.')
            return Response(response_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    def delete(self, request, pk, *args, **kwargs):
        ''' 
        Método delete para eliminar una configuración de reporte

        param pk: llave primaria del reporte a eliminar
        '''
        response_data = {}
        configuracion = get_object_or_404(DynamicTableReport, pk= pk)
        configuracion.delete()

        Mensaje.success(response_data, 'Reporte eliminado con éxito.')
        return Response(response_data, status=status.HTTP_204_NO_CONTENT)


class Exportar_CSV(BasePermissionAPIView):
    ''' 
    APIView para manejar la exportación de los datos según una configuración de reporte.
    '''
    permission_classes_list = [IsAuthenticated, es_admin]
    model_class = None

    def parse_json_param(self, param):
        '''Convierte un string JSON a un diccionario, si es posible.'''
        try:
            import json
            return json.loads(param)
        except (ValueError, TypeError):
            return {}

    def get_configuracion_reporte(self, request):
        '''
        Recuperar la configuración del reporte de la request si se ha enviado.
        '''
        try:
            reporte_id = request.query_params.get('reporte_id', None)
            if reporte_id:
                return DynamicTableReport.objects.get(id = reporte_id)
            else:
                model_name = "Solicitud"
                columns = request.query_params.get('columns', '__all__').strip('"')
                filters = self.parse_json_param(request.query_params.get('filters', {}))
                exclude_columns = request.query_params.get('exclude_columns', [])
                search_query = request.query_params.get('search_query', '')
                exclude_filters = self.parse_json_param(request.query_params.get('exclude_filters', {}))
                reporte = DynamicTableReport(
                    model_name=model_name,
                    columns=columns,
                    filters=filters,
                    exclude_columns=exclude_columns,
                    exclude_filters=exclude_filters,
                    search_query=search_query
                )

                return reporte
        except Exception as e:
            data = {}
            Mensaje.error(data, str(e))
            return Response(data, status = status.HTTP_400_BAD_REQUEST)


    def get(self, request, *args, **kwargs):
        ''' 
        Método get para obtener el archivo zip con todos los documentos solicitados.
        '''
        configuracion = self.get_configuracion_reporte(request)
        configuracion.columns = self.format_columns(configuracion.columns)
        configuracion.filters = self.format_filters(configuracion.filters)
        reporte = DynamicTableDynamicForm(instance=configuracion, model_class=self.model_class)
        data = reporte.get_data(configuracion)
        response = reporte.export_to_csv_and_zip(data)
        return response 


    @staticmethod
    def format_columns(columns_dict):
        """
        Convierte un diccionario de columnas en una lista de claves.

        Args:
            columns_dict (dict): Diccionario de columnas en formato {"campo": "label"}.

        Returns:
            list: Lista de claves de columnas en el formato ['campo', ...].
        """
        return list(columns_dict.keys())

    @staticmethod
    def format_filters(filters_list):
        """
        Convierte una lista de filtros con `campo`, `lookups` y valores a un diccionario simplificado.
    
        Args:
            filters_list (list): Lista de filtros en formato detallado.
    
        Returns:
            dict: Diccionario con formato {'campo': {'lookup': [valor]}}.
        """
        filters_dict = {}
        for filter_item in filters_list:
            field_name = filter_item.get('campo')
            lookups = filter_item.get('lookups', {})
            for lookup, value in lookups.items():
                # Omitir si el valor es None o 'null'
                if value is None or value == 'null':
                    continue
                if field_name not in filters_dict:
                    filters_dict[field_name] = {}
                # Asegurarse de que 'value' sea una lista
                filters_dict[field_name][lookup] = value if isinstance(value, list) else [value]
        return filters_dict
