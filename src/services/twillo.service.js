import twilio from 'twilio';
import config from '../config';
import loggers from './logger.service';
import utility from '../utils/index';

export default {

  /**
  * Otp send sms
  * @param {string} to
  * @param {string} message
  */
  async sendOtp(options) {
    try {
      const otpMessage = utility.getMessage({}, false, 'OTP_MESSAGE');
      const messageBody = {
        message: otpMessage.replace('{otp}', options?.otp ?? 4444),
        to: options.to,
      };
      return await this.sendMessage(messageBody);
    } catch (error) {
      loggers.error(`Otp send error: ${JSON.stringify(error)}`);
      throw Error(error);
    }
  },

  /**
  * Reset link mobile number
  * @param {string} to
  * @param {string} message
  */
  async forgotResetLink(options) {
    try {
      const messageBody = {
        message: `Morluxury account: Click on the following link to reset your password, ${options?.redirectUrl}`,
        to: options.to,
      };
      return await this.sendMessage(messageBody);
    } catch (error) {
      loggers.error(`Otp send error: ${JSON.stringify(error)}`);
      throw Error(error);
    }
  },

  /**
    * Reset link mobile number
    * @param {string} to
    * @param {string} message
    */
  async forgotResetLinkSms(options) {
    try {
      const messageBody = {
        message: `Morluxury account: Click on the following link to reset your password, ${options?.redirectUrlCheck}`,
        to: options.to,
      };
      return await this.sendMessage(messageBody);
    } catch (error) {
      loggers.error(`Otp send error: ${JSON.stringify(error)}`);
      throw Error(error);
    }
  },

  /**
   * Send sms
   * @param {string} to
   * @param {string} message
   */
  async sendMessage(options) {
    try {
      const {
        sms: { twilio: { accountSid, authToken, fromNumber } },
        // app: { adminUrl },
      } = config;
      const client = twilio(accountSid, authToken);
      const messageBody = {
        body: options.message,
        to: options.to,
        from: fromNumber,
      };
      loggers.info(`messageBody ${JSON.stringify(messageBody)}`);
      /** ******** Bulk sms and mms ********* */
      if (Array(options) && options.length > 0) {
        await Promise.all(options.map(async (item) => {
          messageBody.body = item.message;
          messageBody.to = item.to;
          await client.messages.create(messageBody);
        }));
      }
      const response = messageBody;
      const smsData = await client.messages.create(messageBody);
      loggers.info(`Successfully sent with message sid: ${JSON.stringify(smsData)}`);
      return response;
    } catch (error) {
      loggers.error(`Twilio Sms send error: ${JSON.stringify(error)}`);
      return error;
    }
  },
};
