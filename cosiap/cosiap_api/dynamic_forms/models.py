from django.db import models
from model_utils.managers import InheritanceManager
from django.db import IntegrityError
from dynamic_formats.models import DynamicFormat
from common.nombres_archivos import nombre_archivo_respuesta_doc
from django.core.exceptions import ValidationError
from django.core.validators import MinLengthValidator, MaxLengthValidator
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

class Opcion(models.Model):
    """
    Modelo con la información de las opciones de los elementos de opción múltiple.

    Campos:
    - nombre (str, nombre de la opción.)
    """
    nombre = models.CharField(max_length=100, verbose_name='Nombre de la opción')
    class Meta:
        verbose_name_plural = ""        
        verbose_name_plural = '07. Opciones'


class Elemento(models.Model):
    """
    Modelo que define la información de los elementos.

    Campos:
    - nombre (str, Nombre del elemento.)
    - tipo (str, Indica qué tipo de elemento del formulario es, default Elemento.Tipo.TEXTO_CORTO.)
    - obligatorio (bool, Indica si la pregunta es obligatoria, default True.)
    - opcion_otro (bool, Indica si está habilitada la opción "otro" en preguntas de opción múltiple, default False.)
    - min_digits (int, Indica el número mínimo de dígitos permitido para un campo de tipo numérico, default 0.)
    - max_digits (int, Indica el número máximo de dígitos permitido para un campo de tipo numérico, default 10.)
    """
    class Tipo(models.TextChoices):        
        SEPARADOR = 'separador', 'Separador'
        NUMERICO = 'numerico', 'Numérico'
        TEXTO_CORTO = 'texto_corto', 'Texto Corto'
        TEXT_PARRAFO = 'texto_parrafo', 'Texto Párrafo'
        HORA = 'hora', 'Hora'
        FECHA = 'fecha', 'Fecha'
        OPCION_MULTIPLE = 'opcion_multiple', 'Opción Múltiple'
        CASILLAS = 'casillas', 'Casillas'
        DESPLEGABLE = 'desplegable', 'Desplegable'
        DOCUMENTO = 'documento', 'Documento'

    nombre = models.CharField(max_length=100, verbose_name='Nombre del elemento')
    tipo = models.CharField(max_length=20, choices=Tipo.choices, default=Tipo.TEXTO_CORTO, verbose_name='Tipo de elemento')
    obligatorio = models.BooleanField(default=True, verbose_name='¿Es obligatorio?')
    opcion_otro = models.BooleanField(default=False, verbose_name='¿Opción "otro"?')
    min_digits = models.IntegerField(default=0, verbose_name='Mínimo de dígitos')
    max_digits = models.IntegerField(default=10, verbose_name='Máximo de dígitos')

    opciones = models.ManyToManyField(Opcion, through='ElementosOpciones', verbose_name='Opciones', blank=True)
    formato = models.ForeignKey(DynamicFormat, on_delete=models.SET_NULL, verbose_name='Formato', default=None, null=True, blank=True)        
    class Meta:
        verbose_name_plural = '05. Elementos'


class ElementosOpciones(models.Model):
    """
    Modelo que contiene la información de las relaciones ManyToMany entre Elemento y Opcion.

    Campos:
    - elemento (Elemento, Elemento de la relación.)
    - opcion (Opcion, Opción de la relación.)
    - orden (int, Orden de la Opción en el elemento.)
    """
    elemento = models.ForeignKey(Elemento, on_delete=models.CASCADE, verbose_name='Elemento')
    opcion = models.ForeignKey(Opcion, on_delete=models.CASCADE, verbose_name='Opción')
    orden = models.IntegerField(verbose_name='Orden', default=0)
    class Meta:
        ordering = ['orden'] 
        unique_together = ('elemento', 'opcion')        
        verbose_name_plural = '06. Rel Elemento - Opciones'

