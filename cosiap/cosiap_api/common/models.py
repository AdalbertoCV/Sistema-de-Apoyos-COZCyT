from django.db import models

# Create your models here.
class SingletonModel(models.Model):
    ''' 
    Modelo Singleton para objetos que solo necesitan una instancia
    '''

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        """
        Guarda el objeto en la base de datos y elimina los dema si existen
        """
        self.__class__.objects.exclude(id=self.id).delete()
        super(SingletonModel, self).save(*args, **kwargs)

    @classmethod
    def get_object(cls):
        """
        Carga el objeto de la base de datos. Si no existe ningun objeto
        se crea uno nuevo sin guardar y lo devuelve.        
        """
        try:
            return cls.objects.get()
        except cls.DoesNotExist:
            return cls()
