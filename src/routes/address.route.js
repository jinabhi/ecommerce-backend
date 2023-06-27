import { Router } from 'express';
import controllers from '../controllers';
import validations from '../validations/index';
import middlewares from '../middlewares/index';

const router = Router();
const { addressController } = controllers;
const { addressValidator } = validations;
const {
  validateMiddleware, addressMiddleware, authMiddleware,
  resourceAccessMiddleware,
} = middlewares;

router.post(
  '/customer/address',
  authMiddleware,
  resourceAccessMiddleware(['customer']),
  validateMiddleware(addressValidator.createAddressSchema),
  addressController.addAddress,
);

router.get(
  '/customer/address',
  authMiddleware,
  resourceAccessMiddleware(['customer']),
  addressController.getAllAddress,
);

router.get(
  '/customer/address/is-default/:id',
  authMiddleware,
  resourceAccessMiddleware(['customer']),
  validateMiddleware(addressValidator.detailAndDeleteAddressSchema),
  addressMiddleware.checkAddressExist,
  addressController.updateDefaultAddress,
);

router.get(
  '/customer/address/:id',
  authMiddleware,
  resourceAccessMiddleware(['customer']),
  validateMiddleware(addressValidator.detailAndDeleteAddressSchema),
  addressMiddleware.checkAddressExist,
  addressController.getAddressDetail,
);

router.put(
  '/customer/address/:id',
  authMiddleware,
  resourceAccessMiddleware(['customer']),
  validateMiddleware(addressValidator.updateAddressSchema),
  addressMiddleware.checkCityExist,
  addressMiddleware.checkStateExist,
  addressMiddleware.checkCountryCodeExist,
  addressMiddleware.checkAddressExist,
  addressController.updateAddress,
);

router.delete(
  '/customer/address/:id',
  authMiddleware,
  resourceAccessMiddleware(['customer']),
  validateMiddleware(addressValidator.detailAndDeleteAddressSchema),
  addressMiddleware.checkAddressExist,
  addressController.deleteAddress,
);

router.get(
  '/country',
  addressController.getAllCountry,
);

router.get(
  '/city',
  addressController.getAllCity,
);

router.get(
  '/state',
  addressController.getAllState,
);

export default router;
