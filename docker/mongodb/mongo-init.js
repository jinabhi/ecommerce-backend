/* eslint-disable no-undef */
db.createUser(
  {
    user: 'node',
    pwd: 'node@123',
    roles: [
      {
        role: 'dbOwner',
        db: 'docker-db',
      },
    ],
  },
);
