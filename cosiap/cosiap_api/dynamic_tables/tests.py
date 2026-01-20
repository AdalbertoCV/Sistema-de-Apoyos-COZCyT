from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from users.models import Usuario, Solicitante, Municipio, Estado
from solicitudes.models import Solicitud
from .models import DynamicTableReport
from django.test.utils import CaptureQueriesContext
from django.db import connection
import os
from django.core.files import File
from django.conf import settings
import json

class ReportesTests(TestCase):
    '''
    Clase de prueba para las funcionalidades de reportes.
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

        # Crear instancias de DynamicTableReport
        self.reporte1 = DynamicTableReport.objects.create(
            model_name="Solicitud",
            columns=[
                "status",
                "solicitud_n",
                "monto_solicitado",
                "monto_aprobado",
                "timestamp",
                "solicitante__nombre"
            ],
            exclude_columns=["monto_solicitado"],
            filters={},
            exclude_filters={},
            search_query=""
        )

        self.reporte2 = DynamicTableReport.objects.create(
            model_name="Solicitud",
            columns=[
                "status",
                "solicitud_n",
                "monto_solicitado",
                "monto_aprobado",
                "timestamp",
                "solicitante__nombre"
            ],
            exclude_columns=["monto_aprobado"],
            filters={},
            exclude_filters={},
            search_query=""
        )

    def test_get_reportes(self):
        """
        Probar que se pueden recuperar todos los reportes con una solicitud GET
        """
        url = reverse('dynamic-tables:reportes')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 2)

    def test_get_reporte_por_pk(self):
        """
        Probar que se puede recuperar un reporte por su pk con una solicitud GET
        """
        url = reverse('dynamic-tables:reportes_pk', args=[self.reporte1.pk])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['columns'], ["status", "solicitud_n", "monto_solicitado", "monto_aprobado", "timestamp","solicitante__nombre"])

    def test_post_reporte(self):
        """
        Probar la creación de un nuevo reporte con una solicitud POST
        """
        url = reverse('dynamic-tables:reportes')
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
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('success', response.data['messages'])
        self.assertEqual(response.data['messages']['success'][0], 'Reporte creado con exito.')

    def test_put_reporte(self):
        """
        Probar la actualización de un reporte con una solicitud PUT
        """
        url = reverse('dynamic-tables:reportes_pk', args=[self.reporte1.pk])
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
                "monto_aprobado"
            ],
            "filters": {},
            "exclude_filters": {},
            "search_query": ""
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('success', response.data['messages'])
        self.assertEqual(response.data['messages']['success'][0], 'Reporte actualizado exitosamente.')
        self.reporte1.refresh_from_db()
        self.assertEqual(self.reporte1.exclude_columns, ["monto_aprobado"])


    def test_delete_reporte(self):
        """
        Probar la eliminación de un reporte con una solicitud DELETE
        """
        url = reverse('dynamic-tables:reportes_pk', args=[self.reporte1.pk])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(DynamicTableReport.objects.filter(pk=self.reporte1.pk).exists())


class OptimizacionTest(TestCase):

    ''' 
    Clase para probar las optimizaciones de rendimiento para tablas dinámicas.
    '''

    ine_file_path = os.path.join(settings.MEDIA_ROOT, 'protected_uploads/INE_files', 'test.png')

    def setUp(self):
        '''
        Método para configurar las pruebas de optimizacion
        '''
        self.client = APIClient()
        self.usuario_data = {'curp': 'CEVA020423HGRRZDA8','nombre': 'Adalberto','email': 'adalc3488@gmail.com','password': 'testpassword123'}
        self.usuario = Usuario.objects.create_superuser(**self.usuario_data)
        self.usuario.is_active = True
        self.usuario.is_staff = True
        self.usuario.save()

        # Iniciar sesión
        self.login_url = reverse('users:token_obtain')
        response = self.client.post(self.login_url, {'curp': self.usuario_data['curp'],'password': self.usuario_data['password']})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.access_token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')

        # Configurar cookie de refresh token
        refresh_token = response.cookies.get('refresh_token')
        if refresh_token:
            self.client.cookies['refresh_token'] = refresh_token.value

        self.url = reverse('solicitudes:solicitudes')
        self.data = {"model_name": "Solicitud","columns": ["status","solicitud_n","monto_solicitado","monto_aprobado","timestamp","solicitante__nombre"],"exclude_columns": ["monto_solicitado"],"filters": {},"exclude_filters": {},"search_query": ""}
        self.data_filters = {"model_name": "Solicitud","columns": ["status","solicitud_n","monto_solicitado","monto_aprobado","timestamp","solicitante__nombre"],"exclude_columns": ["monto_solicitado"],"filters": {"status": {"icontains": ["Aprobado"]},"solicitante__nombre":{"icontains":["Adal"]}},"exclude_filters": {},"search_query": ""}
        self.estado = Estado.objects.create(nombre="Zacetecas")
        self.municipio = Municipio.objects.create(nombre="Guadalupe",estado=self.estado,cve_mun=1000)

        with open(self.ine_file_path, 'rb') as ine_file:
            self.solicitante = Solicitante.objects.create(curp="CEVA020423HGRRZDA9",email="ceva@example.com",nombre="Adalberto",ap_paterno="Evans",ap_materno="Vargas",telefono="1234567890",RFC="CEVA0204237E4",direccion="Calle Falsa 123",codigo_postal="12345",municipio=self.municipio,poblacion="Test Poblacion",datos_bancarios=None,INE=File(ine_file), password="password")

        self.solicitud1 = Solicitud.objects.create(solicitante=self.solicitante,status="Pendiente",monto_solicitado=1000,monto_aprobado=800,observacion="Observación 1")
        self.solicitud2 = Solicitud.objects.create(solicitante=self.solicitante,status="Aprobado",monto_solicitado=1500,monto_aprobado=1200,observacion="Observación 2")
        self.solicitud3 = Solicitud.objects.create(solicitante=self.solicitante,status="Aprobado",monto_solicitado=1500,monto_aprobado=1200,observacion="Observación 2")
        self.solicitud4 = Solicitud.objects.create(solicitante=self.solicitante,status="Aprobado",monto_solicitado=1500,monto_aprobado=1200,observacion="Observación 2")
        self.solicitud5 = Solicitud.objects.create(solicitante=self.solicitante,status="Aprobado",monto_solicitado=1500,monto_aprobado=1200,observacion="Observación 2")
        self.solicitud6 = Solicitud.objects.create(solicitante=self.solicitante,status="Aprobado",monto_solicitado=1500,monto_aprobado=1200,observacion="Observación 2")
        self.solicitud7 = Solicitud.objects.create(solicitante=self.solicitante,status="Aprobado",monto_solicitado=1500,monto_aprobado=1200,observacion="Observación 2")
        self.solicitud8 = Solicitud.objects.create(solicitante=self.solicitante,status="Aprobado",monto_solicitado=1500,monto_aprobado=1200,observacion="Observación 2")

    def test_performance(self):
        """
        test para medir el rendimiento de las tablas dinámicas
        """
        query_params = {'reporte': json.dumps(self.data)}
        with CaptureQueriesContext(connection) as ctx:
            response = self.client.get(self.url, query_params, format='json')
            self.assertEqual(response.status_code, status.HTTP_200_OK)

        print(response.data)
        print(f"\nRendimiento QUERYS: {len(ctx.captured_queries)}")

    def test_performance_filters(self):
        """
        test para medir el rendimiento de las tablas dinámicas usando filtros
        """
        query_params = {'reporte': json.dumps(self.data_filters)}
        with CaptureQueriesContext(connection) as ctx:
            response = self.client.get(self.url, query_params, format='json')
            self.assertEqual(response.status_code, status.HTTP_200_OK)

        print(response.data)
        print(f"\nRendimiento QUERYS: {len(ctx.captured_queries)}")