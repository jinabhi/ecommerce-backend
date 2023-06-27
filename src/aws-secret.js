/* eslint-disable camelcase */
const AWS = require('aws-sdk');
const dotenv = require('dotenv');

// const dbConfig = config.database.mysql;
module.exports = () => {
  // configure AWS SDK
  const awsRegion = process.env.AWS_REGION;
  const secretId = process.env.AWS_SECRET_NAME;

  AWS.CredentialProviderChain.defaultProviders = [
    function () { return new AWS.EnvironmentCredentials('AWS'); },
    function () { return new AWS.EnvironmentCredentials('AMAZON'); },
    function () { return new AWS.SharedIniFileCredentials({ profile: 'default' }); },
    function () { return new AWS.EC2MetadataCredentials(); },
  ];

  const chain = new AWS.CredentialProviderChain();
  chain.resolve((err, cred) => {
    AWS.config.credentials = cred;
  });

  AWS.config.update({ region: awsRegion });

  const client = new AWS.SecretsManager(
    {
      apiVersion: 'latest',
      region: awsRegion,
    },
  );

  return new Promise((resolve, reject) => {
    // retrieving secrets from secrets manager
    client.getSecretValue({ SecretId: secretId }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        // parsing the fetched data into JSON
        const secretsJSON = JSON.parse(data.SecretString);
        // creating a string to store write to .env file
        const secretsString = '';
        Object.keys(secretsJSON).forEach((key) => {
          process.env[key] = secretsJSON[key];
        });
        dotenv.config();
        resolve(secretsString);
      }
    });
  });
};
