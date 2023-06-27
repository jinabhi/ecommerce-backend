import { Op } from 'sequelize';

// eslint-disable-next-line no-unused-vars
const scope = { status: { [Op.eq]: 'active ' } };
module.exports = (sequelize, DataTypes) => {
  const Address = sequelize.define(
    'Address',
    {
      fullName: {
        type: DataTypes.STRING,
      },
      cityId: {
        type: DataTypes.INTEGER,
      },
      stateId: {
        type: DataTypes.INTEGER,
      },
      countryCodeId: {
        type: DataTypes.STRING,
      },
      contactNumberCountryCode: {
        type: DataTypes.STRING,
      },
      zipCode: {
        type: DataTypes.STRING,
      },
      address: {
        type: DataTypes.STRING,
      },
      city: {
        type: DataTypes.STRING,
      },
      state: {
        type: DataTypes.STRING,
      },
      landmark: {
        type: DataTypes.STRING,
      },
      latitude: {
        type: DataTypes.STRING,
      },
      longitude: {
        type: DataTypes.STRING,
      },
      isDefault: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      userId: {
        type: DataTypes.INTEGER,
      },
      phoneNumber: {
        type: DataTypes.STRING,
      },
      addressType: {
        type: DataTypes.ENUM('home', 'office', 'other'),
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
  Address.loadScopes = () => {
    Address.addScope('activeAddress', {
      where: {
        status: 'active',
      },
    });
    Address.addScope('notDeletedAddress', {
      where: {
        status: { [Op.ne]: 'deleted' },
      },
    });
  };
  Address.associate = (models) => {
    // associations can be defined here
    Address.belongsTo(models.Country, {
      foreignKey: 'countryId',
      constraint: false,
    });
    Address.belongsTo(models.City, {
      foreignKey: 'cityId',
      constraint: false,
    });
    Address.belongsTo(models.State, {
      foreignKey: 'stateId',
      constraint: false,
    });
  };
  return Address;
};
