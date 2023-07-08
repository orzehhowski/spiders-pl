FROM node:16-alpine

COPY ./frontend/package.json /app/frontend/

WORKDIR /app/frontend

ENTRYPOINT [ "npm" ]