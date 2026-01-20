FROM node:alpine

WORKDIR /app
COPY ./package.json .
COPY ./package-lock.json .

#RUN npm install

COPY . .

EXPOSE 5173
ENTRYPOINT [ "sh", "/app/entrypoint.sh" ]