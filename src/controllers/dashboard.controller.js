import repositories from '../repositories';
import utility from '../utils';

const { userRepository, productRepository, orderRepository } = repositories;

export default {
  /**
   * Get admin dashboard detail count
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async getDashboardDetail(req, res, next) {
    try {
      const data = {
        totalBuyer: 0,
        totalSeller: 0,
        totalProduct: 0,
        totalEarning: 0,
        activeOrder: 0,
        completeOrder: 0,
        cancelOrder: 0,
      };

      const totalCustomer = await userRepository.getUserCount({
        userType: 'customer',
      });
      const totalSeller = await userRepository.getUserCount({
        userType: 'seller', status: ['active', 'inactive'],
      });
      const totalProduct = await productRepository.getProductCount(req);
      const totalEarning = await orderRepository.getTotalEarning(req);
      req.status = 'active';
      const activeOrder = await orderRepository.getOrderCount(req);
      req.status = 'completed';
      const completeOrder = await orderRepository.getOrderCount(req);
      req.status = 'canceled';
      const cancelOrder = await orderRepository.getOrderCount(req);
      if (totalCustomer) {
        data.totalBuyer = totalCustomer.totalUsers;
      }
      if (totalSeller) {
        data.totalSeller = totalSeller.totalUsers;
      }
      if (totalProduct) {
        data.totalProduct = totalProduct;
      }
      if (totalEarning.length > 0) {
        data.totalEarning = totalEarning[0]?.adminCommission
          ? totalEarning[0]?.adminCommission : 0;
      }
      if (activeOrder) {
        data.activeOrder = activeOrder;
      }
      if (completeOrder) {
        data.completeOrder = completeOrder;
      }
      if (cancelOrder) {
        data.cancelOrder = cancelOrder;
      }
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data,
        message: utility.getMessage(req, false, 'DASHBOARD_DETAIL'),
      });
    } catch (error) {
      next(error);
    }
  },
  /**
   * Get registered user graph
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async getDashboardRegisteredUsersGraph(req, res, next) {
    try {
      const data = [];
      data.push(
        await userRepository.getDashboardRegisteredUsersGraph(req, 'customer'),
      );
      data.push(
        await userRepository.getDashboardRegisteredUsersGraph(req, 'seller'),
      );
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data,
        message: utility.getMessage(req, false, 'DASHBOARD_DETAIL'),
      });
    } catch (error) {
      next(error);
    }
  },
  /**
   * Get visitors user graph
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async getDashboardVisitorGraph(req, res, next) {
    try {
      const {
        user: { userRole },
      } = req;
      let data;
      if (userRole === 'seller') {
        data = await userRepository.visitorBuyerGraphSeller(req);
      } else {
        data = await userRepository.visitorBuyerGraph(req);
      }
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data,
        message: utility.getMessage(req, false, 'DASHBOARD_DETAIL'),
      });
    } catch (error) {
      next(error);
    }
  },
  /**
   * Get Top selling product and category
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async getTopProductCategory(req, res, next) {
    try {
      const data = await productRepository.getProductCategoryChart(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data,
        message: utility.getMessage(req, false, 'DASHBOARD_DETAIL'),
      });
    } catch (error) {
      next(error);
    }
  },
  /**
   * Get seller dashboard detail count
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async getSellerDashboardCount(req, res, next) {
    try {
      const data = {
        totalProduct: 0,
        totalEarning: 0,
        activeOrder: 0,
        completeOrder: 0,
        cancelOrder: 0,
        viewProduct: 0,
        viewSeller: 0,

      };
      const totalProduct = await productRepository.getProductCount(req);
      const totalEarning = await orderRepository.getSellerTotalEarning(req);
      req.status = 'active';
      const activeOrder = await orderRepository.getOrderCount(req);
      req.status = 'completed';
      const completeOrder = await orderRepository.getOrderCount(req);
      req.status = 'canceled';
      const cancelOrder = await orderRepository.getOrderCount(req);
      const viewProduct = await productRepository.viewProductCount(req);
      if (viewProduct) {
        data.viewProduct = viewProduct;
      }
      if (totalProduct) {
        data.totalProduct = totalProduct;
      }
      if (totalEarning.length > 0) {
        data.totalEarning = totalEarning[0]?.sellerCommission
          ? totalEarning[0]?.sellerCommission : 0;
      }
      if (activeOrder) {
        data.activeOrder = activeOrder;
      }
      if (completeOrder) {
        data.completeOrder = completeOrder;
      }
      if (cancelOrder) {
        data.cancelOrder = cancelOrder;
      }
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data,
        message: utility.getMessage(req, false, 'DASHBOARD_DETAIL'),
      });
    } catch (error) {
      next(error);
    }
  },
};
