from . import views
from django.urls import path
from django.contrib.auth import views as auth_views


app_name = 'solicitudes'
urlpatterns = [ 
    path('', views.SolicitudAPIView.as_view(), name='solicitudes'), # lista de solicitudes para el admin 
    path('<int:pk>/', views.SolicitudAPIView.as_view(), name='solicitudes_pk'), # detalle de solicitud del admin o edicion para el admin
    path('solicitar/', views.SolicitarAPIView.as_view(), name='solicitar'), # crear nueva solicitud
    path('solicitar/<int:pk>/', views.SolicitarAPIView.as_view(), name='ver_editar_solicitud'), # se envía el pk de la solicitud a ver o a editar.
    path('historial/', views.HistorialAPIVIew.as_view(), name='historial'), 
    path('historial/<int:pk>/', views.HistorialAPIVIew.as_view(), name='historial_pk'),
    path('reportes/', views.ReportesSolicitudesAPIView.as_view(), name='reportes_solicitudes'),
    path('reportes/<int:pk>/', views.ReportesSolicitudesAPIView.as_view(), name='reportes_solicitudes_pk'),
    path('reportes/exportar/', views.ExportarReporteSolicitudes.as_view(), name='exportar_reportes'),
    path('reportes/exportar/<int:pk>/', views.ExportarReporteSolicitudes.as_view(), name='exportar_reportes_pk'),
    path('calificar/<int:pk>/', views.CalificarDocumento.as_view(), name='calificar_documentos'),
    path('subir-convenio/<int:pk>/', views.SubirConvenio.as_view(), name='subir_convenio_pk'),
    path('subir-minuta/<int:pk>/', views.SubirMinuta.as_view(), name='subir_minuta_pk'),
    path('subir-convenio/', views.SubirConvenio.as_view(), name='subir_convenio'),
    ]