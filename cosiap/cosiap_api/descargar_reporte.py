import requests
import urllib.parse
import json


base_url = "http://localhost:8000/api/solicitudes/reportes/exportar/"
filters = {"status": {"iexact": ["Aprobado"]}}

# Convertir el diccionario a una cadena JSON
filters_json = json.dumps(filters)

# Codificar la cadena JSON para usarla en la URL
encoded_filters = urllib.parse.quote(filters_json)

# Construir la URL completa
url = f"{base_url}?filters={encoded_filters}"

print(url)
headers = {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzI5OTAwNDAwLCJpYXQiOjE3Mjk4MTQwMDAsImp0aSI6IjVmYTM1ZGU2ZGM4ZDQ1MDBhMTZmYzAwM2E5ZTExMTQ2IiwidXNlcl9pZCI6OX0.GbkUOLbFCu4FAP6rHxkmldOlNY5VxZ-0Nf2RZ_x28_8"
}

response = requests.get(url, headers=headers)

if response.status_code == 200:
    with open("archivo.zip", "wb") as f:
        f.write(response.content)
    print("Archivo descargado exitosamente.")
else:
    print(f"Error: {response.status_code}")