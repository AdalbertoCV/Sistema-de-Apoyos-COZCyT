from . import views
from modalidades.views import ModalidadAPIView
from django.urls import path
from django.contrib.auth import views as auth_views


app_name = 'modalidades'
urlpatterns = [
    path('', ModalidadAPIView.as_view(), name='modalidades'),    
    path('<int:pk>/', ModalidadAPIView.as_view(), name='modalidades_pk'),   
]