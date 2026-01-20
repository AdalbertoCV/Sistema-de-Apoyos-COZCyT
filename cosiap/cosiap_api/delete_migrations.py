import os
import shutil

def delete_migrations(project_dir):
    for root, dirs, files in os.walk(project_dir):
        if 'migrations' in dirs:
            migrations_dir = os.path.join(root, 'migrations')
            print(f"Eliminando archivos de migración en: {migrations_dir}")
            # Borra todos los archivos en el directorio de migraciones, excepto el archivo __init__.py
            for filename in os.listdir(migrations_dir):
                file_path = os.path.join(migrations_dir, filename)
                if filename != '__init__.py' and filename.endswith('.py'):
                    print(f"Eliminando archivo: {file_path}")
                    os.remove(file_path)
            # Si quieres eliminar también el archivo __init__.py, descomenta la siguiente línea
            # shutil.rmtree(migrations_dir)
            print(f"Archivos de migración eliminados en: {migrations_dir}")

if __name__ == "__main__":
    project_dir = os.path.dirname(os.path.abspath(__file__))
    delete_migrations(project_dir)
