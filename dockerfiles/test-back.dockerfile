FROM node:alpine

COPY ./backend/package.json /app/backend/

WORKDIR /app/backend

RUN npm install

COPY ./backend .

CMD ["npm", "run", "test"]