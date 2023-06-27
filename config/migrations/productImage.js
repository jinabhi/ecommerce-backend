module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('product_images', 'file_type', {
    type: Sequelize.STRING,
  }),
  down: (queryInterface) => queryInterface.removeColumn(
    'product_images',
    'file_type',
  ),

};
