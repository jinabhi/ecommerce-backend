import jwt from '../services/jwt.service';
import accountRepository from '../repositories/account.repository';
import utility from '../utils/index';
/**
 * Check user authorization
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
const authValidateRequest = async (req, res, next) => {
  try {
    if (req.headers && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      const unauthorizedError = utility.httpStatus('UNAUTHORIZED');
      if (parts.length === 2) {
        const scheme = parts[0];
        const token = parts[1];
        if (/^Bearer$/i.test(scheme)) {
          const decodedToken = jwt.verifyToken(token);
          if (decodedToken) {
            const user = await accountRepository.findOne({
              id: decodedToken.id,
            });
            if (user) {
              const userToken = await accountRepository.getDeviceDetailByToken(
                token,
              );
              if (userToken) {
                req.user = user;
                req.userToken = userToken;
                next();
              } else {
                const error = new Error('TOKEN_BAD_FORMAT');
                error.status = unauthorizedError;
                error.message = utility.getMessage(
                  req,
                  false,
                  'SESSION_EXPIRE',
                );
                next(error);
              }
            } else {
              const error = new Error();
              error.status = unauthorizedError;
              error.message = utility.getMessage(
                req,
                false,
                'ACCOUNT_INACTIVE',
              );
              next(error);
            }
          } else {
            const error = new Error('TOKEN_NOT_FOUND');
            error.status = utility.httpStatus('BAD_REQUEST');
            error.message = utility.getMessage(
              req,
              false,
              'UNAUTHORIZED_USER_ACCESS',
            );
            next(error);
          }
        } else {
          const error = new Error('TOKEN_BAD_FORMAT');
          error.status = unauthorizedError;
          error.message = utility.getMessage(req, false, 'SESSION_EXPIRE'); // 'Format is Authorization: Bearer [token]';
          next(error);
        }
      } else {
        const error = new Error('TOKEN_BAD_FORMAT');
        error.status = unauthorizedError; // HttpStatus['401'];
        error.message = utility.getMessage(
          req,
          false,
          'UNAUTHORIZED_USER_ACCESS',
        ); // 'Format is Authorization: Bearer [token]';
        next(error);
      }
    } else {
      const error = new Error('TOKEN_NOT_FOUND');
      error.status = utility.httpStatus('UNAUTHORIZED');
      error.message = utility.getMessage(
        req,
        false,
        'UNAUTHORIZED_USER_ACCESS',
      );
      next(error);
    }
  } catch (error) {
    error.status = utility.httpStatus('UNAUTHORIZED');
    next(error);
  }
};
export default authValidateRequest;
