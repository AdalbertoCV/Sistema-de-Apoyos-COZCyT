import os  
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

def validador_pdf(value):
    '''
    Validador para campos de archivo que verifica que su extencion sea un pdf
    '''
    ext = os.path.splitext(value.name)[1]  # Obtener la extensión del archivo
    valid_extensions = ['.pdf']  # Lista de extensiones permitidas
    if ext.lower() not in valid_extensions:
        raise ValidationError(_('Sólo se permiten archivos en formato PDF.'))

def validador_archivo_1MB(value):
   '''Validador que valida que un archivo subido no sobrepase el tamaño de 1MB'''
   filesize = value.size
   if filesize > 1048576: # 1MB
       raise ValidationError("El archivo es demasiado grande. El tamaño máximo permitido es 1MB.")