class Seccion(models.Model):
    """
    Modelo que contiene la información de una Sección de un formulario dinámico.

    Campos:
    - nombre (str, Nombre de la sección.)
    - tipo (str, Tipo de sección, default Seccion.Tipo.UNICO)
    """
    class Tipo(models.TextChoices):        
        UNICO = 'unico', 'Único'
        LISTA = 'lista', 'Lista'

    nombre = models.CharField(max_length=100, verbose_name='Nombre de la sección')
    tipo = models.CharField(max_length=20, choices=Tipo.choices, default=Tipo.UNICO, verbose_name='Tipo de sección')

    elementos = models.ManyToManyField(Elemento, through='SeccionesElementos', verbose_name='Elementos', blank=True)
    class Meta:
        verbose_name_plural = '03. Secciones'


class SeccionesElementos(models.Model):
    """
    Modelo que contiene la información de las relaciones ManyToMany entre Sección y Elemento.

    Campos:
    - seccion (Seccion, Sección de la relación.)
    - elemento (Elemento, Elemento de la relación.)
    - orden (int, Orden del Elemento en la sección.)
    """
    seccion = models.ForeignKey(Seccion, on_delete=models.CASCADE, verbose_name='Sección')
    elemento = models.ForeignKey(Elemento, on_delete=models.CASCADE, verbose_name='Elemento')
    orden = models.IntegerField(verbose_name='Orden', default=0)
    class Meta:
        ordering = ['orden'] 
        unique_together = ('seccion', 'elemento')        
        verbose_name_plural = '04. Rel Secciones - Elementos'


class DynamicForm(models.Model):
    """
    Modelo que contiene la información de un DynamicForm.

    Campos:
    - nombre (str, Nombre del formulario dinámico)
    """
    nombre = models.CharField(max_length=100, verbose_name='Nombre del formulario')
    secciones = models.ManyToManyField(Seccion, through='DynamicFormsSecciones', verbose_name='Secciones', blank=True)
    class Meta:
        verbose_name_plural = "01. Formularios"

class DynamicFormsSecciones(models.Model):
    """
    Modelo que contiene la información de las relaciones ManyToMany entre DynamicForm y Sección.

    Campos:
    - dynamic_form (DynamicForm, DynamicForm de la relación.)
    - seccion (Seccion, Sección de la relación.)
    - orden (int, Orden de la Sección en el formulario.)
    """
    dynamic_form = models.ForeignKey(DynamicForm, on_delete=models.CASCADE, verbose_name='Formulario dinámico')
    seccion = models.ForeignKey(Seccion, on_delete=models.CASCADE, verbose_name='Sección')
    orden = models.IntegerField(verbose_name='Orden', default=0)
    class Meta:
        ordering = ['orden'] 
        unique_together = ('dynamic_form', 'seccion')
        verbose_name_plural = '02. Rel ormulario - Secciones'

class RegistroFormulario(models.Model):
    #Formulario que se encarga de agrupar todos los registros de un Formulario
    pass

class RegistroSeccion(models.Model):
    '''
        Modelo que define el id de una lista de respuestas de una seccion 
        Campos:
        -id (id)    has
    '''
    registro_formulario = models.ForeignKey(RegistroFormulario, on_delete=models.CASCADE)   
    seccion = models.ForeignKey(Seccion, on_delete=models.CASCADE, null=False, blank=False)     

    class Meta:
        verbose_name_plural = '08. Rel Respuestas Agrecacion'        

