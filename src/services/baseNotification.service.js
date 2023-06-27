/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable no-param-reassign */
/* eslint-disable node/no-extraneous-import */
/* eslint-disable import/no-extraneous-dependencies */
import * as admin from 'firebase-admin';
import config from '../config';

// The topic name can be optionally prefixed with "/topics/".
// const { topic } = config.google;
const projectId = config.google.project_id;
admin.initializeApp({
  credential: admin.credential.cert(config.google.service_account_key),
  databaseURL: `https://${projectId}.firebaseio.com`,
});
export default {
  /**
     * Send notification to android
     * @param {object} data
     * @param {string} deviceId
     */
  async sendToAndroidUser(deviceId, requestData, unreadCount) {
    const options = {
      priority: 'high',
      timeToLive: 60 * 60 * 24,
    };
    requestData = { ...requestData, badge: unreadCount.toString() };
    const defaultSound = 'default';
    const data = {
      sound: defaultSound,
      message: requestData ? requestData.message.toString() : 'Morluxury',
      title: requestData ? requestData.title.toString() : 'Morluxury',
      type: requestData ? requestData.type.toString() : 'Morluxury',
    };
    if (requestData?.orderId) {
      data.orderId = requestData?.orderId ? requestData.orderId.toString() : '';
    }
    const payload = { data };
    const result = admin.messaging().sendToDevice(deviceId, payload, options).then((notifyResponse) => {
      console.log(notifyResponse);
    }).catch((error) => {
      console.log(error);
    });
    return result;
  },

  /**
     * Send notification to IOS
     * @param {object} data
     * @param {string} deviceId
     */
  async sendToIosUser(deviceId, requestData, unreadCount) {
    const options = {
      priority: 'high',
      timeToLive: 60 * 60 * 24,
    };
    requestData = { ...requestData, badge: unreadCount.toString() };
    const defaultSound = 'default';
    const notificationData = requestData;
    const data = {
      sound: defaultSound,
      message: requestData ? requestData.message.toString() : 'Morluxury',
      title: requestData ? requestData.title.toString() : 'Morluxury',
      type: requestData ? requestData.type.toString() : 'Morluxury',
    };

    if (requestData?.orderId) {
      data.orderId = requestData?.orderId ? requestData.orderId.toString() : '';
    }
    const payload = {
      notification: {
        title: notificationData ? notificationData.title.toString() : 'Morluxury',
        body: notificationData ? notificationData.message.toString() : '',
        badge: unreadCount.toString(),
        sound: defaultSound,
      },
      data,
    };
    return admin.messaging().sendToDevice(deviceId, payload, options).then((notifyResponse) => {
      console.log(notifyResponse);
    }).catch((error) => {
      console.log(error);
    });
  },

  /**
     * Send topic notification
     * @param {object} data
     * @param {string} deviceId
     */
  async sendTopicNotification(topic, payload) {
    // The topic name can be optionally prefixed with "/topics/".
    const defaultSound = 'default';
    const message = {
      notification: {
        title: 'Morluxury',
        body: payload ? payload.message.toString() : '',
      },
      data: {
        sound: defaultSound,
        message: (payload) ? JSON.stringify(payload) : '',
      },
      topic,
    };

    // Send a message to devices subscribed to the provided topic.
    return admin.messaging().send(message)
      .then((response) => true)
      .catch((error) => {
        console.log('Error sending message:', error);
        return false;
      });
  },
};
