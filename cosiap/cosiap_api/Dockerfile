# For more information, please refer to https://aka.ms/vscode-docker-python
FROM debian:latest

EXPOSE 8000

# Configure timezone
ENV TZ=America/Mexico_City
RUN ln -snf  /etc/l/usr/share/zoneinfo/$TZocaltime && echo $TZ > /etc/timezone

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1

# Install requirements
RUN apt update
RUN apt -y upgrade
RUN apt-get -y install\
    python3 python3-pip\
    pkg-config libmariadb-dev \
    python3-cffi python3-brotli libpango-1.0-0 libpangoft2-1.0-0 \
    cron \
    lsb-release curl gpg    
COPY requirements.txt .
RUN pip3 install -r requirements.txt --break-system-packages

WORKDIR /app
COPY . /app

COPY ./entrypoint.sh /app/
ENTRYPOINT [ "sh", "/app/entrypoint.sh" ]
