/* eslint-disable no-param-reassign */
import { Op } from 'sequelize';

module.exports = (sequelize, DataTypes) => {
  const City = sequelize.define(
    'City',
    {
      city: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      stateId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      countryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
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

  City.loadScopes = () => {
    City.addScope('activeCity', {
      where: {
        status: 'active',
      },
    });

    City.addScope('notDeletedCity', {
      where: {
        status: { [Op.ne]: 'deleted' },
      },
    });
  };
  City.associate = (models) => {
    // associations can be defined here
    City.belongsTo(models.State, {
      foreignKey: 'stateId',
      onDelete: 'cascade',
      onUpdate: 'cascade',
    });
  };

  return City;
};
