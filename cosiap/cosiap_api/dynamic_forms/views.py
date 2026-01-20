from common.views import BasePermissionAPIView
from rest_framework.response import Response
from rest_framework import status
from notificaciones.mensajes import Mensaje
from django.shortcuts import get_object_or_404
from dynamic_forms.models import (
    Opcion, Elemento, ElementosOpciones, Seccion, SeccionesElementos,
    DynamicForm, DynamicFormsSecciones, Respuesta
)
from .serializers import (
    OpcionSerializer, ElementoSerializer, ElementosOpcionesSerializer,
    SeccionSerializer, SeccionesElementosSerializer, DynamicFormSerializer,
    DynamicFormsSeccionesSerializer, RespuestaFormularioSerializer
)
from rest_framework.permissions import IsAuthenticated
from users.permisos import es_admin, primer_login
from solicitudes.models import Solicitud



class BaseFormAPIView(BasePermissionAPIView):
    model_class = None
    serializer_class = None
    genero_gramatical = False #False masculino, True Femenino
    str_simple = None    
    str_plural = None
    model_queryset = None

    required_attributes = [
            'model_class',
            'serializer_class',
            'str_simple',
            'str_plural',            
        ]

    permission_classes_create = [IsAuthenticated, es_admin]
    permission_classes_delete = [IsAuthenticated, es_admin]  
    permission_classes_list = [IsAuthenticated]    
    permission_classes_update = [IsAuthenticated, es_admin]

    def __init__(self):  
        if not self.model_queryset:
            self.model_queryset = self.model_class.objects.all()
        if not self.genero_gramatical:
            # Masculino            
            self.articulo_definido = "el"
            self.articulo_indefinido = "un"
            self.desinencia_singular = "o"
            self.desinencia_plural = "os"
        else:
            # Femenino            
            self.articulo_definido = "la"
            self.articulo_indefinido = "una"
            self.desinencia_singular = "a"
            self.desinencia_plural = "as"        
        self._check_attributes()
        super().__init__()        

    def _check_attributes(self):
        # Lista de atributos que deben ser verificados        
        
        for attr in self.required_attributes:
            value = getattr(self, attr, None)
            if value is None:
                raise ValueError(f'{attr} must be initialized')

    def get(self, request, pk=None, *args, **kwargs):               
        if pk:
            instance = get_object_or_404(self.model_class, pk=pk)
            serializer = self.serializer_class(instance)                      
        else:
            substring = request.query_params.get('q', None)
            if substring:
                instances = self.model_queryset.filter(nombre__icontains=substring)  
            else:
                instances = self.model_queryset
            serializer = self.serializer_class(instances, many=True)        
        
        response_data = {'data': serializer.data}        
        return Response(response_data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            response_data = {'data': serializer.data}
            Mensaje.success(response_data, f'{self.str_simple.capitalize()} cread{self.desinencia_singular} con éxito.')
            return Response(response_data, status=status.HTTP_201_CREATED)
        response_data = {'errors': serializer.errors}
        Mensaje.warning(response_data, f'No se pudo guardar {self.articulo_definido} {self.str_simple.lower()}.')
        Mensaje.error(response_data, serializer.errors)
        return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        instance = get_object_or_404(self.model_class, pk=pk)
        serializer = self.serializer_class(instance, data=request.data)
        if serializer.is_valid():
            serializer.save()
            response_data = {'data': serializer.data}
            Mensaje.success(response_data, f'{self.str_simple.capitalize()} actualizad{self.desinencia_singular} con éxito.')
            return Response(serializer.data, status=status.HTTP_200_OK)
        response_data = {'errors': serializer.errors}
        Mensaje.warning(response_data, f'No se pudo actualizar {self.articulo_definido} {self.str_simple.lower()}.')
        Mensaje.error(response_data, serializer.errors)
        return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):        
        instance = get_object_or_404(self.model_class, pk=pk)
        instance.delete()
        response_data = {}
        Mensaje.success(response_data, f'{self.str_simple.capitalize()} eliminad{self.desinencia_singular} con éxito')
        return Response(response_data, status=status.HTTP_204_NO_CONTENT)
    
