/* eslint-disable no-param-reassign */
import { Op } from 'sequelize';

module.exports = (sequelize, DataTypes) => {
  const Faq = sequelize.define(
    'Faq',
    {
      question: {
        type: DataTypes.TEXT,
      },
      answer: {
        type: DataTypes.TEXT,
      },
      type: {
        type: DataTypes.ENUM('seller', 'customer', 'promotional'),
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

  Faq.addScope('notDeletedFaq', {
    where: {
      status: { [Op.ne]: 'deleted' },
    },
  });
  Faq.addScope('activeFaq', {
    where: {
      status: 'active',
    },
  });

  return Faq;
};
