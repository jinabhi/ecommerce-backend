/* eslint-disable no-unused-vars */
/* eslint-disable consistent-return */
import axios from 'axios';
import verifyAppleToken from 'verify-apple-id-token';
import { OAuth2Client } from 'google-auth-library';
import utility from '../utils/index';
import config from '../config';

export default {
  /**
   * Check Order exist
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * @returns
   */
  async checkSocialAuthToken(req, res, next) {
    try {
      if (req.body.socialType === 'apple') {
        const { socialMediaLogin: { appleAudience } } = config;
        // Apple Social Login
        const appleIdToken = req.body.socialToken;
        const appleResult = await verifyAppleToken({
          clientId: appleAudience,
          idToken: appleIdToken,
        });
        if (appleResult) {
          next();
        }
      }

      if (req.body.socialType === 'google') {
        // Google Social Login
        const { socialMediaLogin: { googleClientIdIos, googleClientIdAndroid } } = config;
        let googleClientID = googleClientIdAndroid;
        if (req.body.deviceType === 'ios') {
          googleClientID = googleClientIdIos;
        }
        const googleIdToken = req.body.socialToken;
        const client = new OAuth2Client(googleIdToken);
        const ticket = await client.verifyIdToken({
          idToken: googleIdToken,
          requiredAudience: googleClientID,
        });
        const googleResult = ticket.getPayload();
        if (googleResult) {
          next();
        }
      }

      if (req.body.socialType === 'facebook') {
        // Facebook Social Login
        const facebookIdToken = req.body.socialToken;
        const facebookResult = await axios.get('https://graph.facebook.com/me', { params: { access_token: facebookIdToken } });
        if (facebookResult) {
          next();
        } else {
          const error = new Error(utility.getMessage(req, false, 'INVALID_ACCESS'));
          error.status = utility.httpStatus('BAD_REQUEST');
          next(error);
        }
      }
    } catch (error) {
      error.message = utility.getMessage(req, false, 'INVALID_ACCESS');
      next(error);
    }
  },

};
