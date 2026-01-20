from rest_framework import serializers
from rest_framework.fields import empty
from rest_framework.exceptions import ValidationError
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import models
from dynamic_forms.models import (
    Opcion, Elemento, ElementosOpciones, Seccion, SeccionesElementos,
    DynamicForm, DynamicFormsSecciones, RegistroSeccion, Respuesta, RNumerico,
    RTextoCorto, RTextoParrafo, RHora, RFecha, ROpcionMultiple, RCasillas,
    RDesplegable, RDocumento, RegistroFormulario
)
from django.core.validators import MinLengthValidator, MaxLengthValidator
from django.contrib.contenttypes.models import ContentType
from django.db.models import Prefetch
from django.db.models import OneToOneField

class BaseDynamicFormSerializer(serializers.ModelSerializer):      
    def __str__(self):
        # Representa la clase y el objeto relacionado si existe
        instance_str = f"{self.instance}" if self.instance else "No instance"
        return f"{self.__class__.__name__}({instance_str})"

# Serializer para Opcion
class OpcionSerializer(BaseDynamicFormSerializer):
    class Meta:
        model = Opcion
        fields = '__all__'


class ElementosOpcionesSerializer(BaseDynamicFormSerializer):
    opcion = serializers.PrimaryKeyRelatedField(
        queryset=Opcion.objects.all()        
    )
    elemento = serializers.PrimaryKeyRelatedField(
        queryset=Elemento.objects.all(),
        write_only=True
    )

    class Meta:
        model = ElementosOpciones
        fields = ['elemento','opcion','orden']     
    
    def to_representation(self, instance):        
        representation = super().to_representation(instance)          
        combined_representation = OpcionSerializer(instance.opcion).data
        combined_representation['orden'] = representation['orden']
        return combined_representation    


class ElementoSerializer(BaseDynamicFormSerializer):
    opciones = ElementosOpcionesSerializer(source='elementosopciones_set', many=True, read_only=True)

    class Meta:
        model = Elemento
        fields = '__all__'      

    def to_representation(self, instance):        
        representation = super().to_representation(instance)                
        opciones_dict = { item_data['id']: item_data for item_data in representation.pop('opciones', []) }                
        representation['opciones'] = opciones_dict
        return representation
    
    

# Serializer para SeccionesElementos
class SeccionesElementosSerializer(BaseDynamicFormSerializer):
    elemento = serializers.PrimaryKeyRelatedField(
        queryset=Elemento.objects.all()
    )
    seccion = serializers.PrimaryKeyRelatedField(
        queryset=Seccion.objects.all(),
        write_only=True
    )

    class Meta:
        model = SeccionesElementos
        fields = ['seccion','elemento','orden']

    def to_representation(self, instance):        
        representation = super().to_representation(instance)          
        combined_representation = ElementoSerializer(instance.elemento).data
        combined_representation['orden'] = representation['orden']
        return combined_representation    

# Serializer para Seccion
class SeccionSerializer(BaseDynamicFormSerializer):
    elementos = SeccionesElementosSerializer(source='seccioneselementos_set', many=True, read_only=True)

    class Meta:
        model = Seccion
        fields = '__all__'    

    def to_representation(self, instance):        
        representation = super().to_representation(instance)                
        elementos_dict = { item_data['id']: item_data for item_data in representation.pop('elementos', []) }                
        representation['elementos'] = elementos_dict
        return representation
    

# Serializer para DynamicFormsSecciones
class DynamicFormsSeccionesSerializer(BaseDynamicFormSerializer):
    seccion = serializers.PrimaryKeyRelatedField(
        queryset=Seccion.objects.all()        
    )
    dynamic_form = serializers.PrimaryKeyRelatedField(
        queryset=DynamicForm.objects.all(),
        write_only=True
    )

    class Meta:
        model = DynamicFormsSecciones
        fields = ['dynamic_form', 'seccion','orden']    

    def to_representation(self, instance):        
        representation = super().to_representation(instance)          
        combined_representation = SeccionSerializer(instance.seccion).data
        combined_representation['orden'] = representation['orden']
        return combined_representation    

# Serializer para DynamicForm
class DynamicFormSerializer(BaseDynamicFormSerializer):
    secciones = DynamicFormsSeccionesSerializer(source='dynamicformssecciones_set', many=True, read_only=True)

    class Meta:
        model = DynamicForm
        fields = '__all__'    

    def to_representation(self, instance):        
        representation = super().to_representation(instance)                
        secciones_dict = { item_data['id']: item_data for item_data in representation.pop('secciones', []) }                
        representation['secciones'] = secciones_dict
        return representation
    


###RESPUESTAS

