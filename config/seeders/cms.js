/* eslint-disable no-unused-vars */
const table = 'cms';
const listArray = [
  {
    pageName: 'Terms & Conditions',
    description: 'Lorem',
    cmsKey: 'terms_conditions',
    status: 'active',
  },
  {
    pageName: 'Privacy Policy',
    description: 'Lorem',
    cmsKey: 'privacy_policy',
    status: 'active',
  },
  {
    pageName: 'About Us',
    description: 'Lorem',
    cmsKey: 'about_us',
    status: 'active',
  },
  {
    pageName: 'Cancellation Policy',
    description: 'Lorem',
    cmsKey: 'cancellation_policy',
    status: 'active',
  },
  {
    pageName: 'Returns & Refund Policy',
    description: 'Lorem',
    cmsKey: 'returns_refund_policy',
    status: 'active',
  },
  {
    pageName: 'FAQs',
    description: 'Lorem',
    cmsKey: 'faq',
    status: 'active',
  },
  {
    pageName: 'How it Works',
    description: 'Lorem',
    cmsKey: 'how_it_works',
    status: 'active',
  },
  {
    pageName: 'Accessibility',
    description: 'Lorem',
    cmsKey: 'accessibility',
    status: 'active',
  },
];
const data = listArray.map((element) => ({
  page_name: element.pageName,
  status: element.status,
  created_at: new Date(),
  updated_at: new Date(),
  cms_key: element.cmsKey,
}));

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert(table, data, {}),
  down: (queryInterface, Sequelize) => queryInterface.bulkDelete(table, null, {}),
};
