/* eslint-disable no-param-reassign */
import { Op } from 'sequelize';

module.exports = (sequelize, DataTypes) => {
  const Inventory = sequelize.define(
    'Inventory',
    {
      availableQuantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      productId: {
        type: DataTypes.INTEGER,
      },
      inventoryStatus: {
        type: DataTypes.ENUM('lowInventory', 'outOfStock', 'inStock'),
        defaultValue: 'outOfStock',
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'deleted'),
        defaultValue: 'active',
      },
    },
    {
      underscored: true,
    },
  );

  Inventory.associate = (models) => {
    Inventory.belongsTo(models.Product, {
      foreignKey: 'productId',
      onDelete: 'cascade',
    });
    Inventory.hasMany(models.ShippingLog, {
      foreignKey: 'inventoryId',
      onDelete: 'cascade',
      onUpdate: 'cascade',
    });
  };

  Inventory.loadScopes = () => {
    Inventory.addScope('activeInventory', {
      where: {
        status: 'active',
      },
    });
    Inventory.addScope('notDeletedInventory', {
      where: {
        status: { [Op.ne]: 'deleted' },
      },
    });
  };

  return Inventory;
};
