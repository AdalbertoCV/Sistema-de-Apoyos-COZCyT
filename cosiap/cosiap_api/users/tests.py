from django.test import TestCase
from rest_framework.test import APIClient
from django.urls import reverse
from rest_framework import status
from .models import Usuario, Solicitante, Municipio
from django.core.files.uploadedfile import SimpleUploadedFile
import os
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken

class UsuarioTest(TestCase):
    ''' 
    Clase para probar la funcionalidad de usuarios de la API.
    '''

    def setUp(self):
        ''' 
        Configuración del entorno de prueba
        '''

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

        self.login_url = reverse('users:token_obtain')
        response = self.client.post(self.login_url, {
            'curp': self.usuario_data['curp'],
            'password': self.usuario_data['password']
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.access_token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')

        refresh_token = response.cookies.get('refresh_token')
        if refresh_token:
            self.client.cookies['refresh_token'] = refresh_token.value

    def test_crear_usuario(self):
        ''' 
        Probamos que la creación de un usuario se realice de manera correcta.
        '''

        data = {
            'curp':'CEVA020223HGRRZDA8',
            'nombre':'OtroUsuario',
            'email':'34152734@uaz.edu.mx',
            'password':'anotherpassword',
            'confirmar_password':'anotherpassword'
        }

        url = reverse('users:usuarios')

        response = self.client.post(url, data, format = 'json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    
    def test_get_usuarios(self):
        ''' 
        Probamos la funcion de la obtencion de la tabla de usuarios
        '''

        url = reverse('users:usuarios')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['data']), 1)

    def test_get_usuario_1(self):
        ''' 
        Probamos la funcionalidad para obtener un usuario por pk
        '''

        url = reverse('users:usuarios_pk', args= [self.usuario.pk])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['curp'], 'CEVA020423HGRRZDA8')

    def test_update_usuario(self):
        '''
        Probamos la edición de un usuario
        '''

        url = reverse('users:usuarios_pk', args= [self.usuario.pk])
        data = {
            "field_updates":{
                "nombre": "Adalberto Cerrillo V."
            }
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.usuario.refresh_from_db()
        self.assertEqual(self.usuario.nombre, 'Adalberto Cerrillo V.')


    def test_delete_usuario(self):
        ''' 
        Probamos la eliminación de un usuario
        ''' 

        url = reverse('users:usuarios_pk', args= [self.usuario.pk])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    
class SolicitanteTest(TestCase):
    '''
    Clase de prueba para las funcionalidades del solicitante
    '''
    def setUp(self):
        ''' 
        Configuración del entorno de prueba
        '''



        self.client = APIClient()
        self.usuario_data = {
            'curp': 'CEVA020423HGRRZDA8',
            'nombre': 'Adalberto',
            'email': 'adalc3488@gmail.com',
            'password': 'testpassword123'
        }
        self.usuario = Usuario.objects.create_user(**self.usuario_data)
        self.usuario.is_active = True
        self.usuario.save()

        self.login_url = reverse('users:token_obtain')
        response = self.client.post(self.login_url, {
            'curp': self.usuario_data['curp'],
            'password': self.usuario_data['password']
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.access_token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')

        refresh_token = response.cookies.get('refresh_token')
        if refresh_token:
            self.client.cookies['refresh_token'] = refresh_token.value

        ine_file_path = os.path.join(settings.MEDIA_ROOT, 'protected_uploads/INE_files', 'test.png')
        with open(ine_file_path, 'rb') as ine_file:
            ine_file_data = ine_file.read()
        
        self.ine_uploaded_file = SimpleUploadedFile(
            name='test.png',
            content=ine_file_data,
            content_type='image/png'
        )


    def test_crear_solicitante_datos_completos(self):
        ''' 
        Prueba de la creación correcta de un solicitante 
        '''

        data = {
            "ap_paterno": "Evans",
            "ap_materno": "Vargas",
            "telefono": "1234567890",
            "RFC": "CEVA0204237E4",
            "direccion": "Calle Falsa 123",
            "codigo_postal": "12345",
            "municipio": Municipio.objects.get(pk=1).pk,
            "poblacion": "Test Poblacion",
            "INE": self.ine_uploaded_file,  
        }

        url = reverse('users:solicitantes')
        response = self.client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    
    def test_crear_solicitante_datos_incompletos(self):
        '''
        Prueba del comportamiento de la creación en caso de datos incompletos
        '''

        data = {
            "ap_paterno": "Evans",
            "ap_materno": "Vargas",
            "RFC": "CEVA0204237E4",
            "codigo_postal": "12345",
            "municipio": Municipio.objects.get(pk=1).pk,
            "poblacion": "Test Poblacion",
            "INE": self.ine_uploaded_file,  
        }

        url = reverse('users:solicitantes')
        response = self.client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


    def test_update_solicitante(self):
        ''' 
        Probar la funcionalidad de atualizacion de un solicitante
        '''
        
        solicitante = Solicitante.objects.create(
            pk= self.usuario.pk,
            curp=self.usuario.curp,
            email=self.usuario.email,
            nombre=self.usuario.nombre,
            is_active=True,
            ap_paterno="Evans",
            ap_materno="Vargas",
            telefono="1234567890",
            RFC="CEVA0204237E4",
            direccion="Calle Falsa 123",
            codigo_postal="12345",
            municipio=Municipio.objects.get(id=1),
            poblacion="Test Poblacion", 
            INE=self.ine_uploaded_file,  
            password=self.usuario.password
        )
        solicitante.save()

        url = reverse('users:solicitantes_pk', args= [solicitante.pk])
        data = {
            "field_updates":{
                "nombre": "Adalberto Cerrillo V."
            }
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        solicitante.refresh_from_db()
        self.assertEqual(solicitante.nombre, 'Adalberto Cerrillo V.')