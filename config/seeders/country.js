/* eslint-disable no-async-promise-executor */
/* eslint-disable no-unused-vars */
const superTable = 'countries';
const parentTable = 'states';
const childTable = 'cities';

const listArray = [
  {
    name: 'India',
    countryCode: '+91',
    state: [
      {
        stateName: 'Madhya pradesh',
        city: [
          {
            city: 'Indore',
          },
          {
            city: 'Bhopal',
          },
          {
            city: 'Jabalpur',
          },
          {
            city: 'Ujjain',
          },
          {
            city: 'Khandwa',
          },
        ],
      },
      {
        stateName: 'Rajasthan',
        city: [
          {
            city: 'Jaipur',
          },
          {
            city: 'Jodhpur',
          },
          {
            city: 'Kota',
          },
          {
            city: 'Udaipur',
          },
          {
            city: 'Ajmer',
          },
        ],
      }],
  },
  {
    name: 'USA',
    countryCode: '+1',
    state: [
      {
        stateName: 'North Dakota',
        city: [
          {
            city: 'Fargo',
          },
          {
            city: 'Williston',
          },
          {
            city: 'Dickinson',
          },
          {
            city: 'Mandan',
          },
        ],
      },
      {
        stateName: 'Delaware',
        city: [
          {
            city: 'Bear',
          },
          {
            city: 'Georgetown',
          },
          {
            city: 'Smyrna',
          },
          {
            city: 'Milton',
          },
        ],
      },
      {
        stateName: 'California',
        city: [
          {
            city: 'Los Angeles',
          },
          {
            city: 'San Diego',
          },
          {
            city: 'San Jose',
          },
          {
            city: 'San Francisco',
          },
        ],
      },
      {
        stateName: 'Texas',
        city: [
          {
            city: 'Houston',
          },
          {
            city: 'San Antonio',
          },
          {
            city: 'Dallas',
          },
          {
            city: 'McKinney',
          },
        ],
      },
      {
        stateName: 'Florida',
        city: [
          {
            city: 'Jacksonville',
          },
          {
            city: 'Miami',
          },
          {
            city: 'Tampa',
          },
          {
            city: 'Orlando',
          },
        ],
      },
      {
        stateName: 'Hawaii',
        city: [
          {
            city: 'Honolulu',
          },
          {
            city: 'Kailua-Kona',
          },
          {
            city: 'Hilo',
          },
          {
            city: 'Hawi',
          },
        ],
      },
    ],
  },
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const arr = listArray.map((item) => new Promise(async (resolve, reject) => {
      const country = await queryInterface.bulkInsert(
        superTable,
        [
          {
            country: item.name,
            country_code: item.countryCode,
            status: 'active',
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
        {},
      );

      if (item?.countryCode === '+91') {
        await queryInterface.bulkInsert('currency_exchange_rates', [{
          rate: '79.00',
          country_id: country,
          name: 'INR',
          created_at: new Date(),
          updated_at: new Date(),
        }], {});
      }
      item.state.map(async (element) => {
        const stateValue = await queryInterface.bulkInsert(parentTable, [{
          state_name: element.stateName,
          country_id: country,
          status: 'active',
          created_at: new Date(),
          updated_at: new Date(),
        }], {});
        element.city.map(async (value) => {
          await queryInterface.bulkInsert(childTable, [{
            city: value.city,
            state_id: stateValue,
            country_id: country,
            status: 'active',
            created_at: new Date(),
            updated_at: new Date(),
          }], {});
          resolve();
        });
      });
    }));
    await Promise.all(arr);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete(superTable, null, { truncate: true, cascade: true });
    await queryInterface.bulkDelete(parentTable, null, { truncate: true, cascade: true });
    await queryInterface.bulkDelete(childTable, null, { truncate: true, cascade: true });
  },
};
