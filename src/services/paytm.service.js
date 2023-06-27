import paytmCheckSum from 'paytmchecksum';
import config from '../config';

const https = require('https');

export default {

  async verifyPayTmSignature(data) {
    /*
* import checksum generation utility
* You can get this utility from https://developer.paytm.com/docs/checksum/
*/

    try {
      const {
        paytmApiKey: {
          merchantKey, mid, callbackUrl, paytmHost, paytmWeb,
        },
      } = config;
      const paytmParams = {};
      paytmParams.body = {
        requestType: 'Payment',
        mid,
        websiteName: paytmWeb,
        orderId: data.orderId,
        callbackUrl: `${callbackUrl}${data.orderId}`,
        txnAmount: {
          value: data.value,
          currency: 'INR',
        },
        userInfo: {
          custId: data.userId,
        },
      };

      /*
  * Generate checksum by parameters we have in body
  * Find your Merchant Key in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys
  */
      const signature = await paytmCheckSum
        .generateSignature(JSON.stringify(paytmParams.body), merchantKey);

      return new Promise((resolve) => {
        if (signature) {
          paytmParams.head = {
            signature,
          };

          const postData = JSON.stringify(paytmParams);

          const options = {

            /* for Staging */
            hostname: paytmHost,

            /* for Production */
            // hostname: 'securegw.paytm.in',

            port: 443,
            path: `/theia/api/v1/initiateTransaction?mid=${mid}&orderId=${data.orderId}`,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': postData.length,
            },
          };

          let response = '';
          const postReq = https.request(options, (postRes) => {
            postRes.on('data', (chunk) => {
              response += chunk;
            });

            postRes.on('end', () => {
              resolve(response);
            });
          });
          postReq.write(postData);
          postReq.end();
        }
      });
    } catch (error) {
      throw Error(error);
    }
  },
};
