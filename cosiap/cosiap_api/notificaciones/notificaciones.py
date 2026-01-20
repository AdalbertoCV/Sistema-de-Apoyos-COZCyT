from .models import Notificacion
from django.urls import reverse

# importar como: from mensajes import notificaciones as notif

"""
 Ejemplos:
    solicitante = get_object_or_404(Solicitante, pk=request.user.id)  
    notif.nueva(solicitante, 'Mi mensaje', 'usuarios:perfil')

    notif.nueva(solicitante, titulo='MI TITULO', mensaje='Mi mensaje', url='solicitudes:convocatoria', urlArgs=[id])
"""

def nueva(solicitante, mensaje, url=None, urlArgs=None, titulo=Notificacion.TITULO_DEFAULT):
    '''
    Funcion que sirve para crear una nueva notificacion facilmente desde una vista.
    
    Argumentos:
    - *usuario*: Usuario al que va dirigida la notificación.
    - *mensaje*: Mensaje de la notificación.
    - *url* : Nombre de la URL asociada a la notificación. Puede estar en blanco o ser nulo.
    - *urlArgs* : Argumentos de la URL en formato JSON. Puede estar en blanco o ser nulo.
    - *titulo* : Título de la notificación. Puede estar en blanco o ser nulo.    

    Retorna: 
    - Instancia de Notificacion creada.
    '''
    return Notificacion.objects.create(solicitante=solicitante, titulo=titulo, mensaje=mensaje, urlName=url, urlArgs=urlArgs)

