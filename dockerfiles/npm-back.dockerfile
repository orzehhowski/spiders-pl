FROM node:16-alpine

COPY ./backend/package.json /app/backend/

WORKDIR /app/backend

ENTRYPOINT [ "npm" ]