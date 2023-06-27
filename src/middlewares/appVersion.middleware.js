import semver from 'semver';
import settingRepository from '../repositories/setting.repository';
/**
  * Check version
  * @param {Object} req
  */
const checkVersion = (req) => {
  const headersData = {};
  const headers = req.headers || {};
  headersData.appVersion = headers['app-version'];
  headersData.deviceType = (headers['device-type']) ? headers['device-type'].toLowerCase() : '';
  return headersData;
};
/**
  * Check App version
  * @param {Object} req
  * @param {Object} res
  * @param {Function} next
  */
const appVersionMiddleware = async (req, res, next) => {
  try {
    if (req.baseUrl !== '/api/setting') {
      const headersData = checkVersion(req);
      if (headersData.appVersion) {
        const settingDetail = await settingRepository.findAll(req);
        const configBuildVersion = (headersData.deviceType === 'android') ? settingDetail.android_app_version : settingDetail.ios_app_version;
        const forceUpdate = (headersData.deviceType === 'android') ? settingDetail.android_force_update : settingDetail.ios_force_update;
        if (!semver.gte(headersData.appVersion, configBuildVersion) && parseInt(forceUpdate, 10)) {
          res.status(403).json({
            success: false,
            data: [],
            message: 'A newer version is available on the store, please update the application.',
            isForceUpdate: parseInt(forceUpdate, 10),
            isUpdate: true,
          });
        } else {
          next();
        }
      } else {
        next();
      }
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
};

export default appVersionMiddleware;
