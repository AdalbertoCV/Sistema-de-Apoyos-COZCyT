from django.db import models
from common.validadores_campos import validador_pdf
from common.nombres_archivos import nombre_archivo_modalidad
from django.utils import timezone
import os
from django.db.models.signals import pre_save
from django.dispatch import receiver
from common.delete_old_files import borrar_archivo_viejo



DynamicForm = 'dynamic_forms.DynamicForm'

class Modalidad(models.Model):
    
    '''
    Modelo que contiene la informacion de una modalidad.

    Campos:
    - nombre: Nombre de la modalidad. Es un campo de texto con un máximo de 255 caracteres.
    - imagen: Imagen asociada a la modalidad. 
    - descripcion: Descripción de la modalidad. Es un campo de texto.
    - mostrar: Booleano que indica si la modalidad se debe mostrar o no. Por defecto es True.
    - archivado: Booleano que indica si la modalidad está archivada. Por defecto es False.
    - dynamic_form: Campo reservado para formularios dinámicos (actualmente no se usa).
    '''
    nombre = models.CharField(max_length=255, verbose_name="Nombre", null=False)
    imagen = models.ImageField(upload_to=nombre_archivo_modalidad, verbose_name="Imagen", null=False)
    descripcion = models.TextField(verbose_name="Descripción", null=False)  
    monto_maximo = models.FloatField(default=0.0, verbose_name="Monto")  
    mostrar = models.BooleanField(default=True)
    archivado = models.BooleanField(default=False)
    dynamic_form = models.ForeignKey('dynamic_forms.DynamicForm', on_delete=models.SET_NULL, verbose_name="Formulario", null=True, blank=False)

    def __str__(self):
        return f'{self.nombre}'
    
    class Meta:        
        ordering = ['nombre']



@receiver(pre_save, sender=Modalidad)
def borrar_imagen_vieja_modalidad(sender, instance, **kwargs):
    borrar_archivo_viejo(sender, instance, field_name='imagen', **kwargs)

