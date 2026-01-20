from django.db import models
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.core.validators import RegexValidator
from django.contrib.auth.models import PermissionsMixin
from django.core.exceptions import ValidationError 
from common.nombres_archivos import nombre_archivo_estado_cuenta, nombre_archivo_ine, nombre_archivo_sat
from django.db.models.signals import pre_save
from django.dispatch import receiver
from common.delete_old_files import borrar_archivo_viejo


# modelo con la información de los estados de la república
class Estado(models.Model):
    nombre = models.CharField(verbose_name="Nombre Estado", max_length=191, null=False)
    created_at = models.DateTimeField(verbose_name="created_at", auto_now_add=True, null=True)
    updated_at = models.DateTimeField(verbose_name="updated_at", auto_now=True, null=True)

    def __str__(self):
        return self.nombre

# modelo con la información de los municipios de un estado
class Municipio(models.Model):
    estado = models.ForeignKey(Estado, verbose_name="Estado", on_delete=models.CASCADE)
    cve_mun = models.PositiveIntegerField(verbose_name="Clave Municipio", null=False)
    nombre = models.CharField(verbose_name="Nombre Municipio", max_length=191, null=False)    
    created_at = models.DateTimeField(verbose_name="created_at", auto_now_add=True, null=True)
    updated_at = models.DateTimeField(verbose_name="updated_at", auto_now=True, null=True)

    def save(self, *args, **kwargs):
        # Generar el ID combinando estado y cve_mun como una cadena
        self.id = f"{self.estado_id}{self.cve_mun}"
        super(Municipio, self).save(*args, **kwargs)

    def __str__(self):
        return self.nombre
    class Meta:
        ordering = ['estado', 'nombre']
        unique_together = ('estado', 'cve_mun')


# modelo para el registro de los datos bancarios del solicitante
class DatosBancarios(models.Model):
    # Choices para el campo de régimen fiscal
    REGIMEN_CHOICES = [
    ('1', 'Régimen Simplificado de Confianza'),
    ('2', 'Sueldos y salarios e ingresos asimilados a salarios'),
    ('3', 'Régimen de Actividades Empresariales y Profesionales'),
    ('4', 'Régimen de Incorporación Fiscal'),
    ('5', 'Enajenación de bienes'),
    ('6', 'Régimen de Actividades Empresariales con ingresos a través de Plataformas Tecnológicas'),
    ('7', 'Régimen de Arrendamiento'),
    ('8', 'Intereses'),
    ('9', 'Obtención de premios'),
    ('10', 'Dividendos'),
    ('11', 'Demás Ingresos'),
    ('12', 'Sin obligaciones fiscales')
    ]

    # identificador del objeto
    id = models.BigAutoField(primary_key=True)
    # nombre del banco al que pertenece la cuenta
    nombre_banco = models.CharField(verbose_name="Nombre banco", max_length=20)
    # numero de cuenta
    cuenta_bancaria = models.CharField(verbose_name="No. Cuenta", max_length=10)
    # clabe interbancaria
    clabe_bancaria = models.CharField(verbose_name="Clabe bancaria", max_length=16)
    # archivo de el estado de cuenta
    doc_estado_cuenta = models.FileField(verbose_name="Estado de cuenta", upload_to= nombre_archivo_estado_cuenta, null=True, blank=True)
    # archivo de el comporbante de situación fiscal
    doc_constancia_sat = models.FileField(verbose_name="Constancia Situación Fiscal", upload_to= nombre_archivo_sat , null=True, blank=True)
    # código postal fiscal
    codigo_postal_fiscal = models.CharField(verbose_name="Código Postal Físcal", max_length=5)
    # regimen fiscal al que pertenece
    regimen = models.CharField(max_length=255, choices=REGIMEN_CHOICES)


class UsuarioManager(BaseUserManager):
    def create_user(self, email, curp, nombre, password=None, is_admin=False, is_staff=False, is_active=False):        
        user = self.model(
            email=self.normalize_email(email),
            curp=curp,
            nombre=nombre,
            is_staff=is_staff,
            is_active=is_active
        )
        user.set_password(password)  
        user.save(using=self._db)
        return user
        
    def create_superuser(self, email, curp, nombre, password=None, **extra_fields):        
        user = self.model(
            email=self.normalize_email(email),
            curp=curp,
            nombre=nombre,
            is_staff=True,
            is_superuser=True,
            is_active=True,
            **extra_fields
        )
        user.set_password(password)        
        user.save(using=self._db)
        return user

