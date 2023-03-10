kill -n 9 $(fuser 8080/tcp | tail -n 1)
