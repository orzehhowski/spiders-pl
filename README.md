# spiders-pl

Well I wan't to create nice site with complete list of spiders occuring in Poland cuz I can't find any except wikipedia

App is devided into 3 containers - mysql server, express.js backend and vue.js frontend.

# tech stack

- express.js
- mysql (sequelize)
- vue
- docker

# how to run

you can run app with only docker installed, by creating `.env` files depending on examples, typing `docker-compose run frontend` and opening "Network" address given by Vite. If you want to install frontend or backend 3rd party dependencies locally, you can also use docker: `docker-compose run --rm npm-front install` and `docker-compose run --rm npm-back install`

When app is running, you can login as admin using email "admin@admin.pl" and password "wlodzimierzbialy123". To check non-admin functionality you can create new account or login as "test@test.pl" with password "jeremiaszruzowy321"
