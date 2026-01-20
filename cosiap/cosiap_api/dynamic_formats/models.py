from django.db import models
from common.nombres_archivos import nombre_archivo_formato
from django.db.models.signals import pre_save
from django.dispatch import receiver
from common.delete_old_files import borrar_archivo_viejo

class DynamicFormat(models.Model):
    '''
    Modelo que contiene la información de los formatos dinámicos.

    Campos:
    - **nombre**: Nombre del formato.
    - **template**: Archivo de plantilla asociado al formato.
    '''
    
    nombre = models.CharField(max_length=255, verbose_name="Nombre")
    template = models.FileField(upload_to=nombre_archivo_formato, verbose_name="Plantilla")

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = "Formato Dinámico"
        verbose_name_plural = "Formatos Dinámicos"
        ordering = ['nombre']


@receiver(pre_save, sender= DynamicFormat)
def borrar_template(sender, instance, **kwargs):
    borrar_archivo_viejo(sender, instance, field_name='template', **kwargs)