# APIView para Opcion
class OpcionAPIView(BaseFormAPIView):
    model_class = Opcion    
    serializer_class = OpcionSerializer
    genero_gramatical = True #False masculino, True Femenino
    str_simple = 'Opción'
    str_plural = 'Opciones'    

# APIView para ElementosOpciones
class ElementosOpcionesAPIView(BaseFormAPIView):
    model_class = ElementosOpciones
    serializer_class = ElementosOpcionesSerializer
    genero_gramatical = True #False masculino, True Femenino
    str_simple = 'Relación Elemento Opción'
    str_plural = 'Relaciones Elemento Opción'

    def get(self, request, elemento, opcion):
        instance = get_object_or_404(ElementosOpciones, elemento_id=elemento, opcion_id=opcion)
        return super().get(request, pk=instance.pk)

    def post(self, request, elemento, opcion):       
        request.data['elemento'] = elemento
        request.data['opcion'] = opcion
        return super().post(request)

    def put(self, request, elemento, opcion):
        request.data['elemento'] = elemento
        request.data['opcion'] = opcion
        instance = get_object_or_404(ElementosOpciones, elemento_id=elemento, opcion_id=opcion)
        return super().put(request, pk=instance.pk)

    def delete(self, request, elemento, opcion):
        instance = get_object_or_404(ElementosOpciones, elemento_id=elemento, opcion_id=opcion)
        return super().delete(request, pk=instance.pk)
    

# APIView para Elemento
class ElementoAPIView(BaseFormAPIView):
    model_class = Elemento
    model_queryset = Elemento.objects.all().prefetch_related('elementosopciones_set__opcion')
    serializer_class = ElementoSerializer
    genero_gramatical = False #False masculino, True Femenino
    str_simple = 'Elemento'
    str_plural = 'Elementos'

# APIView para SeccionesElementos
class SeccionesElementosAPIView(BaseFormAPIView):
    model_class = SeccionesElementos
    serializer_class = SeccionesElementosSerializer
    genero_gramatical = True #False masculino, True Femenino
    str_simple = 'Relación Sección Elemento'
    str_plural = 'Relaciones Sección Elemento'    

    def get(self, request, seccion, elemento):
        instance = get_object_or_404(SeccionesElementos, seccion_id=seccion, elemento_id=elemento)
        return super().get(request, pk=instance.pk)

    def post(self, request, seccion, elemento):       
        request.data['seccion'] = seccion
        request.data['elemento'] = elemento        
        return super().post(request)

    def put(self, request, seccion, elemento):
        request.data['seccion'] = seccion
        request.data['elemento'] = elemento   
        instance = get_object_or_404(SeccionesElementos, seccion_id=seccion, elemento_id=elemento)
        return super().put(request, pk=instance.pk)

    def delete(self, request, seccion, elemento):
        instance = get_object_or_404(SeccionesElementos, seccion_id=seccion, elemento_id=elemento)
        return super().delete(request, pk=instance.pk)

# APIView para Seccion
class SeccionAPIView(BaseFormAPIView):
    model_class = Seccion
    model_queryset = Seccion.objects.all().prefetch_related('seccioneselementos_set__elemento__elementosopciones_set__opcion')    
    serializer_class = SeccionSerializer
    genero_gramatical = True #False masculino, True Femenino
    str_simple = 'Sección'
    str_plural = 'Secciones'

# APIView para DynamicFormsSecciones
class DynamicFormsSeccionesAPIView(BaseFormAPIView):
    model_class = DynamicFormsSecciones
    serializer_class = DynamicFormsSeccionesSerializer
    genero_gramatical = True #False masculino, True Femenino
    str_simple = 'Relación Formulario Sección'
    str_plural = 'Relaciones Formulario Sección'    

    def get(self, request, formulario, seccion):
        instance = get_object_or_404(DynamicFormsSecciones, dynamic_form_id=formulario, seccion_id=seccion)
        return super().get(request, pk=instance.pk)

    def post(self, request, formulario, seccion):       
        request.data['dynamic_form'] = formulario
        request.data['seccion'] = seccion             
        return super().post(request)

    def put(self, request, formulario, seccion):
        request.data['dynamic_form'] = formulario
        request.data['seccion'] = seccion   
        instance = get_object_or_404(DynamicFormsSecciones, dynamic_form_id=formulario, seccion_id=seccion)
        return super().put(request, pk=instance.pk)

    def delete(self, request, formulario, seccion):
        instance = get_object_or_404(DynamicFormsSecciones, dynamic_form_id=formulario, seccion_id=seccion)
        return super().delete(request, pk=instance.pk)

