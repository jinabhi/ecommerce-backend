/* eslint-disable prefer-regex-literals */
import fs from 'fs';
import path from 'path';
import AWS from 'aws-sdk';
import multer from 'multer';
import sharp from 'sharp';
import HttpStatus from 'http-status';
import config from '../config';
import models from '../models';
import s3Bucket from '../services/s3Bucket.service';
import multerStorageService from '../services/multerStorage.service';
import loggers from '../services/logger.service';
import utility from '../utils';

const { MediaTemp } = models;
const { Op, literal } = models.Sequelize;

const s3 = new AWS.S3({
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
  Bucket: config.aws.bucketName,
  signatureVersion: 'v4',
  region: config.aws.region, // 'ap-south-1'
});

export default {
  /**
   * Find all and remove
   */
  async findAllAndRemove() {
    try {
      const where = {
        [Op.and]: literal('TIMESTAMPDIFF(MINUTE, `created_at`, NOW()) > 30'),
        status: 'pending',
      };
      const result = await MediaTemp.findAll({ where });

      const pendingMediaIds = [];
      const unlinkMediaPromises = result.map((media) => {
        pendingMediaIds.push(media.id);
        return this.unlinkMedia(media);
      });

      unlinkMediaPromises.push(
        MediaTemp.destroy({
          where: {
            id: {
              [Op.in]: pendingMediaIds,
            },
          },
        }),
      );

      await Promise.all(unlinkMediaPromises);

      return result;
    } catch (error) {
      loggers.error(`Media find all and remove error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * Unlink media file
   * @param {Object} media
   */
  async unlinkMedia(media) {
    const fileDir = media.basePath;
    const objects = [{ Key: media.basePath }];
    // eslint-disable-next-line prefer-regex-literals
    const regexp = RegExp('image(\\\\|/)');
    if (fileDir && fileDir.match(regexp)) {
      const imagePathArray = fileDir.split('/');
      const imageName = imagePathArray.pop();
      imagePathArray.push('thumb');
      imagePathArray.push(imageName);
      const thumbPath = imagePathArray.join('/');
      if (thumbPath) {
        objects.push({ Key: thumbPath });
      }
    }
    const imageObj = { objects };
    if (config.app.mediaStorage === 's3') {
      if (media.mediaFor === 'video-track') {
        s3Bucket.unlinkVideoFromS3(imageObj);
      } else {
        s3Bucket.unlinkMediaFromS3(imageObj);
      }
    } else {
      // For local delete media

      await this.unlinkMediaFromLocal(media);
    }
  },

  /**
   * unlink media file from local
   * @param {Object} media
   */
  async unlinkMediaFromLocal(media) {
    try {
      const fileDir = path.join(__dirname, `../../${media.basePath}`);
      // eslint-disable-next-line no-unused-expressions
      fs.existsSync(fileDir) && fs.unlinkSync(fileDir);

      const regexp = RegExp('image(\\\\|/)');
      if (fileDir && fileDir.match(regexp)) {
        const imagePathArray = fileDir.split('/');
        const imageName = imagePathArray.pop();
        imagePathArray.push('thumb');
        imagePathArray.push(imageName);
        const thumbPath = imagePathArray.join('/');
        // eslint-disable-next-line no-unused-expressions
        fs.existsSync(thumbPath) && fs.unlinkSync(thumbPath);
      }
    } catch (error) {
      loggers.error(`Media unlink media from local error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * Upload media Local/AWS
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async uploadMedia(req, res, next) {
    try {
      const { params } = req;
      const { mediaFor } = params;
      const { aws: { privateBucketName, bucketName } } = config;
      req.bucketName = (mediaFor === 'brandLogo') ? privateBucketName : bucketName;
      const multerStorage = await multerStorageService.getStorage(config.app.mediaStorage);
      // eslint-disable-next-line consistent-return
      multerStorage.single('file')(req, res, async (error) => {
        this.error = error;
        if (error instanceof multer.MulterError) {
          return next(error);
        }
        if (error) {
          return next(error);
        }

        // Crop images
        if (config.app.mediaStorage === 'local') {
          const fileDir = path.join(
            path.resolve(),
            `/public/uploads/${mediaFor}/thumb/`,
          );
          const fileName = req?.file?.path.split(`${mediaFor}`);
          sharp(req.file.path)
            .resize(200, 200)
            .sharpen()
            .toFile(`${fileDir}${fileName[1]}`, (err) => {
              if (err) {
                this.error = err;
              }
            });
        }
        next();
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Upload media Local/AWS
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async uploadMediaFile(req, res, next) {
    try {
      // const { params } = req;
      // const { mediaType } = params;
      // params.mediaType = mediaType;
      const multerStorage = await multerStorageService.getFileStorage(
        config.app.mediaStorage,
      );
      // eslint-disable-next-line consistent-return
      multerStorage.single('file')(req, res, async (error) => {
        this.error = error;
        if (this.error instanceof multer.MulterError) {
          // A Multer error occurred when uploading.
          if (this.error.code === 'LIMIT_FILE_SIZE') {
            this.error.message = utility.getMessage(req, false, 'TOO_LARGE_FILE');
          }
          this.error.status = HttpStatus.BAD_REQUEST;
          return next(this.error);
        }
        if (this.error) {
          // An unknown error occurred when uploading.
          this.error.status = HttpStatus.BAD_REQUEST;
          return next(this.error);
        }
        // if (config.app.mediaStorage === 'local') {
        //   // Generate Image thumb
        //   if (mediaType === 'image') {
        //     await createThumb(req, next);
        //   }
        // }
        next();
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Save media file
   * @param {Object} req
   */
  async create({
    params, file, headers, req,
  }) {
    try {
      let result = '';
      const mediaType = config.app.mediaStorage === 'local' ? params.mediaType : 'image';

      const imageDir = path.join(__dirname, `../../${file.path}`);
      // const ext = path.extname(file.originalname).split('.').pop();
      const HTTPs = 'https';
      if (config.app.mediaStorage === 's3' && params.mediaType === 'image') {
        const originalFileObj = file.transforms.findIndex((data) => data.id === 'original');
        if (originalFileObj >= 0) {
          // eslint-disable-next-line no-param-reassign
          file.key = file.transforms[originalFileObj].key;
        }
      }

      const mediaData = {
        name: file.filename || file.originalname,
        basePath: file.path || file.key,
        imagePath: imageDir,
        baseUrl: `${HTTPs}://${headers.host}/${file.path}`,
        mediaType,
        mediaFor: params.mediaFor,
        isThumbImage: false,
        status: 'pending',
      };
      // Upload image on s3
      if (config.app.mediaStorage === 's3') {
        if (params.mediaFor === 'video-track' && params.mediaType === 'image') {
          mediaData.baseUrl = config.aws.s3PublicBucketUrl + file.key;
        } else if (params.mediaFor === 'video-track' && params.mediaType === 'video') {
          mediaData.baseUrl = config.aws.s3PublicBucketUrl + file.key;
        } else {
          mediaData.baseUrl = config.aws.s3PublicBucketUrl + file.key;
        }
        result = await MediaTemp.create(mediaData);
      } else {
        result = await MediaTemp.create(mediaData);
      }
      return result;
    } catch (error) {
      loggers.error(`Media file create error: ${error}, user id: ${req?.user?.id} `);
      throw Error(error);
    }
  },

  /**
   * Save multiple media file
   * @param {Object} req
   */
  async createMultiple(req) {
    const {
      params, files, headers, connection,
    } = req;
    try {
      const HTTPs = connection.encrypted === undefined ? 'http' : 'https';
      const mediaDataArray = files.map((file) => ({
        name: file.filename,
        basePath: file.path,
        baseUrl: `${HTTPs}://${headers.host}/${file.path}`,
        mediaType: params.mediaType,
        mediaFor: params.mediaFor,
        status: 'pending',
      }));

      return await MediaTemp.bulkCreate(mediaDataArray);
    } catch (error) {
      loggers.error(`Media file create multiple error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * Find all media file by base_path
   * @param {Array} paths
   */
  async findAllByBasePathIn(paths) {
    try {
      const where = {
        status: 'pending',
        basePath: {
          [Op.in]: paths,
        },
      };
      return await MediaTemp.findAll({ where });
    } catch (error) {
      loggers.error(`Media find all by base path error: ${error}`);
      throw Error(error);
    }
  },
  /**
   * Find  media file by base_path and unlink
   * @param {Array} paths
   */
  async findMediaByBasePathAndUnlink(paths) {
    try {
      const where = { basePath: paths };
      const mediaData = await MediaTemp.findOne({ where });
      if (mediaData) {
        await this.unlinkMedia(mediaData);
        await mediaData.update({ status: 'deleted' });
      }
      return true;
    } catch (error) {
      loggers.error(`Media find media by base path and unlink error: ${error}`);
      throw Error(error);
    }
  },
  /**
   * Change media status
   * @param {Array} paths
   */
  async markMediaAsUsed(paths, t) {
    let transaction = '';
    if (t) {
      transaction = t;
    } else {
      transaction = await models.sequelize.transaction();
    }
    try {
      const mediaData = {
        status: 'used',
      };
      const result = await MediaTemp.update(
        mediaData,
        {
          where: {
            basePath: {
              [Op.in]: paths,
            },
          },
        },
        {
          transaction,
        },
      );
      if (!t) {
        await transaction.commit();
      }
      return result;
    } catch (error) {
      if (!t) {
        await transaction.rollback();
      }
      throw Error(error);
    }
  },

  /**
  * Change media status pending
  * @param {Array} paths
  */
  async markMediaAsPending(paths) {
    const transaction = await models.sequelize.transaction();
    try {
      const mediaData = {
        status: 'pending',
      };
      const result = await MediaTemp.update(
        mediaData,
        {
          where: {
            basePath: {
              [Op.in]: paths,
            },
          },
        },
        {
          transaction,
        },
      );
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      loggers.error(`Media mark media as pending error: ${error}`);
      throw Error(error);
    }
  },
  /**
   * Change media status
   * @param {Array} paths
   */
  async getSingedUrl(paths) {
    const params = {
      Bucket: config.aws.bucketName,
      Key: paths,
      Expires: 60,
    };
    try {
      const url = await new Promise((resolve, reject) => {
        s3.getSignedUrl('getObject', params, (err, signedUrl) => (err ? reject(err) : resolve(signedUrl)));
      });
      return url;
    } catch (error) {
      loggers.error(`Media get singled url error: ${error}`);
      throw Error(error);
    }
  },

  async getSecureS3Url(paths) {
    if (paths) {
      if (config.app.mediaStorage === 's3') {
        const signedUrl = await this.getSingedUrl(paths);
        return signedUrl;
      }
      return false;
    }
    return false;
  },
};
