/* eslint-disable no-param-reassign */
import { Op } from 'sequelize';
import utility from '../utils';
import config from '../config';

const defaultUserImage = `${config.app.baseUrl}public/default-images/defaultImage.png`;

module.exports = (sequelize, DataTypes) => {
  const DamageProductImage = sequelize.define(
    'DamageProductImage',
    {
      productComplaintId: {
        type: DataTypes.INTEGER,
      },
      damageImage: {
        type: DataTypes.STRING,
      },
      damageImageUrl: {
        type: DataTypes.VIRTUAL,
        get() {
          const str = this.get('damageImage');
          return utility.getImage(str, defaultUserImage, 'public');
        },
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

  DamageProductImage.loadScopes = () => {
    DamageProductImage.addScope('activeDamageProductImage', {
      where: {
        status: 'active',
      },
    });

    DamageProductImage.addScope('notDeletedDamageProductImage', {
      where: {
        status: { [Op.ne]: 'deleted' },
      },
    });
  };

  return DamageProductImage;
};
