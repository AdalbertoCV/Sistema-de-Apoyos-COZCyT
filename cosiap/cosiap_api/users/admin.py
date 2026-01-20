from django.contrib import admin
from django.contrib.auth.admin import UserAdmin 
from users.models import Usuario, Solicitante, Municipio, Estado, DatosBancarios

# Register your models here.

class UserAdmin(UserAdmin):

    add_fieldsets = (
        (None, {'fields': ('curp', 'password1', 'password2')}),
        ('Información personal', {'fields': ('nombre', 'email')}),
        ('Permisos', {'fields': ('is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Login info', {'fields': ('last_login',)}),
    ) 
    # Campos que se mostrarán en el formulario de usuario en el sitio de administración
    fieldsets = (
        (None, {'fields': ('curp', 'password')}),
        ('Información personal', {'fields': ('nombre', 'email')}),
        ('Permisos', {'fields': ('is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Login info', {'fields': ('last_login',)}),
    )
    # Campos que se mostrarán en la lista de usuarios en el sitio de administración
    list_display = ('curp', 'nombre', 'email', 'is_staff', 'is_superuser', 'is_active')
    # Campos por los que se puede buscar en la lista de usuarios en el sitio de administración
    search_fields = ('curp', 'nombre', 'email', 'is_active')
    # Muestra el campo de contraseña como un campo de contraseña enmascarado
    #readonly_fields = ('password',)
    # Eliminar la configuración de ordering
    ordering = ['id']

    list_filter = ('is_staff', 'is_superuser', 'is_active')
    
admin.site.register(Usuario, UserAdmin)
admin.site.register(Solicitante)
admin.site.register(Estado)
admin.site.register(Municipio)
admin.site.register(DatosBancarios)