# APIView para DynamicForm
class DynamicFormAPIView(BaseFormAPIView):
    model_class = DynamicForm
    model_queryset = DynamicForm.objects.all().prefetch_related('dynamicformssecciones_set__seccion__seccioneselementos_set__elemento__elementosopciones_set__opcion')    
    serializer_class = DynamicFormSerializer
    genero_gramatical = False #False masculino, True Femenino
    str_simple = 'Formulario'
    str_plural = 'Formularios'

# APIView para Respuesta
class FormularioRespuestaAPIView(BaseFormAPIView):
    permission_classes_create = [IsAuthenticated, primer_login]
    permission_classes_delete = [IsAuthenticated, primer_login]  
    permission_classes_list = [IsAuthenticated, primer_login]    
    permission_classes_update = [IsAuthenticated, primer_login] 

    required_attributes = BaseFormAPIView.required_attributes + ['dynamic_form_source']

    serializer_class = RespuestaFormularioSerializer   
    dynamic_form_source = None
    genero_gramatical = False #False masculino, True Femenino
    str_simple = 'Formulario'
    str_plural = 'Formularios'

    def get(self, request, solicitud=None, *args, **kwargs):                       
        if solicitud:
            owner = get_object_or_404(self.model_class, pk=solicitud)
            serializer = self.serializer_class(owner, dynamic_form_source=self.dynamic_form_source)                      
        else:
            owners = self.model_queryset            
            serializer = self.serializer_class(owners, dynamic_form_source=self.dynamic_form_source, many=True)        
        
        response_data = {'data': serializer.data}        
        return Response(response_data, status=status.HTTP_200_OK)

    def post(self, request, solicitud):
        owner = get_object_or_404(self.model_class, pk=solicitud)
        serializer = self.serializer_class(owner, data=request.data, dynamic_form_source=self.dynamic_form_source)
        if serializer.is_valid():
            serializer.save()
            response_data = {'data': serializer.data}
            Mensaje.success(response_data, f'{self.str_simple.capitalize()} cread{self.desinencia_singular} con éxito.')
            return Response(response_data, status=status.HTTP_201_CREATED)
        response_data = {'errors': serializer.errors}
        Mensaje.warning(response_data, f'No se pudo guardar {self.articulo_definido} {self.str_simple.lower()}.')
        Mensaje.error(response_data, serializer.errors)
        return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, solicitud):
        owner = get_object_or_404(self.model_class, pk=solicitud)
        serializer = self.serializer_class(owner, data=request.data, dynamic_form_source=self.dynamic_form_source)
        if serializer.is_valid():
            serializer.save()
            response_data = {'data': serializer.data}
            Mensaje.success(response_data, f'{self.str_simple.capitalize()} actualizad{self.desinencia_singular} con éxito.')
            return Response(serializer.data, status=status.HTTP_200_OK)
        response_data = {'errors': serializer.errors}
        Mensaje.warning(response_data, f'No se pudo actualizar {self.articulo_definido} {self.str_simple.lower()}.')
        Mensaje.error(response_data, serializer.errors)
        return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, solicitud):        
        owner = get_object_or_404(self.owner, pk=solicitud)        
        response_data = {}
        Mensaje.success(response_data, f'{self.str_simple.capitalize()} eliminad{self.desinencia_singular} con éxito')
        return Response(response_data, status=status.HTTP_204_NO_CONTENT)


class RespuestasFormularioSolicitudesAPIView(FormularioRespuestaAPIView):
    model_class = Solicitud
    model_queryset = Solicitud.objects.all().prefetch_related('modalidad__dynamic_form')
    dynamic_form_source = 'modalidad__dynamic_form'
    