/* eslint-disable no-unused-vars */
const table = 'users';
const listArray = [
  {
    email: 'backend.gopal@mailinator.com',
    password: '$2a$08$dQWrGSXodiFE5gn7jphCB.tAFU30pzBRSueeBewbhTxfEnr8l/1FK',
    first_name: 'morluxury',
    last_name: 'api',
    status: 'active',
    phone_number: '4343345555',
    user_role: 'admin',
  },
  {
    email: 'backend.durgesh@mailinator.com',
    password: '$2a$08$dQWrGSXodiFE5gn7jphCB.tAFU30pzBRSueeBewbhTxfEnr8l/1FK',
    first_name: 'morluxury',
    last_name: 'api',
    status: 'active',
    phone_number: '4343349999',
    user_role: 'admin',
  },
  {
    email: 'backend.harshita@mailinator.com',
    password: '$2a$08$dQWrGSXodiFE5gn7jphCB.tAFU30pzBRSueeBewbhTxfEnr8l/1FK',
    first_name: 'morluxury',
    last_name: 'api',
    status: 'active',
    phone_number: '4343348888',
    user_role: 'admin',
  },
  {
    email: 'backend.ganesh@mailinator.com',
    password: '$2a$08$dQWrGSXodiFE5gn7jphCB.tAFU30pzBRSueeBewbhTxfEnr8l/1FK',
    first_name: 'morluxury',
    last_name: 'api',
    status: 'active',
    phone_number: '4343347777',
    user_role: 'admin',
  },
  {
    email: 'backend.vijeta@mailinator.com',
    password: '$2a$08$dQWrGSXodiFE5gn7jphCB.tAFU30pzBRSueeBewbhTxfEnr8l/1FK',
    first_name: 'morluxury',
    last_name: 'api',
    status: 'active',
    phone_number: '4343346666',
    user_role: 'admin',
  },
  {
    email: 'backend.gourav@mailinator.com',
    password: '$2a$08$dQWrGSXodiFE5gn7jphCB.tAFU30pzBRSueeBewbhTxfEnr8l/1FK',
    first_name: 'morluxury',
    last_name: 'api',
    status: 'active',
    phone_number: '434334444',
    user_role: 'admin',
  },
  {
    email: 'backend.swapnilk@mailinator.com',
    password: '$2a$08$dQWrGSXodiFE5gn7jphCB.tAFU30pzBRSueeBewbhTxfEnr8l/1FK',
    first_name: 'morluxury',
    last_name: 'api',
    status: 'active',
    phone_number: '4343343333',
    user_role: 'admin',
  },
  {
    email: 'backend.shubham@mailinator.com',
    password: '$2a$08$dQWrGSXodiFE5gn7jphCB.tAFU30pzBRSueeBewbhTxfEnr8l/1FK',
    first_name: 'morluxury',
    last_name: 'api',
    status: 'active',
    phone_number: '4343341111',
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
