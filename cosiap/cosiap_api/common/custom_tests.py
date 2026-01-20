from rest_framework.test import APITestCase, APIRequestFactory, force_authenticate, APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from users.models import Usuario, Solicitante
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from common.views import BasePermissionAPIView
from rest_framework.response import Response
from django.urls import reverse
from django.test import tag
from urllib.parse import urlencode
from django.db import transaction

from users.permisos import es_admin, primer_login
from rest_framework.permissions import AllowAny, IsAuthenticated

class BasePerUserTestCase(APITestCase):
    '''
    Clase de APITestCase con configuracion por defecto para hacer tests con los
    distintos tipos de Usuario en el sistema

    Atributos: 

    - self.user (Usuario comun, sin permisos de administrador)
    - self.solicitante_user (Usuario inicializado como Solicitante)
    - self.admin_user (Usuario Administrador)

    - self.user_token
    - self.admin_token
    - self.solicitante_token

    metodos nuevos: 
    - perform_request() (Funcion de atajo para ejecutar una request y obtener una response)

    '''
    
    #metodo para resetear atributos para uso en subTests
    def reset(self):
        pass

    def setUp(self):
        self.reset()
        self.factory = APIRequestFactory()

        self.user = Usuario.objects.create_user(
            curp='testuser',
            password='testpassword',
            email='usuario1@gmail.com',
            nombre='usuario'
        )

        self.admin_user = Usuario.objects.create_superuser(
            curp='adminuser',
            password='adminpassword',
            email='usuarioAdmin@gmail.com',
            nombre='Administrador'
        )

        self.solicitante_user = Solicitante.objects.create(
            curp='solicitanteuser',
            password='solicitantepassword',
            email='solicitante@gmail.com',
            nombre='Solicitante',
            ap_paterno='Marquez',
            telefono='0000000001',
            RFC='1234567890123',  # Ajustar tipo de dato
            direccion='Calle sin Nombre',
            codigo_postal='89890',  # Ajustar tipo de dato
            municipio_id=2,
            poblacion=5,
            INE='awdawd'
        )

        self.user_token = self.get_tokens_for_user(self.user)
        self.admin_token = self.get_tokens_for_user(self.admin_user)
        self.solicitante_token = self.get_tokens_for_user(self.solicitante_user)

    def get_tokens_for_user(self, user):
        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

    def perform_request(self, method, url_name, url_kwargs=None, query_params=None, token=None, user=None, data=None, is_multipart=False):
        """
        Realiza una solicitud a la vista especificada utilizando el método HTTP indicado.
        
        Parameters:
        - method (HTTP method ('get', 'post', 'put', 'patch', 'delete').)
        - url_name (Name of the URL to perform the request.)
        - url_kwargs (Dictionary of URL keyword arguments.)
        - token (Authentication token.)
        - user (User making the request.)
        - data (Data to be sent with the request (default is None).)
        - is_multipart (Boolean indicating if the request is multipart (default is False).)
        
        Returns:
        - response: The response from the request.
        """
        client = APIClient()
        if token:
            client.force_authenticate(user=user, token=token['access'])

        url = reverse(url_name, kwargs=url_kwargs)
        if query_params:
            query_string = urlencode(query_params)
            url = f"{url}?{query_string}"
        method = method.lower()

        if is_multipart:
            format_type = 'multipart'
        else:
            format_type = 'json'

        if method == 'get':
            response = client.get(url, data, format=format_type)
        elif method == 'post':
            response = client.post(url, data, format=format_type)
        elif method == 'put':
            response = client.put(url, data, format=format_type)
        elif method == 'patch':
            response = client.patch(url, data, format=format_type)
        elif method == 'delete':
            response = client.delete(url, data, format=format_type)
        else:
            raise ValueError(f"Unsupported HTTP method: {method}")

        return response
    

