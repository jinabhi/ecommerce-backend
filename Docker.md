
# Node
![Node Js](nodejs.png?raw=true "Nodejs Logo")
![Docker Compose](docker-compose-logo.png?raw=true "Docker Compose Logo")

#### Steps
##### Step 1
Copy - .env.docker.example file to .env.docker.dev Modify - Contents of .env.docker.dev file:
```sh
PROJECT_NAME=
NODE_VERSION=
NODE_PORT=
MONGO_PORT=
MYSQL_PORT=
MAILHOG_PORT=
MAILHOG_DASHBOARD_PORT=
NGINX_PORT=
REDIS_PORT=
DIRECTORY_PATH=
MYSQL_DATABASE=
MYSQL_USER=
MYSQL_PASSWORD=
MYSQL_ROOT_PASSWORD=
MONGO_INITDB_DATABASE=
MONGO_INITDB_ROOT_USERNAME=
MONGO_INITDB_ROOT_PASSWORD=
MONGO_INITDB_USER=
MONGO_INITDB_PWD=
```

##### Step 2
```sh
docker-compose --env-file ./.env.docker.dev up
```
##### Step 3
MySQL Database configuraton in Node .env must be update.
Example
```
DB_CONNECTION=mysql
DB_HOST=mysqldb
DB_PORT=3306
DB_DATABASE=dockerdb
DB_USERNAME=docker
DB_PASSWORD=docker
```
**Note:** DB_HOST will be "mysqldb" to connect with mysql container

---

##### Step 4
MongoDB Database configuraton in Node .env must be update.
Example
```
MONGODB_CONNECTION=mongo
MONGODB_HOST=mongodb
MONGODB_PORT=3306
MONGODB_DATABASE=dockerdb
MONGODB_USERNAME=docker
MONGODB_PASSWORD=docker
```
**Note:** 
1. DB_HOST will be "mongodb" to connect with mysql container
2. Don't use "@" and "#" in password         

---
## Accessing any container

```sh
docker exec -it <container_name> bash 
```
## Configure Ports details

| Service | Default Port |
| ------ | ------ |
| NODE_PORT| 3000 |
| NGINX_PORT | 80 |
| MYSQL_PORT| 3306 |
| MONGODB_PORT | 27017 |
| MAILHOG_DASHBOARD_PORT| 8025 |
| MAILHOG_SERVER_PORT | 1025 |
| REDIS_PORT | 6379 |

##  Other helpful command lines:
# Remove containers
```
docker rm -f <container-name>
```

# Stop all docker containers
```
docker rm -f $(docker ps -aq)
```

# Remove docker image
```
docker rmi -f <image-id OR name>
```

## License
<p align="center">
<a href="https://www.codiant.com/"><img src="https://www.codiant.com/assets/images/codiant-logo.svg" width="400"></a>
</p>
