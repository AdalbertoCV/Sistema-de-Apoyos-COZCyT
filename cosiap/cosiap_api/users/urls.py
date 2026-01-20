from . import views
from django.urls import path
from django.contrib.auth import views as auth_views
from .views import CustomTokenObtainPairView, CustomTokenRefreshView
from .admin_views import AdminAPIView


app_name = 'users'
urlpatterns = [  
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('uid/', views.UserID.as_view(), name='user_id'),
    path('user-is-admin/', views.UserIsStaff.as_view(), name='user_staff'),
    path('user-complete-data/', views.SolicitanteDatosCompletos.as_view(), name='user_complete_data'),
    path('logout/', views.LogoutAPIView.as_view(), name='logout'),

    path('municipios/', views.RetreiveMunicipioAPIView.as_view(), name='municipios'),
    path('estados/', views.RetreiveEstadoAPIView.as_view(), name='estados'),

    path('', views.UsuarioAPIView.as_view(), name = 'usuarios'),  
    path('<int:pk>/', views.UsuarioAPIView.as_view(), name = 'usuarios_pk'), 
    path('solicitantes/', views.SolicitanteAPIView.as_view(), name = 'solicitantes'), 
    path('solicitantes/<int:pk>', views.SolicitanteAPIView.as_view(), name = 'solicitantes_pk'), 
    path('datos-bancarios/', views.DatosBancariosAPIView.as_view(), name = 'datos_bancarios'), 
    path('datos-bancarios/<int:pk>', views.DatosBancariosAPIView.as_view(), name = 'datos_bancarios_pk'),  
    path('verificar-correo/<str:uidb64>/<str:token>/', views.VerificarCorreo.as_view(), name='verificar_correo'),
    path('restablecer-password/', views.ResetPassword.as_view(), name='reset_password'),
    path('nueva-password/<str:uidb64>/<str:token>/', views.NuevaPassword.as_view(), name='nueva_password'),
    path('administradores/',  AdminAPIView.as_view() , name = 'administradores'), 
    path('administradores/<int:pk>',  AdminAPIView.as_view() , name = 'administradores_pk'), 
    path('descargar-archivo/',  views.FileDownloadAPIView.as_view() , name = 'descargar_archivo'), 
]