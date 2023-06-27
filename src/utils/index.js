import dotenv from 'dotenv';
import httpStatus from 'http-status';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import moment from 'moment';
import momentTimeZone from 'moment-timezone';
import path from 'path';
import language from '../language/index';
import config from '../config';
import MediaService from '../services/s3Bucket.service';

moment.suppressDeprecationWarnings = true;
dotenv.config();

export default {
  /**
   * Check application environment
   * @returns boolean
   */
  isProduction() {
    return this.getEnv('NODE_ENV') === 'production';
  },
  /**
   * Get environment variable value
   * @param {string} envVar
   * @returns {any}
   */
  getEnv(envVar) {
    const envValue = process.env[envVar];
    if (envValue) {
      return envValue;
    }
    return null;
  },

  /**
   * Set environment variable value
   * @param {string} envVar
   * @param {any} envValue
   */
  setEnv(envVar, envValue) {
    if (envValue) {
      process.env[envVar] = envValue;
    }
  },

  /**
   * Get http status code
   * @param {string} status
   * @returns {number}
   */
  httpStatus(status) {
    return httpStatus[status];
  },

  /**
   * Creates an object composed of the picked object properties
   * @param {object} object
   * @param {array} keys
   * @returns {object}
   */
  pick(object, keys) {
    return keys.reduce((obj, key) => {
      if (object && Object.prototype.hasOwnProperty.call(object, key)) {
        // eslint-disable-next-line no-param-reassign
        obj[key] = object[key];
      }
      return obj;
    }, {});
  },

  /**
   * get full name
   * @param {Number} length
   */
  async getFullName(data) {
    return `${data.firstName} ${data.lastName}`;
  },
  /**
   * Generate random string
   * @param {Number} length
   */
  generateRandomString: (length) => {
    let chars = 'klmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    chars = `${chars}0123456789abcdefghij`;
    let output = '';

    for (let x = 0; x < length; x += 1) {
      const i = Math.floor(Math.random() * 62);
      output += chars.charAt(i);
    }
    return output;
  },

  /**
   * returns random data of 6 digit
   * @returns data
   */
  generateRandomData: () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456987';
    let result = ' ';
    const charactersLength = characters.length;
    for (let i = 0; i < 10; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  },

  /**
 * Generate random integer
 */
  generateRandomInteger: (length = 8) => {
    const addData = Math.random() * 9 * 10 ** (length - 1);
    return Math.floor(10 ** (length - 1) + addData);
  },

  /**
   * Generate otp
   */
  generateOtp() {
    return this.getEnv('NODE_ENV') === 'development'
      ? 4444
      : this.generateRandomInteger(4);
  },

  /**
 * Generate random password
 */
  generateRandomPassword() {
    return this.generateRandomString(8);
  },

  /**
   * Generate hash password
   * @param {String} dataString
   */
  async generateHashPassword(dataString) {
    try {
      const salt = await bcrypt.genSalt();
      return await bcrypt.hash(dataString, salt);
    } catch (error) {
      throw new Error(error);
    }
  },

  /**
 * Get current timestamp
 */
  getCurrentTimeInUnix() {
    return moment().unix();
  },

  /**
 * get current date
 * @returns CURRENT DATE
 */
  getCurrentDate(date, format) {
    if (date) {
      return moment(date).format(format ?? 'YYYY-MM-DD');
    }
    return moment().format(format ?? 'YYYY-MM-DD');
  },

  /**
 * get current date
 * @returns CURRENT DATE
 */
  getCurrentDateTime(date, format) {
    if (date) {
      return moment(date).format(format ?? 'YYYY-MM-DD');
    }
    return moment().format(format ?? 'YYYY-MM-DD HH:mm');
  },

  /**
* get current local date time
* @returns CURRENT DATE
*/
  getCurrentLocalDate(date, format) {
    if (date) {
      return moment(date).utc().add(5, 'hours').add(30, 'minutes')
        .format(format ?? 'YYYY-MM-DD');
    }
    return moment.utc().add(5, 'hours').add(30, 'minutes').format(format ?? 'YYYY-MM-DD');
  },

  /**
 * Get current year
 */
  convertDateFromTimezone(date, timezone, format) {
    this.date = date || new Date();
    let dateObj = '';
    if (timezone) {
      dateObj = moment.tz(this.date, timezone).format(format);
    } else {
      dateObj = moment.utc(this.date).format(format);
    }
    return dateObj;
  },

  /**
 * Get current year with utc
 */
  getUTCDateTimeFromTimezone(date, timezone, format = 'YYYY-MM-DD HH:mm:ss') {
    let newDate = date || new Date();
    newDate = moment.tz(newDate, timezone);
    const data = momentTimeZone.utc(newDate).format(format);
    return data;
  },

  /**
 * Change Date format
 */
  changeDateFormat(date, format = 'YYYY-MM-DD') {
    this.date = date || new Date();
    let dateStr = '';
    dateStr = moment.utc(this.date).format(format);
    return dateStr;
  },

  /**
 *
 * @param {*} dateObject
 * @returns
 * Convert time according to timezone
 */
  convertToTz(date, timeZone) {
    const format = 'YYYY-MM-DD HH:mm:ss';
    return moment(date, format).tz(timeZone).format(format);
  },
  /**
 * Get date from date time
 */
  getDateFromDateTime(dateObject) {
    const date = dateObject.getDate();
    const month = dateObject.getMonth() + 1;
    const year = dateObject.getFullYear();
    return `${year}-${month}-${date}`;
  },

  /**
 * Get date difference
 * @param {Date} date
 * @param {String} interval
 * @param {Number} units
 */
  dateDifference(date1, date2) {
    const startDate = moment(date1, 'YYYY-MM-DD HH:mm:ss');
    const endDate = moment(date2, 'YYYY-MM-DD HH:mm:ss');
    const duration = moment.duration(endDate.diff(startDate));
    return duration.asHours();
  },

  /**
 * Check file exists
 * @param {string} path
 */
  isFileExist(filePath) {
    const tmpPath = path.join(path.resolve(), `${filePath}`);
    return fs.existsSync(tmpPath) || false;
  },

  /**
 * Remove # from string
 * @param {string} path
 */
  removeHasTag(string) {
    return string.replace(/^#+/i, '');
  },

  /**
 * check valid email or not
 * @param {string} path
 */
  validateEmail(email) {
    // eslint-disable-next-line no-useless-escape
    let re = '/^(([^<>()[]\\.,;:s@"]+(.[^<>()[]\\.,;:s@"]+)*)';
    re = `${re}|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}])|(([a-zA-Z-0-9]+.)+[a-zA-Z]{2,}))$/`;
    return re.test(String(email).toLowerCase());
  },

  /**
 * Get date time format
 * @returns
 */
  getDateFormat() {
    return 'YYYY-MM-DD HH:mm:ss';
  },

  /**
 * Get upload image
 * @param {string} str
 * @param {string} defaultIcon
 * @param {variable} type
 * @returns
 */
  getImage(str, defaultIcon, type = 'private', thumbImage = null) {
    if (str) {
      const {
        app: { mediaStorage, environment, swaggerHost },
        aws: { s3PublicBucketUrl },
      } = config;
      const imagePathArray = str.split('/');
      const imageName = imagePathArray.pop();
      imagePathArray.push(thumbImage ? `thumb/${imageName}` : imageName);

      if (mediaStorage === 's3' && type === 'public') {
        return `${s3PublicBucketUrl}${str}`;
      }
      if (mediaStorage === 's3' && type === 'private') {
        return MediaService.getSingedUrl(str);
      }
      if (mediaStorage === 's3') {
        return `${s3PublicBucketUrl}${str}`;
      }
      if (this.isFileExist(str)) {
        const http = environment === 'production' ? 'https' : 'https';
        return `${http}://${swaggerHost}/${imagePathArray.join(
          '/',
        )}`;
      }
      return defaultIcon;
    }
    return defaultIcon;
  },

  /**
 * get message
 * @param {object} req
 * @param {object} data
 * @param {function} key
 * @returns
 */
  getMessage(req, data, key) {
    let languageCode = req.headers && req.headers.language;
    languageCode = languageCode || 'en';
    const condition = language[languageCode] && language.en[`${key}`];
    if (data) {
      return condition ? language[languageCode][`${key}`](data) : key;
    }
    return condition ? language[languageCode][`${key}`] : key;
  },

  /**
 * Get unique id
 * @param {Number} length
 * @param {Number} userId
 * @returns
 */
  getUniqueId(length, userId = 1) {
    const data = this.generateRandomInteger(length) + Date.now() + userId;
    const toText = data.toString(); // Convert to string
    return toText.slice(7); // Gets last character
  },

  /**
 * Start date get
 * @param {String} date
 * @returns
 */
  getStartDateFormater(date) {
    const startDate = moment(date).format('YYYY-MM-DD');
    return `${startDate} 00:00:00`;
  },

  /**
 * End date get
 * @param {String} date
 * @returns
 */
  getEndDateFormater(date) {
    const endDate = moment(date).format('YYYY-MM-DD');
    return `${endDate} 23:59:59`;
  },

  /**
 * Get Difference start and end time
 */
  getDifferenceStartAndEndTime(startTime, endTime, format) {
    const startTimes = moment(startTime, 'HH:mm:ss');
    const endTimes = moment(endTime, 'HH:mm:ss');
    return moment(endTimes.diff(startTimes)).format(format ?? 'HH:mm:ss');
  },

  /**
 * Get subtract date
 */
  getCurrentWeek(date, subtract, type, format) {
    return moment(date)
      .subtract(subtract, type)
      .format(format ?? 'YYYY-MM-DD');
  },

  /**
 * Convert Date Time Format
 */
  convertDateTimeFormat(date, format = 'YYYY-MM-DD HH:mm:00') {
    const dateCheck = moment(date, format).isValid();
    if (dateCheck) {
      return moment(date).format(format);
    }
    return null;
  },

  /**
 * Convert date time to date then convert to UTC
 */
  convertLocalDateTimeToUtc(date, time, timezone) {
    if (date && time) {
      const newDate = moment(date).format('YYYY-MM-DD');
      const utcDateTime = moment.tz(`${newDate} ${time}`, timezone).utc();
      const newUtcDate = moment(utcDateTime).format('YYYY-MM-DD');
      const newUtcTime = moment(utcDateTime).format('HH:mm:ss');
      return { date: newUtcDate, time: newUtcTime };
    }
    return { date: '', time: '' };
  },

  /**
 * Add date
 */
  getAddDate(addData, convert, format) {
    return moment()
      .add(addData ?? 1, convert ?? 'days')
      .format(format ?? 'YYYY-MM-DD 23:59:59');
  },

  /**
 * Add date
 */
  getAddDateTime(addData, convert, format) {
    return moment()
      .add(addData ?? 1, convert ?? 'days')
      .format(format ?? 'YYYY-MM-DD HH:mm');
  },

  /**
 * Add date
 */
  getAddFieldDate(field, addData, convert, format) {
    return moment(field)
      .add(addData ?? 1, convert ?? 'days')
      .format(format ?? 'YYYY-MM-DD 23:59:59');
  },

  /**
 * Get current year
 */
  currentYear() {
    return moment().year();
  },

  /**
 *time delay
 */
  delay() {
    return new Promise((resolve) => {
      setTimeout(resolve, this.generateRandomInteger(4));
    });
  },

  /**
   * Sum of two column
   * @param {Number}
   */
  sumAmount(col1, column) {
    return parseFloat(col1) + parseFloat(column);
  },

  /**
* get current local date time
* @returns CURRENT DATE
*/
  getLocaleDate() {
    const localDate = moment.utc().add(5, 'hours').add(30, 'minutes').format('YYYY-MM-DD');
    const days = moment(localDate).format('dddd');
    const month = moment(localDate).format('MMMM');
    const day = moment(localDate).format('D');
    return `${days}, ${day} ${month}`;
  },
};
