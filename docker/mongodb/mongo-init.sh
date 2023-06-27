#!/bin/bash

set -e

mongo <<EOF
use admin 
db.createUser(
  {
    user: "${MONGO_INITDB_USER}",
    pwd: "${MONGO_INITDB_PWD}",
    roles: [ { role: "dbOwner", db: "${MONGO_INITDB_DATABASE}" } ]
  }
);

use ${MONGO_INITDB_DATABASE}
db.createCollection("users")
db.users.insert({"name": "john"})
EOF
