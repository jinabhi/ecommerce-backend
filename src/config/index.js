import path from 'path';
import dotenv from 'dotenv';

dotenv.config();
export default {
  app: {
    siteName: process.env.APP_NAME,
    cronEnv: process.env.CRON_ENV,
    siteEmail: '',
    mediaStorage: process.env.MEDIA_STORAGE, // local,s3
    mediaUploadSizeLimit: 1024 * 1024 * 25,
    baseUrl: process.env.BASE_URL,
    adminUrl: process.env.ADMIN_URL,
    environment: process.env.NODE_ENV,
    mailEnv: process.env.MAIL_ENV,
    secretManageEnv: process.env.SECRET_MANAGER_ENV,
    swaggerEnv: process.env.SWAGGER_ENV,
    swaggerHost: process.env.SWAGGER_HOST,
    cryptrSecretKey: process.env.CRYPTR_SECRET,
    languages: ['en'],
    setBaseUrl(url) {
      this.baseUrl = url;
    },
  },
  database: {
    mysql: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      db: process.env.DB_NAME,
      timezone: '+00:00',
    },
    resetValues() {
      this.mysql.host = process.env.DB_HOST;
      this.mysql.port = process.env.DB_PORT;
      this.mysql.user = process.env.DB_USERNAME;
      this.mysql.password = process.env.DB_PASSWORD;
      this.mysql.db = process.env.DB_NAME;
      this.mysql.timezone = '+00:00';
    },
  },
  mail: {
    smtp: {
      // pool: true,
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_HOST_PORT,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
      secure: false, // use TLS
      tls: {
        rejectUnauthorized: false,
      },
    },
    fromName: process.env.SMTP_EMAIL_FROM_NAME,
    fromEmail: process.env.SMTP_EMAIL_FROM_EMAIL,
    resetValues() {
      this.smtp.host = process.env.SMTP_HOST;
      this.smtp.port = process.env.SMTP_HOST_PORT;
      this.smtp.secure = false;
      this.smtp.auth = {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      };
      this.fromName = process.env.SMTP_EMAIL_FROM_NAME;
      this.fromEmail = process.env.SMTP_EMAIL_FROM_EMAIL;
    },
  },
  sms: {
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      fromNumber: process.env.TWILIO_FROM_NUMBER,
    },
    resetValues() {
      this.twilio.accountSid = process.env.TWILIO_ACCOUNT_SID;
      this.twilio.authToken = process.env.TWILIO_AUTH_TOKEN;
      this.twilio.fromNumber = process.env.TWILIO_FROM_NUMBER;
    },
  },
  winston: {
    maxSize: process.env.LOGGER_MAX_SIZE,
    maxFiles: process.env.LOGGER_MAX_FILES,
  },
  google: {
    service_account_key: path.join(
      __dirname,
      'google',
      'firebase-service.json',
    ),
    project_id: process.env.FIREBASE_PROJECT_ID,
    api_key: process.env.GOOGLE_API_KEY,
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    googleApiUrl: process.env.GOOGLE_API_URL,
    resetValues() {
      this.project_id = process.env.FIREBASE_PROJECT_ID;
      this.api_key = process.env.GOOGLE_API_KEY;
      this.clientID = process.env.GOOGLE_CLIENT_ID;
      this.clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      this.googleApiUrl = process.env.GOOGLE_API_URL;
      this.service_account_key = path.join(
        __dirname,
        'google',
        'firebase-service.json',
      );
    },
  },
  notification: {
    ios: {
      token: {
        key: path.join(__dirname, 'ios-token', 'AuthKey_SJQTVZK57P.p8'),
        keyId: '',
        teamId: '',
      },
      production: true,
    },
    android: {
      fcm: {
        server_key: '',
      },
    },
  },
  media: {
    staticMediaUrl: process.env.AWS_S3_BUCKET_URL,
    resetValues() {
      this.staticMediaUrl = process.env.AWS_S3_BUCKET_URL;
    },
  },
  region: {
    countryPhoneCode: process.env.COUNTRY_PHONE_CODE,
    currencySymbol: process.env.CURRENCY_ABBR,
  },
  aws: {
    bucketPrefix: process.env.AWS_BUCKET_PREFIX,
    bucketName: process.env.AWS_BUCKET_NAME,
    privateBucketName: process.env.AWS_PRIVATE_BUCKET_NAME,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3PrivateBucketUrl: process.env.AWS_S3_BUCKET_PRIVATE_URL,
    s3PublicBucketUrl: process.env.AWS_S3_BUCKET_PUBLIC_URL,
    cloudfrontPrivateKey: process.env.CLOUD_FRONT_private_KEY,
    cloudfrontAccessKey: process.env.CLOUD_FRONT_ACCESS_KEY,
    mediaExpireTime: process.env.MEDIA_EXPIRE,
    region: process.env.AWS_REGION,
    resetValues() {
      this.bucketPrefix = process.env.AWS_BUCKET_PREFIX;
      this.bucketName = process.env.AWS_BUCKET_NAME;
      this.privateBucketName = process.env.AWS_PRIVATE_BUCKET_NAME;
      this.accessKeyId = process.env.AWS_ACCESS_KEY_ID;
      this.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
      this.s3PrivateBucketUrl = process.env.AWS_S3_BUCKET_PRIVATE_URL;
      this.s3PublicBucketUrl = process.env.AWS_S3_BUCKET_PUBLIC_URL;
      this.region = process.env.AWS_REGION;
      this.cloudfrontPrivateKey = process.env.CLOUD_FRONT_private_KEY;
      this.cloudfrontAccessKey = process.env.CLOUD_FRONT_ACCESS_KEY;
      this.mediaExpireTime = process.env.MEDIA_EXPIRE;
    },
  },

  firebase: {
    domainUriPrefix: process.env.DOMAIN_URI_PREFIX,
    dynamicLink: process.env.DYNAMIC_LINK,
    androidPackageName: process.env.ANDROID_PACKAGE_NAME,
    androidFallbackLink: process.env.ANDROID_FALLBACK_LINK,
    iosBundleId: process.env.IOS_BUNDLE_ID,
    // desktopFallbackLink: process.env.DESKTOP_FALLBACK_LINK,
    passwordToken: process.env.RESET_PASSWORD_TOKEN,
    resetValues() {
      this.domainUriPrefix = process.env.DOMAIN_URI_PREFIX;
      this.dynamicLink = process.env.DYNAMIC_LINK;
      this.androidPackageName = process.env.ANDROID_PACKAGE_NAME;
      this.androidFallbackLink = process.env.ANDROID_FALLBACK_LINK;
      this.iosBundleId = process.env.IOS_BUNDLE_ID;
      this.passwordToken = process.env.RESET_PASSWORD_TOKEN;
    },
  },

  sendGrid: {
    skdSendGrid: process.env.SEND_GRID_SKD,
    email: process.env.SEND_GRID_FROM_EMAIL,
    resetValues() {
      this.skdSendGrid = process.env.SEND_GRID_SKD;
      this.email = process.env.SEND_GRID_FROM_EMAIL;
    },
  },
  jwtSecret: process.env.JWT_SECRET,
  jwtExpireIn: process.env.JWT_EXPIRE_IN,
  supportEmail: process.env.SUPPORT_EMAIL,
  supportContactNumber: process.env.SUPPORT_CONTACT_NUMBER,
  stripe: {
    secretKey: process.env.SECRETKEY,
    publishKey: process.env.PUBLISHKEY,
    webHookSecret: process.env.WEBHOOK_SECRET,
    resetValues() {
      this.secretKey = process.env.SECRETKEY;
      this.publishKey = process.env.PUBLISHKEY;
      this.webHookSecret = process.env.WEBHOOK_SECRET;
    },
  },

  socialMediaLogin: {
    googleClientIdIos: process.env.GOOGLE_CLIENT_ID_IOS,
    googleClientIdAndroid: process.env.GOOGLE_CLIENT_ID_ANDROID,
    appleAudience: process.env.APPLE_AUDIENCE,
  },
  currencyExchange: {
    apiKey: process.env.CURRENCY_API_KEY,
  },
  shippingApiKey: {
    username: process.env.SHIPPING_USERNAME,
    password: process.env.SHIPPING_PASSWORD,
    asendiaKey: process.env.SHIPPING_ASENDIA_KEY,
    accountNumber: process.env.ACCOUNT_NUMBER,
    shippingChargeUrl: process.env.SHIPPING_URL,
    shippingApiUrl: process.env.SHIPPING_API_URL,
    trackingUrl: process.env.TRACKING_URL,
    shippingPhone: process.env.SHIPPING_PHONE,
    shippingEmail: process.env.SHIPPING_EMAIL,
    shippingCity: process.env.SHIPPING_CITY,
    shippingState: process.env.SHIPPING_STATE,
    shippingZipCode: process.env.SHIPPING_ZIP_CODE,
    shippingAddress: process.env.SHIPPING_ADDRESS,
    trackUrl: process.env.TRACK_URL,
    resetValues() {
      this.username = process.env.SHIPPING_USERNAME;
      this.password = process.env.SHIPPING_PASSWORD;
      this.asendiaKey = process.env.SHIPPING_ASENDIA_KEY;
      this.accountNumber = process.env.ACCOUNT_NUMBER;
      this.shippingChargeUrl = process.env.SHIPPING_URL;
      this.shippingApiUrl = process.env.SHIPPING_API_URL;
      this.trackingUrl = process.env.TRACKING_URL;
      this.shippingPhone = process.env.SHIPPING_PHONE;
      this.shippingEmail = process.env.SHIPPING_EMAIL;
      this.shippingCity = process.env.SHIPPING_CITY;
      this.shippingState = process.env.SHIPPING_STATE;
      this.shippingZipCode = process.env.SHIPPING_ZIP_CODE;
      this.shippingAddress = process.env.SHIPPING_ADDRESS;
      this.trackUrl = process.env.TRACK_URL;
    },
  },
  paytmApiKey: {
    merchantKey: process.env.PAYTM_MERCHANT_KEY,
    mid: process.env.PAYTM_MID,
    callbackUrl: process.env.CALLBACK_URL,
    paytmHost: process.env.PAYTM_HOST,
    paytmWeb: process.env.PAYTMWEB,
    resetValues() {
      this.merchantKey = process.env.PAYTM_MERCHANT_KEY;
      this.mid = process.env.PAYTM_MID;
      this.callbackUrl = process.env.CALLBACK_URL;
      this.paytmHost = process.env.PAYTM_HOST;
      this.paytmWeb = process.env.PAYTMWEB;
    },
  },
  paypalApiKey: {
    clintId: process.env.PAYPAL_CLIENT_ID,
    secret: process.env.PAYPAL_SECRET,
    successUrl: process.env.PAYPAL_SUCCESS,
    cancelUrl: process.env.PAYPAL_CANCEL,
    apiUrl: process.env.PAYPAL_API_URL,
    resetValues() {
      this.clintId = process.env.PAYPAL_CLIENT_ID;
      this.secret = process.env.PAYPAL_SECRET;
      this.successUrl = process.env.PAYPAL_SUCCESS;
      this.cancelUrl = process.env.PAYPAL_CANCEL;
      this.apiUrl = process.env.PAYPAL_API_URL;
    },

  },
  brainTreeApiKey: {
    environment: process.env.BRAINTREE_ENV,
    merchantId: process.env.BRAINTREE_MERCHANT_ID,
    publicKey: process.env.BRAINTREE_PUBLICK_KEY,
    privateKey: process.env.BRAINTREE_Private_KEY,
    resetValues() {
      this.environment = process.env.BRAINTREE_ENV;
      this.merchantId = process.env.BRAINTREE_MERCHANT_ID;
      this.publicKey = process.env.BRAINTREE_PUBLICK_KEY;
      this.privateKey = process.env.BRAINTREE_Private_KEY;
    },
  },
  resetAll() {
    this.aws.resetValues();
    this.database.resetValues();
    this.sms.resetValues();
    this.sendGrid.resetValues();
    this.media.resetValues();
    this.google.resetValues();
    this.firebase.resetValues();
    this.mail.resetValues();
    this.paytmApiKey.resetValues();
    this.paypalApiKey.resetValues();
    this.brainTreeApiKey.resetValues();
    this.shippingApiKey.resetValues();
    this.stripe.resetValues();
  },
};
