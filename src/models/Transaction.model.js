module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define(
    'Transaction',
    {
      paymentId: {
        type: DataTypes.STRING(255),
      },
      orderId: {
        type: DataTypes.INTEGER,
      },
      apiResponse: {
        type: DataTypes.TEXT,
      },
      paymentStatus: {
        type: DataTypes.STRING(255),
      },
      status: {
        type: DataTypes.ENUM('refunded', 'failed', 'success'),
      },
    },
    {
      underscored: true,
    },
  );
  Transaction.associate = (models) => {
    Transaction.belongsTo(models.Order, {
      foreignKey: 'orderId',
      onDelete: 'cascade',
    });
  };

  return Transaction;
};
