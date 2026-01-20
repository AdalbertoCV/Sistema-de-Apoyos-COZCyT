from rest_framework.test import APITestCase, APIRequestFactory, force_authenticate, APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from users.models import Usuario, Solicitante
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from common.views import BasePermissionAPIView
from rest_framework.response import Response
from django.urls import reverse
from django.test import tag

from users.permisos import es_admin, primer_login
from rest_framework.permissions import AllowAny, IsAuthenticated


class TestBasePermissionAPIView(BasePermissionAPIView):
    permission_classes_create = [AllowAny]
    permission_classes_delete = [es_admin]     
    permission_classes_list = [es_admin]    
    permission_classes_update = [IsAuthenticated, primer_login]
    def post(self, request, *args, **kwargs):
        return Response({'detail': 'Create permission passed.'}, status=status.HTTP_201_CREATED)
    
    def delete(self, request, *args, **kwargs):
        return Response({'detail': 'Delete permission passed.'}, status=status.HTTP_204_NO_CONTENT)

    def get(self, request, *args, **kwargs):
        return Response({'detail': 'List permission passed.'}, status=status.HTTP_200_OK)

    def put(self, request, *args, **kwargs):
        return Response({'detail': 'Update permission passed.'}, status=status.HTTP_200_OK)

class TestOnlyAdmintPermissionsAPIView(BasePermissionAPIView):
    permission_classes = [IsAuthenticated, primer_login]
    permission_classes_create = [es_admin]
    permission_classes_delete = [es_admin]
    permission_classes_list = [es_admin]
    permission_classes_update = [es_admin]

    def post(self, request, *args, **kwargs):
        return Response({'detail': 'Create permission passed.'}, status=status.HTTP_201_CREATED)
    
    def delete(self, request, *args, **kwargs):
        return Response({'detail': 'Delete permission passed.'}, status=status.HTTP_204_NO_CONTENT)

    def get(self, request, *args, **kwargs):
        return Response({'detail': 'List permission passed.'}, status=status.HTTP_200_OK)

    def put(self, request, *args, **kwargs):
        return Response({'detail': 'Update permission passed.'}, status=status.HTTP_200_OK)
    
class TestAllowAnyPermissionsAPIView(BasePermissionAPIView):
    permission_classes = [AllowAny]
    permission_classes_create = []    
    permission_classes_delete = None   
    permission_classes_list = []    
    permission_classes_update = None
    
    def post(self, request, *args, **kwargs):
        return Response({'detail': 'Create permission passed.'}, status=status.HTTP_201_CREATED)
    
    def delete(self, request, *args, **kwargs):
        return Response({'detail': 'Delete permission passed.'}, status=status.HTTP_204_NO_CONTENT)

    def get(self, request, *args, **kwargs):
        return Response({'detail': 'List permission passed.'}, status=status.HTTP_200_OK)

    def put(self, request, *args, **kwargs):
        return Response({'detail': 'Update permission passed.'}, status=status.HTTP_200_OK)



class PermissionAPIViewTestCase(APITestCase):

    def setUp(self):
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
            RFC=1234567890123,
            direccion='Calle sin Nombre',
            codigo_postal=89890,
            municipio_id=1,
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

    def perform_request(self, view, method, token=None, user=None):
        request = getattr(self.factory, method)('/')
        if token:
            force_authenticate(request, user=user, token=token['access'])
        response = view(request)
        return response


    def test_base_permission_view(self):
        view = TestBasePermissionAPIView.as_view()
        print('\ntest_base_permission_view')
        # Tests for non-authenticated user
        response = self.perform_request(view, 'get')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.perform_request(view, 'post')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        response = self.perform_request(view, 'put')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.perform_request(view, 'delete')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Tests for authenticated user
        response = self.perform_request(view, 'get', self.user_token, self.user)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.perform_request(view, 'post', self.user_token, self.user)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        response = self.perform_request(view, 'put', self.user_token, self.user)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.perform_request(view, 'delete', self.user_token, self.user)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Tests for solicitante user        
        response = self.perform_request(view, 'get', self.solicitante_token, self.solicitante_user)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.perform_request(view, 'post', self.solicitante_token, self.solicitante_user)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        response = self.perform_request(view, 'put', self.solicitante_token, self.solicitante_user)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.perform_request(view, 'delete', self.solicitante_token, self.solicitante_user)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Tests for admin user
        response = self.perform_request(view, 'get', self.admin_token, self.admin_user)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.perform_request(view, 'post', self.admin_token, self.admin_user)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        response = self.perform_request(view, 'put', self.admin_token, self.admin_user)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.perform_request(view, 'delete', self.admin_token, self.admin_user)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)        

    def test_only_admin_permission_view(self):
        view = TestOnlyAdmintPermissionsAPIView.as_view()
        print('\ntest_only_admin_permission_view')
        # Tests for non-authenticated user
        response = self.perform_request(view, 'get')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.perform_request(view, 'post')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.perform_request(view, 'put')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.perform_request(view, 'delete')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Tests for authenticated user
        response = self.perform_request(view, 'get', self.user_token, self.user)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.perform_request(view, 'post', self.user_token, self.user)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.perform_request(view, 'put', self.user_token, self.user)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.perform_request(view, 'delete', self.user_token, self.user)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Tests for solicitante user
        response = self.perform_request(view, 'get', self.solicitante_token, self.solicitante_user)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.perform_request(view, 'post', self.solicitante_token, self.solicitante_user)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.perform_request(view, 'put', self.solicitante_token, self.solicitante_user)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.perform_request(view, 'delete', self.solicitante_token, self.solicitante_user)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Tests for admin user
        response = self.perform_request(view, 'get', self.admin_token, self.admin_user)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.perform_request(view, 'post', self.admin_token, self.admin_user)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        response = self.perform_request(view, 'put', self.admin_token, self.admin_user)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.perform_request(view, 'delete', self.admin_token, self.admin_user)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_allow_any_permission_view(self):
        view = TestAllowAnyPermissionsAPIView.as_view()
        print('\ntest_allow_any_permission_view')
        # Tests for non-authenticated user
        response = self.perform_request(view, 'get')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.perform_request(view, 'post')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        response = self.perform_request(view, 'put')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.perform_request(view, 'delete')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # Tests for authenticated user
        response = self.perform_request(view, 'get', self.user_token, self.user)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.perform_request(view, 'post', self.user_token, self.user)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        response = self.perform_request(view, 'put', self.user_token, self.user)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.perform_request(view, 'delete', self.user_token, self.user)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # Tests for solicitante user
        response = self.perform_request(view, 'get', self.solicitante_token, self.solicitante_user)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.perform_request(view, 'post', self.solicitante_token, self.solicitante_user)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        response = self.perform_request(view, 'put', self.solicitante_token, self.solicitante_user)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.perform_request(view, 'delete', self.solicitante_token, self.solicitante_user)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # Tests for admin user
        response = self.perform_request(view, 'get', self.admin_token, self.admin_user)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.perform_request(view, 'post', self.admin_token, self.admin_user)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        response = self.perform_request(view, 'put', self.admin_token, self.admin_user)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.perform_request(view, 'delete', self.admin_token, self.admin_user)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
