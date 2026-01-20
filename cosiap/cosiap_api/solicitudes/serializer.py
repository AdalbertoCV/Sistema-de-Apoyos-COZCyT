from rest_framework import serializers
from .models import Solicitud, Minuta, Convenio

class MinutaSerializer(serializers.ModelSerializer):
    ''' 
    Serializer para la minuta de una solicitud
    '''
    class Meta:
        model = Minuta
        fields = ['archivo']

class ConvenioSerializer(serializers.ModelSerializer):
    ''' 
    Serializer para el convenio de una solicitud
    '''
    class Meta:
        model = Convenio
        fields = ['archivo']

class SolicitudSerializer(serializers.ModelSerializer):
    ''' 
    Serializer para listar las solicitudes 
    '''
    minuta = MinutaSerializer(read_only=True)
    convenio = ConvenioSerializer(read_only=True)
    
    class Meta:
        model = Solicitud
        fields = [
            'id', 
            'status', 
            'solicitud_n', 
            'minuta', 
            'convenio', 
            'monto_solicitado', 
            'monto_aprobado', 
            'modalidad', 
            'timestamp', 
            'observacion', 
            'solicitante'
        ]