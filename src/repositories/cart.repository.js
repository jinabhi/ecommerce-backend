import models from '../models/index';
import logger from '../services/logger.service';
import helper from '../helper/subQuery';
import addressRepository from './address.repository';

const {
  Cart, Product, Brand, ReviewRating, GeneralSetting, ProductDiscount,
  ProductImage, Address, City, State, Country, UserDevice, User, Discount,
} = models;
export default {

  /**
   * Add Product to Cart
   * @param {OBJECT} req
   * @returns
   */
  async addToCart(req) {
    try {
      const { user: { id }, finalList } = req;
      await Promise.all(
        finalList.map(async (element) => {
          const cartProduct = await Cart.findOne({ where: { userId: id, productId: element.productId, status: 'active' } });
          if (cartProduct) {
            // If product exist in cart
            const newQuantity = parseInt(cartProduct.quantity, 10) + parseInt(element.quantity, 10);
            await cartProduct.update({ quantity: newQuantity });
            return true;
          }
          // Product added to Cart
          const cartData = {
            userId: id,
            productId: element.productId,
            quantity: element.quantity,
          };
          return Cart.create(cartData);
        }),
      );
      return true;
    } catch (error) {
      logger.error(`Add to Cart error: ${error}, user id: ${req?.user?.id}`);
      throw Error(error);
    }
  },

  /**
   * Update Cart Product
   * @param {Object} req
   * @returns
   */
  async updateCartItem(req) {
    try {
      const {
        body, user, query: { type }, params: { id },
      } = req;
      if (type) {
        return Cart.update({ status: 'deleted' }, { where: { productId: id, userId: user.id } });
      }
      return Cart.update(body, { where: { userId: user.id, productId: id } });
    } catch (error) {
      logger.error(`Update Cart error: ${error}, user id: ${req?.user?.id}`);
      throw Error(error);
    }
  },

  /**
   * Get All Cart Product
   * @param {Object} req
   * @returns
   */
  async getCartProduct(req) {
    try {
      const { user, headers: { currencyCode } } = req;
      let num = 0;
      let totalTax = 0;
      let shippingCharge = 0;
      const creditData = await GeneralSetting.findOne({ where: { key: 'credit_point' } });

      const taxData = await GeneralSetting.findOne({ where: { key: 'tax' } });
      const taxAmount = taxData.get();
      const currencyRate = await addressRepository.exchangeCurrencyGet({ name: currencyCode ?? 'INR' });
      const activeWhere = { status: 'active' };
      const data = await Cart.findAll({
        where: { userId: user.id, status: 'active' },
        include: [{
          model: Product,
          required: true,
          where: activeWhere,
          attributes: {
            include: [
              ...helper.productAttributes(user.id, currencyRate?.rate ?? 0),
              ...helper.reviewRating(),
            ],
          },
          include: [{
            model: ProductImage,
            as: 'productImage',
            order: [['createdAt', 'ASC']],
            required: false,
            where: activeWhere,
          }, {
            model: ReviewRating,
            as: 'productReviewRating',
            required: false,
            where: activeWhere,
          },
          {
            model: ProductDiscount,
            where: activeWhere,
            required: false,
            include: [
              {
                model: Discount,
                where: activeWhere,
                required: false,
              },
            ],
          },
          {
            model: Brand,
            required: false,
            where: activeWhere,
          }],
        }],
        attributes: {
          include: helper.orderTotalCart(),
        },
      });
      if (data && data.length > 0) {
        num = data.reduce((accumulator, object) => accumulator
          + parseFloat(object?.dataValues?.totalAmount, 10), 0);
        shippingCharge = data.reduce((accumulator, object) => accumulator
          + parseFloat(object?.dataValues?.shippingChargetotalAmount, 10), 0);
        const productPrice = parseFloat(num, 10) + parseFloat(shippingCharge);
        totalTax = (Math.floor(parseFloat((taxAmount.value * productPrice)))) / 100;
      }
      const address = await Address.findOne({
        where: { ...activeWhere, userId: user?.id },
        include: [{
          model: Country,
          required: true,
          where: activeWhere,
          include: [{
            model: State,
            required: true,
            where: activeWhere,
            include: [{
              model: City,
              required: true,
              where: activeWhere,
            }],
          }],
        }],
      });
      return {
        cartTotal: num ?? 0,
        taxValue: totalTax ?? 0,
        taxAmount: taxAmount.value,
        creditData: creditData.value,
        totalShippingCharge: shippingCharge ?? 0,
        data,
        address,
        conversionRateCreditPoint: parseInt(creditData?.value, 10) ?? 0,
        creditPoint: user?.creditPoints ?? 0,
      };
    } catch (error) {
      logger.error(`Update Cart error: ${error}, user id: ${req?.user?.id}`);
      throw Error(error);
    }
  },

  /**
   * Update guest Cart data
   * @param {Object} req
   * @returns
   */
  async updateGuestCart(req) {
    try {
      const { user, body: { token } } = req;
      const guestUserData = await UserDevice.findOne({
        where: { accessToken: token },
        include: [{
          model: User,
          required: true,
          where: { status: 'active', userRole: 'guest' },
        }],
      });
      if (guestUserData) {
        const guestUser = guestUserData.get();

        const cartInfo = await Cart.findAll({ where: { userId: guestUser.userId, status: 'active' } });

        if (cartInfo) {
          await Promise.all(
            cartInfo.map(async (element) => {
              const newData = element.get();
              const cartDetail = await Cart.findOne({ where: { status: 'active', productId: newData.productId, userId: user.id } });
              const guestCartDetail = await Cart.findOne({ where: { status: 'active', productId: newData.productId, userId: newData.userId } });
              if (cartDetail) {
                await Cart.update({ quantity: newData.quantity }, { where: { status: 'active', productId: newData.productId, userId: user.id } });
                return Cart.destroy({
                  where:
                    { userId: newData.userId, productId: newData.productId },
                });
              }
              if (guestCartDetail) {
                return Cart.update({ userId: user.id }, { where: { status: 'active', productId: newData.productId, userId: newData.userId } });
              }
              return true;
            }),
          );
        }
        return true;
      }
      return true;
    } catch (error) {
      logger.error(`Update Cart error: ${error}, user id: ${req?.user?.id}`);
      throw Error(error);
    }
  },

};