class Respuesta(models.Model):
    '''
        Modelo que define la infromacion abstracta de una respuesta.

        Campos: 
        - registro (RAgregacion, lista de seccion Agregacion a la que pertenece la respuesta.)
        - solicitud (Solicitud, solicitud a la que pertenece la respuesta.)
        - elemento (Elemento, elemento al que pertenece la  respuesta.)
        - otro (None, Campo donde se almacena la opcion otro, no definido en esta clase)
    '''    
    RESPUESTA_TYPES = None

    registro_seccion = models.ForeignKey(RegistroSeccion, on_delete=models.CASCADE, null=False, blank=False)     
    elemento = models.ForeignKey(Elemento, on_delete=models.CASCADE, null=False, blank=False)
    valor = None
    otro = None   

    objects = InheritanceManager()

    class Meta:        
        verbose_name = 'Respuesta'
        verbose_name_plural = '09. Respuestas'   
        unique_together = ('registro_seccion', 'elemento')             
        
    @classmethod
    def create_respuesta(cls, **kwargs):
        respuesta_class = cls.RESPUESTA_TYPES.get(kwargs['elemento'].tipo)
        if not respuesta_class:
            raise ValidationError(f"No se puede encontrar un tipo de respuesta para el tipo de elemento {kwargs['elemento'].tipo}")

        respuesta = respuesta_class(**kwargs)
        respuesta.clean()
        respuesta.save()
        return respuesta

    def update_respuesta(self, valor=None, otro=None):
        """
        Actualiza una respuesta existente con los nuevos valores proporcionados.
        """
        # Asegurarte de que estás trabajando con la subclase correcta
        instancia = self.__class__.objects.get_subclass(pk=self.pk)

        if hasattr(instancia, 'valor'):
            print(f"Actualizando 'valor' de {instancia.valor} a {valor}")
            instancia.valor = valor

        if hasattr(instancia, 'otro') and otro is not None:
            print(f"Actualizando 'otro' de {instancia.otro} a {otro}")
            instancia.otro = otro

        instancia.clean()
        instancia.save()
        return instancia


    def clean(self):
        """
        Método `clean` abstracto para ser sobrescrito en las subclases.
        """
        pass
    
    def getStringValue(self):
        return 'Respuesta no Implementado'



class RNumerico(Respuesta):
    valor = models.FloatField()

    def getStringValue(self):
        if self.valor is None:
            return '-----'
        else :
            return str(self.valor)      
    class Meta:
        verbose_name_plural = '10. R Numericos'   

    def get_validators(self):
        validators = []
        elemento = self.elemento if self.pk else None
        if elemento:
            if elemento.min_digits is not None:
                validators.append(MinLengthValidator(elemento.min_digits))
            if elemento.max_digits is not None:
                validators.append(MaxLengthValidator(elemento.max_digits))
        return validators

    def clean(self):
        super().clean()
        for validator in self.get_validators():
            validator(self.valor)

        obligatorio = self.elemento.obligatorio    
        if (not self.valor or not self.valor.strip()) and obligatorio:
            raise ValidationError("Este campo es Obligatorio.")
        

class RTextoCorto(Respuesta):
    valor = models.CharField(max_length=255, null=True,  blank=True)

    def getStringValue(self):
        if self.valor is None:
            return '-----'
        else :
            return str(self.valor) 
    class Meta:
        verbose_name_plural = '11. R TextoCortos'

    def clean(self):
        super().clean()
        obligatorio = self.elemento.obligatorio    
        if (not self.valor or not self.valor.strip()) and obligatorio:
            raise ValidationError("Este campo es Obligatorio.")        


class RTextoParrafo(Respuesta):
    valor = models.TextField(null=True,  blank=True)

    def getStringValue(self):
        if self.valor is None:
            return '-----'
        else :
            return str(self.valor)   
    class Meta:
        verbose_name_plural = '12. R TextoParrafos'

    def clean(self):
        super().clean()
        obligatorio = self.elemento.obligatorio    
        if (not self.valor or not self.valor.strip()) and obligatorio:
            raise ValidationError("Este campo es Obligatorio.")


class RHora(Respuesta):
    valor = models.TimeField(null=True,  blank=True)

    def getStringValue(self):
        if self.valor is None:
            return '-----'
        else :
            return str(self.valor)    
    class Meta:
        verbose_name_plural = '13. R Horas'

    def clean(self):
        super().clean()
        obligatorio = self.elemento.obligatorio    
        if (not self.valor) and obligatorio:
            raise ValidationError("Este campo es Obligatorio.")


class RFecha(Respuesta):
    valor = models.CharField(max_length=255, null=True,  blank=True)


    def getStringValue(self):
        if self.valor is None:
            return '-----'
        else :
            return str(self.valor)
    class Meta:
        verbose_name_plural = '14. R Fechas'

    def clean(self):
        super().clean()
        obligatorio = self.elemento.obligatorio    
        if (not self.valor) and obligatorio:
            raise ValidationError("Este campo es Obligatorio.")

