from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from .models import DynamicFormat
from users.models import Usuario

class FormatoAPIViewTestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()

        # Crear un usuario admin para las pruebas
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

        # Crear un archivo de ejemplo para el formato
        self.pdf_file = SimpleUploadedFile("template1.pdf", b"%PDF-1.4 contenido del PDF")

        # Crear un objeto de DynamicFormat para pruebas
        self.dynamic_format = DynamicFormat.objects.create(nombre='Formato 1', template=self.pdf_file)

        # URL base de la API
        self.list_url = reverse('dynamic_formats:formatos')
        self.detail_url = reverse('dynamic_formats:formatos_pk', args=[self.dynamic_format.id])

    def test_get_formatos(self):
        # Prueba para obtener la lista de formatos
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_formato(self):
        # Prueba para crear un nuevo formato
        data = {
            'nombre': 'Nuevo Formato',
            'template': SimpleUploadedFile("template2.pdf", b"%PDF-1.4 contenido del PDF nuevo")
        }
        response = self.client.post(self.list_url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(DynamicFormat.objects.count(), 2)

    def test_create_formato_invalid_file(self):
        # Prueba para intentar crear un formato con un archivo no PDF
        data = {
            'nombre': 'Formato con archivo inválido',
            'template': SimpleUploadedFile("template3.txt", b"Contenido no PDF")
        }
        response = self.client.post(self.list_url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_formato(self):
        # Prueba para actualizar un formato existente
        data = {
            'nombre': 'Formato Actualizado',
            'template': SimpleUploadedFile("template_updated.pdf", b"%PDF-1.4 contenido actualizado")
        }
        response = self.client.put(self.detail_url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.dynamic_format.refresh_from_db()
        self.assertEqual(self.dynamic_format.nombre, 'Formato Actualizado')

    def test_delete_formato(self):
        # Prueba para eliminar un formato
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(DynamicFormat.objects.count(), 0)

