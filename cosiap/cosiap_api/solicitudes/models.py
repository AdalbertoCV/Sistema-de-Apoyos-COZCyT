from django.db import models
from common.nombres_archivos import nombre_archivo_minuta, nombre_archivo_convenio
from common.validadores_campos import validador_archivo_1MB, validador_pdf
from dynamic_formats.models import DynamicFormat
from users.models import Solicitante
from modalidades.models import Modalidad
from dynamic_forms.models import RegistroFormulario

class Minuta(models.Model):
    '''
    Modelo que contiene la información de las minutas.

    Campos:
    - *archivo*: Archivo de la minuta.
    
    Métodos:
    - *get_formato()*: Devuelve el formato común de todas las instancias de Minuta.
    - *set_formato(value)*: Establece el formato común para todas las instancias de Minuta.
    '''    
    archivo = models.FileField(upload_to=nombre_archivo_minuta, validators=[validador_archivo_1MB, validador_pdf], verbose_name="Archivo")
    # Atributo de clase común a todas las instancias
    _formato = None

    @classmethod
    def get_formato(cls):
        '''
        Devuelve el formato común de todas las instancias de Minuta.
        '''
        if cls._formato is None:
            formato_minuta = DynamicFormat.objects.filter(nombre="formato_minuta_default").first()
            cls._formato = formato_minuta
        return cls._formato

    @classmethod
    def set_formato(cls, value):
        '''Establece el formato común para todas las instancias de Minuta.       
        Args:
        - value: El nuevo valor del formato.
        '''
        cls._formato = value

    def save(self, *args, **kwargs):
        '''
        Sobrescribe el método save para asegurarse de que el formato
        se asigne al crear o actualizar la instancia.
        '''
        # Intenta encontrar el formato dinámico al guardar la instancia
        formato_minuta = DynamicFormat.objects.filter(nombre="formato_minuta_default").first()
        if formato_minuta:
            self._formato = formato_minuta
        else:
            self._formato = None

        # Llama al método save original
        super(Minuta, self).save(*args, **kwargs)

    def __str__(self):
        return f'Minuta {self.pk}'

    class Meta:
        verbose_name = "Minuta"
        verbose_name_plural = "Minutas"
        ordering = ['pk']


class Convenio(models.Model):
    '''
    Modelo que contiene la información de los Convenios.

    Campos:
    - *archivo*: Archivo del convenio.
    
    Métodos:
    - *get_formato()*: Devuelve el formato común de todas las instancias de Convenio.
    - *set_formato(value)*: Establece el formato común para todas las instancias de Convenio.
    '''    
    archivo = models.FileField(upload_to=nombre_archivo_convenio, validators=[validador_archivo_1MB, validador_pdf], verbose_name="Archivo")
    # Atributo de clase común a todas las instancias
    _formato = None

    @classmethod
    def get_formato(cls):
        '''
        Devuelve el formato común de todas las instancias de Convenio.
        '''
        if cls._formato is None:
            formato_convenio = DynamicFormat.objects.filter(nombre="formato_convenio_default").first()
            cls._formato = formato_convenio
        return cls._formato

    @classmethod
    def set_formato(cls, value):
        '''Establece el formato común para todas las instancias de Convenio.       
        Args:
        - value: El nuevo valor del formato.
        '''
        cls._formato = value

    def save(self, *args, **kwargs):
        '''
        Sobrescribe el método save para asegurarse de que el formato
        se asigne al crear o actualizar la instancia.
        '''
        # Intenta encontrar el formato dinámico al guardar la instancia
        formato_convenio = DynamicFormat.objects.filter(nombre="formato_convenio_default").first()
        if formato_convenio:
            self._formato = formato_convenio
        else:
            self._formato = None

        # Llama al método save original
        super(Convenio, self).save(*args, **kwargs)

    def __str__(self):
        return f'Convenio {self.pk}'

    class Meta:
        verbose_name = "Convenio"
        verbose_name_plural = "Convenios"
        ordering = ['pk']



class Solicitud(models.Model):
    """
        Modelo que contiene la información de referencia de una solicitud.

        Campos:
        - status  (Estado de la solicitud.)
        - solicitud_n  (Campo autoincremental que identifica la solicitud.)
        - minuta  (Relación opcional a un modelo Minuta, puede ser nulo, por defecto es nulo.)
        - convenio  (Relación one-to-one con un modelo Convenio, puede ser nulo, por defecto es nulo.)
        - monto_solicitado  (Monto solicitado, por defecto es 0.0.)
        - monto_aprobado  (Monto aprobado, por defecto es 0.0.)
        - modalidad  (Relación con un modelo Modalidad, requerido. Al eliminar, se establece como nulo.)
        - timestamp  (Marca de tiempo de la solicitud.)
        - observacion  (Observaciones adicionales, puede ser nulo.)
        - solicitante  (Relación con un modelo Solicitante, requerido. Al eliminar, se establece como nulo.)
    """

    STATUS_CHOICES = [
    ('Pendiente', 'En revisión'),
    ('Aprobado', 'Aprobado'),
    ('Rechazado', 'Rechazado'),
    ]

    status = models.CharField(verbose_name='Status', max_length=255, choices= STATUS_CHOICES)
    solicitud_n = models.IntegerField(verbose_name='Num. Solicitud', null=True, blank=True, unique=True)
    minuta = models.ForeignKey(Minuta, verbose_name='Minuta', on_delete=models.SET_NULL, null=True, blank=True)
    convenio = models.OneToOneField(Convenio, verbose_name='Convenio', on_delete=models.SET_NULL, null=True, blank=True)
    monto_solicitado = models.FloatField(verbose_name='Monto Solicitado', default=0.0)
    monto_aprobado = models.FloatField(verbose_name='Monto Aprobado', default=0.0)
    modalidad = models.ForeignKey(Modalidad, verbose_name='Modalidad', on_delete=models.CASCADE, null=True, blank=True)
    timestamp = models.DateTimeField(verbose_name='Timestamp', auto_now_add=True)
    observacion = models.TextField(verbose_name='Observación', null=True, blank=True)
    solicitante = models.ForeignKey(Solicitante, verbose_name='Solicitante', on_delete=models.CASCADE, null=True, blank=True)
    registro_formulario = models.OneToOneField(RegistroFormulario, on_delete=models.SET_NULL, null=True, blank=True)

    def save(self, *args, **kwargs):
        # Validación para que el monto_aprobado no exceda el monto máximo de la modalidad
        if self.modalidad and self.monto_aprobado > self.modalidad.monto_maximo:
            raise ValueError("El monto aprobado no puede exceder el monto máximo permitido por la modalidad asociada.")
        # Si no tiene un registro_formulario asignado, lo creamos
        if not self.registro_formulario:
            self.registro_formulario = RegistroFormulario.objects.create()
        super().save(*args, **kwargs)

