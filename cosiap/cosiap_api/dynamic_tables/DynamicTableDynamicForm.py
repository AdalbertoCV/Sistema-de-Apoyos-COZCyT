from .DynamicTable import DynamicTable
from dynamic_forms.models import DynamicForm
from solicitudes.models import Solicitud
from dynamic_forms.models import Respuesta
from dynamic_forms.serializers import RespuestaFormularioSerializer


class DynamicTableDynamicForm(DynamicTable):
    ''' 
    Clase que hereda de DynamicTable con el objetivo de especializar su comportamiento para la extracción de los 
    datos de un formulario dinámico
    '''

    def retrieve_instance_data(self, instance):
        ''' 
        Método sobreescrito para la vista detallada de la solicitud incluyendo su formulario dinámico
        '''
        solicitud = super().retrieve_instance_data(instance)
        solicitud_id = solicitud.get('id')
        solicitud_instance = Solicitud.objects.get(id=solicitud_id)
        form = RespuestaFormularioSerializer(solicitud_instance, dynamic_form_source='modalidad__dynamic_form')
        form_data = form.data

        solicitud['formulario'] = form_data
  
        return solicitud