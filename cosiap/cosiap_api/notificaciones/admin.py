from django.contrib import admin
from .models import Notificacion, NotifInboxLastOpened

# Register your models here.
admin.site.register(Notificacion)
admin.site.register(NotifInboxLastOpened)