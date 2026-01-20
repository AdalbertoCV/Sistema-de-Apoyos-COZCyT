from django.contrib import admin
from dynamic_forms.models import DynamicForm, DynamicFormsSecciones,  \
    Seccion, SeccionesElementos, Elemento, ElementosOpciones, Opcion, \
    RegistroSeccion, Respuesta, RTextoCorto, RTextoParrafo, RNumerico, \
    RHora, RFecha, ROpcionMultiple, RDesplegable, RCasillas, RDocumento, RegistroFormulario

# Register your models here.
admin.site.register(DynamicForm)
admin.site.register(DynamicFormsSecciones)
admin.site.register(Seccion)
admin.site.register(SeccionesElementos)
admin.site.register(Elemento)
admin.site.register(ElementosOpciones)
admin.site.register(Opcion)
admin.site.register(RegistroSeccion)
admin.site.register(Respuesta)
admin.site.register(RTextoCorto)
admin.site.register(RTextoParrafo)
admin.site.register(RNumerico)
admin.site.register(RHora)
admin.site.register(RFecha)
admin.site.register(ROpcionMultiple)
admin.site.register(RDesplegable)
admin.site.register(RCasillas)
admin.site.register(RDocumento) 
admin.site.register(RegistroFormulario)