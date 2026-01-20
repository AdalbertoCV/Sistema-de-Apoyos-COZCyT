from rest_framework.test import APITestCase
from rest_framework import status
from users.models import Usuario, Solicitante
from django.urls import reverse
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken

class MensajeTestCase(APITestCase):
    
    def setUp(self):
        # Crear un usuario común
        self.user = Usuario.objects.\
            create_user(curp='testuser',
                        password='testpassword',
                        email='usuario1@gmail.com',
                        nombre='usuario')
        
        # Crear un usuario administrador
        self.admin_user = Usuario.objects.\
            create_superuser(curp='adminuser', 
                        password='adminpassword',                         
                        email='usuarioAdmin@gmail.com',
                        nombre='Administrador')
        
        # Generar tokens JWT para el usuario común y administrador
        self.user_token = self.get_tokens_for_user(self.user)
        self.admin_token = self.get_tokens_for_user(self.admin_user)
        
        # URL para la vista usuario
        self.url = reverse('users:usuario_list_create')

    def get_tokens_for_user(self, user):
        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

    def test_usuario_lista_creacion_usuario_comun(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.user_token["access"]}')
        response = self.client.get(self.url)
        print(response.data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        # Aquí puedes agregar más aserciones según los datos que esperas en la respuesta

    def test_usuario_lista_creacion_administrador(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token["access"]}')
        response = self.client.get(self.url)
        print(response.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Añade aserciones adicionales según sea necesario para el rol de administrador
