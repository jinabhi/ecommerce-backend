import { Op } from 'sequelize';

module.exports = (sequelize, DataTypes) => {
  const SellerBankDetail = sequelize.define(
    'SellerBankDetail',
    {
      routingNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      accountHolderName: {
        type: DataTypes.STRING(255),
      },
      accountNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
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

  SellerBankDetail.loadScopes = () => {
    SellerBankDetail.addScope('activeSellerBankDetail', {
      where: {
        status: 'active',
      },
    });

    SellerBankDetail.addScope('notDeleteSellerBankDetail', {
      where: {
        status: { [Op.ne]: 'deleted' },
      },
    });
  };
  return SellerBankDetail;
};
