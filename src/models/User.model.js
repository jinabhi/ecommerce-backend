/* eslint-disable no-param-reassign */
import { Op } from 'sequelize';
import config from '../config';
import utility from '../utils/index';

const defaultUserImage = `${config.app.baseUrl}public/default-images/defaultImage.png`;

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
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
      phoneNumber: {
        type: DataTypes.STRING(16),
      },
      password: {
        type: DataTypes.STRING(255),
      },
      phoneNumberCountryCode: {
        type: DataTypes.STRING(255),
      },
      token: {
        type: DataTypes.STRING(255),
      },
      userRole: {
        type: DataTypes.ENUM('admin', 'customer', 'seller', 'staff', 'guest'),
        default: null,
      },
      verificationStatus: {
        type: DataTypes.ENUM('otpVerified', 'userDetail', 'category', 'bankAccount', 'completed'),
        defaultValue: null,
      },
      changeNumberVerificationStatus: {
        type: DataTypes.BOOLEAN,
        default: false,
      },
      otp: {
        type: DataTypes.INTEGER,
      },
      lastLoginDate: {
        type: DataTypes.DATE,
      },
      socialId: {
        type: DataTypes.STRING(255),
        defaultValue: null,
      },
      socialType: {
        type: DataTypes.ENUM('facebook', 'apple', 'google'),
        defaultValue: null,
      },
      stripeCustomerId: {
        type: DataTypes.STRING(255),
        defaultValue: null,
      },
      isPushNotification: {
        type: DataTypes.BOOLEAN,
        comment: 'customer notification setting default true',
        defaultValue: true,
      },
      changePasswordLocation: {
        type: DataTypes.TEXT,
      },
      deviceType: {
        type: DataTypes.TEXT,
      },
      expireDateTime: {
        type: DataTypes.DATE,
      },
      profilePicture: {
        type: DataTypes.STRING(255),
        set(val) {
          let tmpStr = val;
          tmpStr = tmpStr.replace(/\\/g, '/');
          this.setDataValue('profilePicture', tmpStr);
        },
      },
      profilePictureUrl: {
        type: DataTypes.VIRTUAL,
        get() {
          const str = this.get('profilePicture');
          return utility.getImage(str, defaultUserImage, 'public');
        },
      },
      creditPoints: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      status: {
        type: DataTypes.ENUM('profileInComplete', 'pendingApproval', 'active', 'inactive', 'rejected', 'deleted'),
        defaultValue: 'profileInComplete',
      },
    },
    {
      underscored: true,
    },

  );
  User.associate = (models) => {
    User.hasMany(models.Address, {
      foreignKey: 'userId',
      as: 'userAddressDetails',
    });
    User.hasOne(models.Brand, {
      foreignKey: 'userId',
      as: 'sellerBrandDetail',
    });
    User.hasOne(models.SellerBankDetail, {
      foreignKey: 'userId',
      as: 'sellerBankDetail',
    });
    User.hasMany(models.ReviewRating, {
      foreignKey: 'userId',
      as: 'userByRating',
    });
    User.hasMany(models.Product, {
      foreignKey: 'sellerId',
    });
  };
  User.loadScopes = () => {
    User.addScope('activeUser', {
      where: {
        status: 'active',
      },
      attributes: {
        exclude: ['password'],
      },
    });

    User.addScope('notDeletedUser', {
      where: {
        status: { [Op.ne]: 'deleted' },
      },
      attributes: {
        exclude: ['password'],
      },
    });

    User.addScope('user', (data) => ({
      where: {
        [Op.and]: [
          { status: { [Op.ne]: 'deleted' } },
          data.where,
        ],
      },
      having: data.havingWhere,
      attributes: data.attributes,
    }));
  };

  return User;
};
