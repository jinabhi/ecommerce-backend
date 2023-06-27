import { Op } from 'sequelize';
import utility from '../utils';
import config from '../config';

const defaultUserImage = `${config.app.baseUrl}public/default-images/defaultImage.png`;

module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    'Category',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      categoryImage: {
        type: DataTypes.STRING(255),
      },
      categoryImageUrl: {
        type: DataTypes.VIRTUAL,
        get() {
          const str = this.get('categoryImage');
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

  Category.associate = (models) => {
    Category.hasMany(models.SubCategory, {
      foreignKey: 'categoryId',
      onDelete: 'cascade',
      onUpdate: 'cascade',
    });
  };

  Category.loadScopes = () => {
    Category.addScope('activeCategory', {
      where: {
        status: 'active',
      },
    });

    Category.addScope('notDeletedCategory', {
      where: {
        status: { [Op.ne]: 'deleted' },
      },
    });
  };

  return Category;
};
