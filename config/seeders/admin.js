/* eslint-disable no-unused-vars */
const table = 'users';
const listArray = [
  {
    email: 'backend@mailinator.com',
    password: '$2a$08$dQWrGSXodiFE5gn7jphCB.tAFU30pzBRSueeBewbhTxfEnr8l/1FK',
    first_name: 'morluxury',
    last_name: 'api',
    status: 'active',
    phone_number: '4343342222',
    user_role: 'admin',
  },
];
const data = listArray.map((element) => ({
  email: element.email,
  password: element.password,
  first_name: element.first_name,
  phone_number: element.phone_number,
  user_role: element.user_role,
  status: element.status,
  // verification_status: 'completed',
  created_at: new Date(),
  updated_at: new Date(),
}));

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert(table, data, {}),

  down: (queryInterface, Sequelize) => queryInterface.bulkDelete(table, null, {}),
};
