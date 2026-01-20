from rest_framework import serializers
from modalidades.models import Modalidad

class ModalidadSerializer(serializers.ModelSerializer):

    class Meta:
        model = Modalidad
        fields = '__all__'

    def create(self, validated_data):
        modalidad = Modalidad.objects.create(**validated_data)
        return modalidad

    def update(self, instance, validated_data):
        modalidad = super().update(instance, validated_data)
        return modalidad




