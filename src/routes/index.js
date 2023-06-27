/* eslint-disable no-unused-vars */
import { Router } from 'express';
import path from 'path';
import loggers from '../services/logger.service';
import accountRoute from './account.route';
import addressRoute from './address.route';
import mediaRoute from './media.route';
import categoryRoute from './category.route';
import brandRoute from './brand.route';
import childCategoryRoute from './childCategory.route';
import productVariantRoute from './productVariant.route';
import productRoute from './product.route';
import utility from '../utils';
import subCategoryRoute from './subCategory.route';
import generalSettingRoute from './generalSetting.route';
import cmsRoute from './cms.route';
import discountRoute from './discount.route';
import userRoute from './user.route';
import contactUsRoute from './contactUs.route';
import customNotificationRoute from './customNotifications.route';
import productComplaintRoute from './productComplaint.route';
import notificationRoute from './notification.route';
import faqRoute from './faq.route';
import shippingLogRoute from './shippingLog.route';
import storeRoute from './store.route';
import cartRoute from './cart.route';
import orderRoute from './order.route';
import earningRoute from './earning.route';
import dashboardRoute from './dashboard.route';
import howItWorksRoute from './howItWorks.route';
import promotionContactUsRoute from './promotionContactUs.route';
import getEarlyAccessRoute from './getEarlyAccess.route';
import bannerRoute from './banner.route';
import paymentCard from './paymentCard.route';
import productNotifyMeRoute from './productNotifyMe.route';

const router = Router();
const register = (app) => {
  app.use(router);
  app.get('/*', (req, res) => {
    if (!req.path.includes('/api')) {
      res.sendFile(path.join(`${__dirname}/../../build/index.html`));
    }
  });

  router.use('/api', [
    accountRoute,
    addressRoute,
    mediaRoute,
    categoryRoute,
    childCategoryRoute,
    howItWorksRoute,
    productVariantRoute,
    getEarlyAccessRoute,
    promotionContactUsRoute,
    subCategoryRoute,
    categoryRoute,
    cmsRoute,
    discountRoute,
    brandRoute,
    bannerRoute,
    generalSettingRoute,
    productRoute,
    userRoute,
    notificationRoute,
    contactUsRoute,
    customNotificationRoute,
    productComplaintRoute,
    faqRoute,
    shippingLogRoute,
    storeRoute,
    cartRoute,
    orderRoute,
    earningRoute,
    dashboardRoute,
    paymentCard,
    productNotifyMeRoute,
  ]);

  app.use((error, req, res, next) => {
    const internalError = utility.httpStatus('INTERNAL_SERVER_ERROR');
    if (!error.status || error.status === internalError) {
      loggers.error(`internal error ${new Date()} ${error}`);
    }
    res.status(error.status || internalError).json({
      success: false,
      data: null,
      error,
      message:
        error.status === internalError
          ? utility.getMessage(req, false, 'INTERNAL_ERROR')
          : error.message,
    });
  });

  app.use((req, res) => {
    const error = new Error('Not Found');
    error.status = utility.httpStatus('NOT_FOUND');
    res.status(error.status).json({
      success: false,
      data: null,
      error,
      message: error.message,
    });
  });
};
export default register;
