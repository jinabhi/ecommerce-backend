/* eslint-disable consistent-return */
/* eslint-disable no-return-await */
/* eslint-disable max-len */
/* eslint-disable import/no-cycle */
import Notification from './baseNotification.service';
import userRepository from '../repositories/user.repository';

export default {

  async sendTestNotification(deviceId, payload) {
    await Notification.sendToIosUser(deviceId, payload, 0).then((response) => response).catch((error) => error);
  },

  async sendToNotificationUser(userId, payload) {
    const userInfo = await userRepository.getUserDetail({ id: userId });
    if (userInfo && userInfo.isPushNotification) {
      // get user accessToken
      const userData = await userRepository.getUserDeviceToken(userId);

      let notificationUnreadCount = await userRepository.getUserNotificationCount(userId);
      notificationUnreadCount += 1;
      if (userData && userData.deviceId) {
        // new code added by me
        if (userData.deviceType.toLowerCase() === 'ios') {
          return await Notification.sendToIosUser(
            userData.deviceId ? userData.deviceId : '',
            payload,
            notificationUnreadCount,
          );
        }
        return await Notification.sendToAndroidUser(
          userData.deviceId ? userData.deviceId : '',
          payload,
          notificationUnreadCount,
        );
      }
      console.log('User device id not exists');
    } else {
      console.log('User notification nto active');
    }
    return false;
  },

  async sendMultipleNotificationUser(userIds, payload) {
    const deviceIds = [];
    let notificationUnreadCount = 0;

    await Promise.all(
      userIds.map(async (userId) => {
        const userInfo = await userRepository.getUserDetail({ id: userId });
        const info = userInfo.get();

        if (info && info.isPushNotification) {
          // get user accessToken
          const userData = await userRepository.getUserDeviceToken(userId);

          const userDataInfo = userData ? userData.get() : null;

          await userRepository.getUserNotificationCount(userId);
          notificationUnreadCount += 1;

          if (userDataInfo && userDataInfo.deviceId) {
            deviceIds.push(userDataInfo.deviceId);
            return true;
          }
          console.log('User device id not exists');
        } else {
          console.log('User notification status not active');
        }
      }),
    );
    // new code added by me
    if (deviceIds.length > 0) {
      return await Notification.sendToIosUser(
        deviceIds,
        payload,
        notificationUnreadCount,
      );
    }
  },
};
