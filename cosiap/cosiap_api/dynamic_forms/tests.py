from rest_framework import status
from common import custom_tests as c_tests
from common.custom_tests import BasePerUserTestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from common.utils import print_dict, print_captured_queries
from PIL import Image
import io
import os
from dynamic_forms.models import (
    Opcion, Elemento, ElementosOpciones, Seccion, SeccionesElementos,
    DynamicForm, DynamicFormsSecciones, Respuesta
)

from django.test.utils import CaptureQueriesContext
from django.db import connection


from users.models import Solicitante
from solicitudes.models import Solicitud
from modalidades.models import Modalidad
from dynamic_forms.models import (
   RegistroFormulario ,RegistroSeccion, Respuesta, RCasillas, RDesplegable, RDocumento, RFecha
    , RHora, RNumerico, ROpcionMultiple, RTextoCorto, RTextoParrafo)



#TESTS PARA OPCIONES

class TestsPermisosOpcion(c_tests.PermissionTestCase):    
    url_name = 'dynamic_forms:opciones'    
    
    methods_responses = {
        'get': {
            'user': status.HTTP_403_FORBIDDEN,
            'admin': status.HTTP_200_OK,
            'solicitante': status.HTTP_200_OK,
            'anonymous': status.HTTP_401_UNAUTHORIZED
        },
        'post': {
            'user': status.HTTP_403_FORBIDDEN,
            'admin': status.HTTP_400_BAD_REQUEST,
            'solicitante': status.HTTP_403_FORBIDDEN,
            'anonymous': status.HTTP_401_UNAUTHORIZED
        }
    }