class DynamicModelSerializer(serializers.ModelSerializer):
    def __init__(self, *args, **kwargs):
        # Obtener la instancia o queryset y el model_class
        instance_or_queryset = args[0] if args else None              
        if isinstance(instance_or_queryset, models.QuerySet):
            model_class = instance_or_queryset.model        
        elif instance_or_queryset is not None:
            model_class = type(instance_or_queryset)
        else:
            # Si no hay ni queryset ni instancia, intentar obtener model_class de kwargs
            model_class = kwargs.pop('model_class', None)        
        # Verificar si model_class está definido
        if not model_class:
            raise ValueError("El argumento 'model_class' es obligatorio y no fue proporcionado ni se puede obtener de la instancia.")
        
        # Establecer el modelo en Meta.model
        self.Meta.model = model_class        
        # Llamar al constructor de la clase base
        super().__init__(*args, **kwargs)

    class Meta:
        model = None
        fields = '__all__'


RESPUESTA_MODELOS = {
    'RNumerico': RNumerico,
    'RTextoCorto': RTextoCorto,
    'RTextoParrafo': RTextoParrafo,
    'RHora': RHora,
    'RFecha': RFecha,
    'ROpcionMultiple': ROpcionMultiple,
    'RCasillas': RCasillas,
    'RDesplegable': RDesplegable,
    'RDocumento': RDocumento,
}