class Usuario(AbstractBaseUser, PermissionsMixin):
    """ Clase base de los usuarios del sistema. """
    
    CURP_REGEX = r'^[A-Z]{1}[AEIOU]{1}[A-Z]{2}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])[HM]{1}(AS|BC|BS|CC|CS|CH|CL|CM|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]{1}[0-9]{1}$'    

    nombre = models.CharField(
        verbose_name="Nombre", max_length=191, blank=False, null=True)    
    curp = models.CharField(
        verbose_name="CURP", max_length=18, 
        validators=[RegexValidator(CURP_REGEX,'Debe ser un CURP valido.')],
        unique=True)
    email = models.EmailField(verbose_name="E-mail", blank=False, null=False, unique=True)
    is_staff = models.BooleanField(default=False)    
    is_active = models.BooleanField(default=False)  # Cambiamos este campo a inactivo por defecto

    EMAIL_FIELD = 'email'
    USERNAME_FIELD = 'curp'    
    REQUIRED_FIELDS = ['nombre','email']
    objects = UsuarioManager()

    def __str__(self):
        return self.curp
    
    class Meta:        
        ordering = ['-is_superuser', 'id' ]

SEXO_CHOICES = [
    ("M", "Masculino"),
    ("F", "Femenino"),
    ("O", "Otro")
]
class Solicitante(Usuario):
    '''
    Calse para representar al solicitante (Hereda de Usuario)
    '''
    # validador para el formato del RFC
    RFC_REGEX = r'^([A-ZÑ&]{3,4}) ?(?:- ?)?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?(?:- ?)?([A-Z\d]{2})([A\d])$'

    # campos para los apellidos
    ap_paterno = models.CharField(verbose_name='Apellido Paterno',max_length=50, null=True, blank=True)
    # campo de apellido materno es opcional
    ap_materno = models.CharField(verbose_name='Apellido Materno', max_length=50, null=True, blank=True)
    # campo para telefono, longitud maxima de 10
    telefono = models.CharField(verbose_name='Teléfono', max_length=10, null=True, blank=True)
    # campo para el RFC, longitud de 13
    RFC = models.CharField(verbose_name='RFC', max_length=13, validators=[RegexValidator(RFC_REGEX,'Debe ser un RFC válido.')], unique=True, null=True, blank=True)
    sexo = models.CharField(verbose_name="Sexo", max_length=1, choices=SEXO_CHOICES)
    # campo para la dirección
    direccion = models.CharField(verbose_name='Dirección', max_length=255, null=True, blank=True)
    # campo para el código postal, longitud 5
    codigo_postal = models.CharField(verbose_name='Código Postal', max_length=5, null=True, blank=True)
    # relación con el municipio mediante llave foránea
    municipio = models.ForeignKey(Municipio, verbose_name="Municipio",null=True, blank=True, on_delete=models.SET_NULL)
    # campo para la poblacion
    poblacion = models.CharField(verbose_name='Población', max_length=255, null=True, blank=True)
    # campo de relacion uno a uno con los datos bancarios
    datos_bancarios = models.OneToOneField(DatosBancarios, verbose_name="Datos Bancarios",null=True, blank=True, on_delete=models.SET_NULL)
    # campo para la identificación oficial
    INE = models.FileField(verbose_name='INE', upload_to= nombre_archivo_ine , null=True, blank=True)

    def __str__(self):
        return self.nombre

    @property
    # Método para determinar si todos los datos del solicitante estan completos
    def datos_completos(self):
        # campos requeridos
        required_fields = ['ap_paterno', 'telefono', 'RFC', 'direccion', 'codigo_postal', 'municipio', 'poblacion', 'INE']
        # verificamos que cada uno de los campos este lleno
        return all(getattr(self, field) for field in required_fields)


@receiver(pre_save, sender= DatosBancarios)
def borrar_constancia_sat(sender, instance, **kwargs):
    borrar_archivo_viejo(sender, instance, field_name='doc_constancia_sat', **kwargs)

@receiver(pre_save, sender= DatosBancarios)
def borrar_estado_cuenta(sender, instance, **kwargs):
    borrar_archivo_viejo(sender, instance, field_name='doc_estado_cuenta', **kwargs)

@receiver(pre_save, sender= Solicitante)
def borrar_INE(sender, instance, **kwargs):
    borrar_archivo_viejo(sender, instance, field_name='INE', **kwargs)