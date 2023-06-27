module.exports = (sequelize, DataTypes) => sequelize.define(
  'CurrencyExchangeRates',
  {
    countryId: {
      type: DataTypes.INTEGER,
    },
    rate: {
      type: DataTypes.DECIMAL(10, 2),
    },
    name: {
      type: DataTypes.STRING,
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
