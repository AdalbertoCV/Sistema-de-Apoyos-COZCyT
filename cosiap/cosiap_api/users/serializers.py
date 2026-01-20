# Archivo con los serializers necesarios para la gestión de los usuarios
# Autores: Adalberto Cerrillo Vázquez, 
# Versión: 1.0

from rest_framework import serializers
from .models import Usuario, Solicitante, DatosBancarios, Municipio, Estado


class AdminSerializer(serializers.ModelSerializer):
    confirmar_password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Usuario
        fields = ['pk', 'nombre', 'curp', 'email', 'password', 'confirmar_password']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            'nombre': {'required': False},
        }

    def validate(self, data):
        # Validamos sólo si ambos campos están presentes
        password = data.get('password')
        confirmar_password = data.get('confirmar_password')
        
        if password or confirmar_password:
            if password != confirmar_password:
                raise serializers.ValidationError("Atención: Las contraseñas no coinciden.")
        return data

    def create(self, validated_data):
        user = Usuario.objects.create_superuser(
            email=validated_data['email'],
            curp=validated_data['curp'],
            nombre=validated_data.get('nombre', ''),
            password=validated_data['password']
        )
        return user

    def update(self, instance, validated_data):
        instance.curp = validated_data.get('curp', instance.curp)
        instance.email = validated_data.get('email', instance.email)
        instance.nombre = validated_data.get('nombre', instance.nombre)

        # Verificamos si se envía el password para actualizarlo
        password = validated_data.get('password', None)
        if password:
            instance.set_password(password)

        instance.save()
        return instance


# serializer para el usuario solicitante
class UsuarioSerializer(serializers.ModelSerializer):
    # Creamos un campo de confirmación de la contraseña del solicitante
    confirmar_password = serializers.CharField(write_only=True)

    class  Meta:
        # Indicamos el modelo 
        model = Usuario
        # Indicamos los campos que deseamos incluir
        fields = ['nombre', 'curp', 'email', 'password', 'confirmar_password']
        # Indicamos algún argumento extra necesario
        extra_kwargs = {
            'password': {'write_only': True}
        }

    # validamos que ambas contraseñas enviadas coincidan
    def validate(self, data):
        # realizamos la comparación de las contraseñas
        if data['password'] != data['confirmar_password']:
            # Si las contraseñas no coinciden se muestra un error
            raise serializers.ValidationError("Atención: Las contraseñas no coinciden.")
        return data

    # Función para crear el usuario, usando los datos ya validados
    def create(self, validated_data):
        # Creamos el usuario solicitante por medio de la funcion create_user del modelo
        user = Usuario.objects.create_user(
            email=validated_data['email'],
            curp=validated_data['curp'],
            nombre=validated_data['nombre'],
            password=validated_data['password'],
            is_admin=False,
            is_staff=False
        )
        # Retornamos el usuario creado
        return user


# Serializer para el registro y edición de los datos bancarios del usuario
class DatosBancariosSerializer(serializers.ModelSerializer):
    class Meta:
        # indicamos el modelo
        model = DatosBancarios
        # indicamos los fields que el usuario debe ingresar
        fields = ['nombre_banco', 'cuenta_bancaria', 'clabe_bancaria', 'doc_estado_cuenta', 'doc_constancia_sat', 'codigo_postal_fiscal', 'regimen']
        extra_kwargs = {'nombre_banco': {'required': False}, 'cuenta_bancaria': {'required': False},'clabe_bancaria': {'required': False},
            'doc_estado_cuenta': {'required': False}, 'doc_constancia_sat': {'required': False},'codigo_postal_fiscal': {'required': False},
            'regimen': {'required': False}
        }

    def create(self, validated_data):
        ''' 
        Función create para crear una instancia de datos bancarios
        '''

        datos_bancarios = DatosBancarios.objects.create(
            **validated_data
        )

        return datos_bancarios

    def update(self, instance, validated_data):
        ''' 
        Función para actualizar una instancia de datos bancarios
        '''

        instance.nombre_banco = validated_data.get('nombre_banco', instance.nombre_banco)
        instance.cuenta_bancaria = validated_data.get('cuenta_bancaria', instance.cuenta_bancaria)
        instance.clabe_bancaria = validated_data.get('clabe_bancaria', instance.clabe_bancaria)
        instance.doc_estado_cuenta = validated_data.get('doc_estado_cuenta', instance.doc_estado_cuenta)
        instance.doc_constancia_sat = validated_data.get('doc_constancia_sat', instance.doc_constancia_sat)
        instance.codigo_postal_fiscal = validated_data.get('codigo_postal_fiscal', instance.codigo_postal_fiscal)
        instance.regimen = validated_data.get('regimen', instance.regimen)

        instance.save()

        return instance


# Serializer para el registro y actualización de los datos del solicitante
class SolicitanteSerializer(serializers.ModelSerializer):
    class Meta:
        # indicamos el modelo a utilziar 
        model = Solicitante
        # indicamos los campos que debe ingresar el usuario
        fields =  ['curp', 'email', 'nombre','ap_paterno', 'ap_materno', 'telefono', 'RFC','sexo', 'direccion', 'codigo_postal', 'municipio', 'poblacion', 'INE']
        # Agregamos validadores para asegurar que los campos puedan estar vacíos
        extra_kwargs = {'ap_paterno': {'required': False}, 'ap_materno': {'required': False},'telefono': {'required': False},'RFC': {'required': False}, 'sexo':{'required':False},
            'direccion': {'required': False},'codigo_postal': {'required': False},'municipio': {'required': False},'poblacion': {'required': False},
            'INE': {'required': False} 
        }

    # Definimos una función para crear al Solicitante
    def create(self, validated_data):
        user = self.context['request'].user
        solicitante = Solicitante.objects.create(
            curp=user.curp,
            nombre=user.nombre,
            email=user.email,
            is_active=True, 
            **validated_data
        )
        return solicitante

    # Definimos una función para la actualización del solicitante, recibiendo una instancia
    def update(self, instance, validated_data):
        # Actualizar los campos del Solicitante
        instance.curp = validated_data.get('curp', instance.curp)
        instance.email = validated_data.get('email', instance.email)
        instance.nombre = validated_data.get('nombre', instance.nombre)
        instance.ap_paterno = validated_data.get('ap_paterno', instance.ap_paterno)
        instance.ap_materno = validated_data.get('ap_materno', instance.ap_materno)
        instance.telefono = validated_data.get('telefono', instance.telefono)
        instance.sexo = validated_data.get('sexo', instance.sexo)
        instance.RFC = validated_data.get('RFC', instance.RFC)
        instance.direccion = validated_data.get('direccion', instance.direccion)
        instance.codigo_postal = validated_data.get('codigo_postal', instance.codigo_postal)
        instance.municipio = validated_data.get('municipio', instance.municipio)
        instance.poblacion = validated_data.get('poblacion', instance.poblacion)
        instance.INE = validated_data.get('INE', instance.INE)

        # Guardar el objeto Solicitante actualizado
        instance.save()
        # Retornamos la instancia actualizada
        return instance


class MunicipioSerializer(serializers.ModelSerializer):
    ''' Serializer para serializar los municipios'''
    class Meta:
        model = Municipio
        fields = '__all__'

class EstadoSerializer(serializers.ModelSerializer):
    ''' clase para serializar los estados'''
    class Meta:
        model = Estado
        fields = '__all__'
