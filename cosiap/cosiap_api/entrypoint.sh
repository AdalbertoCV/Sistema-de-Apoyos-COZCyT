#!/bin/sh

#waiting db 
set -e

host="db-cosiap"
user="root"
password="cosiap_root_password"

until python3 -c "import MySQLdb; MySQLdb.connect(host='$host', user='$user', passwd='$password', db='mysql')" >/dev/null 2>&1; do
  >&2 echo "Data Base is unavailable - sleeping"
  sleep 1
done

>&2 echo "Data Base is up - executing command"

#Django commands
>&2 echo "Ejecutando Migraciones"
#python3 manage.py makemigrations --name 
python3 manage.py migrate
#python3 manage.py collectstatic --no-input

cron 
python3 manage.py crontab add 

#gunicorn cosiap_api.wsgi:application --bind 0.0.0.0:8000
python3 manage.py runserver 0.0.0.0:8000