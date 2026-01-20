from rest_framework import status
from rest_framework.test import APITestCase
from modalidades.models import Modalidad
from modalidades.views import ModalidadAPIView
from common.custom_tests import BasePerUserTestCase
from common.utils import print_dict
from common import custom_tests as c_tests
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image
import io
import os

class PermisosModalidadesTests(c_tests.PermissionTestCase):
    url_name = 'modalidades:modalidades'    
    
    methods_responses = {
        'get': {
            'user': status.HTTP_200_OK,
            'admin': status.HTTP_200_OK,
            'solicitante': status.HTTP_200_OK,
            'anonymous': status.HTTP_200_OK
        },
        'post': {
            'user': status.HTTP_403_FORBIDDEN,
            'admin': status.HTTP_400_BAD_REQUEST,
            'solicitante': status.HTTP_403_FORBIDDEN,
            'anonymous': status.HTTP_401_UNAUTHORIZED
        }
    }

class PermisosPKModalidadesTests(c_tests.PermissionTestCase):
    url_name = 'modalidades:modalidades_pk'    

    def get_url_kwargs(self):
        self.modalidad = Modalidad.objects.create(nombre='Modalidad Prueba 0', descripcion='Descripción 0', mostrar=True, archivado=False)                
        return {'pk': self.modalidad.pk}
    
    methods_responses = {        
        'put': {
            'user': status.HTTP_403_FORBIDDEN,
            'admin': status.HTTP_200_OK,
            'solicitante': status.HTTP_403_FORBIDDEN,
            'anonymous': status.HTTP_401_UNAUTHORIZED
        },
        'delete': {
            'user': status.HTTP_403_FORBIDDEN,
            'admin': status.HTTP_204_NO_CONTENT,
            'solicitante': status.HTTP_403_FORBIDDEN,
            'anonymous': status.HTTP_401_UNAUTHORIZED
        }
    }


