# Archivo con la funcionalidad necesaria para la gestión de usuarios en la API
# Autores: Adalberto Cerrillo Vázquez, Rafael Uribe Caldera
# Versión: 1.0

from django.shortcuts import get_object_or_404, redirect
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Usuario, Solicitante, DatosBancarios, Municipio, Estado
from django.contrib import messages
from .serializers import UsuarioSerializer, SolicitanteSerializer, DatosBancariosSerializer, MunicipioSerializer, EstadoSerializer
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.conf import settings
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.contrib.auth.hashers import make_password
from .tokens import account_activation_token, token_generator
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from datetime import datetime, timedelta
from .permisos import es_admin, primer_login
from notificaciones.mensajes import Mensaje
from common.views import BasePermissionAPIView
from dynamic_tables.views import DynamicTableAPIView
from rest_framework.exceptions import PermissionDenied
from common.views import serve_file  
from dynamic_forms.models import RDocumento, RegistroSeccion
from solicitudes.models import Solicitud

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == status.HTTP_200_OK:
            refresh_token = response.data['refresh']
            response.set_cookie(
                key='refresh_token',
                value=refresh_token,
                httponly=True,
                secure=True,
                samesite='Strict',   # Whether to set the flag restricting cookie leaks on cross-site requests. This can be 'Lax', 'Strict', or None to disable the flag.                                    
                expires=datetime.now() + settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'],
            )
            # Eliminar el refresh token de la respuesta JSON
            del response.data['refresh']
            # Agregar mensaje de éxito
            response.data['message'] = {'success':'Login exitoso'}
                   
        return response

class CustomTokenRefreshView(TokenRefreshView):        
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('refresh_token')
        if not refresh_token:
            return Response({"detail": "Refresh token is missing."}, status=status.HTTP_400_BAD_REQUEST)
        request.data['refresh'] = refresh_token
        response = super().post(request, *args, **kwargs)
        if response.status_code != status.HTTP_200_OK:
            response.delete_cookie('refresh_token')
        return response


class RetreiveMunicipioAPIView(BasePermissionAPIView):
    '''
    Clase para obtener los municipios de la base de datos
    '''
    permission_classes_list = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        data = {}
        try:
            queryset = Municipio.objects.all()
            serializer = MunicipioSerializer(queryset, many=True)
            data = serializer.data
            return Response(data, status = status.HTTP_200_OK)
        except Exception as e:
            Mensaje.error(data, str(e))
            return Response(data, status = status.HTTP_400_BAD_REQUEST)


class RetreiveEstadoAPIView(BasePermissionAPIView):
    '''
    Clase para obtener los estados de la base de datos
    '''
    permission_classes_list = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        data = {}
        try:
            queryset = Estado.objects.all()
            serializer = EstadoSerializer(queryset, many=True)
            data = serializer.data
            return Response(data, status = status.HTTP_200_OK)
        except Exception as e:
            Mensaje.error(data, str(e))
            return Response(data, status = status.HTTP_400_BAD_REQUEST)


class LogoutAPIView(APIView):
    ''' APIView que maneja el cierre de sesión '''
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        data = {}
        Mensaje.success(data, 'Logout exitoso.')
        response = Response(data, status=status.HTTP_200_OK)
        # Eliminar las cookies de access_token y refresh_token
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        return response



class UserID(APIView):
    ''' 
    Clase para recuperar el ID del usuario logeado actual
    '''

    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        data = {}
        try:
            user = request.user
            uid = user.id
            data['user_id'] = uid
            return Response(data, status= status.HTTP_200_OK)
        except Exception as e:
            Mensaje.error(data, str(e))
            return Response(data, status=status.HTTP_400_BAD_REQUEST)


class UserIsStaff(APIView):
    ''' 
    Clase para indicar si el usuario logeado es admin o solicitante
    '''

    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        data = {}
        try:
            user = request.user
            user_is_admin = user.is_staff
            data['user_is_admin'] = user_is_admin
            return Response(data, status= status.HTTP_200_OK)
        except Exception as e:
            Mensaje.error(data, str(e))
            return Response(data, status=status.HTTP_400_BAD_REQUEST)


class SolicitanteDatosCompletos(APIView):
    '''
    APIView para conocer si el solicitante tiene sus datos completos
    '''

    permission_classes = [IsAuthenticated] 

    def get(self, request, *args, **kwargs):
        data = {}
        try:
            user = request.user
            solicitante = Solicitante.objects.get(id=user.id)
            data['solicitante_datos_completos'] = solicitante.datos_completos
            return Response(data, status = status.HTTP_200_OK)
        except Exception as e:
            Mensaje.error(data, str(e))
            return Response(data, status=status.HTTP_400_BAD_REQUEST)


