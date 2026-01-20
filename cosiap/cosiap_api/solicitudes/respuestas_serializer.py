from rest_framework import serializers
from dynamic_forms.models import (
    Opcion, Respuesta, Elemento, RegistroFormulario,
    RegistroSeccion, RNumerico, RCasillas, RDesplegable,
    RDocumento, RFecha, RHora, ROpcionMultiple,
    RTextoParrafo, RTextoCorto
)

class RespuestaSerializer(serializers.Serializer):
    seccion_id = serializers.IntegerField()
    elemento_id = serializers.IntegerField()
    valor_texto = serializers.CharField(max_length=255, required=False, allow_blank=True)
    valor_file = serializers.FileField(required=False, allow_empty_file=True)
    otro = serializers.CharField(max_length=255, required=False, allow_blank=True)

    def validate(self, data):
        registro_formulario = self.context['registro_formulario']
        seccion_id = data.get('seccion_id')
        elemento_id = data.get('elemento_id')

        # Verifica que el elemento existe
        try:
            elemento = Elemento.objects.get(id=elemento_id)
        except Elemento.DoesNotExist:
            raise serializers.ValidationError("El elemento especificado no existe.")

        # Busca o crea el registro de la sección
        registro_seccion, created = RegistroSeccion.objects.get_or_create(
            registro_formulario=registro_formulario,
            seccion_id=seccion_id
        )

        data['registro_seccion'] = registro_seccion
        data['elemento'] = elemento

        # Validación de los campos `valor_texto` y `valor_file`
        respuesta_class = Respuesta.RESPUESTA_TYPES.get(elemento.tipo)
        if respuesta_class:
            respuesta_instance = respuesta_class()

            if isinstance(respuesta_instance, RDocumento):
                valor_file = data.get('valor_file')
                if valor_file and not self._validate_file(valor_file, respuesta_instance):
                    raise serializers.ValidationError("El archivo no cumple con el formato esperado.")
            else:
                valor_texto = data.get('valor_texto')
                if not self._validate_value(valor_texto, respuesta_instance):
                    raise serializers.ValidationError("El valor del elemento no cumple con el formato esperado.")

    
            # Validación del campo `otro`
            if 'otro' in data and not self._validate_value(data['otro'], respuesta_instance):
                raise serializers.ValidationError("El campo 'otro' no cumple con el formato esperado.")

        return data

    def _validate_value(self, value, respuesta_instance):
        """
        Valida el valor del campo según el tipo de campo en la instancia del modelo.
        """
        if value is None or value == '':      
            return True

        if isinstance(respuesta_instance, RNumerico):
            try:
                float(value)  # Verifica si se puede convertir a float
                return True
            except ValueError:
                return False

        if isinstance(respuesta_instance, (RTextoCorto, RTextoParrafo, RDesplegable, ROpcionMultiple, RCasillas)):
            return isinstance(value, str)

        if isinstance(respuesta_instance, (RHora, RFecha)):
            return isinstance(value, str)  
        
        return True  # Si no es uno de los tipos conocidos, se considera válido

    def _validate_file(self, file, respuesta_instance):
        """
        Valida el archivo según el tipo de campo en la instancia del modelo.
        """
        # Puedes implementar validaciones adicionales según sea necesario
        if isinstance(respuesta_instance, RDocumento):
            return file.size <= 10 * 1024 * 1024  

        return True  # Si no hay validaciones específicas, se considera válido

    def create(self, validated_data):
        registro_seccion = validated_data['registro_seccion']
        elemento = validated_data['elemento']
        valor_texto = validated_data.get('valor_texto', None)
        valor_file = validated_data.get('valor_file', None)
        otro = validated_data.get('otro', None)

        # Determina el valor a utilizar
        if elemento.tipo == 'documento' and valor_file:
            valor = valor_file  # Si es tipo documento y hay un archivo
        elif elemento.tipo != 'documento' and valor_texto:
            valor = valor_texto  # Si no es tipo documento y hay texto
        else:
            valor = None  # Ninguno de los dos tiene valor

        respuesta = Respuesta.create_respuesta(
            registro_seccion=registro_seccion,
            elemento=elemento,
            valor= valor
        )

        return respuesta

    def update(self, instance, validated_data):
        valor_texto = validated_data.get('valor_texto', instance.valor)
        valor_file = validated_data.get('valor_file', instance.valor)
        otro = validated_data.get('otro', instance.otro)

        # Determina el nuevo valor
        if instance.elemento.tipo == 'documento' and valor_file:
            valor = valor_file  # Si es tipo documento y hay un archivo
        elif instance.elemento.tipo != 'documento' and valor_texto:
            valor = valor_texto  # Si no es tipo documento y hay texto
        else:
            valor = None  # Ninguno de los dos tiene valor
        
        updated_instance = instance.update_respuesta(valor=valor)
        return updated_instance
       