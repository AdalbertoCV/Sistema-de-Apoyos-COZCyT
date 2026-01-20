from django.db import models
from django.core.exceptions import ValidationError

class Convocatoria(models.Model):
    ''' 
    Modelo que guardará los datos de una convocatoria
    '''
    abierta = models.BooleanField(default=False)


class Colores(models.Model):
    logo = models.ImageField(upload_to='logos/', blank=True, null=True)
    principal= models.CharField(max_length=255, default='#E2746E')
    principal_mf = models.CharField(max_length=255, default='#781005')
    principal_f = models.CharField(max_length=255, default='#BB4433')
    principal_c = models.CharField(max_length=255, default='#F5ADAB')
    principal_mc = models.CharField(max_length=255, default='#FCE2E4')
    es_default = models.BooleanField(default=False)

    def clean(self):
        """
        Asegurar que solo haya una configuración por defecto.
        """
        if self.es_default and Colores.objects.filter(es_default=True).exclude(id=self.id).exists():
            raise ValidationError('Solo puede haber una configuración predeterminada.')

    def __str__(self):
        return f"Configuración de diseño - ID: {self.id}"

    class Meta:
        verbose_name = "Configuración de Estilo"
        verbose_name_plural = "Configuraciones de Estilo"