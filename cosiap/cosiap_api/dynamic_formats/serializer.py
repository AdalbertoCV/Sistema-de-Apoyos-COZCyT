from rest_framework import serializers
from .models import DynamicFormat

class DynamicFormatSerializer(serializers.ModelSerializer):
    '''
    Clase para serializar los formatos dinámicos y manejar la lógica creación/edición
    '''
    class Meta:
        model = DynamicFormat
        fields = ['id', 'nombre', 'template']

    def create(self, validated_data):
        return DynamicFormat.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.nombre = validated_data.get('nombre', instance.nombre)
        instance.template = validated_data.get('template', instance.template)
        instance.save()
        return instance