class TestsPermisosOpcionPK(c_tests.PermissionTestCase):
    url_name = 'dynamic_forms:opciones_pk'    

    def get_url_kwargs(self):
        self.opcion = Opcion.objects.create(nombre='Opcion de Prueba 0')                
        return {'pk': self.opcion.pk}
    
    methods_responses = {        
        'put': {
            'user': status.HTTP_403_FORBIDDEN,
            'admin': status.HTTP_400_BAD_REQUEST,
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


class OpcionTests(BasePerUserTestCase):       
    def reset(self):
        print('')
        Opcion.objects.all().exclude(nombre='Otro').delete()
        Elemento.objects.all().delete()
        Seccion.objects.all().delete()
        DynamicForm.objects.all().delete()

        self.opcion1 = Opcion.objects.create(nombre='Opcion prueba 1 piña')
        self.opcion2 = Opcion.objects.create(nombre='Opcion prueba 2 manzana')
        self.opcion3 = Opcion.objects.create(nombre='Opcion prueba 3 naranja')
        self.opcion4 = Opcion.objects.create(nombre='Opcion prueba 4 perejil')
        self.opcion5 = Opcion.objects.create(nombre='Opcion prueba 5 apio')
        self.opcion6 = Opcion.objects.create(nombre='Opcion prueba 6 tomate')
        self.opcion7 = Opcion.objects.create(nombre='Opcion prueba 7 pez')
        self.opcion_count = 8

    def tests(self):
        subtest_name = 'test_get_opciones'
        with self.subTest(subtest_name):            
            self.reset()
            with CaptureQueriesContext(connection) as ctx:
                print(subtest_name)
                response = self.perform_request('get', url_name='dynamic_forms:opciones', token=self.solicitante_token, user=self.solicitante_user) 
                print_dict(response.data)
                self.assertEqual(response.status_code, status.HTTP_200_OK)
                self.assertEqual(len(response.data['data']), self.opcion_count) 
                print(f'\nRENDIMIENTO QUERYS: {len(ctx.captured_queries)}')
        
        subtest_name = 'test_get_opciones_incorrect_user'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            response = self.perform_request('get', url_name='dynamic_forms:opciones', token=self.user_token, user=self.user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
            self.assertFalse('data' in response.data) 

        subtest_name = 'test_get_opciones_substring_filter'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            response = self.perform_request('get', url_name='dynamic_forms:opciones', query_params={'q': 'an'}, token=self.solicitante_token, user=self.solicitante_user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(len(response.data['data']), 2) 

        subtest_name = 'test_get_opciones_pk'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            response = self.perform_request('get', url_name='dynamic_forms:opciones_pk', url_kwargs={'pk': self.opcion1.pk}, token=self.solicitante_token, user=self.solicitante_user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(response.data['data']['nombre'], 'Opcion prueba 1 piña') 
            self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        subtest_name = 'test_get_opciones_pk_not_found'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            response = self.perform_request('get', url_name='dynamic_forms:opciones_pk', url_kwargs={'pk': 99999999999}, token=self.admin_token, user=self.admin_user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        subtest_name = 'test_post_opciones'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            data = {
                'nombre': 'Nueva opcion recien creada'
            }
            response = self.perform_request('post', url_name='dynamic_forms:opciones', data=data, token=self.admin_token, user=self.admin_user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            self.assertEqual(Opcion.objects.count(), self.opcion_count+1) 

        subtest_name = 'test_post_opciones_bad_request'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            data = {
                
            }
            response = self.perform_request('post', url_name='dynamic_forms:opciones', data=data, token=self.admin_token, user=self.admin_user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
            self.assertEqual(Opcion.objects.count(), self.opcion_count) 

        subtest_name = 'test_put_opciones_pk'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            dict_original = self.opcion1.__dict__.copy()
            dict_original.pop('_state', None)
            print(dict_original)
            data = {
                'nombre': 'Nombre modificado'
            }
            response = self.perform_request('put', url_name='dynamic_forms:opciones_pk', url_kwargs={'pk': dict_original['id']}, data=data, token=self.admin_token, user=self.admin_user) 
            dict_nuevo = Opcion.objects.get(id=dict_original['id']).__dict__.copy()
            dict_nuevo.pop('_state', None)
            print(dict_nuevo)
            print_dict(response.data)
            self.assertNotEqual(dict_nuevo, dict_original)
            self.assertEqual(dict_nuevo, response.data)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(Opcion.objects.count(), self.opcion_count) 

        subtest_name = 'test_put_opciones_pk_bad_request'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            dict_original = self.opcion1.__dict__.copy()
            dict_original.pop('_state', None)
            print(dict_original)
            data = {
                
            }
            response = self.perform_request('put', url_name='dynamic_forms:opciones_pk', url_kwargs={'pk': dict_original['id']}, data=data, token=self.admin_token, user=self.admin_user) 
            dict_nuevo = Opcion.objects.get(id=dict_original['id']).__dict__.copy()
            dict_nuevo.pop('_state', None)
            print(dict_nuevo)
            print_dict(response.data)
            self.assertEqual(dict_nuevo, dict_original)            
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
            self.assertEqual(Opcion.objects.count(), self.opcion_count) 

        subtest_name = 'test_put_opciones_pk_not_found'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            response = self.perform_request('put', url_name='dynamic_forms:opciones_pk', url_kwargs={'pk': 99999999999}, data=data, token=self.admin_token, user=self.admin_user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        subtest_name = 'test_delete_opciones_pk'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            response = self.perform_request('delete', url_name='dynamic_forms:opciones_pk', url_kwargs={'pk': self.opcion1.pk}, data=data, token=self.admin_token, user=self.admin_user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
            self.assertEqual(Opcion.objects.count(), self.opcion_count-1)

        subtest_name = 'test_delete_opciones_pk_not_found'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            response = self.perform_request('delete', url_name='dynamic_forms:opciones_pk', url_kwargs={'pk': 99999999999}, data=data, token=self.admin_token, user=self.admin_user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


#TESTS PARA ElementoAPIVIEW
class TestsPermisosElemento(c_tests.PermissionTestCase):    
    url_name = 'dynamic_forms:elementos'    
    
    methods_responses = {
        'get': {
            'user': status.HTTP_403_FORBIDDEN,
            'admin': status.HTTP_200_OK,
            'solicitante': status.HTTP_200_OK,
            'anonymous': status.HTTP_401_UNAUTHORIZED
        },
        'post': {
            'user': status.HTTP_403_FORBIDDEN,
            'admin': status.HTTP_400_BAD_REQUEST,
            'solicitante': status.HTTP_403_FORBIDDEN,
            'anonymous': status.HTTP_401_UNAUTHORIZED
        }
    }

class TestsPermisosElementoPK(c_tests.PermissionTestCase):
    url_name = 'dynamic_forms:elementos_pk'    

    def get_url_kwargs(self):
        self.elemento = Elemento.objects.create(nombre='Elemento de Prueba 0', tipo=Elemento.Tipo.TEXTO_CORTO)                
        return {'pk': self.elemento.pk}
    
    methods_responses = {        
        'put': {
            'user': status.HTTP_403_FORBIDDEN,
            'admin': status.HTTP_400_BAD_REQUEST,
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

class ElementoTests(OpcionTests):       
    def reset(self):
        super().reset()
        Elemento.objects.all().delete()

        self.elemento1 = Elemento.objects.create(nombre='Elemento prueba 1', tipo=Elemento.Tipo.TEXTO_CORTO)
        self.elemento2 = Elemento.objects.create(nombre='Elemento prueba 2', tipo=Elemento.Tipo.NUMERICO)
        self.elemento3 = Elemento.objects.create(nombre='Elemento prueba 3', tipo=Elemento.Tipo.FECHA)

        self.elemento4 = Elemento.objects.create(nombre='Elemento prueba 4', tipo=Elemento.Tipo.NUMERICO)
        self.elemento5 = Elemento.objects.create(nombre='Elemento prueba 5', tipo=Elemento.Tipo.FECHA)
        self.elemento_count = 5

        self.elemento2.opciones.set([self.opcion1, self.opcion2, self.opcion3, self.opcion4])
        self.elemento3.opciones.set([self.opcion5, self.opcion6, self.opcion7])

        self.elemento4.opciones.set([self.opcion1, self.opcion2, self.opcion3, self.opcion4])
        self.elemento5.opciones.set([self.opcion5, self.opcion6, self.opcion7])

    def tests(self):
        subtest_name = 'test_get_elementos'
        with self.subTest(subtest_name):
            self.reset()
            with CaptureQueriesContext(connection) as ctx:                        
                print(subtest_name)
                response = self.perform_request('get', url_name='dynamic_forms:elementos', token=self.solicitante_token, user=self.solicitante_user) 
                print_dict(response.data)
                self.assertEqual(response.status_code, status.HTTP_200_OK)
                self.assertEqual(len(response.data['data']), self.elemento_count) 
                
                print(f'\nRENDIMIENTO QUERYS: {len(ctx.captured_queries)}')
        
        subtest_name = 'test_get_elementos_incorrect_user'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            response = self.perform_request('get', url_name='dynamic_forms:elementos', token=self.user_token, user=self.user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
            self.assertFalse('data' in response.data) 

        subtest_name = 'test_get_elementos_substring_filter'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            response = self.perform_request('get', url_name='dynamic_forms:elementos', query_params={'q': 'prueba 2'}, token=self.solicitante_token, user=self.solicitante_user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(len(response.data['data']), 1) 

        subtest_name = 'test_get_elementos_pk'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            response = self.perform_request('get', url_name='dynamic_forms:elementos_pk', url_kwargs={'pk': self.elemento1.pk}, token=self.solicitante_token, user=self.solicitante_user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(response.data['data']['nombre'], 'Elemento prueba 1') 
        
        subtest_name = 'test_get_elementos_pk_not_found'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            response = self.perform_request('get', url_name='dynamic_forms:elementos_pk', url_kwargs={'pk': 99999999999}, token=self.admin_token, user=self.admin_user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        subtest_name = 'test_post_elementos'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            data = {
                'nombre': 'Nuevo elemento',
                'tipo': Elemento.Tipo.TEXTO_CORTO
            }
            response = self.perform_request('post', url_name='dynamic_forms:elementos', data=data, token=self.admin_token, user=self.admin_user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            self.assertEqual(Elemento.objects.count(), self.elemento_count+1) 

        subtest_name = 'test_post_elementos_bad_request'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            data = {}
            response = self.perform_request('post', url_name='dynamic_forms:elementos', data=data, token=self.admin_token, user=self.admin_user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
            self.assertEqual(Elemento.objects.count(), self.elemento_count) 

        subtest_name = 'test_put_elementos_pk'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            dict_original = self.elemento1.__dict__.copy()
            dict_original.pop('_state', None)
            print(dict_original)
            data = {
                'nombre': 'Nombre modificado'
            }
            response = self.perform_request('put', url_name='dynamic_forms:elementos_pk', url_kwargs={'pk': dict_original['id']}, data=data, token=self.admin_token, user=self.admin_user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(Elemento.objects.get(pk=self.elemento1.pk).nombre, 'Nombre modificado') 

        subtest_name = 'test_put_elementos_pk_bad_request'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            dict_original = self.elemento1.__dict__.copy()
            dict_original.pop('_state', None)
            print(dict_original)
            data = {
                'nombre': ''
            }
            response = self.perform_request('put', url_name='dynamic_forms:elementos_pk', url_kwargs={'pk': dict_original['id']}, data=data, token=self.admin_token, user=self.admin_user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
            self.assertEqual(Elemento.objects.get(pk=self.elemento1.pk).nombre, 'Elemento prueba 1') 

        subtest_name = 'test_delete_elementos_pk'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            response = self.perform_request('delete', url_name='dynamic_forms:elementos_pk', url_kwargs={'pk': self.elemento1.pk}, token=self.admin_token, user=self.admin_user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
            self.assertEqual(Elemento.objects.count(), self.elemento_count-1)

class TestsPermisosElementosOpciones(c_tests.PermissionTestCase):
    url_name = 'dynamic_forms:elementos_opciones'    

    def setUp(self):
        super().setUp()
        self.opcion_t = Opcion.objects.create(nombre='Opcion de Prueba 0')     
        self.elemento_t = Elemento.objects.create(nombre='Elemento de Prueba 0', tipo=Elemento.Tipo.TEXTO_CORTO)  
        self.el_op = ElementosOpciones.objects.create(elemento=self.elemento_t, opcion=self.opcion_t, orden=1)

    def get_url_kwargs(self):                          
        return {'elemento': self.elemento_t.pk, 'opcion': self.opcion_t.pk}
    
    methods_responses = {
        'post': {
            'user': status.HTTP_403_FORBIDDEN,
            'admin': status.HTTP_400_BAD_REQUEST,
            'solicitante': status.HTTP_403_FORBIDDEN,
            'anonymous': status.HTTP_401_UNAUTHORIZED
        },
        'get': {
            'user': status.HTTP_403_FORBIDDEN,
            'admin': status.HTTP_200_OK,
            'solicitante': status.HTTP_200_OK,
            'anonymous': status.HTTP_401_UNAUTHORIZED
        },        
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


class ElementosOpcionesTests(ElementoTests):
    def reset(self):
        super().reset()
        ElementosOpciones.objects.all().delete()
        
        # Crear instancias de elementos y opciones para las pruebas
        self.elemento1 = Elemento.objects.create(nombre='Elemento prueba 1', tipo=Elemento.Tipo.TEXTO_CORTO)
        self.elemento2 = Elemento.objects.create(nombre='Elemento prueba 2', tipo=Elemento.Tipo.NUMERICO)
        self.opcion1 = Opcion.objects.create(nombre='Opción prueba 1')
        self.opcion2 = Opcion.objects.create(nombre='Opción prueba 2')
        self.opcion3 = Opcion.objects.create(nombre='Opción prueba 3')
        self.opcion4 = Opcion.objects.create(nombre='Opción prueba 4')
        self.opcion5 = Opcion.objects.create(nombre='Opción prueba 5')
        self.opcion6 = Opcion.objects.create(nombre='Opción prueba 6')
        self.opcion7 = Opcion.objects.create(nombre='Opción prueba 7')

        self.elementos_opciones1 = ElementosOpciones.objects.create(elemento=self.elemento1, opcion=self.opcion1)
        self.elementos_opciones2 = ElementosOpciones.objects.create(elemento=self.elemento1, opcion=self.opcion2)
        self.elementos_opciones_count = 2

    def tests(self):
        subtest_name = 'test_get_elementos_opciones'
        with self.subTest(subtest_name):
            self.reset()
            with CaptureQueriesContext(connection) as ctx:                        
                print(subtest_name)
                response = self.perform_request('get', url_name='dynamic_forms:elementos_opciones', url_kwargs={'elemento': self.elemento1.pk, 'opcion': self.opcion1.pk}, token=self.solicitante_token, user=self.solicitante_user) 
                print_dict(response.data)
                self.assertEqual(response.status_code, status.HTTP_200_OK)
                self.assertEqual(len(response.data['data']), 2) #esto representa unicamente una opcion: la opcion y su orden
                
                print(f'\nRENDIMIENTO QUERYS: {len(ctx.captured_queries)}')

        subtest_name = 'test_get_elementos_opciones_incorrect_user'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            response = self.perform_request('get', url_name='dynamic_forms:elementos_opciones', url_kwargs={'elemento': self.elemento1.pk, 'opcion': self.opcion1.pk}, token=self.user_token, user=self.user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
            self.assertFalse('data' in response.data) 

        subtest_name = 'test_post_elementos_opciones'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            data = {
                'elemento': self.elemento1.pk,
                'opcion': self.opcion3.pk
            }
            response = self.perform_request('post', url_name='dynamic_forms:elementos_opciones', url_kwargs={'elemento': self.elemento1.pk, 'opcion': self.opcion3.pk} , data=data, token=self.admin_token, user=self.admin_user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            self.assertEqual(ElementosOpciones.objects.count(), self.elementos_opciones_count+1) 

        subtest_name = 'test_post_elementos_opciones_bad_request'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            data = {}
            response = self.perform_request('post', url_name='dynamic_forms:elementos_opciones', url_kwargs={'elemento': self.elemento1.pk, 'opcion': 999999999}, data=data, token=self.admin_token, user=self.admin_user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
            self.assertEqual(ElementosOpciones.objects.count(), self.elementos_opciones_count) 
        
        subtest_name = 'test_put_elementos_opciones'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            dict_original = self.elementos_opciones1.__dict__.copy()
            dict_original.pop('_state', None)
            print(dict_original)
            data = {                
                'orden': 22
            }
            response = self.perform_request('put', url_name='dynamic_forms:elementos_opciones', url_kwargs={'elemento': dict_original['elemento_id'], 'opcion': dict_original['opcion_id']}, data=data, token=self.admin_token, user=self.admin_user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(ElementosOpciones.objects.get(pk=self.elementos_opciones1.pk).orden, 22) 

        subtest_name = 'test_put_elementos_opciones_bad_request'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            dict_original = self.elementos_opciones1.__dict__.copy()
            dict_original.pop('_state', None)
            print(dict_original)
            data = {                
            }
            response = self.perform_request('put', url_name='dynamic_forms:elementos_opciones', url_kwargs={'elemento': dict_original['elemento_id'], 'opcion': dict_original['opcion_id']}, data=data, token=self.admin_token, user=self.admin_user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_200_OK)            

        subtest_name = 'test_delete_elementos_opciones'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            response = self.perform_request('delete', url_name='dynamic_forms:elementos_opciones', url_kwargs={'elemento': self.elemento1.pk, 'opcion': self.opcion1.pk}, token=self.admin_token, user=self.admin_user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
            self.assertEqual(ElementosOpciones.objects.count(), self.elementos_opciones_count-1)


#TESTS para SeccionAPIView
class TestsPermisosSeccion(c_tests.PermissionTestCase):    
    url_name = 'dynamic_forms:secciones'    
    
    methods_responses = {
        'get': {
            'user': status.HTTP_403_FORBIDDEN,
            'admin': status.HTTP_200_OK,
            'solicitante': status.HTTP_200_OK,
            'anonymous': status.HTTP_401_UNAUTHORIZED
        },
        'post': {
            'user': status.HTTP_403_FORBIDDEN,
            'admin': status.HTTP_400_BAD_REQUEST,
            'solicitante': status.HTTP_403_FORBIDDEN,
            'anonymous': status.HTTP_401_UNAUTHORIZED
        }
    }

class TestsPermisosSeccionPK(c_tests.PermissionTestCase):
    url_name = 'dynamic_forms:secciones_pk'    

    def get_url_kwargs(self):
        self.seccion = Seccion.objects.create(nombre='Sección de Prueba 0', tipo=Seccion.Tipo.UNICO)                
        return {'pk': self.seccion.pk}
    
    methods_responses = {        
        'put': {
            'user': status.HTTP_403_FORBIDDEN,
            'admin': status.HTTP_400_BAD_REQUEST,
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

class SeccionTests(ElementoTests):       
    def reset(self):
        super().reset()
        Seccion.objects.all().delete()

        self.seccion1 = Seccion.objects.create(nombre='Sección prueba 1', tipo=Seccion.Tipo.UNICO)
        self.seccion2 = Seccion.objects.create(nombre='Sección prueba 2', tipo=Seccion.Tipo.UNICO)
        self.seccion3 = Seccion.objects.create(nombre='Sección prueba 3', tipo=Seccion.Tipo.LISTA)

        self.seccion4 = Seccion.objects.create(nombre='Sección prueba 4', tipo=Seccion.Tipo.UNICO)
        self.seccion5 = Seccion.objects.create(nombre='Sección prueba 5', tipo=Seccion.Tipo.LISTA)
        self.seccion_count = 5

        self.seccion2.elementos.set([self.elemento1, self.elemento2])
        self.seccion3.elementos.set([self.elemento2, self.elemento3, self.elemento5])

        self.seccion4.elementos.set([self.elemento4, self.elemento2])
        self.seccion5.elementos.set([self.elemento2, self.elemento5])

    def tests(self):
        subtest_name = 'test_get_secciones'
        with self.subTest(subtest_name):
            self.reset()
            with CaptureQueriesContext(connection) as ctx:                  
                print(subtest_name)
                response = self.perform_request('get', url_name='dynamic_forms:secciones', token=self.solicitante_token, user=self.solicitante_user) 
                print_dict(response.data)
                self.assertEqual(response.status_code, status.HTTP_200_OK)
                self.assertEqual(len(response.data['data']), self.seccion_count) 
                print(f'\nRENDIMIENTO QUERYS: {len(ctx.captured_queries)}')
        
        subtest_name = 'test_get_secciones_incorrect_user'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            response = self.perform_request('get', url_name='dynamic_forms:secciones', token=self.user_token, user=self.user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
            self.assertFalse('data' in response.data) 

        subtest_name = 'test_get_secciones_substring_filter'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            response = self.perform_request('get', url_name='dynamic_forms:secciones', query_params={'q': 'prueba 2'}, token=self.solicitante_token, user=self.solicitante_user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(len(response.data['data']), 1) 

        subtest_name = 'test_get_secciones_pk'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            response = self.perform_request('get', url_name='dynamic_forms:secciones_pk', url_kwargs={'pk': self.seccion1.pk}, token=self.solicitante_token, user=self.solicitante_user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(response.data['data']['nombre'], 'Sección prueba 1') 
        
        subtest_name = 'test_get_secciones_pk_not_found'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            response = self.perform_request('get', url_name='dynamic_forms:secciones_pk', url_kwargs={'pk': 99999999999}, token=self.admin_token, user=self.admin_user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        subtest_name = 'test_post_secciones'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            data = {
                'nombre': 'Nueva seccion',
                'tipo': Seccion.Tipo.UNICO
            }
            response = self.perform_request('post', url_name='dynamic_forms:secciones', data=data, token=self.admin_token, user=self.admin_user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            self.assertEqual(Seccion.objects.count(), self.seccion_count+1) 

        subtest_name = 'test_post_secciones_bad_request'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            data = {}
            response = self.perform_request('post', url_name='dynamic_forms:secciones', data=data, token=self.admin_token, user=self.admin_user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
            self.assertEqual(Seccion.objects.count(), self.seccion_count) 

        subtest_name = 'test_put_secciones_pk'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            dict_original = self.seccion1.__dict__.copy()
            dict_original.pop('_state', None)
            print(dict_original)
            data = {
                'nombre': 'Nombre modificado'
            }
            response = self.perform_request('put', url_name='dynamic_forms:secciones_pk', url_kwargs={'pk': dict_original['id']}, data=data, token=self.admin_token, user=self.admin_user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(Seccion.objects.get(pk=self.seccion1.pk).nombre, 'Nombre modificado') 

        subtest_name = 'test_put_secciones_pk_bad_request'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            dict_original = self.seccion1.__dict__.copy()
            dict_original.pop('_state', None)
            print(dict_original)
            data = {
                'nombre': ''
            }
            response = self.perform_request('put', url_name='dynamic_forms:secciones_pk', url_kwargs={'pk': dict_original['id']}, data=data, token=self.admin_token, user=self.admin_user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
            self.assertEqual(Seccion.objects.get(pk=self.seccion1.pk).nombre, 'Sección prueba 1') 

        subtest_name = 'test_delete_secciones_pk'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            response = self.perform_request('delete', url_name='dynamic_forms:secciones_pk', url_kwargs={'pk': self.seccion1.pk}, token=self.admin_token, user=self.admin_user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
            self.assertEqual(Seccion.objects.count(), self.seccion_count-1)

class TestsPermisosSeccionesElementos(c_tests.PermissionTestCase):
    url_name = 'dynamic_forms:secciones_elementos'    

    def setUp(self):
        super().setUp()
        self.elemento_t = Elemento.objects.create(nombre='Elemento de Prueba 0', tipo=Elemento.Tipo.TEXTO_CORTO)  
        self.seccion_t = Seccion.objects.create(nombre='Sección de Prueba 0', tipo=Seccion.Tipo.UNICO)
        self.sec_el = SeccionesElementos.objects.create(seccion=self.seccion_t, elemento=self.elemento_t, orden=1)

    def get_url_kwargs(self):                          
        return {'seccion': self.seccion_t.pk, 'elemento': self.elemento_t.pk}
    
    methods_responses = {
        'post': {
            'user': status.HTTP_403_FORBIDDEN,
            'admin': status.HTTP_400_BAD_REQUEST,
            'solicitante': status.HTTP_403_FORBIDDEN,
            'anonymous': status.HTTP_401_UNAUTHORIZED
        },
        'get': {
            'user': status.HTTP_403_FORBIDDEN,
            'admin': status.HTTP_200_OK,
            'solicitante': status.HTTP_200_OK,
            'anonymous': status.HTTP_401_UNAUTHORIZED
        },        
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

class SeccionesElementosTests(SeccionTests):
    def reset(self):
        super().reset()
        SeccionesElementos.objects.all().delete()
        
        # Crear instancias de secciones y elementos para las pruebas
        self.seccion1 = Seccion.objects.create(nombre='Sección prueba 1')
        self.seccion2 = Seccion.objects.create(nombre='Sección prueba 2')
        self.elemento1 = Elemento.objects.create(nombre='Elemento prueba 1', tipo=Elemento.Tipo.TEXTO_CORTO)
        self.elemento2 = Elemento.objects.create(nombre='Elemento prueba 2', tipo=Elemento.Tipo.NUMERICO)

        self.secciones_elementos1 = SeccionesElementos.objects.create(seccion=self.seccion1, elemento=self.elemento1)
        self.secciones_elementos2 = SeccionesElementos.objects.create(seccion=self.seccion1, elemento=self.elemento2)
        self.secciones_elementos_count = 2

    def tests(self):
        subtest_name = 'test_get_secciones_elementos'
        with self.subTest(subtest_name):
            self.reset()
            with CaptureQueriesContext(connection) as ctx:                        
                print(subtest_name)
                response = self.perform_request('get', url_name='dynamic_forms:secciones_elementos', url_kwargs={'seccion': self.seccion1.pk, 'elemento': self.elemento1.pk}, token=self.solicitante_token, user=self.solicitante_user) 
                print_dict(response.data)
                self.assertEqual(response.status_code, status.HTTP_200_OK)
                self.assertEqual(len(response.data['data']), 2)
                
                print(f'\nRENDIMIENTO QUERYS: {len(ctx.captured_queries)}')

        subtest_name = 'test_get_secciones_elementos_incorrect_user'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            response = self.perform_request('get', url_name='dynamic_forms:secciones_elementos', url_kwargs={'seccion': self.seccion1.pk, 'elemento': self.elemento1.pk}, token=self.user_token, user=self.user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
            self.assertFalse('data' in response.data) 

        subtest_name = 'test_post_secciones_elementos'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            data = {
                'orden': 44
            }
            response = self.perform_request('post', url_name='dynamic_forms:secciones_elementos', url_kwargs={'seccion': self.seccion2.pk, 'elemento': self.elemento2.pk} , data=data, token=self.admin_token, user=self.admin_user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            self.assertEqual(SeccionesElementos.objects.count(), self.secciones_elementos_count+1) 

        subtest_name = 'test_post_secciones_elementos_bad_request'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            data = {}
            response = self.perform_request('post', url_name='dynamic_forms:secciones_elementos', url_kwargs={'seccion': self.seccion2.pk, 'elemento': 999999999}, data=data, token=self.admin_token, user=self.admin_user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
            self.assertEqual(SeccionesElementos.objects.count(), self.secciones_elementos_count) 
        
        subtest_name = 'test_put_secciones_elementos'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            dict_original = self.secciones_elementos1.__dict__.copy()
            dict_original.pop('_state', None)
            print(dict_original)
            data = {                
                'orden': 22
            }
            response = self.perform_request('put', url_name='dynamic_forms:secciones_elementos', url_kwargs={'seccion': dict_original['seccion_id'], 'elemento': dict_original['elemento_id']}, data=data, token=self.admin_token, user=self.admin_user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(SeccionesElementos.objects.get(pk=self.secciones_elementos1.pk).orden, 22) 

        subtest_name = 'test_put_secciones_elementos_bad_request'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            dict_original = self.secciones_elementos1.__dict__.copy()
            dict_original.pop('_state', None)
            print(dict_original)
            data = {                
            }
            response = self.perform_request('put', url_name='dynamic_forms:secciones_elementos', url_kwargs={'seccion': dict_original['seccion_id'], 'elemento': dict_original['elemento_id']}, data=data, token=self.admin_token, user=self.admin_user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_200_OK)            

        subtest_name = 'test_delete_secciones_elementos'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            response = self.perform_request('delete', url_name='dynamic_forms:secciones_elementos', url_kwargs={'seccion': self.seccion1.pk, 'elemento': self.elemento1.pk}, token=self.admin_token, user=self.admin_user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
            self.assertEqual(SeccionesElementos.objects.count(), self.secciones_elementos_count-1)


#TESTS para DynamicFormAPIView
class TestsPermisosDynamicForm(c_tests.PermissionTestCase):    
    url_name = 'dynamic_forms:dynamic_forms'    
    
    methods_responses = {
        'get': {
            'user': status.HTTP_403_FORBIDDEN,
            'admin': status.HTTP_200_OK,
            'solicitante': status.HTTP_200_OK,
            'anonymous': status.HTTP_401_UNAUTHORIZED
        },
        'post': {
            'user': status.HTTP_403_FORBIDDEN,
            'admin': status.HTTP_400_BAD_REQUEST,
            'solicitante': status.HTTP_403_FORBIDDEN,
            'anonymous': status.HTTP_401_UNAUTHORIZED
        }
    }

class TestsPermisosDynamicFormPK(c_tests.PermissionTestCase):
    url_name = 'dynamic_forms:dynamic_forms_pk'    

    def get_url_kwargs(self):
        self.dynamic_form = DynamicForm.objects.create(nombre='Form prueba')    
        print(f'LLAVE PRIMARIA: {self.dynamic_form.pk}')            
        return {'pk': self.dynamic_form.pk}
    
    methods_responses = {        
        'put': {
            'user': status.HTTP_403_FORBIDDEN,
            'admin': status.HTTP_400_BAD_REQUEST,
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

class DynamicFormTests(SeccionTests):       
    def reset(self):
        super().reset()
        DynamicForm.objects.all().delete()

        self.dynamic_form1 = DynamicForm.objects.create(nombre='Form prueba 1')
        self.dynamic_form2 = DynamicForm.objects.create(nombre='Form prueba 2')
        self.dynamic_form3 = DynamicForm.objects.create(nombre='Form prueba 3')

        self.dynamic_form4 = DynamicForm.objects.create(nombre='Form prueba 4')
        self.dynamic_form5 = DynamicForm.objects.create(nombre='Form prueba 5')
        self.dynamic_form6 = DynamicForm.objects.create(nombre='Form prueba 6')
        self.dynamic_form_count = 6

        self.dynamic_form2.secciones.set([self.seccion1, self.seccion5])
        self.dynamic_form3.secciones.set([self.seccion3, self.seccion3])

        self.dynamic_form4.secciones.set([self.seccion1, self.seccion2])
        self.dynamic_form5.secciones.set([self.seccion4, self.seccion4])
        self.dynamic_form6.secciones.set([self.seccion3, self.seccion5])

    def tests(self):
        subtest_name = 'test_get_forms'
        with self.subTest(subtest_name):
            self.reset()
            with CaptureQueriesContext(connection) as ctx:
                print(subtest_name)
                response = self.perform_request('get', url_name='dynamic_forms:dynamic_forms', token=self.solicitante_token, user=self.solicitante_user) 
                print_dict(response.data)
                self.assertEqual(response.status_code, status.HTTP_200_OK)
                self.assertEqual(len(response.data['data']), self.dynamic_form_count) 
                #print_captured_queries(ctx.captured_queries)
                print(f'\nRENDIMIENTO QUERYS: {len(ctx.captured_queries)}')

        subtest_name = 'test_get_forms_incorrect_user'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            response = self.perform_request('get', url_name='dynamic_forms:dynamic_forms', token=self.user_token, user=self.user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
            self.assertFalse('data' in response.data) 

        subtest_name = 'test_get_forms_substring_filter'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            response = self.perform_request('get', url_name='dynamic_forms:dynamic_forms', query_params={'q': 'prueba 1'}, token=self.solicitante_token, user=self.solicitante_user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(len(response.data['data']), 1) 

        subtest_name = 'test_get_form_pk'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            response = self.perform_request('get', url_name='dynamic_forms:dynamic_forms_pk', url_kwargs={'pk': self.dynamic_form1.pk}, token=self.solicitante_token, user=self.solicitante_user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(response.data['data']['nombre'], 'Form prueba 1') 
        
        subtest_name = 'test_get_form_pk_not_found'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            response = self.perform_request('get', url_name='dynamic_forms:dynamic_forms_pk', url_kwargs={'pk': 99999999999}, token=self.admin_token, user=self.admin_user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        subtest_name = 'test_post_form'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            data = {
                'nombre': 'Nuevo form',                
            }
            response = self.perform_request('post', url_name='dynamic_forms:dynamic_forms', data=data, token=self.admin_token, user=self.admin_user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            self.assertEqual(DynamicForm.objects.count(), self.dynamic_form_count+1) 

        subtest_name = 'test_post_form_bad_request'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            data = {}
            response = self.perform_request('post', url_name='dynamic_forms:dynamic_forms', data=data, token=self.admin_token, user=self.admin_user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
            self.assertEqual(DynamicForm.objects.count(), self.dynamic_form_count) 

        subtest_name = 'test_put_form_pk'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            dict_original = self.dynamic_form1.__dict__.copy()
            dict_original.pop('_state', None)
            print(dict_original)
            data = {
                'nombre': 'Form modificado'
            }
            response = self.perform_request('put', url_name='dynamic_forms:dynamic_forms_pk', url_kwargs={'pk': dict_original['id']}, data=data, token=self.admin_token, user=self.admin_user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(DynamicForm.objects.get(pk=self.dynamic_form1.pk).nombre, 'Form modificado') 

        subtest_name = 'test_put_form_pk_bad_request'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            dict_original = self.dynamic_form1.__dict__.copy()
            dict_original.pop('_state', None)
            print(dict_original)
            data = {
                'nombre': ''
            }
            response = self.perform_request('put', url_name='dynamic_forms:dynamic_forms_pk', url_kwargs={'pk': dict_original['id']}, data=data, token=self.admin_token, user=self.admin_user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
            self.assertEqual(DynamicForm.objects.get(pk=self.dynamic_form1.pk).nombre, 'Form prueba 1') 

        subtest_name = 'test_delete_form_pk'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            response = self.perform_request('delete', url_name='dynamic_forms:dynamic_forms_pk', url_kwargs={'pk': self.dynamic_form1.pk}, token=self.admin_token, user=self.admin_user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
            self.assertEqual(DynamicForm.objects.count(), self.dynamic_form_count-1)

class TestsPermisosDynamicFormsSecciones(c_tests.PermissionTestCase):
    url_name = 'dynamic_forms:dynamic_forms_secciones'    

    def setUp(self):
        super().setUp()
        self.seccion_t = Seccion.objects.create(nombre='Sección de Prueba 0', tipo=Seccion.Tipo.UNICO)  
        self.formulario_t = DynamicForm.objects.create(nombre='Formulario de Prueba 0')
        self.form_sec = DynamicFormsSecciones.objects.create(dynamic_form=self.formulario_t, seccion=self.seccion_t, orden=1)

    def get_url_kwargs(self):                          
        return {'formulario': self.formulario_t.pk, 'seccion': self.seccion_t.pk}
    
    methods_responses = {
        'post': {
            'user': status.HTTP_403_FORBIDDEN,
            'admin': status.HTTP_400_BAD_REQUEST,
            'solicitante': status.HTTP_403_FORBIDDEN,
            'anonymous': status.HTTP_401_UNAUTHORIZED
        },
        'get': {
            'user': status.HTTP_403_FORBIDDEN,
            'admin': status.HTTP_200_OK,
            'solicitante': status.HTTP_200_OK,
            'anonymous': status.HTTP_401_UNAUTHORIZED
        },        
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

class DynamicFormsSeccionesTests(DynamicFormTests):
    def reset(self):
        super().reset()
        DynamicFormsSecciones.objects.all().delete()
        
        # Crear instancias de formularios y secciones para las pruebas
        self.formulario1 = DynamicForm.objects.create(nombre='Formulario prueba 1')
        self.formulario2 = DynamicForm.objects.create(nombre='Formulario prueba 2')
        self.seccion1 = Seccion.objects.create(nombre='Sección prueba 1')
        self.seccion2 = Seccion.objects.create(nombre='Sección prueba 2')

        self.forms_secciones1 = DynamicFormsSecciones.objects.create(dynamic_form=self.formulario1, seccion=self.seccion1)
        self.forms_secciones2 = DynamicFormsSecciones.objects.create(dynamic_form=self.formulario1, seccion=self.seccion2)
        self.forms_secciones_count = 2

    def tests(self):
        subtest_name = 'test_get_forms_secciones'
        with self.subTest(subtest_name):
            self.reset()
            with CaptureQueriesContext(connection) as ctx:                        
                print(subtest_name)
                response = self.perform_request('get', url_name='dynamic_forms:dynamic_forms_secciones', url_kwargs={'formulario': self.formulario1.pk, 'seccion': self.seccion1.pk}, token=self.solicitante_token, user=self.solicitante_user) 
                print_dict(response.data)
                self.assertEqual(response.status_code, status.HTTP_200_OK)
                self.assertEqual(len(response.data['data']), 2)
                
                print(f'\nRENDIMIENTO QUERYS: {len(ctx.captured_queries)}')

        subtest_name = 'test_get_forms_secciones_incorrect_user'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            response = self.perform_request('get', url_name='dynamic_forms:dynamic_forms_secciones', url_kwargs={'formulario': self.formulario1.pk, 'seccion': self.seccion1.pk}, token=self.user_token, user=self.user) 
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
            self.assertFalse('data' in response.data) 


        subtest_name = 'test_post_dynamic_forms_secciones'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            data = {
                'orden': 66
            }
            response = self.perform_request('post', url_name='dynamic_forms:dynamic_forms_secciones', url_kwargs={'formulario': self.formulario2.pk, 'seccion': self.seccion2.pk}, data=data, token=self.admin_token, user=self.admin_user)
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            self.assertEqual(DynamicFormsSecciones.objects.count(), self.forms_secciones_count + 1)

        subtest_name = 'test_post_dynamic_forms_secciones_bad_request'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            data = {}
            response = self.perform_request('post', url_name='dynamic_forms:dynamic_forms_secciones', url_kwargs={'formulario': self.formulario2.pk, 'seccion': 999999999}, data=data, token=self.admin_token, user=self.admin_user)
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
            self.assertEqual(DynamicFormsSecciones.objects.count(), self.forms_secciones_count)

        subtest_name = 'test_put_dynamic_forms_secciones'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            dict_original = self.forms_secciones1.__dict__.copy()
            dict_original.pop('_state', None)
            print(dict_original)
            data = {
                'orden': 22
            }
            response = self.perform_request('put', url_name='dynamic_forms:dynamic_forms_secciones', url_kwargs={'formulario': dict_original['dynamic_form_id'], 'seccion': dict_original['seccion_id']}, data=data, token=self.admin_token, user=self.admin_user)
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(DynamicFormsSecciones.objects.get(pk=self.forms_secciones1.pk).orden, 22)

        subtest_name = 'test_put_dynamic_forms_secciones_bad_request'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            dict_original = self.forms_secciones1.__dict__.copy()
            dict_original.pop('_state', None)
            print(dict_original)
            data = {}
            response = self.perform_request('put', url_name='dynamic_forms:dynamic_forms_secciones', url_kwargs={'formulario': dict_original['dynamic_form_id'], 'seccion': dict_original['seccion_id']}, data=data, token=self.admin_token, user=self.admin_user)
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_200_OK)

        subtest_name = 'test_delete_dynamic_forms_secciones'
        with self.subTest(subtest_name):
            self.reset()
            print(subtest_name)
            response = self.perform_request('delete', url_name='dynamic_forms:dynamic_forms_secciones', url_kwargs={'formulario': self.formulario1.pk, 'seccion': self.seccion1.pk}, token=self.admin_token, user=self.admin_user)
            print_dict(response.data)
            self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
            self.assertEqual(DynamicFormsSecciones.objects.count(), self.forms_secciones_count - 1)


class FormularioRespuestaTests(BasePerUserTestCase):       
    def setUp(self):
        super().setUp()

        self.solicitante_user2 = Solicitante.objects.create(
            curp='solicitanteuser2',
            password='solicitantepassword',
            email='solicitante22@gmail.com',
            nombre='Solicitante 222',
            ap_paterno='Marqueawdz',
            telefono='0000000001',
            RFC='1234567890124',  # Ajustar tipo de dato
            direccion='Calle sin Nombre',
            codigo_postal='89890',  # Ajustar tipo de dato
            municipio_id=2,
            poblacion=5,
            INE='veeveve'
        )

        self.solicitante_token2 = self.get_tokens_for_user(self.solicitante_user)

        # Crear opciones para los elementos de tipo opción múltiple, casillas, y desplegable
        self.opcion_1 = Opcion.objects.create(nombre='Opción 1')
        self.opcion_2 = Opcion.objects.create(nombre='Opción 2')
        self.opcion_3 = Opcion.objects.create(nombre='Opción 3')
        self.opcion_4 = Opcion.objects.create(nombre='Opción 4')

        # Crear un elemento para cada tipo del choices
        self.elemento_separador = Elemento.objects.create(nombre='Separador', tipo=Elemento.Tipo.SEPARADOR)
        self.elemento_numerico = Elemento.objects.create(nombre='Elemento Numérico', tipo=Elemento.Tipo.NUMERICO, min_digits=1, max_digits=10)
        self.elemento_texto_corto = Elemento.objects.create(nombre='Elemento Texto Corto', tipo=Elemento.Tipo.TEXTO_CORTO, obligatorio=True)
        self.elemento_texto_parrafo = Elemento.objects.create(nombre='Elemento Texto Párrafo', tipo=Elemento.Tipo.TEXT_PARRAFO)
        self.elemento_hora = Elemento.objects.create(nombre='Elemento Hora', tipo=Elemento.Tipo.HORA)
        self.elemento_fecha = Elemento.objects.create(nombre='Elemento Fecha', tipo=Elemento.Tipo.FECHA)
        self.elemento_opcion_multiple = Elemento.objects.create(nombre='Elemento Opción Múltiple', tipo=Elemento.Tipo.OPCION_MULTIPLE, opcion_otro=True)
        self.elemento_casillas = Elemento.objects.create(nombre='Elemento Casillas', tipo=Elemento.Tipo.CASILLAS)
        self.elemento_desplegable = Elemento.objects.create(nombre='Elemento Desplegable', tipo=Elemento.Tipo.DESPLEGABLE)
        self.elemento_documento = Elemento.objects.create(nombre='Elemento Documento', tipo=Elemento.Tipo.DOCUMENTO)

        # Asignar opciones a los elementos correspondientes
        ElementosOpciones.objects.create(elemento=self.elemento_opcion_multiple, opcion=self.opcion_1, orden=1)
        ElementosOpciones.objects.create(elemento=self.elemento_opcion_multiple, opcion=self.opcion_2, orden=2)
        ElementosOpciones.objects.create(elemento=self.elemento_casillas, opcion=self.opcion_3, orden=1)
        ElementosOpciones.objects.create(elemento=self.elemento_casillas, opcion=self.opcion_4, orden=2)
        ElementosOpciones.objects.create(elemento=self.elemento_desplegable, opcion=self.opcion_1, orden=1)
        ElementosOpciones.objects.create(elemento=self.elemento_desplegable, opcion=self.opcion_4, orden=2)

        # Crear secciones y asignarles elementos
        self.seccion_all = Seccion.objects.create(nombre='Sección Todo', tipo=Seccion.Tipo.UNICO)
        self.seccion_1 = Seccion.objects.create(nombre='Sección 1', tipo=Seccion.Tipo.UNICO)
        self.seccion_2 = Seccion.objects.create(nombre='Sección 2', tipo=Seccion.Tipo.LISTA)
        self.seccion_3 = Seccion.objects.create(nombre='Sección 3', tipo=Seccion.Tipo.LISTA)
        self.seccion_4 = Seccion.objects.create(nombre='Sección 4', tipo=Seccion.Tipo.LISTA)
        self.seccion_5 = Seccion.objects.create(nombre='Sección 5', tipo=Seccion.Tipo.UNICO)

        SeccionesElementos.objects.create(seccion=self.seccion_all, elemento=self.elemento_separador, orden=1)
        SeccionesElementos.objects.create(seccion=self.seccion_all, elemento=self.elemento_numerico, orden=2)
        SeccionesElementos.objects.create(seccion=self.seccion_all, elemento=self.elemento_texto_corto, orden=3)
        SeccionesElementos.objects.create(seccion=self.seccion_all, elemento=self.elemento_texto_parrafo, orden=4)
        SeccionesElementos.objects.create(seccion=self.seccion_all, elemento=self.elemento_hora, orden=4)
        SeccionesElementos.objects.create(seccion=self.seccion_all, elemento=self.elemento_fecha, orden=5)
        SeccionesElementos.objects.create(seccion=self.seccion_all, elemento=self.elemento_opcion_multiple, orden=6)
        SeccionesElementos.objects.create(seccion=self.seccion_all, elemento=self.elemento_casillas, orden=7)
        SeccionesElementos.objects.create(seccion=self.seccion_all, elemento=self.elemento_desplegable, orden=8)
        SeccionesElementos.objects.create(seccion=self.seccion_all, elemento=self.elemento_documento, orden=9)

        SeccionesElementos.objects.create(seccion=self.seccion_1, elemento=self.elemento_separador, orden=0)
        SeccionesElementos.objects.create(seccion=self.seccion_1, elemento=self.elemento_numerico, orden=1)
        SeccionesElementos.objects.create(seccion=self.seccion_1, elemento=self.elemento_texto_corto, orden=2)
        SeccionesElementos.objects.create(seccion=self.seccion_1, elemento=self.elemento_fecha, orden=3)
        
        SeccionesElementos.objects.create(seccion=self.seccion_2, elemento=self.elemento_texto_parrafo, orden=1)
        SeccionesElementos.objects.create(seccion=self.seccion_2, elemento=self.elemento_hora, orden=2)
        SeccionesElementos.objects.create(seccion=self.seccion_2, elemento=self.elemento_desplegable, orden=3)

        SeccionesElementos.objects.create(seccion=self.seccion_3, elemento=self.elemento_numerico, orden=1)
        SeccionesElementos.objects.create(seccion=self.seccion_3, elemento=self.elemento_opcion_multiple, orden=2)

        SeccionesElementos.objects.create(seccion=self.seccion_4, elemento=self.elemento_casillas, orden=1)
        SeccionesElementos.objects.create(seccion=self.seccion_4, elemento=self.elemento_documento, orden=2)
        
        SeccionesElementos.objects.create(seccion=self.seccion_5, elemento=self.elemento_desplegable, orden=1)

        # Crear dos formularios dinámicos y asignarles secciones
        self.formulario_all = DynamicForm.objects.create(nombre='Formulario Todo')
        self.formulario_1 = DynamicForm.objects.create(nombre='Formulario 1')
        self.formulario_2 = DynamicForm.objects.create(nombre='Formulario 2')

        DynamicFormsSecciones.objects.create(dynamic_form=self.formulario_all, seccion=self.seccion_all, orden=1)

        DynamicFormsSecciones.objects.create(dynamic_form=self.formulario_1, seccion=self.seccion_1, orden=1)
        DynamicFormsSecciones.objects.create(dynamic_form=self.formulario_1, seccion=self.seccion_3, orden=2)
        DynamicFormsSecciones.objects.create(dynamic_form=self.formulario_1, seccion=self.seccion_5, orden=3)
        
        DynamicFormsSecciones.objects.create(dynamic_form=self.formulario_2, seccion=self.seccion_2, orden=1)
        DynamicFormsSecciones.objects.create(dynamic_form=self.formulario_2, seccion=self.seccion_4, orden=2)
        DynamicFormsSecciones.objects.create(dynamic_form=self.formulario_2, seccion=self.seccion_5, orden=3)

        self.modalidad_1 = Modalidad.objects.create(dynamic_form=self.formulario_1, nombre='Modalidad Prueba 1', descripcion='Descripción 1', mostrar=True, archivado=False)                
        self.modalidad_2 = Modalidad.objects.create(dynamic_form=self.formulario_2, nombre='Modalidad Prueba 2', descripcion='Descripción 2', mostrar=True, archivado=False)                
        self.modalidad_3 = Modalidad.objects.create(dynamic_form=self.formulario_all, nombre='Modalidad Prueba 3', descripcion='Descripción 3', mostrar=False, archivado=False)        

        #creando registros completados para el usuario 1
        #registros de formulario 1 (modalidad 1 )
        self.registro_formulario_1 = RegistroFormulario.objects.create()

        self.registro_seccion_f1_s1 = RegistroSeccion.objects.create(registro_formulario=self.registro_formulario_1, seccion=self.seccion_1)
        self.registro_seccion_f1_s3_1 = RegistroSeccion.objects.create(registro_formulario=self.registro_formulario_1, seccion=self.seccion_3)
        self.registro_seccion_f1_s5_1 = RegistroSeccion.objects.create(registro_formulario=self.registro_formulario_1, seccion=self.seccion_5)
        self.registro_seccion_f1_s3_2 = RegistroSeccion.objects.create(registro_formulario=self.registro_formulario_1, seccion=self.seccion_3)
        self.registro_seccion_f1_s5_2 = RegistroSeccion.objects.create(registro_formulario=self.registro_formulario_1, seccion=self.seccion_5)


        self.respuesta_separador_r1 =        RNumerico.objects.       create(registro_seccion=self.registro_seccion_f1_s1, elemento=self.elemento_numerico, valor=999)
        self.respuesta_texto_corto_r1 =      RTextoCorto.objects.     create(registro_seccion=self.registro_seccion_f1_s1, elemento=self.elemento_texto_corto, valor='Quinientas Sandias')
        self.respuesta_fecha_r1 =            RFecha.objects.          create(registro_seccion=self.registro_seccion_f1_s1, elemento=self.elemento_fecha, valor='2024-08-14')

        self.respuesta_numerico_r1_1 =         RNumerico.objects.       create(registro_seccion=self.registro_seccion_f1_s3_1, elemento=self.elemento_numerico,valor=44)
        self.respuesta_opcion_multiple_r1_1 =  ROpcionMultiple.objects. create(registro_seccion=self.registro_seccion_f1_s3_1, elemento=self.elemento_opcion_multiple,valor=self.opcion_2)
        self.respuesta_desplegable_r1_1 =      RDesplegable.objects.    create(registro_seccion=self.registro_seccion_f1_s5_1, elemento=self.elemento_desplegable, valor=self.opcion_3)
        self.respuesta_numerico_r1_2 =         RNumerico.objects.       create(registro_seccion=self.registro_seccion_f1_s3_2, elemento=self.elemento_numerico,valor=44)
        self.respuesta_opcion_multiple_r1_2 =  ROpcionMultiple.objects. create(registro_seccion=self.registro_seccion_f1_s3_2, elemento=self.elemento_opcion_multiple,valor=self.opcion_2)
        self.respuesta_desplegable_r1_2 =      RDesplegable.objects.    create(registro_seccion=self.registro_seccion_f1_s5_2, elemento=self.elemento_desplegable, valor=self.opcion_3)

#############
        self.registro_seccion_f1_s3_2 = RegistroSeccion.objects.create(registro_formulario=self.registro_formulario_1, seccion=self.seccion_3)
        self.registro_seccion_f1_s5_2 = RegistroSeccion.objects.create(registro_formulario=self.registro_formulario_1, seccion=self.seccion_5)
        self.respuesta_numerico_r1_2 =         RNumerico.objects.       create(registro_seccion=self.registro_seccion_f1_s3_2, elemento=self.elemento_numerico,valor=44)
        self.respuesta_opcion_multiple_r1_2 =  ROpcionMultiple.objects. create(registro_seccion=self.registro_seccion_f1_s3_2, elemento=self.elemento_opcion_multiple,valor=self.opcion_2)
        self.respuesta_desplegable_r1_2 =      RDesplegable.objects.    create(registro_seccion=self.registro_seccion_f1_s5_2, elemento=self.elemento_desplegable, valor=self.opcion_3)

        self.registro_seccion_f1_s3_2 = RegistroSeccion.objects.create(registro_formulario=self.registro_formulario_1, seccion=self.seccion_3)
        self.registro_seccion_f1_s5_2 = RegistroSeccion.objects.create(registro_formulario=self.registro_formulario_1, seccion=self.seccion_5)
        self.respuesta_numerico_r1_2 =         RNumerico.objects.       create(registro_seccion=self.registro_seccion_f1_s3_2, elemento=self.elemento_numerico,valor=44)
        self.respuesta_opcion_multiple_r1_2 =  ROpcionMultiple.objects. create(registro_seccion=self.registro_seccion_f1_s3_2, elemento=self.elemento_opcion_multiple,valor=self.opcion_2)
        self.respuesta_desplegable_r1_2 =      RDesplegable.objects.    create(registro_seccion=self.registro_seccion_f1_s5_2, elemento=self.elemento_desplegable, valor=self.opcion_3)

        self.registro_seccion_f1_s3_2 = RegistroSeccion.objects.create(registro_formulario=self.registro_formulario_1, seccion=self.seccion_3)
        self.registro_seccion_f1_s5_2 = RegistroSeccion.objects.create(registro_formulario=self.registro_formulario_1, seccion=self.seccion_5)
        self.respuesta_numerico_r1_2 =         RNumerico.objects.       create(registro_seccion=self.registro_seccion_f1_s3_2, elemento=self.elemento_numerico,valor=44)
        self.respuesta_opcion_multiple_r1_2 =  ROpcionMultiple.objects. create(registro_seccion=self.registro_seccion_f1_s3_2, elemento=self.elemento_opcion_multiple,valor=self.opcion_2)
        self.respuesta_desplegable_r1_2 =      RDesplegable.objects.    create(registro_seccion=self.registro_seccion_f1_s5_2, elemento=self.elemento_desplegable, valor=self.opcion_3)
############


        self.registro_formulario_all = RegistroFormulario.objects.create()
        self.registro_seccion_all = RegistroSeccion.objects.create(registro_formulario=self.registro_formulario_all, seccion=self.seccion_all)        
        self.respuesta_numerico_rall = RNumerico.objects.create(registro_seccion=self.registro_seccion_all, elemento=self.elemento_numerico, valor=55)
        self.respuesta_texto_corto_rall = RTextoCorto.objects.create(registro_seccion=self.registro_seccion_all, elemento=self.elemento_texto_corto, valor='cortoo')
        self.respuesta_texto_parrafo_rall = RTextoParrafo.objects.create(registro_seccion=self.registro_seccion_all, elemento=self.elemento_texto_parrafo, valor='largoo')
        self.respuesta_hora_rall = RHora.objects.create(registro_seccion=self.registro_seccion_all, elemento=self.elemento_hora, valor='6:20')
        self.respuesta_fecha_rall = RFecha.objects.create(registro_seccion=self.registro_seccion_all, elemento=self.elemento_fecha, valor='2024-08-14')
        self.respuesta_opcion_multiple_rall = ROpcionMultiple.objects.create(registro_seccion=self.registro_seccion_all, elemento=self.elemento_opcion_multiple, valor=self.opcion_1)
        self.respuesta_casillas_rall = RCasillas.objects.create(registro_seccion=self.registro_seccion_all, elemento=self.elemento_casillas, )
        self.respuesta_casillas_rall.valor.set([self.opcion_2, self.opcion_3])
        self.respuesta_desplegable_rall = RDesplegable.objects.create(registro_seccion=self.registro_seccion_all, elemento=self.elemento_desplegable, valor=self.opcion_4)
        self.respuesta_documento_rall = RDocumento.objects.create(registro_seccion=self.registro_seccion_all, elemento=self.elemento_documento, )


        self.solicitud_1 = Solicitud.objects.create(modalidad=self.modalidad_1 , registro_formulario=self.registro_formulario_1)
        self.solicitud_2 = Solicitud.objects.create(modalidad=self.modalidad_2)        
        self.solicitud_4 = Solicitud.objects.create(modalidad=self.modalidad_1)        

        self.solicitud_all = Solicitud.objects.create(modalidad=self.modalidad_3 ,registro_formulario=self.registro_formulario_all)
        self.numero_solicitudes = 4
        #REPETIDO#################

        

    def reset(self):
        print('')

    def tests(self):
        '''
        subtest_name = 'test_get_registro_formulario'
        with self.subTest(subtest_name):
            self.reset()
            with CaptureQueriesContext(connection) as ctx:
                print(subtest_name)
                response = self.perform_request('get', url_name='dynamic_forms:solcitud_respuestas', token=self.solicitante_token, user=self.solicitante_user) 
                print_dict(response.data)
                self.assertEqual(response.status_code, status.HTTP_200_OK)        
                self.assertEqual(len(response.data['data']), self.numero_solicitudes)                                        
                #print_captured_queries(ctx.captured_queries)
                print(f'\nRENDIMIENTO QUERYS: {len(ctx.captured_queries)}')     

        subtest_name = 'test_get_registro_formulario_pk'
        with self.subTest(subtest_name):
            self.reset()            
            with CaptureQueriesContext(connection) as ctx:
                print(subtest_name)
                response = self.perform_request('get', url_name='dynamic_forms:solicitud_respuestas_pk', url_kwargs={'solicitud': self.solicitud_all.pk}, token=self.solicitante_token, user=self.solicitante_user) 
                print_dict(response.data)
                self.assertEqual(response.status_code, status.HTTP_200_OK)        
                self.assertEqual(response.data['data']['nombre'], 'Formulario Todo')
                #print_captured_queries(ctx.captured_queries)
                print(f'\nRENDIMIENTO QUERYS: {len(ctx.captured_queries)}')    
        #'''
        subtest_name = 'test_post_registro_formulario'
        with self.subTest(subtest_name):
            self.reset()
            with CaptureQueriesContext(connection) as ctx:
                print(subtest_name)
                data = {
                    
                }
                response = self.perform_request('post', url_name='dynamic_forms:solicitud_respuestas_pk', url_kwargs={'solicitud': self.solicitud_all.pk}, data=data, token=self.admin_token, user=self.admin_user)
                print_dict(response.data)
                self.assertEqual(response.status_code, status.HTTP_201_CREATED)                
                print(f'\nRENDIMIENTO QUERYS: {len(ctx.captured_queries)}')    
