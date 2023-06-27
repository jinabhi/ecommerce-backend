/* eslint-disable consistent-return */
import Joi from 'joi';
import utils from '../utils/index';
import ValidationError from '../utils/ValidationError';

/**
 * Middleware for validate json object schema request
 * @param {Object} schema
 * @returns {function}
 */
const validate = (schema) => async (req, res, next) => {
  try {
    const validSchema = utils.pick(schema, [
      'headers',
      'params',
      'query',
      'body',
    ]);

    const object = utils.pick(req, Object.keys(validSchema));

    const { error } = Joi.compile(validSchema)
      .prefs({ errors: { label: 'key' }, abortEarly: false })
      .validate(object);
    if (error) {
      let errors = [];
      error.details.forEach((errorData) => {
        const errorObject = {
          message: utils.getMessage({}, false, errorData.message),
          field: errorData.path.join('_'),
          type: errorData.type,
        };

        errors.push(errorObject);
      });
      errors = new ValidationError(errors[0]?.message);
      errors.status = utils.httpStatus('BAD_REQUEST');
      delete errors.statusCode;
      return next(errors);
    }
    return next();
  } catch (error) {
    return next(error);
  }
};

export default validate;
