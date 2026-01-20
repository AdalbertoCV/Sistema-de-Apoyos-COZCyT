# Archivo con la lógica del manejo de las tablas dinámicas
# Autores: Adalberto Cerrillo Vázquez
# Versión: 1.0

from rest_framework import serializers
from django.apps import apps
from django.db.models import Q, Prefetch
from .models import DynamicTableReport
from django.db import models
from collections import defaultdict
from django.db.models import ForeignKey, ManyToManyField, OneToOneField, ManyToOneRel, FileField, ImageField
from solicitudes.models import Solicitud
import re
from django.core.exceptions import ValidationError, FieldDoesNotExist
import json
import csv
import os
import shutil
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.http import HttpResponse
from zipfile import ZipFile
import io
from dynamic_forms.models import RDocumento, RegistroSeccion

exclude_pattern = re.compile(r'archivo|mostrar|archivado|INE|doc|id|imagen|staff|user|active|^password$|^last_login$|^created_at$|^updated_at$|^usuario_ptr$|^groups$|^user_permissions$|^dynamic_form__nombre$|^dynamic_form__secciones$',re.IGNORECASE)


class Reporte(serializers.ModelSerializer):
    ''' 
    Clase para crear, actualziar y serialziar reportes de tabla dinámica.
    '''

    class Meta:
        model = DynamicTableReport
        fields = '__all__'


    def create(self, validated_data):
        ''' 
        Método que se encargará de guardar en la base de datos una nueva configuración para la tabla dinámica

        parámetros:
        - validated_data: Datos validados según la configuración de la base de datos
        '''

        # Verificamos si ya existe una configuración igual en la base de datos
        instance = DynamicTableReport.objects.filter(
            nombre = validated_data['nombre'],
            model_name=validated_data['model_name'],
            columns=validated_data['columns'],
            exclude_columns=validated_data.get('exclude_columns', None),
            search_query=validated_data.get('search_query', None),
            filters=validated_data.get('filters', None)
        ).first()

        if instance:
            # Si ya existe una configuración igual, la retornamos
            return instance

        # Si no existe, creamos una nueva instancia
        instance = DynamicTableReport.objects.create(**validated_data)
        return instance

    def update(self, instance, validated_data):
        ''' 
        Método para modificar una configuración de reporte.

        param instance: Instancia de DynamicTableReport
        param validated_data: Nuevos datos
        '''
        instance.nombre = validated_data.get('nombre', instance.nombre)
        instance.model_name = validated_data.get('model_name', instance.model_name)
        instance.columns = validated_data.get('columns', instance.columns)
        instance.exclude_columns = validated_data.get('exclude_columns', instance.exclude_columns)
        instance.search_query = validated_data.get('search_query', instance.search_query)
        instance.filters = validated_data.get('filters', instance.filters)
        instance.exclude_filters = validated_data.get('exclude_filters', instance.exclude_filters)

        instance.save()
        return instance



