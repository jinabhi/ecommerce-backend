import { Op } from 'sequelize';

module.exports = (sequelize, DataTypes) => {
  const Country = sequelize.define(
    'Country',
    {
      country: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      countryCode: {
        type: DataTypes.STRING(5),
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

  Country.loadScopes = () => {
    Country.addScope('activeCountry', {
      where: {
        status: 'active',
      },
    });

    Country.addScope('notDeletedCountry', {
      where: {
        status: { [Op.ne]: 'deleted' },
      },
    });
  };

  Country.associate = (models) => {
    // associations can be defined here
    Country.hasMany(models.State, {
      foreignKey: 'countryId',
      onDelete: 'cascade',
      onUpdate: 'cascade',
    });
  };

  return Country;
};
