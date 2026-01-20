import os
from django.db.models.signals import pre_save
from django.dispatch import receiver

def borrar_archivo_viejo(sender, instance, field_name, **kwargs):
    # Verifica si el objeto ya existe (es un update)
    if instance.pk:
        try:
            # Obtiene la instancia antigua del modelo
            old_instance = sender.objects.get(pk=instance.pk)
            old_file = getattr(old_instance, field_name)
            new_file = getattr(instance, field_name)
         
            if old_file and old_file != new_file:
                if os.path.isfile(old_file.path):
                    os.remove(old_file.path)
        except sender.DoesNotExist:
            pass