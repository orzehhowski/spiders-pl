# spiders-pl

Well I wan't to create nice site with complete list of spiders occuring in Poland cuz I can't find any except wikipedia

App is devided into 3 containers - mysql server, express.js backend and vue.js frontend.

# tech stack

- express.js
- mysql (sequelize)
- vue
- docker

# how to run

you can run app with only docker installed, by typing `docker-compose run frontend`. If you want to install frontend/backend 3rd party dependencies locally, you can also use docker: `docker-compose run --rm npm-front install` and `docker-compose run --rm npm-back install`