class ModalidadTests(BasePerUserTestCase):       
    def reset(self):
        MontoModalidad.objects.all().delete()
        Modalidad.objects.all().delete()

        self.modalidad0 = Modalidad.objects.create(nombre='Modalidad Prueba 0', descripcion='Descripción 0', mostrar=True, archivado=False)                
        self.modalidad1 = Modalidad.objects.create(nombre='Modalidad Prueba 1', descripcion='Descripción 1', mostrar=True, archivado=False)                
        self.modalidad2 = Modalidad.objects.create(nombre='Modalidad Prueba 2', descripcion='Descripción 2', mostrar=False, archivado=False)
        self.modalidad_archivada = Modalidad.objects.create(nombre='Modalidad Archivada', descripcion='Descripción Archivada', mostrar=True, archivado=True)

        MontoModalidad.objects.create(modalidad=self.modalidad0, monto=999)
        MontoModalidad.objects.create(modalidad=self.modalidad0, monto=992)
        self.cantidad_MontoModalidad = 2

        # Crear una imagen en memoria
        image = Image.new('RGB', (100, 100), color=(73, 109, 137))
        byte_array = io.BytesIO()
        image.save(byte_array, format='JPEG')
        byte_array.seek(0)

        self.test_image = SimpleUploadedFile(
            name='test_image.jpg',
            content=byte_array.read(),
            content_type='image/jpeg'
        )

        image = Image.new('RGB', (100, 100), color=(137, 137, 137))
        byte_array = io.BytesIO()
        image.save(byte_array, format='JPEG')
        byte_array.seek(0)

        self.test_image_original = SimpleUploadedFile(
            name='test_image_original.jpg',
            content=byte_array.read(),
            content_type='image/jpeg'
        )


    def test(self):
        #'''
        with self.subTest("test_get_modalidades_as_anonymous"):
            self.reset()
            print("\nRunning test: test_get_modalidades_as_anonymous")      
            response = self.perform_request('get', url_name='modalidades:modalidades')
            print(response.data)
            self.assertEqual(response.status_code, status.HTTP_200_OK)

        with self.subTest("test_get_modalidades_as_user"):
            self.reset()
            print("\nRunning test: test_get_modalidades_as_user")      
            response = self.perform_request('get', url_name='modalidades:modalidades', token=self.user_token, user=self.user)        
            print(response.data)
            self.assertEqual(response.status_code, status.HTTP_200_OK)

        with self.subTest("test_get_modalidades_as_admin"):
            self.reset()
            print("\nRunning test: test_get_modalidades_as_admin")      
            response = self.perform_request('get', url_name='modalidades:modalidades', token=self.admin_token, user=self.admin_user)
            print(response.data)
            self.assertEqual(response.status_code, status.HTTP_200_OK)

        with self.subTest("test_get_modalidades_as_solicitante"):
            self.reset()
            print("\nRunning test: test_get_modalidades_as_solicitante")      
            response = self.perform_request('get', url_name='modalidades:modalidades', token=self.solicitante_token, user=self.solicitante_user)
            print(response.data)
            self.assertEqual(response.status_code, status.HTTP_200_OK)

        with self.subTest("test_get_modalidades_archivadas_no_included"):
            self.reset()
            print("\nRunning test: test_get_modalidades_archivadas_no_included")      
            response = self.perform_request('get', url_name='modalidades:modalidades', token=self.user_token, user=self.user)        
            print(response.data)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertNotIn('Modalidad Archivada', [modalidad['nombre'] for modalidad in response.data['data']])
            self.assertEqual(len(response.data['data']), 2) 

        with self.subTest("test_get_modalidades_as_admin"):
            self.reset()
            print("\nRunning test: test_get_modalidades_as_admin")      
            response = self.perform_request('get', url_name='modalidades:modalidades', token=self.admin_token, user=self.admin_user)
            print(response.data)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertIn('Modalidad Prueba 1', [modalidad['nombre'] for modalidad in response.data['data']])
            self.assertIn('Modalidad Prueba 2', [modalidad['nombre'] for modalidad in response.data['data']])
            self.assertNotIn('Modalidad Archivada', [modalidad['nombre'] for modalidad in response.data['data']])
            self.assertEqual(len(response.data['data']), 3)  

        with self.subTest("test_get_modalidades_as_solicitante"):
            self.reset()
            print("\nRunning test: test_get_modalidades_as_solicitante")      
            response = self.perform_request('get', url_name='modalidades:modalidades', token=self.solicitante_token, user=self.solicitante_user)
            print(response.data)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertIn('Modalidad Prueba 1', [modalidad['nombre'] for modalidad in response.data['data']])
            self.assertNotIn('Modalidad Prueba 2', [modalidad['nombre'] for modalidad in response.data['data']])
            self.assertNotIn('Modalidad Archivada', [modalidad['nombre'] for modalidad in response.data['data']])
            self.assertEqual(len(response.data['data']), 2) 

        with self.subTest("test_get_single_modalidad_valid_id"):
            self.reset()
            print("\nRunning test: test_get_single_modalidad_valid_id")      
            response = self.perform_request('get', url_name='modalidades:modalidades_pk', url_kwargs={'pk': self.modalidad1.pk}, token=self.user_token, user=self.user)
            print(response.data)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(response.data['data']['nombre'], self.modalidad1.nombre)
            self.assertEqual(response.data['data']['descripcion'], self.modalidad1.descripcion)

        with self.subTest("test_get_single_modalidad_invalid_id"):
            self.reset()
            print("\nRunning test: test_get_single_modalidad_invalid_id")      
            invalid_id = 99999  # ID que no existe
            response = self.perform_request('get', url_name='modalidades:modalidades_pk', url_kwargs={'pk': invalid_id}, token=self.user_token, user=self.user)
            print(response.data)
            self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        with self.subTest("test_post_modalidad_as_admin"):
            self.reset()
            print("\nRunning test: test_post_modalidad_as_admin")      
            data = {
                'nombre': 'Nueva Modalidad',
                'imagen': self.test_image,
                'descripcion': 'Descripción de la nueva modalidad',
                'monto': 100.0
            }
            response = self.perform_request('post', url_name='modalidades:modalidades', token=self.admin_token, user=self.admin_user, data=data, is_multipart=True)
            print(response.data)
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            self.assertEqual(Modalidad.objects.count(), 5)
            modalidad = Modalidad.objects.get(pk=response.data['data']['id'])
            self.assertEqual(modalidad.nombre, data['nombre'])
            self.assertEqual(modalidad.descripcion, data['descripcion'])
            montoModalidad = MontoModalidad.objects.get(modalidad=modalidad, fecha_fin=None)
            print(f'MontoModalidad: {montoModalidad.__dict__}')
            self.assertEqual(montoModalidad.monto, data['monto'])
            os.remove(modalidad.imagen.path)

        with self.subTest("test_post_modalidad_as_solicitante"):
            self.reset()
            print("\nRunning test: test_post_modalidad_as_solicitante")      
            data = {
                'nombre': 'Nueva Modalidad',
                'imagen': self.test_image,
                'descripcion': 'Descripción de la nueva modalidad',
                'monto': 100.0
            }
            response = self.perform_request('post', url_name='modalidades:modalidades', token=self.solicitante_token, user=self.solicitante_user, data=data, is_multipart=True)        
            print(response.data)
            self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
            self.assertEqual(Modalidad.objects.count(), 4)        

        with self.subTest("test_put_modalidad_as_admin"):
            self.reset()
            print("\nRunning test: test_put_modalidad_as_admin")      
            modalidad = Modalidad.objects.create(nombre='Modalidad Existente', imagen=self.test_image_original,  descripcion='Descripción', mostrar=True, archivado=False)                
            MontoModalidad.objects.create(modalidad=modalidad, monto=0.5)
            montoModalidad = MontoModalidad.objects.get(modalidad = modalidad, fecha_fin=None)
            print(f'MontoModalidad: {montoModalidad.__dict__}')
            self.assertEqual(montoModalidad.monto, 0.5)
            # Verifica que la imagen original existe
            original_image_path = modalidad.imagen.path
            self.assertTrue(os.path.isfile(original_image_path))
            data = {            
                'nombre': 'Modalidad Actualizada',
                'imagen': self.test_image,
                'descripcion': 'Descripción actualizada',
                'monto': 200.0
            }        
            response = self.perform_request('put', url_name='modalidades:modalidades_pk', url_kwargs={'pk':modalidad.pk}, token=self.admin_token, user=self.admin_user, data=data, is_multipart=True)
            print(f'RESPONSE_DATA')
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            modalidad.refresh_from_db()                
            self.assertEqual(modalidad.nombre, data['nombre'])
            self.assertEqual(modalidad.descripcion, data['descripcion'])
            montoModalidad = MontoModalidad.objects.get(modalidad = modalidad, fecha_fin=None)
            print(f'MontoModalidad: {montoModalidad.__dict__}')
            self.assertEqual(montoModalidad.monto, data['monto'])
            self.assertEqual(MontoModalidad.objects.count(), self.cantidad_MontoModalidad + 2)
            # Verifica que la imagen original ha sido eliminada
            self.assertFalse(os.path.isfile(original_image_path))
            # Verifica que la nueva imagen existe
            new_image_path = modalidad.imagen.path
            self.assertTrue(os.path.isfile(new_image_path))
            os.remove(new_image_path)
        
        with self.subTest("test_put_modalidad_as_admin_no_image"):
            self.reset()
            print("\nRunning test: test_put_modalidad_as_admin")      
            modalidad = Modalidad.objects.create(nombre='Modalidad Existente', imagen=self.test_image_original,  descripcion='Descripción', mostrar=True, archivado=False)                
            MontoModalidad.objects.create(modalidad=modalidad, monto=0.5)
            montoModalidad = MontoModalidad.objects.get(modalidad = modalidad, fecha_fin=None)
            print(f'MontoModalidad: {montoModalidad.__dict__}')
            print(f'Modalidad: {modalidad.__dict__}')
            self.assertEqual(montoModalidad.monto, 0.5)
            # Verifica que la imagen original existe
            original_image_path = modalidad.imagen.path
            self.assertTrue(os.path.isfile(original_image_path))
            data = {            
                'nombre': 'Modalidad Actualizada',            
                'descripcion': 'Descripción actualizada',
                'monto': 200.0
            }        
            response = self.perform_request('put', url_name='modalidades:modalidades_pk', url_kwargs={'pk':modalidad.pk}, token=self.admin_token, user=self.admin_user, data=data, is_multipart=True)
            print(response.data)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            modalidad.refresh_from_db()                
            self.assertEqual(modalidad.nombre, data['nombre'])
            self.assertEqual(modalidad.descripcion, data['descripcion'])
            montoModalidad = MontoModalidad.objects.get(modalidad = modalidad, fecha_fin=None)
            print(f'MontoModalidad: {montoModalidad.__dict__}')
            self.assertEqual(montoModalidad.monto, data['monto'])
            self.assertEqual(MontoModalidad.objects.count(), self.cantidad_MontoModalidad + 2)
            # Verifica que la imagen original ha sido eliminada
            self.assertTrue(os.path.isfile(original_image_path))
            # Verifica que la nueva imagen existe
            new_image_path = modalidad.imagen.path
            self.assertTrue(os.path.isfile(new_image_path))
            os.remove(new_image_path)

        with self.subTest("test_put_modalidad_as_solicitante"):
            self.reset()
            print("\nRunning test: test_put_modalidad_as_solicitante")      
            modalidad = Modalidad.objects.create(nombre='Modalidad Existente', descripcion='Descripción', mostrar=True, archivado=False)                
            data = {            
                'nombre': 'Modalidad Actualizada',
                'imagen': self.test_image,
                'descripcion': 'Descripción actualizada',
                'monto': 200.0
            }        
            response = self.perform_request('put', url_name='modalidades:modalidades_pk', url_kwargs={'pk':modalidad.pk}, token=self.solicitante_token, user=self.solicitante_user, data=data, is_multipart=True)
            print(response.data)
            self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
            modalidad.refresh_from_db()
            self.assertEqual(modalidad.nombre, 'Modalidad Existente')

        with self.subTest("test_delete_modalidad_as_admin"):
            self.reset()
            print("\nRunning test: test_delete_modalidad_as_admin")      
            modalidad = Modalidad.objects.create(nombre='Modalidad Existente', descripcion='Descripción', mostrar=True, archivado=False)                
            response = self.perform_request('delete', url_name='modalidades:modalidades_pk', url_kwargs={'pk':modalidad.pk}, token=self.admin_token, user=self.admin_user)
            print(response.data)
            self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
            modalidad.refresh_from_db()
            self.assertTrue(modalidad.archivado)

        with self.subTest("test_delete_modalidad_as_solicitante"):
            self.reset()
            print("\nRunning test: test_delete_modalidad_as_solicitante")      
            modalidad = Modalidad.objects.create(nombre='Modalidad Existente', descripcion='Descripción', mostrar=True, archivado=False)                
            response = self.perform_request('delete', url_name='modalidades:modalidades_pk', url_kwargs={'pk':modalidad.pk}, token=self.solicitante_token, user=self.solicitante_user)
            print(response.data)
            self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
            modalidad.refresh_from_db()
            self.assertFalse(modalidad.archivado)
        #'''
        print("\nTODOS LOS TESTS EJECUTADOS")      

