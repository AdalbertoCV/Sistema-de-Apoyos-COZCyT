from uuid import uuid4
from django.conf import settings
import os  

# Función para generar nombre único de archivo
def generar_nombre_archivo(nombre_archivo, path, protected=True):
    '''
    Genera la ruta de un archivo de media con un nombre unico aleatorio.
    '''
    ext = nombre_archivo.split('.')[-1]
    nombre_unico = f"{uuid4().hex}.{ext}"
    if protected:
       path = os.path.join('protected_uploads/', path)
    return os.path.join(path, nombre_unico)

# Funciones para nombre de archivo específico para cada campo de FileField
def nombre_archivo_estado_cuenta(instance, filename):
    return generar_nombre_archivo(filename, 'estado_cuenta_files/')

def nombre_archivo_sat(instance, filename):
    return generar_nombre_archivo(filename, 'constancia_sat_files/')

def nombre_archivo_ine(instance, filename):
    return generar_nombre_archivo(filename, 'INE_files/')

def nombre_archivo_minuta(instance, filename):
    return generar_nombre_archivo(filename, 'minutas/',)

def nombre_archivo_convenio(instance, filename):
    return generar_nombre_archivo(filename, 'convenios/',)

def nombre_archivo_respuesta_doc(instance, filename):
    return generar_nombre_archivo(filename, 'respuesta_documentos/',)

def nombre_archivo_modalidad(instance, filename):
    return generar_nombre_archivo(filename, 'modalidades/', protected=False)

def nombre_archivo_formato(instance, filename):
    return generar_nombre_archivo(filename, 'formatos/', protected=False)