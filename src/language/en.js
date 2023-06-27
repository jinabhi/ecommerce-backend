export default {
  TO_MANY_REQUEST: 'Too many requests, please try again later.',
  PHONE_NUMBER_FORMAT: ' should contain only numeric value 4-15 digits.',
  PHONE_NOT_FOUND: 'Mobile number not exist.',
  EMAIL_MOBILE_NOT_FOUND: 'Email and Mobile number not exist.',
  EMAIL_NOT_FOUND: 'Email address not registered!',
  CURRENT_PASSWORD_MATCH: 'Current Password Invalid.',
  PASSWORD_NOT_MATCH: 'Password and Confirm Password must be the same',
  CURRENT_PASSWORD_NOT_MATCH:
    'New password should be different from your old password.',
  PASSWORD_REGEX: 'Password should contain at least one number and one special character',
  VERIFICATION_PENDING: 'You will get notified once your profile is approved by admin',
  CUSTOMER_WRONG_CREDENTIAL: 'Wrong mobile number or password. Please try again!',
  WRONG_CREDENTIAL: 'Wrong email, mobile number or password. Please try again!',
  WRONG_EMAIL_CREDENTIAL: 'Wrong email or password. Please try again!',
  WRONG_MOBILE_NUMBER_CREDENTIAL: 'Wrong mobile number or password. Please try again!',
  DEFAULT_ROLE: 'Cannot edit default Role.',
  LOGIN_SUCCESS: 'Login Successful',
  NUMBER_VALIDATION: 'Only numeric value',
  NUMBER_LENGTH_VALIDATION_TAX: 'Tax should be numeric value and less than or equal to 100',
  NUMBER_LENGTH_VALIDATION_COMMISSION: 'Commission should be numeric value and less than or equal to 100',
  LOGOUT_SUCCESS: 'You\'ve successfully logged out of the system',
  PASSWORD_CHANGED: 'Password Updated successfully',
  PASSWORD_NOT_CHANGED: 'Password not changed!',
  PROFILE_UPDATED: 'Account updated successfully',
  PROFILE_CANNOT_UPDATED: 'Profile alert cannot updated',
  PROFILE_ADDED: 'Profile alert has been added.',
  INVALID_PASSWORD: 'Old password is wrong.',
  UNAUTHORIZED_ACCESS: 'Unauthorized user access',
  SIGNUP: 'Your account has been created. Please login',
  SEND_EMAIL_VERIFICATION: 'A verification code has been sent to your email.',
  MOBILE_NOT_FOUND: 'Mobile number does not exists.',
  MOBILE_ALREADY_EXIST: 'Mobile number already exists.',
  USERNAME_NOT_FOUND: 'Entered email does not exist.',
  INVALID_OTP: 'Verification code is wrong.',
  PHONE_EXIST: 'This number is already in use. Please enter another number.',
  EMAIL_EXIST: 'Email already exists.',
  INVALID_ACTION: 'You can not able to take action for yourself.',
  TRY_AGAIN: 'Something went wrong, please try again.',
  USER_NOT_FOUND: 'User not found.',
  RECENT_USER_NOT_FOUND: 'This user does not exist.',
  USER_FOUND: 'User list found.',
  USER_DETAIL: 'User detail.',
  INVALID_ACCESS: 'Invalid user access.',
  PASSWORD_LINK_SENT: 'Reset password link is successfully sent to your registered email address.',
  PASSWORD_LINK_NOT_SENT: 'Reset link not send!',
  PASSWORD_LINK_EXPIRED:
    'It seems this link is expired or you have already changed your password.',
  EMAIL_NOT_EXIST: 'This email is not registered.',
  CHANGE_MOBILE_OTP_SENT: '4 digit verification code sent to your mobile',
  CHANGE_MOBILE_OTP_VERIFY: 'Mobile number verified successfully.',
  DASHBOARD_DETAIL: 'Dashboard detail.',
  DASHBOARD_SETTING_UPDATED: 'Dashboard Setting updated successfully.',
  OBJECT_NULL: 'Object cannot be null or At least one key should be used.',
  CMS_UPDATED: 'Cms page successfully updated.',
  CMS_PAGE_NOT_FOUND: 'Cms page not found.',
  FAQ_ADDED: 'Faq successfully added.',
  FAQ_NOT_EXIST: 'Faq not found.',
  FAQ_DELETED: 'Faq successfully deleted.',
  FAQ_UPDATED: 'Faq successfully updated.',
  FAQ_EXIST: 'Faq Already Exist',
  UPDATE_NOTIFICATION: 'Update notification status successfully .',
  INVALID_REQUEST: 'Payment request does not exist.',
  TRANSACTION_NOT_FOUND: 'Transaction not found.',
  INVALID_CARD: 'Invalid card details.',
  LOCATION_UPDATED: 'Location Updated',
  ACCOUNT_CREATED: 'Account created',
  FALSE_USER: 'This token is invalid',
  PASSWORD_MISMATCH: ' Password and Confirm Password must be the same',
  PASSWORD_CREATED_SUCCESS: 'Password reset successfully!',
  LINK_EXPIRE:
    'Reset password link inactive since 12 hours have gone by! Please reset your password again',
  OTP_EXPIRE: 'Otp expire since 10 minutes have gone by! Please signup again',
  INTERNAL_ERROR: 'Internal Server Error',
  FALSE_RESPONSE: 'Something went wrong',
  OTP_VERIFICATION_INCOMPLETE: 'OTP Verification incomplete',
  OTP_RE_SENT: 'OTP sent successfully.',
  TRAFFIC_SOURCE_LISTING: 'Traffic source listing',

  /**
   * Validation message
   */
  CONFIRM_PASSWORD_NOT_MATCH: 'Password and confirm password must be the same',
  PASSWORD_VALIDATION: 'Password must contain minimum 1 Uppercase 1 Lowercase 1 Number 1 special character.',
  EMAIL_VALIDATION: 'Email must be a valid format.',
  ONLY_ALPHABET_ALLOWED: 'Only characters allowed.',
  ONLY_ALPHANUMERIC_ALLOWED: 'Both letters and numbers are required in routing number.',
  WHITE_SPACE_NOT_ALLOWED: 'Blank space not allowed.',
  EMAIL_MOBILE_NUMBER_ALLOWED: 'Email or mobile number proper format',
  MAXIMUM_FIVE_FILE_ALLOWED: 'Only five file allow',
  NOT_SAME_NEW_AND_CURRENT_PASSWORD_MATCH: 'Current Password and new password should not be the same',
  ONLY_NUMERIC_ALLOWED: 'Only numeric value allowed.',
  PASSED_DATE_NOT_ALLOWED: 'Start and end date should not be past date',
  VALID_PHONE_NUMBER: 'Phone Number is not in correct format',

  /**
   * Upload Product
   */
  SOME_PRODUCT_ADDED: 'Some product are uploaded successfully,Please check email for further Information.',
  ALL_PRODUCT_UPLOADED: 'All product are uploaded successfully.',
  NO_PRODUCT_ADDED: 'Product upload failed, Please check your email for details',

  /**
 * Auth message
 */
  SESSION_EXPIRE: 'Your session has expired. Please login.',
  ACCOUNT_INACTIVE: 'Your Account is inactive, please contact to admin.',
  UNAUTHORIZED_USER_ACCESS: 'Please login to continue.',
  LOGIN_PERMISSION: 'You do not have permission for login. because you have sign up with social login',
  REJECT_USER_REQUEST: 'Your approval request reject, please contact to admin.',
  FORGO_PASSWORD_PERMISSION: 'You do not have permission for forgot password. because you have sign up with social login',
  CHANGE_PASSWORD_PERMISSION: 'You do not have permission for change password. because you have sign up with social login',

  /**
   * Sub Category message
   */
  SUB_CATEGORY_ADDED: 'Sub category added successfully',
  SUB_CATEGORY_EXIST: 'Sub category already exist',
  SUB_CATEGORY_UPDATED: 'Sub category updated successfully',
  SUB_CATEGORY_DELETED: 'Sub category deleted successfully',
  SUB_CATEGORY_DETAIL: 'Sub category details',
  SUB_CATEGORY_NOT_EXIST: 'Sub category not exist',
  /*
   * Media uploader message
   */
  TOO_LARGE_FILE: 'Please add a picture not exceeding 5MBs',
  MEDIA_INVALID: 'Media is not valid',

  /**
   *  Category message
   */
  CATEGORY_ADDED: 'Category added successfully.',
  CATEGORY_EXIST: 'Category already exist.',
  CATEGORY_NOT_EXIST: 'Category not exist.',
  CATEGORY_DETAIL: 'Category details.',
  CATEGORY_DELETED: 'Category Deleted Successfully.',
  CATEGORY_UPDATED: 'Category Updated Successfully',
  CATEGORY_STATUS_UPDATE: 'Category Status Updated Successfully.',
  /**
   * Child Category message
   */
  CHILD_CATEGORY_ADDED: 'Child Category added successfully',
  CHILD_CATEGORY_EXIST: 'Child category already existing',
  CHILD_CATEGORY_UPDATE_EXIST:
    'Child Category is already available in the system',
  CHILD_CATEGORY_UPDATED: ' Child Category updated successfully',
  CHILD_CATEGORY_NOT_EXIST: 'Child category not exist',
  CHILD_CATEGORY_DELETED: 'Child category deleted successfully',
  CHILD_CATEGORY_DETAIL: 'Child category details',

  /**
  *  Product variant message
  */
  PRODUCT_VARIANT_ADDED: 'Product Variant added successfully',
  PRODUCT_VARIANT_EXIST: 'Product variant existing',
  PRODUCT_VARIANT_NOT_EXIST: 'Product variant not exist.',
  PRODUCT_VARIANT_DETAIL: 'Product variant details.',
  PRODUCT_VARIANT_DELETED: ' Product variant successfully deleted! ',
  PRODUCT_VARIANT_UPDATED: 'Product Variant updated successfully',
  PRODUCT_VARIANT_STATUS_UPDATE: 'Product variant Status Updated Successfully.',
  EMPTY_FILE: 'This File is empty.',
  INVALID_HEADER: 'This file contains invalid headers.',
  PRODUCT_ATTRIBUTE_NOT_SAME: 'attributes should not be same',
  UPLOAD_SUCCESS: 'File uploaded successfully.',
  UPLOAD_PRODUCT_SUMMARY: 'Product upload summary',
  PRODUCT_NOT_AVAILABLE: 'This product is not available',
  PRODUCT_UPDATED_CART: 'Cart updated successfully',
  PRODUCT_REMOVED_CART: 'Product removed successfully',
  PRODUCT_ADD_CART: 'Product added to your cart',
  PRODUCT_NOT_FOUND: 'Product not found',
  QUANTITY_NOT_AVAILABLE: 'Not enough quantity available',
  QUANTITY_NOT_AVAILABLE_PRODUCT: 'Not enough quantity available of product',

  /**
   *  CMS message
   */
  CMS_EXIST: 'Page Name already Exist.',
  CMS_NOT_EXIST: 'Page Name does not Exist.',
  CMS_DELETED: 'CMS Page deleted successfully.',
  CMS_DETAIL: 'CMS Page detail.',
  CMS_STATUS_UPDATED: 'CMS Page status updated.',

  /**
  *  Discount message
  */
  DISCOUNT_ADDED: 'Discount added successfully.',
  DISCOUNT_EXIST: 'Discount already exist.',
  DISCOUNT_CODE_EXIST: 'Discount code already exist.',
  DISCOUNT_NOT_EXIST: 'Discount not exist.',
  DISCOUNT_NOT_SCHEDULED: 'Discount not scheduled.',
  DISCOUNT_SCHEDULED: 'Scheduled status can not be changed.',

  DISCOUNT_DETAIL: 'Discount details.',
  DISCOUNT_DELETED: 'Discount Deleted Successfully.',
  DISCOUNT_UPDATED: 'Discount Updated Successfully',
  DISCOUNT_STATUS_UPDATE: 'Discount Status Updated Successfully.',
  PRODUCT_DISCOUNT_STATUS_UPDATE: 'Product Discount Status Updated Successfully.',
  PRODUCT_DISCOUNT_NOT_EXIST: 'Product discount not exist.',
  PRODUCT_ALREADY_ASSIGN: 'Already assign product this product',
  PRODUCT_ATTRIBUTE_VARIANT_NOT_SAME: 'Product variants and attributes should not be same',

  /**
   * Brand message
   */
  BRAND_ADDED: 'Brand added successfully',
  BRAND_EXIST: 'Brand already exist',
  BRAND_NOT_EXIST: 'Brand not exist',
  BRAND_DETAIL: 'Brand details',
  BRAND_UPDATED: 'Brand updated successfully',
  BRAND_DELETED: 'Brand deleted successfully',
  BRAND_COMMISSION_UPDATED: 'Brand commission updated successfully',

  /**
   * General setting message
   */
  GENERAL_SETTING_UPDATED: 'General setting updated successfully',

  /**
   * Product message
   */
  PRODUCT_ADDED: 'Product added successfully',
  PRODUCT_NOT_EXIST: 'Product not exist',
  PRODUCT_DETAIL: 'Product detail',
  PRODUCT_UPDATED: 'Product updated successfully',
  PRODUCT_DELETED: 'Product deleted successfully',
  REVIEW_RATING_ADDED: 'Review rating added successfully',
  PRODUCT_STATUS_UPDATE: 'Product  Status Updated Successfully.',
  PRODUCT_REJECT_STATUS_UPDATED: 'Product Request has been Rejected',
  PRODUCT_ACCEPT_STATUS_UPDATED: 'Product Request Approved successfully',
  PRODUCT_ATTRIBUTE_NOT_EXIST: 'Product attribute not exist',
  PRODUCT_ATTRIBUTE_AND_VARIANT_NOT_EXIST: 'Product variant and attribute not exist',
  PRODUCT_ALREADY_EXIST: 'Product already exist',
  PRODUCT_DE_ACTIVE_STATUS_UPDATE: ' Product has been deactivated',
  PRODUCT_ACTIVE_STATUS_UPDATE: 'Product has been activated',
  PRODUCT_WISHLIST_NOT_EXIST: 'Product in wishlist not found',
  PRODUCT_WISHLIST_EXIST: 'Product exist in wishlist',
  PRODUCT_ALREADY_CART: 'Product already exist in cart',
  /*
   * Staff
   */
  STAFF_UPDATED: 'Staff Updated Successfully',
  STAFF_CREATED: 'Staff Created Successfully',
  STAFF_NOT_EXIST: 'Staff Not Found',

  /**
   * Contact us message
   */
  CONTACT_US_DELETED: 'Contact us deleted successfully',
  CONTACT_US_ADDED: 'Thank you for contacting us',
  CONTACT_US_NOT_EXIST: 'Contact us not exist',

  /**
   *  Custom Notifications message
   */
  NOTIFICATION_ADDED: 'Custom Notification added successfully.',
  NOTIFICATION_UPDATED: 'Custom Notification Updated successfully.',
  NOTIFICATION_EXIST: 'Custom Notification already Exist.',
  NOTIFICATION_NOT_EXIST: 'Custom Notification do not Exist.',
  NOTIFICATION_DELETED: 'Custom Notification deleted successfully.',
  NOTIFICATION_DETAIL: 'Individual Custom Notification.',
  NOTIFICATION_STATUS_UPDATED: 'Custom Notification status updated.',
  NOTIFICATION_NOT_FOUND: 'Notification not found',

  /**
  *  Product complaint message
  */
  PRODUCT_COMPLAINT_ADDED: 'Product complaint added successfully.',
  PRODUCT_COMPLAINT_NOT_EXIST: 'Product complaint not exist.',
  PRODUCT_COMPLAINT_STATUS_UPDATE: 'Product complaint Status Updated Successfully.',
  CREDIT_POINT_ADDED: 'Credit Point Added',
  PRODUCT_COMPLAINT_CREDIT_POINT_EXIST: 'Credit point already exist.',

  /**
   * Product wishlist
   */
  PRODUCT_REMOVED_WISHLIST: 'Product removed from wishlist',
  PRODUCT_ADDED_WISHLIST: 'Product added to wishlist',

  /*
   * Seller message
   */
  SELLER_ADDED: 'Congratulations! Your profile has been successfully completed, Your request is sent for approval',
  SELLER_NOT_EXIST: 'Seller not found',
  USER_STATUS_UPDATED: 'User status Updated Successfully',
  BANK_DETAIL_UPDATED: 'Bank detail updated Successfully',
  USER_DETAIL_UPDATED: 'Account detail updated successfully',
  ACCOUNT_NUMBER_EXIST: 'Account number already exists.',
  ROUTING_NUMBER_EXIST: 'Routing number already exists.',

  /**
   * Email subject
   */
  RESET_PASSWORD_EMAIL: 'MorLuxury – Reset your password!',
  ACCOUNT_CHANGE_PASSWORD_EMAIL: 'MorLuxury - Account Password Changed',
  SELLER_STATUS_UPDATED_EMAIL: 'MorLuxury - Welcome to MorLuxury Platform',
  SELLER_REQUEST_REJECTED_EMAIL: 'MorLuxury - Account Request Rejected',
  SELLER_REQUEST_APPROVED_EMAIL: 'MorLuxury - Account Request Approved',
  ACTIVE_STATUS_UPDATED_EMAIL: 'MorLuxury - Your Account has been Activated',
  INACTIVE_STATUS_UPDATED_EMAIL: 'MorLuxury - Your Account has been Restricted',
  STAFF_ADD_EMAIL: 'MorLuxury - Staff created',
  SELLER_INACTIVE_MESSAGE: 'This is to inform you that your account has been restricted temporarily. Please reach out to Admin to re-activate your account.',
  SELLER_ACTIVE_MESSAGE: 'This is to inform you that your account has been activated.',

  /**
   * How it works message
   */
  HOW_IT_WORKS_ADDED: 'How it works added successfully',
  HOW_IT_WORKS_NOT_EXIST: 'How it works not exist',
  HOW_IT_WORKS_UPDATED: 'How it works updated successfully',
  HOW_IT_WORKS_DETAIL: 'How it works details',
  HOW_IT_WORKS_DELETED: 'How it works deleted successfully',

  /**
    * Address message
    */
  ADDRESS_ADDED: 'Address added Successfully',
  ADDRESS_UPDATED: 'Address updated Successfully',
  ADDRESS_NOT_EXIST: 'Address not found',
  ADDRESS_DELETED: 'Address deleted successfully',
  ADDRESS_DETAIL: 'Address detail',
  CITY_NOT_EXIST: 'City not found',
  STATE_NOT_EXIST: 'State not found',
  COUNTRY_NOT_EXIST: 'Country Code not found',
  DEFAULT_ADDRESS: 'Customer default address added Successfully',

  /*
   * In App Notification
   */
  ACCOUNT_INFO_UPDATED: 'Your account info was updated.',
  ACCOUNT_PASSWORD_UPDATED: 'Your account password was changed.',
  APPROVAL_REQUEST: ' Congratulations! Your profile has been successfully completed, Your request has been sent for approval ',
  SELLER_INFO_UPDATED: 'Account detail updated successfully',
  BRAND_INFO_UPDATED: 'Store detail updated successfully.',
  BRAND_BANK_INFO_UPDATED: 'Bank detail updated successfully',
  CUSTOMER_ADD: 'A new Customer has registered to the platform',
  SELLER_ADD: 'A new Seller has registered to the platform',
  PRODUCT_REQUEST: 'You have received a new Product request {productName} at {dateTime}',
  SHIPPED_REQUEST: 'Product Name {productName} has been shipped by the {sellerName} on {dateTime}',
  LOW_INVENTORY: 'Product Name {productName} has reached the minimum available quantity {quantity}',
  OUT_OF_STOCK: 'Product Name {productName} has become out of stock',
  ACCOUNT_UPDATED: 'Your Account details are updated by Admin',
  USER_CREDIT_POINT_ADDED: 'You have been credited {creditPoint} points on your complaint on product {productName} at {dateTime}',
  PRODUCT_COMPLAINT_REJECTED: 'Your complaint for Product {productName} is rejected by the admin at {dateTime}',
  PRODUCT_COMPLAINT_APPROVED: 'You complaint for Product {productName} is accepted by the admin at {dateTime}',
  SHIPPED_REQUEST_ACCEPTED: '{productName} product has been delivered by the admin this quantity {quantity} on {dateTime}',
  COMMISSION_UPDATED: 'Commission  {commission} to {updateCommission} has been updated by the admin on {dateTime}',

  /*
   * Customer message
   */
  CUSTOMER_SIGNUP: 'Customer sign up successfully',
  USER_ABOUT_US_ADDED: 'Customer about us added successfully.',
  VERIFICATION_INCOMPLETE: 'Verification and profile incomplete',
  MOBILE_NUMBER_UPDATED: 'Mobile number updated Successfully',
  CUSTOMER_SOCIAL_SIGNUP: 'Signup Successful, Fill your details',
  CUSTOMER_STATUS_INACTIVE:
    'Customer Can’t be deactivated as order is in process',

  /**
   * Sms message
   */
  OTP_MESSAGE: '{otp} is your one time password to proceed on MorLuxury. It is valid for 10 minutes. Do not share your OTP with anyone.',
  PROMOTIONAL_SMS_MESSAGE: 'Thanks for registering. You will get a lovely link to download our mobile app when we launch ❤️. Stay tuned! Xoxo, MorLuxury',

  /*
   * Shipping logs
   */
  SHIPPING_LOG_ADDED: 'Shipment created successfully',
  INVENTORY_NOT_EXIST: 'Product not exist',
  DELIVER_STATUS_UPDATED: 'Delivered Successfully',
  SHIPPING_LOG_NOT_EXIST: 'Shipping log not exist',
  SHIPPING_LOG_QUANTITY_NOT_EXIST: 'Seller not shipped this quantity for product',

  /**
   * Order message
   */
  ORDER_NOT_EXIST: 'Order not exist',
  ORDER_CREATED: 'Order created successfully.',
  ORDER_STATUS_UPDATE: 'Order Status Updated Successfully.',
  EARNING_NOT_EXIST: 'earning not exist',
  EARNING_STATUS_UPDATE: 'Earning Status Updated Successfully.',
  STATUS_ALREADY_PAID: 'Earning status is already paid',
  PRODUCT_ORDER_NOT_EXIST: 'Product order not exist',
  ORDER_PERMISSION: 'You do not have permission to update order',
  CANNOT_CANCELED: 'You can not cancel this order',

  /**
   * Order message
   */
  PAYMENT_CARD_ADDED: 'Card Added Successfully',
  CARD_DEFAULT: 'Card Updated Successfully',
  CARD_NOT_EXIST: 'Card not found',

  /**
   * Promotion message
   */
  ENQUIRY_ADDED: 'Promotion Contact us enquiry added successfully',
  PROMOTION_CONTACT_US: 'Thank you for contacting us. We will be in touch with you shortly.',
  ENQUIRY_DELETED: 'Promotion contact us enquiry deleted successfully',
  PROMOTION_ENQUIRY_NOT_EXIST: 'Promotion contact us enquiry not found',
  GET_EARLY_ACCESS_CONTACT_US_NOT_EXIST: 'Get early access contact us not exist',
  GET_EARLY_ACCESS_CONTACT_US_DELETED: 'Get early access contact us deleted successfully',
  GET_EARLY_CONTACT_US_ADDED: '<h1>Hola!! You\'re all set to get your FREE GIFT!</h1><h6>Thank you for becoming a part of our beautiful World!</h6> <p> You will be notified when We First List our Beauty Range on our Website. You can avail your FREE GIFT then. Meanwhile, Don\'t forget to tell your loved ones about this fantastic FREE GIFT deal! The easiest way to be in their sweet memory 🙂</p><p className="meta">Stay tune with MorLuxury!</p>',
  GET_EARLY_ACCESS_ALREADY_EXIST: '<h1>Thanks for contacting us again. Stay tuned for our launch updates. ❤️ MorLuxury</h1>',

  /**
    * Banner message
    */
  BANNER_ADDED: 'Banner added successfully',
  BANNER_DELETED: 'Banner deleted successfully',
  BANNER_NOT_EXIST: 'Banner not found',
  BANNER_DETAIL: 'Banner detail',
  BANNER_EXIST: 'Banner title already exist',
  BANNER_STATUS_UPDATE: 'Banner status updated successfully',
  BANNER_ADD_ERROR: 'Cannot add more than 5 banner',

  /**
  * Product notify me message
  */
  PRODUCT_NOTIFY_ME_ADDED: 'Product notify me added successfully',
  PRODUCT_NOTIFY_ME_EXIST: 'Product is already added in Notify me',
  PRODUCT_IN_STOCK: 'Product available in stock',
  PRODUCT_IN_STOCK_NOTIFY: '{productName} available in stock',

  CREDIT_POINT_LESS: 'Please enter valid credit points',
  CREDIT_POINT_SHOULD_BE_LESS: 'Credit point amount should be less than order amount',
  CONFIRMATION_EMAIL: 'MorLuxury - Your Order Confirmation',

  /**
   * Order notification message
  */
  ORDER_PLACED: 'Order {orderId} has been placed successfully. Thank you for shopping at MorLuxury.',
  ORDER_PLACED_SELLER: '{customerName} has placed an order {orderId} at {dateTime}',
  ORDER_PLACED_ADMIN: '{customerName} has placed an order {orderId} with {storeName} at {dateTime}',
  ORDER_PACKED: 'Your Order {orderId} has been packed successfully and ready to be picked up by shipping executive.',
  ORDER_PICKED: 'Your Order {orderId} has been picked up by the shipping executive.',
  ORDER_DELIVERED: 'Your Order {orderId} has been delivered successfully. Please help to rate your experience with MorLuxury. Please write reviews which will help us to serve you better.',
  ORDER_CANCELED: 'We see the Order {orderId} is cancelled.',
  ORDER_SELLER_CANCELED: 'Order {orderId} has been cancelled by the Customer {customerName}',
  ORDER_ADMIN_CANCELED: 'Order {orderId} has been cancelled by the Customer {customerName} at {dateTime}',
  REFUNDED: 'We see the Order amount {amount} for order Id is refunded.',
  ORDER_DELIVERED_ADMIN_SELLER: 'Order {orderId} has been delivered successfully at {dateTime}',

  /**
   * Order title message
   */
  ORDER_PLACED_TITLE: 'Order {orderId} has been placed.',
  ORDER_PACKED_TITLE: 'Order {orderId} has been packed.',
  ORDER_PICKED_TITLE: 'Order {orderId} has been picked up.',
  ORDER_DELIVERED_TITLE: 'Your Order {orderId} has been delivered. Rate your Experience with us',
  CANCEL_ORDER_TITLE: 'Oops, your order placed is Cancelled',
  CANCEL_ORDER_SELLER_TITLE: 'Order {orderId} has been cancelled by the Customer {customerName}',
  CANCEL_ORDER_ADMIN_TITLE: 'Order {orderId} has been cancelled by the Customer {customerName} at date & time',
  REFUNDED_TITLE: 'Oops, your order {orderId} is Refunded',

};
