import { Op } from 'sequelize';

module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define(
    'Notification',
    {
      message: {
        type: DataTypes.STRING,
      },
      title: {
        type: DataTypes.STRING(100),
      },
      type: {
        type: DataTypes.STRING(100),
      },
      userId: {
        type: DataTypes.INTEGER(),
      },
      orderId: {
        type: DataTypes.INTEGER(),
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'deleted'),
        defaultValue: 'active',
      },
      isUnreadStatus: {
        type: DataTypes.ENUM('read', 'unread'),
        defaultValue: 'unread',
      },
    },
    {
      underscored: true,
    },
  );
  Notification.associate = (models) => {
    Notification.belongsTo(models.User, {
      foreignKey: 'userId',
    });
  };

  Notification.loadScopes = () => {
    Notification.addScope('activeNotification', {
      where: {
        status: 'active',
      },
    });

    Notification.addScope('notDeletedNotification', {
      where: {
        status: { [Op.ne]: 'deleted' },
      },
    });
  };
  return Notification;
};
