import nodemailer from 'nodemailer';
import mandrillTransport from 'nodemailer-mandrill-transport';
import config from '../config';
import logger from './logger.service';
import sendGridService from './sendgrid.service';

export default {
  /**
   * Verify email server
   * @param {object} options
   * @returns
   */
  async verifyEmailServer(options) {
    try {
      const { mail: { smtp }, app: { mailEnv } } = config;
      const transport = nodemailer.createTransport(smtp);

      if (mailEnv === 'development') {
        return await sendGridService.sendGridEmail(options);
      }
      const result = await transport.verify();
      if (result) {
        return await this.sendEmail(options);
      }
      return false;
    } catch (e) {
      logger.warn('Unable to connect to email server');
      throw e;
    }
  },

  /**
   * Send email
   * @param {object} options
   * @param {string} type
   * @returns
   */
  async sendEmail(options, type = 'send') {
    try {
      /* *************** Mail send details **************** */
      const { mail: { fromEmail } } = config;
      const mailOptions = {
        from: fromEmail,
        to: options.to,
        subject: options.subject,
        html: options.message,
      };

      /* *************** Mail recived details **************** */
      const mailRecOptions = {
        to: fromEmail,
        from: options.to,
        subject: options.subject,
        html: options.message,
      };

      // File attachment
      if (options.attachments) {
        mailOptions.attachments = options.attachments;
      }

      // BCC users mail send
      if (options.bcc) {
        mailOptions.bcc = options.bcc;
      }

      // CC users mail send
      if (options.cc) {
        mailOptions.cc = options.cc;
      }
      return new Promise((resolve, reject) => {
        const { mail: { smtp } } = config;
        const transport = nodemailer.createTransport(smtp);
        transport.sendMail(
          type === 'send' ? mailOptions : mailRecOptions,
          (error, info) => {
            if (error) {
              logger.error(`Email sent error: ${error}`);
              reject(error);
            } else {
              resolve(info);
            }
          },
        );
      });
    } catch (error) {
      logger.error(`Email sent error: ${error}`);
      throw error;
    }
  },

  async sendMailchimp() {
    try {
      const mandrill = nodemailer.createTransport(mandrillTransport({
        auth: {
          apiKey: 'md-Zv4AX3F8RD75lYP7CSMCwg',
        },
      }));
      return new Promise((resolve, reject) => {
        mandrill.sendMail(
          {
            from: 'morluxury@codiantdev.com',
            to: 'morluxury@mailinator.com',
            subject: 'Test subject',
            html: '<p>Test body</p>',
          },
          (error, info) => {
            if (error) {
              logger.error(`Email sent error: ${error}`);
              reject(error);
            } else {
              resolve(info);
            }
          },
        );
      });
    } catch (error) {
      throw Error(error);
    }
  },

};
