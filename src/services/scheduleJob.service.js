import logger from './logger.service';
import repositories from '../repositories';

const {
  mediaRepository, addressRepository, discountRepository, productRepository,
  notificationRepository, orderRepository,
} = repositories;

export default {
  /**
     * test schedule
     */
  async test() {
    try {
      // await mediaRepository.test();
    } catch (error) {
      logger.error(`Test media error: ${error}`);
    }
  },

  /**
   * Product status update schedule
   */
  async everyMinute() {
    try {
      productRepository.updateCurrentProductStatus();
      notificationRepository.productNotifyNotification();
    } catch (error) {
      logger.error(`Product status update error: ${error}`);
    }
  },

  /**
   * Delete media
   */
  async everyFiveMinute() {
    try {
      mediaRepository.findAllAndRemove();
    } catch (error) {
      logger.error(`Delete media error: ${error}`);
    }
  },
  /**
   * Currency exchange rate
   * Discount status update
   */
  async everyDay() {
    try {
      addressRepository.currencyExchangeRate();
      discountRepository.updateCurrentDiscountStatus();
      productRepository.updateShippingCharges();
    } catch (error) {
      logger.error(`Currency exchange error: ${error}`);
    }
  },

  /**
   * Order status update
   */
  async everyThreeHour() {
    try {
      orderRepository.orderPickedUpStatusChange();
    } catch (error) {
      logger.error(`Order status update: ${error}`);
    }
  },

};
