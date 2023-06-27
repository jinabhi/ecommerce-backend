import validateMiddleware from './validate.middleware';
import accountMiddleware from './account.middleware';
import appVersionMiddleware from './appVersion.middleware';
import authMiddleware from './auth.middleware';
import mediaMiddleware from './media.middleware';
import resourceAccessMiddleware from './resourceAccess.middleware';
import subCategoryMiddleware from './subCategory.middleware';
import categoryMiddleware from './category.middleware';
import childCategoryMiddleware from './childCategory.middleware';
import productVariantMiddleware from './productVariant.middleware';
import cmsMiddleware from './cms.middleware';
import discountMiddleware from './discount.middleware';
import brandMiddleware from './brand.middleware';
import productMiddleware from './product.middleware';
import userMiddleware from './user.middleware';
import contactUsMiddleware from './contactUs.middleware';
import faqMiddleware from './faq.middleware';
import customNotificationsMiddleware from './customNotifications.middleware';
import addressMiddleware from './address.middleware';
import cartMiddleware from './cart.middleware';
import paymentCardMiddleware from './paymentCard.middleware';
import orderMiddleware from './order.middleware';
import socialAuthMiddleware from './socialAuthToken.middleware';
import earningMiddleware from './earning.middleware';
import howItWorksMiddleware from './howItWorks.middleware';
import promotionMiddleware from './promotion.middleware';
import getEarlyAccessMiddleware from './getEarlyAccess.middleware';
import bannerMiddleware from './banner.middleware';
import productNotifyMeMiddleware from './productNotifyMe.middleware';

export default {
  accountMiddleware,
  validateMiddleware,
  appVersionMiddleware,
  authMiddleware,
  mediaMiddleware,
  bannerMiddleware,
  resourceAccessMiddleware,
  categoryMiddleware,
  childCategoryMiddleware,
  productVariantMiddleware,
  subCategoryMiddleware,
  cmsMiddleware,
  discountMiddleware,
  brandMiddleware,
  productMiddleware,
  userMiddleware,
  contactUsMiddleware,
  faqMiddleware,
  customNotificationsMiddleware,
  addressMiddleware,
  cartMiddleware,
  paymentCardMiddleware,
  orderMiddleware,
  socialAuthMiddleware,
  earningMiddleware,
  howItWorksMiddleware,
  promotionMiddleware,
  getEarlyAccessMiddleware,
  productNotifyMeMiddleware,
};
