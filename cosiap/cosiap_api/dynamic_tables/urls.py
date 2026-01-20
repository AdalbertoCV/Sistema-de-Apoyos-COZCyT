from django.urls import path
from .views import ReporteAPIView, Exportar_CSV

app_name = 'dynamic-tables'
urlpatterns = [
    path('', ReporteAPIView.as_view(), name='reportes'),
    path('<int:pk>/', ReporteAPIView.as_view(), name='reportes_pk'),
    path('exportar/', Exportar_CSV.as_view(), name='exportar_pk'),
] 