import utility from '../utils';
import config from '../config';

const defaultUserImage = `${config.app.baseUrl}public/default-images/defaultImage.png`;
module.exports = (sequelize, DataTypes) => {
  const MediaTemp = sequelize.define(
    'MediaTemp',
    {
      name: {
        type: DataTypes.STRING(255),
      },
      basePath: {
        type: DataTypes.TEXT,
      },
      baseUrl: {
        type: DataTypes.TEXT,
      },
      mediaType: {
        type: DataTypes.ENUM('image', 'file', 'audio', 'video', 'doc', 'upload'),
      },
      status: {
        type: DataTypes.ENUM('pending', 'used', 'deleted'),
        defaultValue: 'pending',
      },
      basePathThumbUrl: {
        type: DataTypes.VIRTUAL,
        get() {
          const str = this.get('basePath');
          return utility.getImage(str, defaultUserImage, 'public', true);
        },
      },
    },
    {
      underscored: true,
    },
  );
  return MediaTemp;
};
