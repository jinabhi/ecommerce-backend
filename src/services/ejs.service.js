import ejs from 'ejs';
import path from 'path';

export default {
  /**
   * Generate templates
   * @param {object} model
   * @param {object} rules
   * @param {array} errors
   */
  generateEjsTemplate(req) {
    return new Promise((resolve, reject) => {
      const ejsFilePath = (path.join(__dirname, `../ejs/${req.template}`));
      ejs.renderFile(ejsFilePath, { data: req.data }, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  },
};
