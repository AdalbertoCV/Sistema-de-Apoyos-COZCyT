class Mensaje:
    """
    Clase estática para manejar mensajes de distintos tipos en un diccionario de respuesta.
    Importacion: from notificaciones.mensajes import Mensaje as mensaje

    Métodos estáticos:
    - success(response, message): Añade un mensaje de éxito.
    - warning(response, message): Añade un mensaje de advertencia.
    - error(response, message): Añade un mensaje de error.
    - info(response, message): Añade un mensaje informativo.
    """
    
    @staticmethod
    def _add_message(data, tag, message=''):
        """
        Añade un mensaje al diccionario de respuesta bajo el tipo especificado.

        Parámetros:
        - data (dict): El diccionario de respuesta donde se añadirán los mensajes.
        - tag (str): El tipo de mensaje ('success', 'warning', 'error', 'info').
        - message (str, list, dict): El mensaje a añadir, que puede ser una cadena, lista o diccionario.
        """              
        if not isinstance(data, dict):
            raise TypeError("El argumento 'data' debe ser un diccionario.")
        
        if 'messages' not in data:
            data['messages'] = {}
        if tag not in data['messages']:
            data['messages'][tag] = []
        
        def add_recursive(msg, prefix=""):
            if isinstance(msg, str):
                data['messages'][tag].append(prefix + msg)
            elif isinstance(msg, list):
                for item in msg:
                    add_recursive(item, prefix)
            elif isinstance(msg, dict):
                for key, value in msg.items():
                    new_prefix = f"{prefix}{key}: " if prefix else f"{key}: "
                    add_recursive(value, new_prefix)
            else:
                raise TypeError("El argumento 'message' debe ser una cadena, lista o diccionario.")
        
        add_recursive(message)
    
    @staticmethod
    def success(response_data, message=''):
        """
        Añade un mensaje de éxito al diccionario de respuesta.

        Parámetros:
        - response_data (dict): El diccionario de respuesta.
        - message (str): El mensaje de éxito a añadir.
        """
        Mensaje._add_message(response_data, 'success', message)
    
    @staticmethod
    def warning(response_data, message=''):
        """
        Añade un mensaje de advertencia al diccionario de respuesta.

        Parámetros:
        - response_data (dict): El diccionario de respuesta.
        - message (str): El mensaje de advertencia a añadir.
        """
        Mensaje._add_message(response_data, 'warning', message)
    
    @staticmethod
    def error(response_data, message=''):
        """
        Añade un mensaje de error al diccionario de respuesta.

        Parámetros:
        - response_data (dict): El diccionario de respuesta.
        - message (str): El mensaje de error a añadir.
        """
        Mensaje._add_message(response_data, 'error', message)
    
    @staticmethod
    def info(response_data, message=''):
        """
        Añade un mensaje informativo al diccionario de respuesta.

        Parámetros:
        - response_data (dict): El diccionario de respuesta.
        - message (str): El mensaje informativo a añadir.
        """
        Mensaje._add_message(response_data, 'info', message)