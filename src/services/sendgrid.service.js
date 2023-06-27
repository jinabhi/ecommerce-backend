import sgMail from '@sendgrid/mail';
import config from '../config';
import loggers from './logger.service';

export default {

  /**
* Send gmail using send grid
  */
  async sendGridEmail(obj) {
    try {
      const { sendGrid: { skdSendGrid, email } } = config;
      const {
        message, subject, to, bcc, cc,
        attachments,
      } = obj;
      const mailOptions = {
        from: email,
        to,
        subject,
        html: message,
      };
      // BCC users
      if (bcc) {
        mailOptions.bcc = bcc;
      }

      // CC users
      if (cc) {
        mailOptions.cc = cc;
      }

      // Attachment file
      if (attachments) {
        mailOptions.attachments = attachments;
      }
      sgMail.setApiKey(skdSendGrid);
      sgMail
        .send(mailOptions)
        .then(() => { }, (error) => {
          if (error.response) {
            loggers.error(`Mail sent error %s: ${error}`, error?.response?.body);
          }
        });
      return true;
    } catch (error) {
      loggers.error(`Mail sent error %s: ${error}`, error);
      throw Error(error);
    }
  },
};
