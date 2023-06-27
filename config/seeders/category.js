/* eslint-disable no-async-promise-executor */
/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
const parentTable = 'categories';
const childTable = 'sub_categories';

const listArray = [
  {
    name: 'Makeup',
    categoryImage: 'public/all-icons/category/Makeup.png',
    status: 'active',
    subCategories: [
      {
        subCategoryImage: 'public/all-icons/sub-category/ic_eye_image.png',
        name: 'Eyes',
        status: 'active',
      },
      {
        subCategoryImage: 'public/all-icons/sub-category/ic_face_makeup.png',
        name: 'Face',
        status: 'active',
      },
      {
        subCategoryImage: 'public/all-icons/sub-category/ic_nail_makeup.png',
        name: 'Nails',
        status: 'active',
      },
      {
        subCategoryImage: 'public/all-icons/sub-category/ic_lips_makeup.png',
        name: 'Lips',
        status: 'active',
      },
    ],
  },
  {
    name: 'Skincare',
    categoryImage: 'public/all-icons/category/Skincare.png',
    status: 'active',
    subCategories: [
      {
        subCategoryImage: 'public/all-icons/sub-category/ic_moisturizer.png',
        name: 'Moisturizers',
        status: 'active',
      },
      {
        subCategoryImage: 'public/all-icons/sub-category/ic_cleansers.png',
        name: 'Cleansers',
        status: 'active',
      },
      {
        subCategoryImage: 'public/all-icons/sub-category/ic_treatment.png',
        name: 'Treatments',
        status: 'active',
      },
      {
        subCategoryImage: 'public/all-icons/sub-category/ic_mask.png',
        name: 'Masks',
        status: 'active',
      },
      {
        subCategoryImage: 'public/all-icons/sub-category/ic_eye_care.png',
        name: 'Eye Care',
        status: 'active',
      },
      {
        subCategoryImage: 'public/all-icons/sub-category/ic_lip_balms_&_treatments.png',
        name: 'Lip Balms & Treatments',
        status: 'active',
      },
      {
        subCategoryImage: 'public/all-icons/sub-category/ic_sunscreens.png',
        name: 'Sunscreen',
        status: 'active',
      },
      {
        subCategoryImage: 'public/all-icons/sub-category/ic_anti_aging.png',
        name: 'Anti-Aging',
        status: 'active',
      },
    ],
  },
  {
    name: 'Haircare',
    categoryImage: 'public/all-icons/category/Haircare.png',
    status: 'active',
    subCategories: [
      {
        subCategoryImage: 'public/all-icons/sub-category/ic_shampoo_&_conditioners.png',
        name: 'Shampoo & Conditioners',
        status: 'active',
      },
      {
        subCategoryImage: 'public/all-icons/sub-category/ic_treatment_haircare.png',
        name: 'Treatments',
        status: 'active',
      },
      {
        subCategoryImage: 'public/all-icons/sub-category/ic_styling.png',
        name: 'Styling',
        status: 'active',
      },
      {
        subCategoryImage: 'public/all-icons/sub-category/ic_curly_hair.png',
        name: 'Curly, Coily, Textured Haircare',
        status: 'active',
      },
      {
        subCategoryImage: 'public/all-icons/sub-category/ic_root_touchups.png',
        name: 'Hair Dye and Root Touch Ups',
        status: 'active',
      },
    ],
  },
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const arr = listArray.map(
      (item) => new Promise(async (resolve, reject) => {
        const category_id = await queryInterface.bulkInsert(
          parentTable,
          [
            {
              name: item.name,
              category_image: item.categoryImage,
              status: item.status,
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
          {},
        );
        const subItems = item.subCategories.map((element) => ({
          name: element.name,
          sub_category_image: element.subCategoryImage,
          category_id,
          status: element.status,
          created_at: new Date(),
          updated_at: new Date(),
        }));
        await queryInterface.bulkInsert(childTable, subItems, {});
        resolve();
      }),
    );
    await Promise.all(arr);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete(parentTable, null, {});
    await queryInterface.bulkDelete(childTable, null, {});
  },
};
