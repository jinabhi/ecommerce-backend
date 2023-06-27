import { Op } from 'sequelize';

module.exports = (sequelize, DataTypes) => {
  const ReviewRating = sequelize.define(
    'ReviewRating',
    {
      productId: {
        type: DataTypes.INTEGER,
      },
      userId: {
        type: DataTypes.INTEGER,
      },
      orderId: {
        type: DataTypes.INTEGER,
      },
      review: {
        type: DataTypes.STRING,
      },
      rating: {
        type: DataTypes.FLOAT,
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

  ReviewRating.associate = (models) => {
    ReviewRating.belongsTo(models.Product, {
      foreignKey: 'productId',
      onDelete: 'cascade',
    });
    ReviewRating.belongsTo(models.User, {
      foreignKey: 'userId',
    });
    ReviewRating.belongsTo(models.Order, {
      foreignKey: 'orderId',
    });
  };
  ReviewRating.loadScopes = () => {
    ReviewRating.addScope('activeReviewRating', {
      where: {
        status: 'active',
      },
    });

    ReviewRating.addScope('notDeletedReviewRating', {
      where: {
        status: { [Op.ne]: 'deleted' },
      },
    });
  };
  return ReviewRating;
};
