from . import views
from django.urls import path
from django.contrib.auth import views as auth_views


app_name = 'administracion'
urlpatterns = [
    path('convocatoria/', views.AbrirCerrarConvocatoria.as_view(), name='convocatoria'),
    path('estilos/', views.ConfiguracionEstiloAPIView.as_view(), name='configuracion-default'),
    ]