class UsuarioAPIView(DynamicTableAPIView):
    """
        Clase Usuario para manejar las solicitudes de los usuarios básicos

        Tipos de Solicitud:
        - GET (Obtiene la lista de usuarios o a un usuario específico)
        - POST (Para la creación de un nuevo usuario)
        - DELETE (Borrar un usuario)

        Herencia:
        - BasePermissionAPIView (Heréda de la clase con los permisos predefinidos)
    """
    permission_classes_create = [AllowAny] 
    permission_classes_list = [IsAuthenticated, es_admin] 
    permission_classes_update = [IsAuthenticated, es_admin] 
    permission_classes_delete = [IsAuthenticated, es_admin] 

    model_class = Usuario
    model_name = 'Usuario'
    columns = '__all__'

    def post( self, request, *args, **kwargs ):
        ''' 
        Método post para la creación de un nuevo usuario
        ''' 
        email = request.data.get('email')
        curp = request.data.get('curp')
        curp_exist = Usuario.objects.filter(curp=curp, is_active=False)
        email_exist = Usuario.objects.filter(email=email, is_active=False).exclude(curp=curp)
        if curp_exist:
            curp_exist = Usuario.objects.get(curp=curp)
        else:
            curp_exist = None
        if email_exist:
            email_exist = Usuario.objects.get(email=email).delete() 
        serializer = UsuarioSerializer(data=request.data, instance=curp_exist)
        if serializer.is_valid():
            usuario_nuevo = serializer.save(is_active = False)
            usuario_nuevo.set_password(request.data.get('password'))
            uid = urlsafe_base64_encode(force_bytes(usuario_nuevo.pk))
            token = account_activation_token.make_token(usuario_nuevo)
            enviar_correo_verificacion(usuario_nuevo.email, uid, token)
            response_data = {'data': serializer.data}
            Mensaje.success(response_data, 'Usuario creado exitosamente.')
            return Response(response_data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DatosBancariosAPIView(BasePermissionAPIView):
    ''' 
    Clase para manejar la obtención, creación y edición de los datos bancarios del solicitante.
    '''

    permission_classes_list = [IsAuthenticated]
    permission_classes_create = [IsAuthenticated]
    permission_classes_update = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        ''' 
        Función get para obtener los datos bancarios del solicitante que realiza la petición.
        '''
        data = {}
        user = request.user

        if 'pk' in kwargs:
            try:
                if user.is_staff:
                    solicitante = Solicitante.objects.get(id = kwargs['pk'])
                    # obtenemos los datos bancarios asociados al solicitante
                    datos_bancarios = DatosBancarios.objects.get(solicitante = solicitante)
                    serializer = DatosBancariosSerializer(instance = datos_bancarios)
                    data['data'] = serializer.data
                    return Response(data, status = status.HTTP_200_OK)
                else:
                    Mensaje.error(data, 'Usted no tiene permisos para realizar esta acción.')
                    return Response(data, status = status.HTTP_400_BAD_REQUEST) 
            except Exception as e:
                Mensaje.error(data, str(e))
                return Response(data, status = status.HTTP_400_BAD_REQUEST)

        else:
            try:
                solicitante = Solicitante.objects.get(id = user.id)
                # obtenemos los datos bancarios asociados al solicitante
                datos_bancarios = DatosBancarios.objects.get(solicitante = solicitante)
                serializer = DatosBancariosSerializer(instance = datos_bancarios)
                data['data'] = serializer.data
                return Response(data, status = status.HTTP_200_OK)
            except Exception as e:
                Mensaje.error(data, str(e))
                return Response(data, status = status.HTTP_400_BAD_REQUEST)

    def post(self, request, *args, **kwargs):
        ''' 
        Función post para crear una nueva instancia de datos bancarios asociada al solicitante
        '''

        data = {}

        try:
            user = request.user
            solicitante = Solicitante.objects.get(id = user.id)
            if solicitante.datos_bancarios:
                Mensaje.error(data, 'El solicitante ya tiene datos bancarios registrados.')
                return Response(data, status=status.HTTP_400_BAD_REQUEST)
            serializer = DatosBancariosSerializer(data= request.data)
            if serializer.is_valid():
                serializer.save()
                solicitante.datos_bancarios = serializer.instance
                solicitante.save()
                Mensaje.success(data, 'Datos bancaros registrados.')
                return Response(data, status = status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            Mensaje.error(data, str(e))
            return Response(data, status = status.HTTP_400_BAD_REQUEST)

    def put(self, request, *args, **kwargs):
        ''' 
        Método put para manejar la edición de los datos bancarios
        '''

        data = {}

        try:
            user = request.user
            solicitante = Solicitante.objects.get(id = user.id)
            # obtenemos los datos bancarios asociados al solicitante
            datos_bancarios = DatosBancarios.objects.get(solicitante = solicitante)
            serializer = DatosBancariosSerializer(instance = datos_bancarios, data=request.data)
            if serializer.is_valid():
                # guardamos los cambios
                serializer.save()
                Mensaje.success(data, 'Datos bancarios actualizados.')
                return Response(data, status=status.HTTP_200_OK)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:  
            Mensaje.error(data, str(e))
            return Response(data, status = status.HTTP_400_BAD_REQUEST)


class SolicitanteAPIView(DynamicTableAPIView):
    """
        Clase Solicitante

        Tipo de solicitud:
        - GET (Obtiene la lista de solicitantes o a un solicitante específico)
        - POST (Crear un nuevo solicitante)
        - PUT (Editar los datos de un solicitante)

        Herencia:
        - BasePermissionAPIView (Heréda de la clase con los permisos predefinidos)
    """
    permission_classes_list = [IsAuthenticated]
    permission_classes_create = [IsAuthenticated]
    permission_classes_update = [IsAuthenticated]
    permission_classes_delete = [IsAuthenticated]

    model_class = Solicitante
    model_name = 'Solicitante'
    columns = '__all__'

    def post(self, request, *args, **kwargs):
        ''' 
        Método post para la creación de un nuevo solicitante
        '''
        response_data = {}
        usuario = request.user
        solicitante, created = Solicitante.objects.get_or_create(
            id=usuario.id,
            defaults={
                'curp': usuario.curp,
                'nombre': usuario.nombre,
                'email': usuario.email,
                'is_active': True,
                'password': usuario.password
            }
        )
        serializer = SolicitanteSerializer(instance= solicitante, data=request.data)
        if serializer.is_valid():
            serializer.save()
            Mensaje.success(response_data, 'Datos guardados.')
            return Response(response_data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, *args, **kwargs):
        ''' Sobreescribimos metodo para especialziar el comportamineto'''
        data = {}
        try:
            solicitante = Solicitante.objects.get(id=kwargs['pk'])
            serializer = SolicitanteSerializer(solicitante, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                data['message'] = 'Solicitante actualizado exitosamente'
                data['solicitante'] = serializer.data
                return Response(data, status=status.HTTP_200_OK)
            else:
                # Si la validación falla, devolvemos el error con el estado 400
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                

        except Solicitante.DoesNotExist:
            data['error'] = 'Solicitante no encontrado'
            return Response(data, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            Mensaje.error(data, str(e))
            return Response(data, status = status.HTTP_400_BAD_REQUEST)



class ResetPassword(APIView):
    """
        Clase ResetPassword para enviar un correo de restablecimiento de contraseña

        Tipo de solicitud:
        - GET (Recibe el email del usuario y envia un correo de restablecimiento)
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        response_data = {}
        email = request.data.get('email')
        try:
            usuario = Usuario.objects.get(email=email)
            token = token_generator.make_token(usuario)
            uid = urlsafe_base64_encode(force_bytes(usuario.pk))
            enviar_correo_reset_password(email, uid, token)
            Mensaje.success(response_data, 'Correo de restablecimiento enviado.')
            return Response(response_data, status=status.HTTP_200_OK)
        except Usuario.DoesNotExist:
            Mensaje.error(response_data, 'El correo no está registrado.')
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)


class NuevaPassword(APIView):
    """
        Clase NuevaPassword para registrar una nueva password

        Tipo de solicitud:
        - POST (Se envía la nueva contraseña y se le asigna al usuario una vez confirme el restablecimiento por correo)
    """
    permission_classes = [AllowAny]

    def post(self, request, uidb64, token):
        """
        Método post para guardar la nueva contraseña

        Parámetros:
        - request (la solicitud realizada por el usuario)
        - uidb64 (el id del usuario que restablece su contraseña encriptado en base64)
        - token (el token de reestablecimiento de contraseña)
        """
        response_data = {}
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            usuario = Usuario.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, Usuario.DoesNotExist):
            usuario = None
        if usuario is not None and token_generator.check_token(usuario, token):
            password = request.data.get('password')
            usuario.password = make_password(password)
            usuario.save()
            Mensaje.success(response_data, 'La contraseña ha sido restablecida exitosamente.')
            return Response(response_data, status=status.HTTP_200_OK)
        else:
            Mensaje.error(response_data, 'El enlace no es válido.')
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)


def enviar_correo_reset_password(email, uid, token):
    """
        Método para enviar el correo de restablecimiento de contraseña

        parámetros:
        - email (email al que se enviará el enlace de restablecimiento de contraseña)
        - uid (id del usuario)
        - token (token de restablecimiento de contraseña)
    """
    subject = 'Restablecer contraseña'
    message = f'Para restablecer tu contraseña, haz click en el siguiente enlace:\n\nhttp://localhost:5173/authentication/reset_password?uid={uid}&token={token}'
    from_email = settings.EMAIL_HOST_USER
    recipient_list = [email]
    send_mail(subject, message, from_email, recipient_list)


def enviar_correo_verificacion(email, uid, token):
    """
        Método para enviar el correo de verificación de correo

        parámetros:
        - email (email al que se enviará el enlace de verificación de correo)
        - uid (id del usuario)
        - token (token de verificación de correo)
    """
    subject = 'Verificación de la cuenta'
    message = f'Para activar tu cuenta, haz clic en el siguiente enlace:\n\n{settings.BASE_URL}api/usuarios/verificar-correo/{uid}/{token}/'
    from_email = settings.EMAIL_HOST_USER
    recipient_list = [email]
    send_mail(subject, message, from_email, recipient_list)

class VerificarCorreo(APIView):
    """
        clase para verificar el correo del ususario y hacerlo usuario activo

        Tipo de solicitud:
        - GET (Recupera el token del usario y cambia si estatus a is_active = True)
    """
    permission_classes = [AllowAny]

    def get(self, request, uidb64, token ):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            usuario = Usuario.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, Usuario.DoesNotExist):
            usuario = None
        if usuario is not None and account_activation_token.check_token(usuario, token):
            usuario.is_active = True
            usuario.save()
            return redirect(f'http://localhost:5173/authentication/register?status=success&message=Cuenta verificada exitosamente.')
        else:
            return redirect(f'http://localhost:5173/authentication/register?status=error&message=El token de verificación es inválido o ha expirado.')


class FileDownloadAPIView(BasePermissionAPIView):
    '''
    Api view para la descarga de un archivo subido en el sistema
    '''
    permission_classes_list = [IsAuthenticated]

    def get(self, request):
        ''' 
        Método get para verificar los derechos sobre el archivo y manejar la descarga
        '''
        data = {}
        try:

            file_url = request.query_params.get('file_url', None)

            if not file_url:
                raise PermissionDenied("El parámetro 'file_url' es requerido.")


            user = request.user

            # Si es admin puede descargar cualquier archivo
            if user.is_staff:
                return serve_file(file_url)

            # Si no es administrador, obtener el solicitante asociado al usuario
            solicitante = Solicitante.objects.get(id=user.id)

            # Verificar si el archivo pertenece al solicitante
            if self._file_belongs_to_solicitante(solicitante, file_url):
                return serve_file(file_url)

            # Verificar si el archivo pertenece a alguna solicitud del solicitante
            if self._file_belongs_to_solicitud(solicitante, file_url):
                return serve_file(file_url)

            # Verificar si el archivo pertenece a los datos bancarios del solicitante
            if self._file_belongs_to_datos_bancarios(solicitante, file_url):
                return serve_file(file_url)

            # Si el archivo no pertenece al solicitante ni a sus datos, denegar el acceso
            raise PermissionDenied("No tienes permiso para descargar este archivo.")
            
        except Exception as e:
            Mensaje.error(data, str(e))
            return Response(data, status = status.HTTP_400_BAD_REQUEST)
    
    def _file_belongs_to_solicitante(self, solicitante, file_url):
        """
        Verifica si el archivo pertenece al solicitante, ya sea en su campo INE o cualquier otro campo.
        """
        return solicitante.INE == file_url

    def _file_belongs_to_solicitud(self, solicitante, file_url):
        """
        Verifica si el archivo pertenece a alguna solicitud del solicitante.
        Recorre la relación entre Solicitud -> RegistroSeccion -> RDocumento 
        para verificar si el archivo se encuentra en RDocumento.valor.
        """
        solicitudes = Solicitud.objects.filter(solicitante=solicitante)

        # Recorre todas las solicitudes del solicitante
        for solicitud in solicitudes:
            registro_formulario = solicitud.registro_formulario

            # Verifica si la solicitud tiene un registro_formulario
            if registro_formulario:
                # Busca todas las secciones relacionadas al registro_formulario
                registro_secciones = RegistroSeccion.objects.filter(registro_formulario=registro_formulario)

                # Recorre todas las secciones relacionadas
                for registro_seccion in registro_secciones:
                    # Busca los documentos relacionados a la sección
                    documentos = RDocumento.objects.filter(registro_seccion=registro_seccion)

                    # Recorre los documentos y verifica si el archivo solicitado está en el campo valor
                    for documento in documentos:
                        if documento.valor == file_url:
                            return True
        return False

    def _file_belongs_to_datos_bancarios(self, solicitante, file_url):
        """
        Verifica si el archivo pertenece a los datos bancarios del solicitante.
        Revisa si el archivo solicitado es el estado de cuenta o la constancia SAT.
        """
        datos_bancarios = DatosBancarios.objects.filter(solicitante=solicitante)

        for datos in datos_bancarios:
            if datos.doc_estado_cuenta == file_url or datos.doc_constancia_sat == file_url:
                return True

        return False