class PermissionTestCase(BasePerUserTestCase):
    """
    Clase base para tests de permisos en vistas de Django Rest Framework.

    Esta clase permite definir y ejecutar tests de permisos para diferentes tipos de usuarios
    (común, solicitante, administrador y anónimo) en diversas vistas y métodos HTTP.

    Atributos de clase:
    - url_name: El nombre de la URL que se testeará.
    - methods_responses: Un diccionario que define los códigos de respuesta esperados para
      cada tipo de usuario y método HTTP. La estructura es la siguiente:
        {
            'get': {
                'user': status.HTTP_200_OK,
                'admin': status.HTTP_200_OK,
                'solicitante': status.HTTP_200_OK,
                'anonymous': status.HTTP_403_FORBIDDEN
            },
            'post': {
                'user': status.HTTP_403_FORBIDDEN,
                'admin': status.HTTP_400_BAD_REQUEST,
                'solicitante': status.HTTP_403_FORBIDDEN,
                'anonymous': status.HTTP_403_FORBIDDEN
            },
            'put': {
                'user': status.HTTP_403_FORBIDDEN,
                'admin': status.HTTP_200_OK,
                'solicitante': status.HTTP_403_FORBIDDEN,
                'anonymous': status.HTTP_403_FORBIDDEN
            },
            'delete': {
                'user': status.HTTP_403_FORBIDDEN,
                'admin': status.HTTP_204_NO_CONTENT,
                'solicitante': status.HTTP_403_FORBIDDEN,
                'anonymous': status.HTTP_403_FORBIDDEN
            }
        }

    Métodos:
    - get_url_kwargs(self): Devuelve los argumentos de la URL necesarios para las solicitudes.
      Este método debe ser sobrescrito si la URL requiere argumentos adicionales.
    - test_permissions(self): Ejecuta los tests de permisos para todos los métodos HTTP
      definidos en methods_responses.
    """

    url_name = None
    methods_responses = {
        'get': {
            'user': status.HTTP_200_OK,
            'admin': status.HTTP_200_OK,
            'solicitante': status.HTTP_200_OK,
            'anonymous': status.HTTP_403_FORBIDDEN
        },
        'post': {
            'user': status.HTTP_403_FORBIDDEN,
            'admin': status.HTTP_400_BAD_REQUEST,
            'solicitante': status.HTTP_403_FORBIDDEN,
            'anonymous': status.HTTP_403_FORBIDDEN
        },
        'put': {
            'user': status.HTTP_403_FORBIDDEN,
            'admin': status.HTTP_200_OK,
            'solicitante': status.HTTP_403_FORBIDDEN,
            'anonymous': status.HTTP_403_FORBIDDEN
        },
        'delete': {
            'user': status.HTTP_403_FORBIDDEN,
            'admin': status.HTTP_204_NO_CONTENT,
            'solicitante': status.HTTP_403_FORBIDDEN,
            'anonymous': status.HTTP_403_FORBIDDEN
        }
    }

    def get_url_kwargs(self):
        """
        Devuelve los argumentos de la URL necesarios para las solicitudes.
        Este método debe ser sobrescrito si la URL requiere argumentos adicionales.
        """
        return {}

    @tag('permisos')
    def test_permissions(self):
        if self.url_name == None:
            return
        """
        Ejecuta los tests de permisos para todos los métodos HTTP definidos en methods_responses.

        Para cada método HTTP, realiza una solicitud como usuario común, administrador, solicitante
        y usuario anónimo, y verifica que el código de respuesta sea el esperado.
        """
        print(f'EJECUTANDO TESTS DE PERMISOS: {self.url_name}')
        url_kwargs = self.get_url_kwargs()
        for method, responses in self.methods_responses.items():
            with self.subTest(method=method):
                with transaction.atomic():
                    response = self.perform_request(method, self.url_name, url_kwargs=url_kwargs, token=self.user_token, user=self.user)
                    self.assertEqual(response.status_code, responses.get('user', None), f"Fallo user con metodo {method}")
                    if response.status_code == responses.get('user', None):
                        print(f"Exito para user con metodo {method} ({response.status_code})")

                    response = self.perform_request(method, self.url_name, url_kwargs=url_kwargs, token=self.admin_token, user=self.admin_user)
                    self.assertEqual(response.status_code, responses.get('admin', None), f"Fallo admin con metodo {method}")
                    if response.status_code == responses.get('admin', None):
                        print(f"Exito para admin con metodo {method} ({response.status_code})")

                    response = self.perform_request(method, self.url_name, url_kwargs=url_kwargs, token=self.solicitante_token, user=self.solicitante_user)
                    self.assertEqual(response.status_code, responses.get('solicitante', None), f"Fallo solicitante con metodo {method}")
                    if response.status_code == responses.get('solicitante', None):
                        print(f"Exito para solicitante con metodo {method} ({response.status_code})")

                    response = self.perform_request(method, self.url_name, url_kwargs=url_kwargs)
                    self.assertEqual(response.status_code, responses.get('anonymous', None), f"Fallo anonymous con metodo {method}")
                    if response.status_code == responses.get('anonymous', None):
                        print(f"Exito para anonymous con metodo {method} ({response.status_code})")