class DynamicTable(serializers.ModelSerializer):
    '''
    Clase equivalente a un serializer con la lógica del manejo de las tablas dinámicas
    '''
    data = serializers.SerializerMethodField()

    class Meta:
        model = DynamicTableReport
        fields = '__all__'


    def __init__(self, model_class=None, *args, **kwargs):
        if model_class is None:
            raise ValueError("El argumento 'model_class' es obligatorio.")
        self.model_class = model_class
        

    def get_data(self, obj):
        '''
        Clase para obtener los datos solicitados en la configuración de reporte enviada

        param:
        - obj: Configuración de reporte que contiene las columnas solicitadas, los filtros, exclusiones, etc...
        '''
        try:
            model = self.buscar_modelo(obj)

            columns = obj.columns
            exclude_columns = obj.exclude_columns or []
            search_query = obj.search_query
            filters = obj.filters or {}
            exclude_filters = obj.exclude_filters or {}

        
            if columns == "__all__":
                
                columns = list(self.get_available_columns(obj).keys())
                obj.columns = columns

            # Obtener los filtros disponibles para este modelo
            available_filters = self.get_available_filters(obj)

            # Validar y limpiar los filtros enviados por la request
            clean_filters = self.validate_and_clean_filters({'filters': filters}, available_filters)

            queryset = model.objects.all()

            # Aplicar filtros usando la función recursiva
            queryset = self.apply_filters(queryset, clean_filters, exclude_filters)

            # Obtener los campos de tipo CharField o TextField del modelo y modelos relacionados
            char_and_text_fields = self.get_char_and_text_fields(model)
            related_char_and_text_fields = self.get_related_char_and_text_fields(model)

            # Aplicar búsqueda en campos de tipo CharField o TextField mediante el search_query
            if search_query:
                search_filters = []
                for field in char_and_text_fields + related_char_and_text_fields:
                    search_filters.append(Q(**{f"{field}__icontains": search_query}))
                search_filter = Q()
                for sf in search_filters:
                    search_filter |= sf
                queryset = queryset.filter(search_filter)


            # Seleccionar columnas a incluir y excluir
            queryset = queryset.values(*[col for col in columns if col not in exclude_columns])

            # Incluir campos relacionados
            for field in model._meta.get_fields():
                if (field.is_relation and
                        (field.name not in exclude_columns) and
                        (field.related_model is not None)):
                    related_queryset = field.related_model.objects.all()
                    queryset = queryset.prefetch_related(Prefetch(field.name, queryset=related_queryset))
            return list(queryset)
        except Exception as e:
            # Si hay algún fallo, regresamos una lista vacía
            return []


    @staticmethod
    def buscar_modelo(obj):
        '''
        Método para obtener el modelo de la base de datos, buscando en las aplicaciones registradas.
        '''
        for app_config in apps.get_app_configs():
            try:
                model = app_config.get_model(obj.model_name)
                break
            except LookupError:
                model = None
        else:
            model = None
            raise serializers.ValidationError(f"Model {obj.model_name} not found.")
        return model


    def get_available_filters(self, obj):
        '''
        Método para obtener los filtros disponibles a aplicar a una configuración de tabla dinámica
        con la finalidad de que dichos filtros puedan ser seleccionados desde el frontend
    
        parámetros:
        - obj: objeto con la configuración actual de la tabla dinámica
        '''
        available_filters = []
    
        model = self.buscar_modelo(obj)
        
        for column in obj.columns:
            field_path = column.split('__')
            field = model
            label = ""
            
            for part in field_path:
                if field._meta.get_field(part).is_relation:
                    field = field._meta.get_field(part).related_model
                else:
                    field = field._meta.get_field(part)
                    if hasattr(field, 'verbose_name'):
                        label = field.verbose_name.capitalize()
                    else:
                        label = part.capitalize() 
    
            # Inicializar lookups como un diccionario con valores nulos
            lookups_dict = {lookup: None for lookup in []}
            
            filter_info = {
                'campo': column,
                'label': label,
                'html_type': '',
                'lookups': lookups_dict,
            }
    
            # Verificamos el tipo de campo actual para poder enviar los filtros disponibles
            # correctos según el tipo de campo, y el html_value correspondiente
            if isinstance(field, models.CharField) or isinstance(field, models.TextField):
                filter_info['html_type'] = 'textInput'
                filter_info['lookups'] = {'icontains': None}
                # verificamos si existen choices para crear un nuevo diccionario "exact" con las keys y values
                if field.choices:
                    filter_info['lookups'] = {'iexact': None}
                    filter_info['choices'] = [{'label': choice[1], 'value': choice[0]} for choice in field.choices]
            elif isinstance(field, models.IntegerField) or isinstance(field, models.FloatField) or isinstance(field, models.DecimalField):
                filter_info['html_type'] = 'numberInput'
                filter_info['lookups'] = {'gte': None, 'lte': None}
            elif isinstance(field, models.DateField) or isinstance(field, models.DateTimeField):
                filter_info['html_type'] = 'dateInput'
                filter_info['lookups'] = {'gte': None, 'lte': None}
            elif isinstance(field, models.BooleanField):
                filter_info['html_type'] = 'checkbox'
                filter_info['lookups'] = {'iexact': None}
                filter_info['choices'] = ['True', 'False']
    
            available_filters.append(filter_info)
    
        return available_filters



    @staticmethod
    def validate_and_clean_filters(request_data, available_filters):
        '''
        Función para validar y limpiar los filtros que nos ayudará a asegurarnos de que solo
        se apliquen los filtros permitidos y limitar la cantidad de valores.

        parámetros:
        - request_data: datos enviados en la solicitud
        - available_filters: filtros disponibles previamente obtenidos
        '''
        clean_filters = {}

        for filtro_d in available_filters:
            campo = filtro_d['campo']
            if campo in request_data['filters']:
                # limpiamos el filtro
                clean_filters[campo] = {}
                for lookup in filtro_d['lookups']:
                    if lookup in request_data['filters'][campo]:
                        # vamos a poner un tope de 100 valores para evitar saturación
                        clean_filters[campo][lookup] = request_data['filters'][campo][lookup][:100]

        return clean_filters

    def get_char_and_text_fields(self, model):
        """
        Obtiene todos los campos de tipo CharField o TextField del modelo y sus campos relacionados.

        :param model: Modelo del cual obtener los campos.
        :return: Lista de nombres de campos de tipo CharField o TextField.
        """
        fields = []

        for field in model._meta.get_fields():
            if isinstance(field, (models.CharField, models.TextField)):
                fields.append(field.name)
            elif isinstance(field, ForeignKey):
                related_model = field.related_model
                related_fields = self.get_char_and_text_fields(related_model)
                fields.extend([f"{field.name}__{related_field}" for related_field in related_fields])

        return fields


    def get_related_char_and_text_fields(self, model):
        """
        Obtiene todos los campos de tipo CharField o TextField de los modelos relacionados a través de llaves foráneas.

        :param model: Modelo del cual obtener los campos relacionados.
        :return: Lista de nombres de campos de tipo CharField o TextField de modelos relacionados.
        """
        fields = []

        for field in model._meta.get_fields():
            if isinstance(field, ForeignKey):
                related_model = field.related_model
                related_fields = self.get_char_and_text_fields(related_model)
                fields.extend([f"{field.name}__{related_field}" for related_field in related_fields])

        return fields



    def get_available_columns(self, obj):
        '''
        Método para obtener las columnas disponibles a solicitar de un determinado modelo (para la utilización de filtros y exclusiones)

        parámetros:
        - obj: objeto de configuración de tabla dinámica
        '''
        available_columns = {}

        model = self.buscar_modelo(obj)
        if model is None:
            # En caso de que no se haya encontrado el modelo enviamos un diccionario vacío
            return available_columns

        available_columns = self.get_model_fields(model, set())
        return available_columns



    @staticmethod
    def get_model_fields(model, visited_models):
        '''
        Método recursivo para obtener los campos de un modelo, inclusive los relacionados, cuidando las relaciones muchos a muchos

        parámetros:
        - model: modelo del cual obtener las columnas
        - visited_models: conjunto para determinar si un modelo ya fue checkeado o no
        '''
        if model in visited_models:
            return {}

        # Una vez el modelo sea visitado lo guardamos en la lista
        visited_models.add(model)
        fields = {}

        for field in model._meta.get_fields():
            # Verificar si el campo debe ser excluido
            if exclude_pattern.search(field.name) and field.name != "id" and "modalidad" not in field.name.lower(): 
                continue

            if isinstance(field, ForeignKey):
                related_model = field.related_model
                related_fields = DynamicTable.get_model_fields(related_model, visited_models)
                for related_field_name, related_field_verbose_name in related_fields.items():
                    if not exclude_pattern.search(related_field_name):
                        fields[f"{field.name}__{related_field_name}"] = f"{related_field_verbose_name}"
            elif isinstance(field, ManyToManyField):
                fields[field.name] = field.verbose_name
            elif isinstance(field, ManyToOneRel):
                continue  # Omitir relaciones inversas
            else:
                fields[field.name] = field.verbose_name

        visited_models.remove(model)
        return fields


    @staticmethod
    def apply_filters(queryset, filters, exclude_filters):
        """
        Aplica filtros recursivamente a un queryset basado en un diccionario de filtros
        y exclusiones.
    
        :param queryset: Queryset original al que se le aplican los filtros.
        :param filters: Diccionario de filtros donde las claves son los campos y los valores son los criterios de filtro.
        :param exclude_filters: Diccionario de filtros de exclusión donde las claves son los campos y los valores son los criterios de filtro.
    
        :return: Queryset filtrado según los filtros y las exclusiones especificadas.
        """
        if not filters and not exclude_filters:
            return queryset
    
        q_objects = Q()
        exclude_q_objects = Q()
    
        # Aplicar filtros (OR dentro de un mismo campo, AND entre diferentes campos)
        for field, lookup_values in filters.items():
            field_q_objects = Q()
            for lookup, values in lookup_values.items():
                lookup_q_objects = Q()
                for value in values:
                    lookup_q_objects |= Q(**{f"{field}__{lookup}": value})
                field_q_objects &= lookup_q_objects  # AND dentro de un mismo campo
            q_objects &= field_q_objects  # AND entre diferentes campos
    
        # Aplicar filtros de exclusión (OR dentro de un mismo campo, AND entre diferentes campos)
        for field, lookup_values in exclude_filters.items():
            field_exclude_q_objects = Q()
            for lookup, values in lookup_values.items():
                lookup_exclude_q_objects = Q()
                for value in values:
                    lookup_exclude_q_objects |= Q(**{f"{field}__{lookup}": value})
                field_exclude_q_objects |= lookup_exclude_q_objects  # OR dentro de un mismo campo
            exclude_q_objects &= field_exclude_q_objects  # AND entre diferentes campos
    
        # Aplicar los filtros al queryset original
        queryset = queryset.filter(q_objects).exclude(exclude_q_objects)
    
        return queryset


    def retrieve_instance_data(self, instance):
        """
        Método para obtener todos los campos de la instancia y sus tablas relacionadas mediante foreign key.
    
        :param instance: Instancia del modelo.
        :return: Diccionario con todos los campos y sus valores.
        """
        data = {}
        try:
            self.get_instance_fields(instance, data)
        except Exception as e:
            pass
        return data

    def get_instance_fields(self, instance, data):
        """
        Método recursivo para obtener los campos de una instancia y sus relaciones.

        :param instance: Instancia del modelo.
        :param data: Diccionario para almacenar los campos y sus valores.
        """

        exclude_pattern = re.compile(r'id|staff|user|active|timestamp|^password$|^last_login$|^created_at$|^updated_at$|^usuario_ptr$|^groups$|^user_permissions$|^dynamic_form__nombre$|^dynamic_form__secciones$',re.IGNORECASE)

        for field in instance._meta.get_fields():
            if (exclude_pattern.search(field.name) and field.name != "id" and "modalidad" not in field.name.lower()) or isinstance(field, ManyToOneRel):
                continue
            try:
                field_value = getattr(instance, field.name, None)

                if isinstance(field, (ForeignKey, OneToOneField)):
                    if field_value:
                        related_data = {}
                        self.get_instance_fields(field_value, related_data)
                        data[field.name] = related_data
                    else:
                        data[field.name] = None
                elif isinstance(field, ManyToManyField):
                    data[field.name] = list(field_value.values_list('pk', flat=True))
                elif isinstance(field, (FileField, ImageField)):
                    data[field.name] = field_value.url if field_value else None
                else:
                    data[field.name] = field_value
            except AttributeError as e:
                data[field.name] = None
            except Exception as e:
                data[field.name] = str(e)


    def get_field(self, instance, field_name):
        """
        Obtiene el campo del modelo para el campo especificado, ya sea en el modelo principal o en un modelo relacionado.

        :param instance: Instancia del modelo.
        :param field_name: Nombre del campo, que puede ser en formato `campo__relacion`.
        :return: Campo del modelo si existe, de lo contrario None.
        """
        field_parts = field_name.split('__')
        current_instance = instance

        for i, part in enumerate(field_parts):
            try:
                # Obtener el campo del modelo actual
                field = current_instance._meta.get_field(part)

                # Si es un campo de relación, mover al siguiente nivel
                if isinstance(field, (ForeignKey, OneToOneField)):
                    if i == len(field_parts) - 1:
                        return field
                    current_instance = getattr(current_instance, part)
                else:
                    # El último campo en el path es el que queremos obtener
                    if i == len(field_parts) - 1:
                        return field
                    else:
                        raise ValueError(f"El campo '{part}' no es un campo de relación.")
            except FieldDoesNotExist:
                return None

        return None

    def update_field(self, instance, field_name, new_value):
        """
        Actualiza el campo del modelo especificado, ya sea en el modelo principal o en un modelo relacionado.

        :param instance: Instancia del modelo.
        :param field_name: Nombre del campo a actualizar, en formato `campo__relacion`.
        :param new_value: Nuevo valor para el campo.
        :return: True si se actualizó exitosamente, False de lo contrario.
        """
        field_parts = field_name.split('__')
        current_instance = instance

        for i, part in enumerate(field_parts):
            try:
                # Obtener el campo del modelo actual
                field = current_instance._meta.get_field(part)

                if isinstance(field, (ForeignKey, OneToOneField)):
                    # Si es un campo de relación y no es el último, mover a la instancia relacionada
                    if i == len(field_parts) - 1:
                        setattr(current_instance, part, new_value)
                        current_instance.full_clean()  # Validar antes de guardar
                        current_instance.save()
                        return True
                    current_instance = getattr(current_instance, part)
                else:
                    # Actualizar el campo si es el último en el path
                    if i == len(field_parts) - 1:
                        setattr(current_instance, part, new_value)
                        current_instance.full_clean()  # Validar antes de guardar
                        current_instance.save()
                        return True
                    else:
                        raise ValueError(f"El campo '{part}' no es un campo de relación.")
            except (FieldDoesNotExist, AttributeError):
                return False
            except ValidationError as e:
                return str(e)  # Devolver el error de validación como string

        return False

    def update_fields(self, instance, field_updates):
        """
        Actualiza múltiples campos del modelo especificado, ya sea en el modelo principal o en un modelo relacionado.

        :param instance: Instancia del modelo.
        :param field_updates: Diccionario de campos a actualizar en el formato {"column1": "new_value", "column2": "new_value"}.
        :return: True si todos los campos se actualizaron exitosamente, False de lo contrario.
        """
        errors = {}
        success = True

        for field_name, new_value in field_updates.items():
            result = self.update_field(instance, field_name, new_value)
            if result is not True:
                success = False
                errors[field_name] = result

        if not success:
            raise ValidationError(errors) # devolvemos un diccionario de errores surgidos durante las validaciones

        return success


    def update_registers(self, update_registers, model):
        '''
        Actualiza múltiples campos de múltiples registros del modelo específicado

        :param update_registers: Diccionario en el formato {"id_registro": {"column1": "new_value", "column2": "new_value"}}
        :return: True si todos los registros fueron actualizados de manera exitosa. False de lo contrario
        '''
        all_errors = {}
        overall_success = True

        for pk, field_updates in update_registers.items():
            try:
                instance = model.objects.get(pk=int(pk))
                # Intentar actualizar los campos de la instancia
                try:
                    success = self.update_fields(instance, field_updates)

                except ValidationError as e:
                    all_errors[pk] = str(e)  # Devolvemos el error de validación como string
                    overall_success = False

            except Exception as e:
                all_errors[pk] = str(e)
                overall_success = False

        if not overall_success:
            raise ValidationError(all_errors)  # Devolver un diccionario de errores surgidos durante las actualizaciones

        return overall_success


    def export_to_csv_and_zip(self, data):
        """
        Exporta los datos a un CSV y los archivos asociados a una estructura de directorios,
        y luego empaqueta todo en un archivo zip.
        """
        # Configurar los directorios temporales
        temp_dir = os.path.join(settings.BASE_DIR, 'temp_export')
        os.makedirs(temp_dir, exist_ok=True)
        files_dir = os.path.join(temp_dir, 'archivos')
        os.makedirs(files_dir, exist_ok=True)
        csv_file_path = os.path.join(temp_dir, 'reporte.csv')

        
        # Generación de CSV para múltiples solicitudes
        self.write_csv(data, csv_file_path)
        solicitudes_por_curp = {}

        for item in data:
            id_solicitud = item.get('id')
            solicitud = Solicitud.objects.get(id=id_solicitud)
            solicitante = solicitud.solicitante
            solicitante_curp = solicitante.curp
            if solicitante_curp not in solicitudes_por_curp:
                curp_dir = os.path.join(files_dir, f'solicitud_{solicitante_curp}')
                os.makedirs(curp_dir, exist_ok=True)
                solicitudes_por_curp[solicitante_curp] = curp_dir
            curp_dir = solicitudes_por_curp[solicitante_curp]
            solicitud_dir = os.path.join(curp_dir, f'solicitud_{id_solicitud}')
            os.makedirs(solicitud_dir, exist_ok=True)
            self.handle_files(solicitante, solicitud_dir)
            self.handle_responses(solicitud, solicitud_dir)

        # Crear el archivo ZIP
        return self.create_zip_response(temp_dir, csv_file_path)

    def write_csv(self, data, csv_file_path): 
        """Escribe los datos en un archivo CSV."""
        with open(csv_file_path, mode='w', newline='', encoding='utf-8') as csvfile:
            fieldnames = self.get_fieldnames(data)
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()

            if isinstance(data, list):
                writer.writerows(data)  # Escribir múltiples filas
            elif isinstance(data, dict):
                writer.writerow(data)  # Escribir una única fila
            else:
                raise ValueError("El formato de datos no es compatible para exportar a CSV.")


    def create_directories(self, files_dir, solicitante, solicitud_id):
        """Crea los directorios necesarios para la solicitud."""
        curp_dir = os.path.join(files_dir, f'solicitud_{solicitante.curp}')
        os.makedirs(curp_dir, exist_ok=True)
        solicitud_dir = os.path.join(curp_dir, f'solicitud_{solicitud_id}')
        os.makedirs(solicitud_dir, exist_ok=True)
        return solicitud_dir

    def handle_files(self, solicitante, solicitud_dir):
        """Maneja los archivos adjuntos del solicitante."""
        documentos = {
            'doc_constancia_sat': solicitante.datos_bancarios.doc_constancia_sat.name,
            'doc_estado_cuenta': solicitante.datos_bancarios.doc_estado_cuenta.name,
            'INE': solicitante.INE.name,
        }

        for key, value in documentos.items():
            file_dir = os.path.join(solicitud_dir, key)
            os.makedirs(file_dir, exist_ok=True)
            file_name = os.path.basename(value)
            file_path = os.path.join(file_dir, file_name)
            try:
                # Leer el contenido del archivo desde el almacenamiento predeterminado
                file_content = default_storage.open(value).read()
                with open(file_path, 'wb') as f:
                    f.write(file_content)
            except Exception as e:
                pass

    def handle_responses(self, solicitud, solicitud_dir):
        """Maneja las respuestas asociadas a la solicitud."""
        registros_secciones = RegistroSeccion.objects.filter(
            registro_formulario=solicitud.registro_formulario
        )
        respuestas_dir = os.path.join(solicitud_dir, 'respuestas')
        os.makedirs(respuestas_dir, exist_ok=True)

        responses = RDocumento.objects.filter(registro_seccion__in=registros_secciones)
        for response in responses:
            file_name = os.path.basename(response.valor.name)
            file_path = os.path.join(respuestas_dir, file_name)
            file_content = default_storage.open(response.valor.name).read()

            with open(file_path, 'wb') as f:
                f.write(file_content)


    def create_zip_response(self, temp_dir, csv_file_path):
        """Crea y devuelve el archivo ZIP."""
        zip_buffer = io.BytesIO()
        with ZipFile(zip_buffer, 'w') as zip_file:
            zip_file.write(csv_file_path, 'reporte.csv')

            for root, _, files in os.walk(temp_dir):
                for file in files:
                    if file != 'reporte.csv':
                        file_path = os.path.join(root, file)
                        zip_file.write(file_path, os.path.relpath(file_path, temp_dir))

        zip_buffer.seek(0)
        response = HttpResponse(zip_buffer, content_type='application/zip')
        response['Content-Disposition'] = 'attachment; filename="reporte.zip"'
        shutil.rmtree(temp_dir)
        return response

    def get_fieldnames(self, data):
        """
        Devuelve los nombres de los campos que se usarán en el CSV.
        Maneja tanto listas de diccionarios como un solo diccionario.
        """
        if not data:
            return []

        # Si es una lista, verificar que todos los elementos sean diccionarios
        if isinstance(data, list):
            if not all(isinstance(item, dict) for item in data):
                raise ValueError("Todos los elementos de la lista deben ser diccionarios")
            first_item = data[0]
        elif isinstance(data, dict):
            first_item = data
        else:
            raise ValueError("El formato de los datos no es compatible")

        return list(first_item.keys())


    def flatten_dict(self, d, parent_key='', sep='__'):
        """Aplana un diccionario anidado."""
        items = []
        for k, v in d.items():
            new_key = f"{parent_key}{sep}{k}" if parent_key else k
            if isinstance(v, dict):
                items.extend(self.flatten_dict(v, new_key, sep=sep).items())
            else:
                items.append((new_key, v))
        return dict(items)