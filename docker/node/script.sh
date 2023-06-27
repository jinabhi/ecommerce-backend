#!/bin/sh

project_directory=$1

echo ${project_directory}

if [ ! -f ${project_directory}/.env ]; then
    echo "########## .env file does not exist! ##########"
    cp ${project_directory}/.env.example ${project_directory}/.env
else
    echo "########## .env file already exist! ##########"
fi

npm install pm2 -g

npm install

pm2-runtime start --name node-api npm -- start