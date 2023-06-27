module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction((t) => Promise.all([
    queryInterface.addColumn('users', 'stripe_customer_id', {
      type: Sequelize.STRING,
    }, { transaction: t }),
  ])),
  down: (queryInterface) => queryInterface.sequelize.transaction((t) => Promise.all([
    queryInterface.removeColumn('users', 'stripe_customer_id', {
      transaction: t,
    }),
  ])),
};
