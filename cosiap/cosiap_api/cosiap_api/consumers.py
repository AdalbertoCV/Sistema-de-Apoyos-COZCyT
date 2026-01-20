import json
from channels.generic.websocket import AsyncWebsocketConsumer

class NotificacionConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        # Asociar la conexión WebSocket con el usuario
        self.user = self.scope["user"]
        await self.channel_layer.group_add(
            f"user_{self.user.id}",
            self.channel_name
        )

    async def disconnect(self, close_code):
        # Eliminar la asociación de la conexión WebSocket cuando se desconecta
        await self.channel_layer.group_discard(
            f"user_{self.user.id}",
            self.channel_name
        )

    async def notificar_notificacion(self, event):
        mensaje = event['mensaje']

        # Envía el mensaje al cliente
        await self.send(text_data=json.dumps({
            'mensaje': mensaje
        }))
