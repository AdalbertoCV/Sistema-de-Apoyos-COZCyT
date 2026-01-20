from django.urls import path
from dynamic_formats import views

app_name = 'dynamic_formats'

urlpatterns = [
    path('', views.FormatoAPIView.as_view(), name='formatos'),
    path('convenio/', views.FormatoConvenio.as_view(), name='formato_convenio'),
    path('minuta/', views.FormatoMinuta.as_view(), name='formato_minuta'),
    path('<int:pk>/', views.FormatoAPIView.as_view(), name='formatos_pk'),
    path('download/<int:pk>/', views.DescargarFormatoView.as_view(), name='descargar_formato'),
    path('descargar-formato/<int:pk>', views.descargar_formato, name='descargar_formato_admin'),
    path('manual/', views.descarga_manual, name='descargar_manual'),
]