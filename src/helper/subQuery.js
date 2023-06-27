/* eslint-disable max-len */
import { Sequelize } from 'sequelize';

export default {
  // All avg rating, rating count, is wishlist, is cart
  productAttributes(userId, currencyRate, tokenData) {
    const data = [
      [
        Sequelize.literal(
          `(SELECT (CASE WHEN count(id) > 0 THEN true ELSE false END) FROM carts WHERE status != 'deleted' AND product_id = Product.id AND user_id = ${userId})`,
        ),
        'isCart',
      ],
      [
        Sequelize.literal(
          `(SELECT (sum(quantity)) FROM carts WHERE status != 'deleted' AND product_id = Product.id AND user_id = ${userId})`,
        ),
        'cartProduct',
      ],
      [
        Sequelize.literal(
          `(SELECT (CASE WHEN count(id) > 0 THEN true ELSE false END) FROM product_wishlists WHERE status != 'deleted' AND product_id = Product.id AND user_id = ${userId})`,
        ),
        'isWishlist',
      ],
      [this.reviewRating('allRating'), 'overAllRating'],
      [this.reviewRating('ratingCount'), 'ratingCount'],
      [
        Sequelize.literal(`IFNULL((SELECT TRUNCATE(Product.price - ((discounts.discount_percent/100) * Product.price), 2) from discounts JOIN product_discounts ON product_discounts.discount_id = discounts.id WHERE discounts.status = 'active' AND product_discounts.status = 'active' AND product_discounts.product_id = Product.id limit 1), 0)
      `),
        'discountPrice',
      ],
      [
        Sequelize.literal(
          "IFNULL((SELECT Count(id) FROM product_views WHERE status = 'active' AND product_id = Product.id), 0)",
        ),
        'totalViewCount',
      ],
      [Sequelize.literal(`${currencyRate}`), 'currencyRate'],
      [
        Sequelize.literal(
          "IFNULL((Select count(order_products.id) from order_products join orders on order_products.order_id = orders.id where order_products.status != 'deleted' And order_products.product_id = Product.id and orders.status = 'completed'), 0)",
        ),
        'totalSold',
      ],
    ];
    if (tokenData) {
      data.push([
        Sequelize.literal(`IFNULL(null, '${tokenData.shortLink}')`),
        'shareLink',
      ]);
    }
    return data;
  },

  // Child category total product
  childCategoryProduct(userId) {
    return [
      [
        Sequelize.literal(
          `IFNULL((SELECT COUNT(id) FROM products WHERE products.child_category_id = ChildCategories.id AND products.status = 'active' AND products.seller_id = ${userId} ), 0 )`,
        ),
        'totalProduct',
      ],
    ];
  },

  /**
   * Review rating count and avg rating
   */
  reviewRating(type) {
    const avgRating = Sequelize.literal(
      "IFNULL((SELECT AVG(rating) FROM review_ratings AS productReviewRating WHERE productReviewRating.status = 'active' AND productReviewRating.product_id = Product.id ), 0.0)",
    );
    const ratingCount = Sequelize.literal(
      "IFNULL((SELECT COUNT(id) FROM review_ratings AS productReviewRating WHERE productReviewRating.status = 'active' AND productReviewRating.product_id = Product.id ), 0)",
    );
    if (type === 'ratingCount') {
      return ratingCount;
    }
    if (type === 'allRating') {
      return avgRating;
    }
    return [
      [avgRating, 'rating'],
      [ratingCount, 'totalCount'],
    ];
  },

  /**
   * %, 4, 3, 2, 1 star rating count
   * @param {number} rating
   * @returns
   */
  reviewRatingStarCount(productId) {
    const data = `IFNULL((SELECT COUNT(rating) FROM review_ratings WHERE product_id= ${productId} And rating =`;
    return [
      [Sequelize.literal(`${data} 5), 0)`), 'fiveRatingCount'],
      [Sequelize.literal(`${data} 4), 0)`), 'fourRatingCount'],
      [Sequelize.literal(`${data} 3), 0)`), 'threeRatingCount'],
      [Sequelize.literal(`${data} 2), 0)`), 'twoRatingCount'],
      [Sequelize.literal(`${data} 1), 0)`), 'oneRatingCount'],
    ];
  },

  /**
   * Already assign product
   */
  productDiscountAddId() {
    return [
      Sequelize.literal(`(SELECT Distinct(product_discounts.product_id) from discounts JOIN product_discounts ON product_discounts.discount_id = discounts.id WHERE discounts.status in ('active', 'scheduled') AND product_discounts.status = 'active' AND product_discounts.product_id = Product.id)   
    `),
    ];
  },

  // Product variant assign in product flag
  productAssignVariantAttribute() {
    return [
      Sequelize.literal(
        '(SELECT (CASE WHEN(COUNT(products.id)) > 0 THEN true ELSE false END) FROM products Join seller_product_variants on seller_product_variants.product_id = products.id  WHERE seller_product_variants.product_variant_attribute_id = ProductVariantAttribute.id AND products.status In ("active", "inactive") AND seller_product_variants.status != "deleted" AND ProductVariantAttribute.status != "deleted")',
      ),
      'isDisable',
    ];
  },

  // Total product variant
  totalProductVariantAttribute() {
    return [
      [
        Sequelize.literal(
          "(SELECT Distinct(COUNT(products.id)) FROM products Join seller_product_variants on seller_product_variants.product_id = products.id WHERE seller_product_variants.product_variant_id = ProductVariant.id AND products.status in ('inactive', 'active') AND seller_product_variants.STATUS != 'deleted')",
        ),
        'totalProduct',
      ],
    ];
  },

  // Product variant attributes like
  productVariantLike(name) {
    return [
      Sequelize.literal(
        `(SELECT product_variant_id from  product_variant_attributes where status = 'active' AND attribute_names LIKE '%${name}%')`,
      ),
    ];
  },

  // Seller Product variant attributes like
  productSellerProductVariantLike(name) {
    return [
      Sequelize.literal(
        `(SELECT products.id from products Join seller_product_variants on seller_product_variants.product_id = products.id Join product_variant_attributes on product_variant_attributes.id =  seller_product_variants.product_variant_attribute_id where product_variant_attributes.status = 'active' AND product_variant_attributes.attribute_names LIKE '%${name}%')`,
      ),
    ];
  },

  // Popular product
  popularProduct() {
    return Sequelize.literal(
      '(Select count(order_products.product_id) from order_products join orders on orders.id = order_products.order_id where order_products.status != "deleted" and orders.status = "completed" and Product.id = product_id)',
    );
  },

  // Id for Expired discount
  discountIds() {
    return [
      Sequelize.literal('(Select id from discounts where status = "expired")'),
    ];
  },

  // Total product for brand according
  brandTotalProducts() {
    return [
      [
        Sequelize.literal(
          '(SELECT COUNT(id) FROM products WHERE brand_id= Brand.id AND STATUS in ("inactive", "active"))',
        ),
        'totalProduct',
      ],
      [
        Sequelize.literal(
          '(SELECT COUNT(*) FROM products WHERE id IN (SELECT product_id FROM product_discounts WHERE status="active") AND brand_id=Brand.id)',
        ),
        'totalOffers',
      ],
    ];
  },

  // Total product for category
  categoryTotalProducts() {
    return [
      [
        Sequelize.literal(
          '(SELECT COUNT(id) FROM products WHERE category_id = Category.id AND STATUS in ("inactive", "active"))',
        ),
        'totalProduct',
      ],
    ];
  },

  // Total product for brand subcategory
  subCategoryTotalProducts() {
    return [
      [
        Sequelize.literal(
          '(SELECT COUNT(id) FROM products WHERE sub_category_id = SubCategory.id AND STATUS in ("inactive", "active"))',
        ),
        'totalProduct',
      ],
    ];
  },

  // Total product for brand child category
  childCategoryTotalProducts() {
    return [
      [
        Sequelize.literal(
          '(SELECT COUNT(id) FROM products WHERE child_category_id = ChildCategory.id AND STATUS in ("inactive", "active"))',
        ),
        'totalProduct',
      ],
    ];
  },

  // Total product in discount sorting
  totalProductDiscountSorting() {
    return Sequelize.literal(
      '(Select count(id) from product_discounts where product_discounts.discount_id = Discount.id and status = "active")',
    );
  },
  /**
   * sum of a column
   */
  sumQuery(model, field, alias) {
    return [
      Sequelize.literal(
        `(SELECT (sum(${field})) FROM  ${model} where order_id = Order.id )`,
        // `(SELECT CAST(TRUNCATE(SUM(${field}),2) as float(2)) from ${model} where order_id = Order.id )`,
      ),
      alias,
    ];
  },

  /**
   * sum of a column
   */
  sumQueryGroupBy(model, field, alias) {
    return [
      Sequelize.literal(
        `(SELECT SUM(${field}) from ${model} where brand_id = orderDetails.brand_id AND order_id = Order.id  )`,
      ),
      alias,
    ];
  },
  avgQueryGroupBy(model, field, alias) {
    return [
      Sequelize.literal(
        `(SELECT AVG(${field}) from ${model} where brand_id = orderDetails.brand_id AND order_id = Order.id  )`,
      ),
      alias,
    ];
  },

  /**
   * top selling products
   */
  topSellingProduct() {
    return Sequelize.literal(
      "(SELECT count(order_products.product_id) from orders join order_products on orders.id = order_products.order_id where orders.id = order_products.id and orders.status = 'completed' and order_products.status != \"deleted\")",
    );
  },

  topSellingProductGroup() {
    return Sequelize.literal(
      "(SELECT order_products.product_id from orders join order_products on orders.id = order_products.order_id where orders.id = order_products.id and orders.status = 'completed' and order_products.status != \"deleted\")",
    );
  },

  /**
   * Child category assigned product
   */
  childCategoryIds() {
    return Sequelize.literal(
      '(SELECT products.category_id FROM products join child_categories on child_categories.id = products.child_category_id join categories on child_categories.category_id = categories.id where categories.id = Category.id  AND products.status =  "active" and  child_categories.status =  "active" and categories.status =  "active")',
    );
  },

  /**
   * sum of a column by seller id
   */
  sumQueryBySeller(model, field, alias, id) {
    return [
      Sequelize.literal(
        `(SELECT SUM(${field}) from ${model} where order_id = Order.id AND seller_id = ${id} )`,
      ),
      alias,
    ];
  },

  /**
   * Cart total particular product
   * @returns
   */
  orderTotalCart() {
    return [
      [
        Sequelize.literal(
          '(IFNULL((SELECT TRUNCATE(Product.price - ((discounts.discount_percent/100) * Product.price), 2) from discounts JOIN product_discounts ON product_discounts.discount_id = discounts.id WHERE discounts.status = "active" AND product_discounts.status = "active" AND product_discounts.product_id = Product.id), Product.price) * Cart.quantity )',
        ),
        'totalAmount',
      ],
      [
        Sequelize.literal(
          'IFNULL((SELECT products.shipping_charges * (Select quantity from carts where id = Cart.id) FROM products WHERE id = Cart.product_id), 0)',
        ),
        'shippingChargetotalAmount',
      ],
    ];
  },

  /**
   * Get seller id details
   */
  orderIds(sellerId) {
    return [
      Sequelize.literal(
        `(Select order_id from order_products where seller_id = ${sellerId} AND STATUS != 'deleted')`,
      ),
    ];
  },

  /**
   * Get product quantity
   */
  orderQuantityForProductComplaint() {
    return [
      [
        Sequelize.literal(
          '(IFNULL((Select SUM(quantity) from order_products where order_id = ProductComplaint.order_id and product_id = ProductComplaint.product_id and status != "deleted"), 0))',
        ),
        'orderQuantity',
      ],
    ];
  },

  productComplainCheck() {
    return [[Sequelize.literal('(SELECT product_complaints.product_complaint_status from product_complaints where product_complaints.product_id = OrderProduct.product_id AND product_complaints.order_id = OrderProduct.order_id AND product_complaints.product_complaint_status != "rejected")'), 'reportStatus']];
  },

  /**
   * Already assign product
   */
  productPrice() {
    const query = 'IF( (select ( Product.price - ((discounts.discount_percent/100) * Product.price)) from discounts JOIN product_discounts ON product_discounts.discount_id = discounts.id WHERE discounts.status = \'active\' AND product_discounts.status = \'active\' AND product_discounts.product_id = Product.id limit 1) > 0, (select (Product.price - ((discounts.discount_percent/100) * Product.price)) from discounts JOIN product_discounts ON product_discounts.discount_id = discounts.id WHERE discounts.status = \'active\' AND product_discounts.status = \'active\' AND product_discounts.product_id = Product.id limit 1) + shipping_charges, price + shipping_charges)';
    return [
      Sequelize.literal(`(${query})
      `),
      'priceSort'];
  },

  productDiscountPrice(fromPrice, toPrice) {
    const discountPrice = 'IF (( select ((products.price - ((discounts.discount_percent/100) * products.price)) + products.shipping_charges) from discounts JOIN product_discounts ON product_discounts.discount_id = discounts.id WHERE discounts.status = "active" AND product_discounts.status = "active" AND product_discounts.product_id = products.id limit 1) > 0,  ( select ((products.price - ((discounts.discount_percent/100) * products.price)) + products.shipping_charges) from discounts JOIN product_discounts ON product_discounts.discount_id = discounts.id WHERE discounts.status = "active" AND product_discounts.status = "active" AND product_discounts.product_id = products.id limit 1), price + shipping_charges) ';
    const query = `select id from products having ${discountPrice} >= ${fromPrice} and  ${discountPrice} <= ${toPrice}`;
    return Sequelize.literal(`(${query})
      `);
  },

  productNonDiscountPrice(fromPrice, toPrice) {
    const nonDiscountProduct = '( products.price + products.shipping_charges)';
    const query = `select id from products where   ${nonDiscountProduct} >= ${fromPrice} and  ${nonDiscountProduct} <= ${toPrice}`;
    return Sequelize.literal(`(${query})
      `);
  },
};