class RespuestaFormularioSerializer(DynamicModelSerializer):    
    '''
        Argumentos: 
        - dynamic_form_source (lookup de donde se obtendra la referencia al formulario dinamico en base a la instancia)

        Maneja representaciones con la estructura:
        Instancia o lista de diccionarios que representan un formulario:
        data(formulario) = {
            id: #
            secciones: {
                #(id): {
                    id: #
                    ...atributos del elemento: #
                    elementos: {
                        #(id): {
                            id: #
                            ...atributos del elemento: #                            
                            respuesta: {
                                id: #
                                registro_seccion (id): #
                                valor: #
                            }
                        }
                    }
                    registros: [  #Solo si la seccion es de tipo "Lista" se generara este atributo con la losta de registros y sus repuestas
                        id: # (id registro_seccion)
                        respuesta: {
                            id: #
                            registro_seccion (id): #
                            valor: #
                        }
                    ]
                }
            }
        }
    '''
    forms_prefetch_string = 'dynamicformssecciones_set__seccion__seccioneselementos_set__elemento__elementosopciones_set__opcion'

    def __init__(self, *args, **kwargs):
        # Verificar si el argumento 'dynamic_form_source' está presente en kwargs
        if 'dynamic_form_source' not in kwargs:
            raise ValueError("El argumento 'dynamic_form_source' es obligatorio y no fue proporcionado.")        
        self.dynamic_form_source = kwargs.pop('dynamic_form_source')        
        # Llamar al constructor de la clase base
        super().__init__(*args, **kwargs)        
        self.inicializar_cache()

    def inicializar_cache(self):
        #generar el cache de la configuracion de los formularios que se uzaran, en base a la instancia
        self.forms_cache = None
        self.registros_respuestas_cache = None
        #si la instancia es un queryset:

        one_to_one_field_name = None         
        owner_one_to_one_field_name = None         
        for field in self.Meta.model._meta.get_fields():
            if isinstance(field, OneToOneField) and field.related_model == RegistroFormulario:
                one_to_one_field_name = getattr(field, 'related_name', None)
                owner_one_to_one_field_name = getattr(field, 'name', None)
                if not one_to_one_field_name:
                    one_to_one_field_name = self.Meta.model._meta.model_name
                break
                    
        if one_to_one_field_name is None:
            raise ValueError("No se encontró un campo OneToOneField relacionado con RegistroFormulario")
        if owner_one_to_one_field_name is None:
            raise ValueError("No se pudo obtener el nombre de un campo OneToOneField relacionado con RegistroFormulario")

        self.one_to_one_field_name = one_to_one_field_name
        self.owner_one_to_one_field_name = owner_one_to_one_field_name

        if isinstance(self.instance, models.QuerySet):            
            form_ids = self.instance.values_list(self.dynamic_form_source, flat=True)            
            form_filter_kwargs = {'pk__in':form_ids}   
            
            owners = self.instance.values_list('pk', flat=True)                       
            respuesta_filter_kwargs = {f"registro_seccion__registro_formulario__{one_to_one_field_name}__in": owners}
            
            
        elif self.instance is not None:                     
            form_id = self.get_attr_with_lookup(self.instance, self.dynamic_form_source).pk
            form_filter_kwargs = {'pk':form_id}   

            owner = self.instance.pk
            respuesta_filter_kwargs = {f"registro_seccion__registro_formulario__{one_to_one_field_name}": owner}
            
        qs = DynamicForm.objects.filter(**form_filter_kwargs).prefetch_related(self.forms_prefetch_string)
        self.forms_cache = {form.id: form for form in qs}
           
        # Prefetch para las respuestas
        qs = Respuesta.objects.filter(**respuesta_filter_kwargs).select_subclasses().select_related(
            'elemento', 
            'registro_seccion',
            'registro_seccion__seccion',
            'registro_seccion__registro_formulario',
            f'registro_seccion__registro_formulario__{self.one_to_one_field_name}'
            )
        qs = list(qs) 
        rs_cache = {}
        for respuesta in qs:
            #(respuesta = INstancia de RNUmerico)            
            # Acceder a las claves necesarias y asignar los valores de los diccionarios   
            registro_seccion = respuesta.registro_seccion  
            registro_formulario = registro_seccion.registro_formulario
            owner = getattr(registro_formulario, self.one_to_one_field_name, None)             
            seccion_tipo = registro_seccion.seccion.tipo
            seccion_id = registro_seccion.seccion_id
            elemento_id = respuesta.elemento_id                
            if owner.pk not in rs_cache:
                rs_cache[owner.pk] = {'instance': registro_formulario}                                             
            if seccion_tipo == Seccion.Tipo.LISTA:
                if seccion_id not in rs_cache[owner.pk]:                    
                    rs_cache[owner.pk][seccion_id] = {}                                           
                if registro_seccion.pk not in rs_cache[owner.pk][seccion_id]:
                    rs_cache[owner.pk][seccion_id][registro_seccion.pk] = {'instance': registro_seccion}
                rs_cache[owner.pk][seccion_id][registro_seccion.pk][elemento_id] = respuesta
            else:
                if seccion_id not in rs_cache[owner.pk]:                    
                    rs_cache[owner.pk][seccion_id] = {'instance': registro_seccion}   
                rs_cache[owner.pk][seccion_id][elemento_id] = respuesta
        self.registros_respuestas_cache = rs_cache        

    @staticmethod
    def get_attr_with_lookup(instance, lookup):
        attr = instance
        for field in lookup.split('__'):
            attr = getattr(attr, field, None)
            if attr is None:
                break
        return attr


    def to_representation(self, instance):            
        '''
            instance (instancia o queryset del owner de las respuestas)
        '''
        if hasattr(self, '_validated_data'):
            return self.validated_data                
            
        #obtenemos la estructura del formulario  
        form_id = self.get_attr_with_lookup(instance, self.dynamic_form_source).pk        
        form_data = {}
        #'''
        form_data = DynamicFormSerializer(self.forms_cache[form_id]).data
        #agregamos las representaciones de las respuestas a estos.
        for seccion in form_data['secciones'].values():
            r_forulario_dict = self.registros_respuestas_cache.get(instance.pk, {})            
            r_seccion_dict = r_forulario_dict.get(seccion['id'], {})
            if seccion['tipo'] == Seccion.Tipo.LISTA:
                r_secciones = r_forulario_dict.get(seccion['id'], {})
                seccion['registros'] = {}
                for r_seccion_dict in r_secciones.values():
                    r_s_id = r_seccion_dict.get('instance', None)      
                    r_s_id = r_s_id.pk if r_s_id else None
                    registro = {
                        'id': r_s_id, 
                        'respuestas': [
                            DynamicModelSerializer(r_seccion_dict.get(elemento['id'], None)).data 
                            if r_seccion_dict and r_seccion_dict.get(elemento['id'], None) else {}
                            for elemento in seccion['elementos'].values()
                        ]
                    }
                    seccion['registros'][registro['id']] = registro

                r_seccion_dict = None   
            for elemento in seccion['elementos'].values():                
                respuesta = r_seccion_dict.get(elemento['id'], None) if r_seccion_dict else None
                if respuesta:
                    elemento['respuesta'] = DynamicModelSerializer(respuesta).data
                else:
                    elemento['respuesta'] = {}
        #'''
        return form_data
    

    def to_internal_value(self, data):
        if not isinstance(data, dict):
            raise ValidationError("El formulario debe ser un diccionario.")
                
        if not isinstance(self.instance, models.Model):
            raise ValidationError("La instancia debe ser una instancia de Modelo.")
        
        #Obtenemos la representacion del formulario existente de el cache
        internal_data = self.to_representation(instance=self.instance)

        '''
        respuesta_cache = self.registros_respuestas_cache.get(self.instance.pk, {}).get(seccion_id, {}).get(elemento_id, respuesta_model_class(registro_seccion=None))
        respuesta_serializer = DynamicModelSerializer(respuesta_cache, data=respuesta_data)
        respuesta_serializer.is_valid(raise_exception=True)
        '''
        return {}# internal_data

    def run_validation(self, data=empty):
        """
        Sobreescribir el reun_validations para que no ejecute las validaciones de campos automaticas de los campos del Modelo de la instancia
        """
        value = self.to_internal_value(data)
        try:            
            value = self.validate(value)
            assert value is not None, '.validate() should return the validated data'
        except (ValidationError, DjangoValidationError) as exc:
            raise ValidationError(detail=serializers.as_serializer_error(exc))

        return value
    
    def validate(self, data):
        # Validaciones adicionales a nivel de todo el objeto        
        return data

    def create(self, validated_data):
        # Aquí puedes manejar cómo se crea una nueva instancia basada en los datos validados.
        # Como es un serializer custom, puedes manejar la creación como quieras.
        return self.instance

    def update(self, instance, validated_data):
        # Similarmente, manejar cómo se actualiza la instancia.
        
        return self.instance