from django.db import models

class DynamicTableReport(models.Model):
    '''
    Clase para manejar y guardar las configuraciones de las tablas dinámicas y sus reportes generados
    Columnas:
    - model_name (Nombre del modelo que va a manejar)
    - columns (Lista de columnas del modelo)
    - exclude_columns (Lista de las columnas que no se van a incluir en el reporte)
    - search_query (Cadena de búsqueda para la obtención de los datos del modelo y sus relaciones)
    - filters (Filtros a aplicar recibidos desde el front)
    '''
    nombre = models.CharField(max_length=255)
    model_name = models.CharField(max_length=100)
    columns = models.JSONField()
    # Campos opcionales
    exclude_columns = models.JSONField(blank=True, null=True)
    search_query = models.CharField(max_length=100, blank=True, null=True)
    filters = models.JSONField(blank=True, null=True) 
    exclude_filters = models.JSONField(blank=True, null=True) 
    
    def __str__(self):
        return self.nombre
    
        

    
