module.exports = (sequelize, DataTypes) => {
  const UserDevice = sequelize.define(
    'UserDevice',
    {
      userId: {
        type: DataTypes.INTEGER,
      },
      timezone: {
        type: DataTypes.STRING(255),
      },
      deviceId: {
        type: DataTypes.STRING(255),
      },
      accessToken: {
        type: DataTypes.TEXT,
      },
      deviceType: {
        type: DataTypes.ENUM('web', 'ios', 'android'),
      },
    },
    {
      underscored: true,
    },
  );
  UserDevice.associate = (models) => {
    UserDevice.belongsTo(models.User, {
      foreignKey: 'userId', onDelete: 'cascade',
    });
  };
  return UserDevice;
};
