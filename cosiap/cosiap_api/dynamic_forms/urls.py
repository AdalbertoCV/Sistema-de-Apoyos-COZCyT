from django.urls import path
from dynamic_forms.views import (
    OpcionAPIView, ElementoAPIView, SeccionAPIView, DynamicFormAPIView, FormularioRespuestaAPIView, RespuestasFormularioSolicitudesAPIView,
    DynamicFormsSeccionesAPIView, ElementosOpcionesAPIView, SeccionesElementosAPIView,
)

app_name = 'dynamic_forms'
urlpatterns = [
    path('opciones/', OpcionAPIView.as_view(), name='opciones'),
    path('opciones/<int:pk>/', OpcionAPIView.as_view(), name='opciones_pk'),
    
    path('elementos/<int:elemento>/opcion/<int:opcion>/', ElementosOpcionesAPIView.as_view(), name='elementos_opciones'),

    path('elementos/', ElementoAPIView.as_view(), name='elementos'),
    path('elementos/<int:pk>/', ElementoAPIView.as_view(), name='elementos_pk'),
    
    path('secciones/<int:seccion>/elementos/<int:elemento>', SeccionesElementosAPIView.as_view(), name='secciones_elementos'),

    path('secciones/', SeccionAPIView.as_view(), name='secciones'),
    path('secciones/<int:pk>/', SeccionAPIView.as_view(), name='secciones_pk'),

    path('<int:formulario>/secciones/<int:seccion>', DynamicFormsSeccionesAPIView.as_view(), name='dynamic_forms_secciones'),

    path('', DynamicFormAPIView.as_view(), name='dynamic_forms'),
    path('<int:pk>/', DynamicFormAPIView.as_view(), name='dynamic_forms_pk'),

    path('respuestas/', RespuestasFormularioSolicitudesAPIView.as_view(), name='solcitud_respuestas'), #FormularioRecord
    path('respuestas/<int:solicitud>/', RespuestasFormularioSolicitudesAPIView.as_view(), name='solicitud_respuestas_pk'),
]
