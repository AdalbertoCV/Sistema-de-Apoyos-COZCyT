from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.urls import reverse
from django.conf import settings


class NotifInboxLastOpened(models.Model):
    '''
    Modelo que registra la última vez que un usuario abrió su bandeja de entrada de notificaciones.

    Campos:
    - **usuario**: Usuario al que pertenece el registro. Debe ser único.
    - **timestamp**: Fecha y hora en que el usuario abrió su bandeja de entrada por última vez. Se autogenera cuando se crea o actualiza el registro.
    '''
    
    usuario = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, unique=True, verbose_name="Usuario")
    timestamp = models.DateTimeField(auto_now=True, verbose_name="Fecha y hora de última apertura")

    def __str__(self):
        return f'Última apertura de {self.usuario.username} en {self.timestamp}'

    class Meta:
        verbose_name = "Última apertura de bandeja de entrada"
        verbose_name_plural = "Últimas aperturas de bandeja de entrada"
        ordering = ['-timestamp']
    
class Notificacion(models.Model):
    ''' 
    Modelo que contiene la información de las notificaciones.

    Campos:
    - *usuario*: Usuario al que va dirigida la notificación.
    - *leido*: Booleano que indica si el mensaje ya ha sido abierto. Por defecto es False.
    - *titulo*: Título de la notificación. Por defecto es "Sistema de Apoyos COZCYT". Puede estar en blanco o ser nulo.
    - *mensaje*: Mensaje de la notificación.
    - *urlName*: Nombre de la URL asociada a la notificación. Puede estar en blanco o ser nulo.
    - *urlArgs*: Argumentos de la URL en formato JSON. Puede estar en blanco o ser nulo.
    - *timestamp*: Fecha y hora en que la notificación fue creada. Se autogenera cuando se crea la notificación.
    '''
    TITULO_DEFAULT = 'Sistema de Apoyos COZCYT'

    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name="Usuario")
    leido = models.BooleanField(default=False)
    titulo = models.CharField(max_length=255, blank=True, null=True, default=TITULO_DEFAULT)
    mensaje = models.TextField()
    urlName = models.CharField(max_length=255, blank=True, null=True) 
    urlArgs = models.JSONField(blank=True, null=True)  
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['usuario', '-timestamp']

    def __str__(self):
        return f'Notificación de {self.usuario} - {self.timestamp}'

@receiver(post_save, sender=Notificacion)
def notificar_nueva_notificacion(sender, instance, created, **kwargs):        
    if created:
        if instance.usuario.is_authenticated:
            # Lógica para enviar la notificación al usuario
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f'user_{instance.usuario.id}',
                {
                    'type': 'notificar_notificacion',
                    'mensaje': 'nuevaNotificacion',
                }
            )        