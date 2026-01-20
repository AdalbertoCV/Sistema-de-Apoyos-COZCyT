from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from users.models import Usuario, Solicitante, Municipio
from .models import Solicitud
from django.utils import timezone
from common import custom_tests as c_tests
import json
from django.core.files import File
import os
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken


class HistorialAPIVIewTests(TestCase):
    ine_file_path = os.path.join(settings.MEDIA_ROOT, 'protected_uploads/INE_files', 'test.png')

    def setUp(self):
        """Configurar el entorno de prueba"""
        self.client = APIClient()
        self.usuario_data = {
            'curp': 'CEVA020423HGRRZDA8',
            'nombre': 'Adalberto',
            'email': 'adalc3488@gmail.com',
            'password': 'testpassword123'
        }
        self.usuario = Usuario.objects.create_user(**self.usuario_data)
        self.usuario.is_active = True
        self.usuario.is_staff = False
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

        # Crear solicitante
        with open(self.ine_file_path, 'rb') as ine_file:
            self.solicitante = Solicitante.objects.create(
                pk = self.usuario.pk,
                password = 'testpassword123',
                curp="CEVA020423HGRRZDA9",
                email="ceva@example.com",
                nombre="Adalberto",
                ap_paterno="Evans",
                ap_materno="Vargas",
                telefono="1234567890",
                RFC="CEVA0204237E4",
                direccion="Calle Falsa 123",
                codigo_postal="12345",
                municipio=Municipio.objects.get(id=1),
                poblacion="Test Poblacion",
                datos_bancarios=None,
                INE=File(ine_file),
                is_active=True,
            )
            self.solicitante.save()

        # Crear solicitudes
        self.solicitud1 = Solicitud.objects.create(
            solicitante=self.solicitante,
            status="Pendiente",
            solicitud_n="001",
            monto_solicitado=1000,
            monto_aprobado=800,
            observacion="Observación 1",
        )

        self.solicitud2 = Solicitud.objects.create(
            solicitante=self.solicitante,
            status="Aprobado",
            solicitud_n="002",
            monto_solicitado=1500,
            monto_aprobado=1200,
            observacion="Observación 2",
        )


    def test_get_historial(self):
        """
        Probar que se pueden recuperar todas las solicitudes del historial con una solicitud GET
        """
        url = reverse('solicitudes:historial')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)  # Verificar que hay 2 solicitudes

    def test_get_historial_sin_solicitudes(self):
        """
        Probar el caso donde no hay solicitudes en el historial
        """
        Solicitud.objects.all().delete()  # Borrar todas las solicitudes
        url = reverse('solicitudes:historial')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(response.data,  {'messages': {'error': ['No existen solicitudes en el historial.']}})

    def test_get_historial_usuario_no_solicitante(self):
        """
        Probar el caso donde el usuario no es un solicitante
        """
        otro_usuario = Usuario.objects.create_user(
            curp='ANOT009876HGRRZDA9',
            nombre='OtroUsuario',
            email='otro@example.com',
            password='anotherpassword'
        )
        refresh = RefreshToken.for_user(otro_usuario)
        access_token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

        url = reverse('solicitudes:historial')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_historial_admin(self):
        ''' 
        Probamos el caso en el que un administrador recupera el historial de un solicitante
        '''

        user_admin = Usuario.objects.create_superuser(
            curp='ANOT009876HGRRZDA9',
            nombre='OtroUsuario',
            email='otro@example.com',
            password='anotherpassword',
        )

        refresh = RefreshToken.for_user(user_admin)
        access_token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

        url = reverse('solicitudes:historial_pk',args=[self.solicitante.pk])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2) 
