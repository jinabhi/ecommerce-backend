import { Op } from 'sequelize';
import utils from '../utils';

module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    'Order',
    {
      orderId: {
        type: DataTypes.INTEGER,
        comment: '6 digit alphanumeric',
      },
      customerId: {
        type: DataTypes.INTEGER,
      },
      creditPoints: {
        type: DataTypes.INTEGER,
      },
      creditPointsAmount: {
        type: DataTypes.FLOAT,
      },
      orderAmount: {
        type: DataTypes.DECIMAL(10, 2),
      },
      addressId: {
        type: DataTypes.INTEGER,
      },
      trackingLink: {
        type: DataTypes.TEXT,
      },
      trackingNumber: {
        type: DataTypes.STRING,
      },
      invoiceImage: {
        type: DataTypes.STRING,
      },
      cardId: {
        type: DataTypes.STRING,
      },
      paymentType: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
        comment: '1: card, 2: paytm, 3: google pay , 4: paypal',
      },
      tax: {
        type: DataTypes.DECIMAL(10, 2),
      },
      currencyRate: {
        type: DataTypes.DECIMAL(10, 2),
      },
      earningStatus: {
        type: DataTypes.ENUM(
          'pending',
          'paid',
          'refund',
        ),
        defaultValue: 'pending',
      },
      status: {
        type: DataTypes.ENUM(
          'pending',
          'received',
          'packed',
          'pickedUp',
          'completed',
          'canceled',
          'deleted',
        ),
        defaultValue: 'pending',
      },
      packedOn: {
        type: DataTypes.DATE,
      },
      pickedUpOn: {
        type: DataTypes.DATE,
      },
      deliveredOn: {
        type: DataTypes.DATE,
      },
      canceledOn: {
        type: DataTypes.DATE,
      },
      invoiceImageUrl: {
        type: DataTypes.VIRTUAL,
        get() {
          const str = this.get('invoiceImage');
          return utils.getImage(str, null);
        },
      },
      orderWithCreditPoints: {
        type: DataTypes.VIRTUAL,
        get() {
          const str = this.get('creditPointsAmount');
          const str2 = this.get('orderAmount');

          return utils.sumAmount(str, str2);
        },
      },
    },
    {
      underscored: true,
    },
  );

  Order.associate = (models) => {
    Order.belongsTo(models.User, {
      as: 'customer',
      foreignKey: 'customerId',
      onDelete: 'cascade',
    });
    Order.belongsTo(models.Address, {
      foreignKey: 'addressId',
      onDelete: 'cascade',
    });
    Order.hasMany(models.OrderProduct, {
      foreignKey: 'orderId',
      as: 'orderDetails',
      onDelete: 'cascade',
    });
  };

  Order.loadScopes = () => {
    Order.addScope('activeOrder', {
      where: {
        status: 'received',
      },
    });

    Order.addScope('completed', {
      where: {
        status: 'completed',
      },
    });

    Order.addScope('notDeletedOrder', {
      where: {
        status: { [Op.ne]: 'deleted' },
      },
    });

    Order.addScope('pickedUpOrder', {
      where: {
        status: { [Op.eq]: 'pickedUp' },
      },
    });
  };

  return Order;
};
