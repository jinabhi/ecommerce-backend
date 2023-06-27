module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction((t) => Promise.all([
    queryInterface.changeColumn('orders', 'card_id', {
      type: Sequelize.STRING,
    }, { transaction: t }),
    queryInterface.changeColumn('orders', 'order_id', {
      type: Sequelize.INTEGER,
    }, { transaction: t }),
    queryInterface.addColumn('orders', 'credit_points', {
      type: Sequelize.INTEGER,
    }, { transaction: t }),
    queryInterface.addColumn('orders', 'credit_points_amount', {
      type: Sequelize.FLOAT,
    }, { transaction: t }),
  ])),
};