class ROpcionMultiple(Respuesta):
    valor = models.CharField(max_length=100,null=True, blank=True)
    otro = models.CharField(max_length=255, verbose_name="Otro", null=True,  blank=True)

    def getStringValue(self):
        if self.valor and self.valor.nombre == 'Otro':
            return str(self.valor)+': '+str(self.otro)
        else :
            if self.valor is None:
                return '-----'
            else :
                return str(self.valor)
    class Meta:
        verbose_name_plural = '15. R Opcion Multiples'

    def clean(self):
        super().clean()
        obligatorio = self.elemento.obligatorio            
        opcOtro = self.elemento.opcion_otro     
        respuesta = self.valor      
        otro = self.otro        
        if (not respuesta) and obligatorio:
            raise ValidationError("Este campo es Obligatorio.")        
        if obligatorio:
            if not ((opcOtro and (otro and otro.strip())) or not opcOtro) and (respuesta and respuesta == 'Otro'):
                raise ValidationError("Este campo es obligatorio")
        if (otro and otro.strip()) and (respuesta and not respuesta == 'Otro'):
            raise ValidationError("No esta seleccionada opcion Otro")        
        if respuesta and (respuesta == 'Otro' and not( otro and otro.strip())):
            raise ValidationError("Si eliges 'otro', debes proporcionar más detalles en el campo 'otro'.")  

class RCasillas(Respuesta):
    valor = models.CharField(max_length=100,null=True, blank=True)
    otro = models.CharField(max_length=255, verbose_name="Otro", null=True, blank=True)

    def getStringValue(self):
        string = ''
        objs = self.valor.all()
        for i, obj in enumerate(objs):
            string += str(obj)
            if obj == 'Otro':
                string += ': '+ str(self.otro)
            if i < len(objs) - 1:
                string += ', '
        if string == '':
            return '-----'
        else :           
            return string
    class Meta:
        verbose_name_plural = '16. R Casillas'

    def clean(self):
        super().clean()
        respuesta = self.valor    
        noRespuesta = respuesta == None             
        obligatorio = self.elemento.obligatorio                                                                
        if (noRespuesta) and obligatorio:
            raise ValidationError("Este campo es Obligatorio.")          

class RDesplegable(Respuesta):
    valor = models.CharField(max_length=100,null=True, blank=True)
    otro = models.CharField(max_length=255, verbose_name="Otro", null=True,  blank=True)

    def getStringValue(self):
        if self.valor and self.valor == 'Otro':
            return str(self.valor)+': '+str(self.otro)
        else :
            if self.valor is None:
                return '-----'
            else :
                return str(self.valor)
    class Meta:
        verbose_name_plural = '17. R Desplegables'
 

class RDocumento(Respuesta):
    class Status(models.TextChoices):    
        REVISANDO = 'revisando', 'En revisión'
        VALIDO = 'valido', 'Válido'
        INVALIDO = 'invalido', 'Inválido'     

    valor = models.FileField(verbose_name='Subir Documento', upload_to=nombre_archivo_respuesta_doc , null=True,  blank=True)
    status = models.CharField(verbose_name='Status', max_length=255, choices=Status.choices, default=Status.REVISANDO)
    observacion = models.CharField(verbose_name='Observacion', max_length=255, null=True, blank=True)

    def getStringValue(self):
        return self.valor.name if self.valor else '-----'
    class Meta:
        verbose_name_plural = '18. R Documentos'

    def clean(self):
        super().clean()
        respuesta = self.valor       
        obligatorio = self.elemento.obligatorio     
        if (not respuesta) and obligatorio:
            raise ValidationError("Este campo es Obligatorio.")    


Respuesta.RESPUESTA_TYPES = {
        Elemento.Tipo.NUMERICO: RNumerico,
        Elemento.Tipo.TEXTO_CORTO: RTextoCorto,
        Elemento.Tipo.TEXT_PARRAFO: RTextoParrafo,
        Elemento.Tipo.HORA: RHora,
        Elemento.Tipo.FECHA: RFecha,
        Elemento.Tipo.OPCION_MULTIPLE: ROpcionMultiple,
        Elemento.Tipo.CASILLAS: RCasillas,
        Elemento.Tipo.DESPLEGABLE: RDesplegable,
        Elemento.Tipo.DOCUMENTO: RDocumento,
    }