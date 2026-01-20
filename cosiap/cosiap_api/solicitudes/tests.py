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

'''
class PermisosSolicitudTests(c_tests.PermissionTestCase):
    url_name = 'solicitudes:solicitudes'
    methods_responses = {
        'get': {
            'user': status.HTTP_403_FORBIDDEN,
            'admin': status.HTTP_200_OK,
            'solicitante': status.HTTP_200_OK,
            'anonymous': status.HTTP_401_UNAUTHORIZED
        },
        'post': {
            'user': status.HTTP_403_FORBIDDEN,
            'admin': status.HTTP_403_FORBIDDEN,
            'solicitante': status.HTTP_201_CREATED,
            'anonymous': status.HTTP_401_UNAUTHORIZED            
        }
    }
'''
    
    
class SolicitudTests(TestCase):
    """
    Clase de prueba de la lista de solicitudes usando DynamicTable
    """
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

        # Abre el archivo y asignarlo al campo INE
        with open(self.ine_file_path, 'rb') as ine_file:
            self.solicitante = Solicitante.objects.create(
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
                datos_bancarios=None,  # Asignar datos bancarios si es necesario
                INE=File(ine_file),  # Asignar archivo de INE
                password="password"
            )

        # Crear instancias de Solicitud usando la instancia de Solicitante
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

    def test_get_solicitudes(self):
        """
        Probar que se pueden recuperar todas las solicitudes con una solicitud GET
        """
        url = reverse('solicitudes:solicitudes')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)
        self.assertEqual(len(response.data['data']), 2)

    def test_get_solicitudes_exclusion_columnas(self):
        """
        Probar la exclusión de columnas con una solicitud GET
        """
        url = reverse('solicitudes:solicitudes')
        data = {
            "model_name": "Solicitud",
            "columns": [
                "status",
                "solicitud_n",
                "monto_solicitado",
                "monto_aprobado",
                "timestamp",
                "solicitante__nombre"
            ],
            "exclude_columns": [
                "monto_solicitado"
            ],
            "filters": {},
            "exclude_filters": {},
            "search_query": ""
        }
        query_params = {'reporte': json.dumps(data)}
        response = self.client.get(url, query_params, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)
        self.assertNotIn('monto_solicitado', response.data['data'][0])

    def test_get_solicitudes_con_filtros(self):
        """
        Probar la aplicación de filtros con una solicitud GET
        """
        url = reverse('solicitudes:solicitudes')
        data = {
            "model_name": "Solicitud",
            "columns": [
                "status",
                "solicitud_n",
                "monto_solicitado",
                "monto_aprobado",
                "timestamp",
                "solicitante__nombre"
            ],
            "exclude_columns": [],
            "filters": {
                "status": {
                    "icontains": ["Pendiente"]
                }
            },
            "exclude_filters": {},
            "search_query": ""
        }
        query_params = {'reporte': json.dumps(data)}
        response = self.client.get(url, query_params, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)
        self.assertEqual(len(response.data['data']), 1)
        self.assertEqual(response.data['data'][0]['status'], 'Pendiente')

    def test_get_solicitudes_con_filtros_or(self):
        """
        Probar la aplicación de filtros OR con una solicitud GET
        """
        url = reverse('solicitudes:solicitudes')
        data = {
            "model_name": "Solicitud",
            "columns": [
                "status",
                "solicitud_n",
                "monto_solicitado",
                "monto_aprobado",
                "timestamp",
                "solicitante__nombre"
            ],
            "exclude_columns": [],
            "filters": {
                "status": {
                    "icontains": ["Pendiente"]
                },
                "solicitante__nombre":{
                    "icontains": ["Adalberto", "Nombre_inexistente"]
                }
            },
            "exclude_filters": {},
            "search_query": ""
        }
        query_params = {'reporte': json.dumps(data)}
        response = self.client.get(url, query_params, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)
        self.assertEqual(len(response.data['data']), 1)
        self.assertEqual(response.data['data'][0]['status'], 'Pendiente')

    def test_get_solicitudes_con_filtros_exclusion(self):
        """
        Probar la aplicación de filtros de exclusión con una solicitud GET
        """
        url = reverse('solicitudes:solicitudes')
        data = {
            "model_name": "Solicitud",
            "columns": [
                "status",
                "solicitud_n",
                "monto_solicitado",
                "monto_aprobado",
                "timestamp",
                "solicitante__nombre"
            ],
            "exclude_columns": [],
            "filters": {},
            "exclude_filters": {
                "status": {
                    "icontains": ["Pendiente"]
                }
            },
            "search_query": ""
        }
        query_params = {'reporte': json.dumps(data)}
        response = self.client.get(url, query_params, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)
        self.assertEqual(len(response.data['data']), 1)
        self.assertEqual(response.data['data'][0]['status'], 'Aprobado')

    def test_get_solicitudes_con_search_query(self):
        """
        Probar la aplicación de un search_query con una solicitud GET
        """
        url = reverse('solicitudes:solicitudes')
        data = {
            "model_name": "Solicitud",
            "columns": [
                "status",
                "solicitud_n",
                "monto_solicitado",
                "monto_aprobado",
                "timestamp",
                "solicitante__nombre"
            ],
            "exclude_columns": [],
            "filters": {},
            "exclude_filters": {},
            "search_query": "Adalberto"
        }
        query_params = {'reporte': json.dumps(data)}
        response = self.client.get(url, query_params, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)
        self.assertEqual(len(response.data['data']), 2)
        self.assertEqual(response.data['data'][0]['solicitante__nombre'], 'Adalberto')

    def test_put_solicitud_modificacion_valida(self):
        """
        Probar la modificación válida de una columna con una solicitud PUT
        """
        url = reverse('solicitudes:solicitudes_pk', args=[self.solicitud1.pk])
        data = {
            "field_updates":{
                "solicitante__nombre": "AdalCerrillo",
                "solicitante__telefono": "4920000000"
            }
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.solicitud1.refresh_from_db()
        self.assertEqual(self.solicitud1.solicitante.telefono, "4920000000")
        self.assertEqual(self.solicitud1.solicitante.nombre, "AdalCerrillo")

    def test_put_solicitud_modificacion_columna_no_editable(self):
        """
        Probar la modificación de una columna que no es editable con una solicitud PUT
        """
        url = reverse('solicitudes:solicitudes_pk', args=[self.solicitud1.pk])
        data = {
            "field_updates":{
                "status": "Rechazado"
            }
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_put_datos_incorrectos(self):
        """ 
        Probar las validaciones al momento de editar una columna
        """

        url = reverse('solicitudes:solicitudes_pk', args=[self.solicitud1.pk])
        data = {
            "field_updates":{
                "solicitante__telefono": "4900000000000000000000"
            }
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_solicitud(self):
        """
        Probar la eliminación de una solicitud con una solicitud DELETE
        """
        url = reverse('solicitudes:solicitudes_pk', args=[self.solicitud1.pk])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_detalles_solicitud(self):
        """
        Probar la recuperación completa de todos los campos de una solicitud
        """
        url = reverse('solicitudes:solicitudes_pk', args=[self.solicitud1.pk])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data

        # Verificar los campos en el nivel superior
        self.assertIn('status', data)
        self.assertEqual(data['status'], 'Pendiente')

        # Verificar los campos dentro del diccionario 'solicitante'
        solicitante_data = data.get('solicitante', {})
        self.assertIn('nombre', solicitante_data)
        self.assertEqual(solicitante_data['nombre'], self.solicitante.nombre)

    def test_put_actualizacion_registro_multiple(self):
        """
        Probar la actualización de múltiples registros con una solicitud PUT
        """
        url = reverse('solicitudes:solicitudes')

        data = {
            "register_updates": {
                str(self.solicitud1.pk): {
                    "monto_solicitado": "10000",
                    "observacion": "Actualización múltiple - Solicitud 1"
                },
                str(self.solicitud2.pk): {
                    "monto_solicitado": "10000",
                    "observacion": "Actualización múltiple - Solicitud 2"
                }
            }
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.solicitud1.refresh_from_db()
        self.solicitud2.refresh_from_db()
        self.assertEqual(self.solicitud1.monto_solicitado, 10000.0)
        self.assertEqual(self.solicitud1.observacion, "Actualización múltiple - Solicitud 1")
        self.assertEqual(self.solicitud2.monto_solicitado, 10000.0)
        self.assertEqual(self.solicitud2.observacion, "Actualización múltiple - Solicitud 2")
        self.assertIn('Registros actualizados con éxito.', response.data['messages']['success'])

