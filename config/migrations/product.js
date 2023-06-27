module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction((t) => Promise.all([
    queryInterface.addColumn('products', 'reject_message', {
      type: Sequelize.TEXT,
      defaultValue: null,
    }, { transaction: t }),
    queryInterface.addColumn('products', 'product_status', {
      type: Sequelize.STRING,
      defaultValue: 'outOfStock',
      comment: 'lowInventory, outOfStock, inStock',
    }, { transaction: t }),
    queryInterface.addColumn('products', 'shipping_charges', {
      type: Sequelize.DECIMAL(10, 2),
    }, { transaction: t }),
  ])),
  down: (queryInterface) => queryInterface.sequelize.transaction((t) => Promise.all([
    queryInterface.removeColumn('products', 'reject_message', {
      transaction: t,
    }),
    queryInterface.removeColumn('products', 'product_status', {
      transaction: t,
    }),
    queryInterface.removeColumn('products', 'shipping_charges', {
      transaction: t,
    }),
  ])),
};
