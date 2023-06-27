import { Op } from 'sequelize';
import utility from '../utils';
import config from '../config';

const defaultUserImage = `${config.app.baseUrl}public/default-images/defaultImage.png`;
module.exports = (sequelize, DataTypes) => {
  const Banner = sequelize.define('Banner', {
    title: {
      type: DataTypes.STRING,
    },
    bannerImage: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'deleted'),
      defaultValue: 'active',
    },
    bannerImageUrl: {
      type: DataTypes.VIRTUAL,
      get() {
        const str = this.get('bannerImage');
        return utility.getImage(str, defaultUserImage, 'public');
      },
    },
  }, {
    underscored: true,
  });
  Banner.loadScopes = () => {
    Banner.addScope('activeBanner', {
      where: {
        status: 'active',
      },
    });
    Banner.addScope('notDeletedBanner', {
      where: {
        status: { [Op.ne]: 'deleted' },
      },
    });
  };
  return Banner;
};
