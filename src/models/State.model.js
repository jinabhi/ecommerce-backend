/* eslint-disable no-param-reassign */
import { Op } from 'sequelize';

module.exports = (sequelize, DataTypes) => {
  const State = sequelize.define(
    'State',
    {
      stateName: {
        type: DataTypes.STRING(255),
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
  State.loadScopes = () => {
    State.addScope('notDeletedState', {
      where: {
        status: { [Op.ne]: 'deleted' },
      },
    });
    State.addScope('activeState', {
      where: {
        status: 'active',
      },
    });
  };

  State.associate = (models) => {
    // associations can be defined here
    State.hasMany(models.City, {
      foreignKey: 'stateId',
      onDelete: 'cascade',
      onUpdate: 'cascade',
    });
    State.belongsTo(models.Country, {
      foreignKey: 'countryId',
      onDelete: 'cascade',
      onUpdate: 'cascade',
    });
  };
  return State;
};
