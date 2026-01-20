from django.contrib import admin
from .models import Solicitud, Minuta, Convenio

class MinutaAdmin(admin.ModelAdmin):
    # Definir los campos que serán mostrados en el administrador
    list_display = ('id', 'archivo', 'get_formato')

    # Campo solo lectura para `_formato`
    readonly_fields = ('get_formato',)

    def get_formato(self, obj):
        return Minuta.get_formato()
    get_formato.short_description = 'Formato Minuta'

class ConvenioAdmin(admin.ModelAdmin):
    # Definir los campos que serán mostrados en el administrador
    list_display = ('id', 'archivo', 'get_formato')

    # Campo solo lectura para `_formato`
    readonly_fields = ('get_formato',)

    def get_formato(self, obj):
        return Convenio.get_formato()
    get_formato.short_description = 'Formato Convenio'

# Registrar los modelos en el administrador
admin.site.register(Minuta, MinutaAdmin)
admin.site.register(Convenio, ConvenioAdmin)

admin.site.register(Solicitud)

