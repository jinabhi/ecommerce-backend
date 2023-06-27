/* eslint-disable no-unused-vars */
const table = 'general_settings';
const listArray = [
  { name: 'tax', key: 'tax', value: 5 },
  { name: 'Credit Points ', key: 'credit_point', value: 10 },
  { name: 'Minimum Quantity Product', key: 'minimum_quantity_product', value: 5 },
  { name: 'Commission', key: 'commission', value: 5 },
  { name: 'Promotion Video', key: 'promotion_video', value: true },
  { name: 'Android force update', key: 'android_force_update', value: true },
  { name: 'Android app version', key: 'android_app_version', value: '1.0.0' },
  { name: 'Ios app version', key: 'ios_app_version', value: '1.0.0' },
  { name: 'Ios force update', key: 'ios_force_update', value: true },
  { name: 'Promotional contact us', key: 'promotional_contact_us', value: 'info@mor.luxury' },
];
const data = listArray.map((element) => ({
  name: element.name,
  key: element.key,
  value: element.value,
  status: 'active',
  created_at: new Date(),
  updated_at: new Date(),
}));
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert(table, data, {}),

  down: (queryInterface, Sequelize) => queryInterface.bulkDelete(table, null, {}),
};
