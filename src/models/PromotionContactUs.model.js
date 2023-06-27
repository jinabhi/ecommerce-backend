import { Op } from 'sequelize';

module.exports = (sequelize, DataTypes) => {
  const PromotionContactUs = sequelize.define(
    'PromotionContactUs',
    {
      firstName: {
        type: DataTypes.STRING(50),
      },
      lastName: {
        type: DataTypes.STRING(50),
      },
      email: {
        type: DataTypes.STRING(100),
      },
      companyUrl: {
        type: DataTypes.STRING(250),
      },
      instagramHandle: {
        type: DataTypes.STRING(250),
      },
      phoneNumber: {
        type: DataTypes.STRING(16),
      },
      countryCode: {
        type: DataTypes.STRING(5),
        allowNull: false,
      },
      subject: {
        type: DataTypes.STRING(255),
      },
      message: {
        type: DataTypes.TEXT,
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
  PromotionContactUs.loadScopes = () => {
    PromotionContactUs.addScope('activePromotion', {
      where: {
        status: 'active',
      },
    });

    PromotionContactUs.addScope('notDeletedPromotion', {
      where: {
        status: { [Op.ne]: 'deleted' },
      },
    });
  };
  return PromotionContactUs;
};
