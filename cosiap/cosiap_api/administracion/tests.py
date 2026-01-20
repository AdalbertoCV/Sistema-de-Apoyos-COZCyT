from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from users.models import Usuario, Municipio, Estado
from .models import Convocatoria

class ConvocatoriaTest(TestCase):
    ''' 
    Clase para probar la funcionalidad de cambio de estado de la convocatoria
    '''

    def setUp(self):
        """Configurar el entorno de prueba"""
        self.client = APIClient()
        self.usuario_data = {
            'curp': 'CEVA020423HGRRZDA8',
            'nombre': 'Adalberto',
            'email': 'adalc3488@gmail.com',
            'password': 'testpassword123'
        }
        self.usuario = Usuario.objects.create_superuser(**self.usuario_data)
        self.usuario.is_active = True
        self.usuario.is_staff = True
        self.usuario.save()

        # Iniciar sesión
        self.login_url = reverse('users:token_obtain')
        response = self.client.post(self.login_url, {
            'curp': self.usuario_data['curp'],
            'password': self.usuario_data['password']
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.access_token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')

        # Configurar cookie de refresh token
        refresh_token = response.cookies.get('refresh_token')
        if refresh_token:
            self.client.cookies['refresh_token'] = refresh_token.value


    def test_abrir_convocatoria(self):
        ''' Prueba para probar la apertura de una convocatoria'''

        url = reverse('administracion:convocatoria')

        data = {
            "nuevo_estado": True
        }

        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('success', response.data['messages'])
        self.assertEqual(response.data['messages']['success'][0], 'Estado de la convocatoria actualizado.')
        response = self.client.get(url)
        self.assertEqual(response.data['convocatoria_is_open'], True)

    def test_cerrar_convocatoria(self):
        url = reverse('administracion:convocatoria')

        data = {
            "nuevo_estado": False
        }

        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('success', response.data['messages'])
        self.assertEqual(response.data['messages']['success'][0], 'Estado de la convocatoria actualizado.')
        response = self.client.get(url)
        self.assertEqual(response.data['convocatoria_is_open'], False)
