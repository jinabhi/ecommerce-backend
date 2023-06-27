module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('shipping_logs', 'is_shipping_type', {
    type: Sequelize.STRING,
    Comment: 'manual: user enter, auto: shipping api',
    defaultValue: 'auto',
  }),
  down: (queryInterface) => queryInterface.removeColumn(
    'shipping_logs',
    'is_shipping_type',
  ),

};
