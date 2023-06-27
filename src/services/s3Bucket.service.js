/* eslint-disable prefer-promise-reject-errors */
import fs from 'fs';
import AWS from 'aws-sdk';
import config from '../config';
import loggers from './logger.service';

// AWS.config.update({ region: 'ap-south-1' });

const s3 = new AWS.S3({
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
  Bucket: config.aws.bucketName,
});
export default {
  checkS3MediaExist(path) {
    const params = {
      Bucket: config.aws.bucketName,
      Key: path,
    };

    return new Promise((resolve, reject) => {
      s3.headObject(params, (err) => {
        if (err) {
          reject(false);
        } else {
          resolve(params.Key);
        }
      });
    });
  },

  async unlinkMediaFromS3(data) {
    const params = {
      Bucket: config.aws.bucketName,
      Delete: {
        Objects: data.objects,
      },
    };
    return new Promise((resolve) => {
      s3.deleteObjects(params, (err) => {
        if (err) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  },

  async unlinkVideoFromS3(data) {
    const params = {
      Bucket: config.aws.videoSourceBucketName,
      Delete: {
        Objects: data.objects,
      },
    };
    return new Promise((resolve) => {
      s3.deleteObjects(params, (err) => {
        if (err) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  },

  async uploadImageOnS3Bucket(requestData) {
    let bucketPath = `${requestData.mediaFor}`;
    bucketPath = requestData.isThumbImage
      ? `${bucketPath}/thumb/${requestData.name}`
      : `${bucketPath}/${requestData.name}`;

    const params = {
      Bucket: config.aws.bucketName,
      Key: bucketPath,
      Body: fs.createReadStream(requestData.imagePath),
      ACL: 'public-read',
    };
      // Upload new image, careful not to upload it in a path that will trigger the function again!
    return new Promise((resolve, reject) => {
      s3.upload(params, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve({ basePath: bucketPath });
        }
      });
    });
  },

  async uploadBase64ImageOnS3Bucket(invoiceData, path) {
    const buf = Buffer.from(invoiceData.pdf.replace(/^data:image\/\w+;base64,/, ''), 'base64');

    const data = {
      Bucket: config.aws.bucketName,
      Key: path,
      Body: buf,
      ContentEncoding: 'base64',
      ContentType: 'application/pdf',
    };
    return new Promise((resolve) => {
      s3.upload(data, (err) => {
        if (err) {
          resolve(err);
        } else {
          resolve({ basePath: path });
        }
      });
    });
  },

  /**
   * Read data for excel
   * @param {*} invoiceData
   * @param {*} path
   */
  async getExcelData(basePath) {
    const params = {
      Bucket: config.aws.bucketName,
      Key: basePath,
    };
    return new Promise((resolve, reject) => {
      s3.getObject(params, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  },

  /**
   * Upload excel file on s3
   * @param {*} invoiceData
   * @param {*} path
   */
  async UploadExcel(fileData, path) {
    const data = {
      Bucket: config.aws.bucketName,
      Key: path,
      Body: fileData,
      ContentType: 'application/octet-stream',
    };
    return new Promise((resolve) => {
      s3.upload(data, (err) => {
        if (err) {
          resolve(err);
        } else {
          resolve({ basePath: path });
        }
      });
    });
  },

  /**
   * Get signed URL
   *
   */
  getSingedUrl(imagePath) {
    const key = fs.readFileSync(config?.aws?.cloudfrontPrivateKey, 'ascii');
    const cloudFront = new AWS.CloudFront.Signer(config.aws.cloudfrontAccessKey, key);
    const expireIn = Math.floor((new Date()).getTime() / 1000)
    + parseInt(config.aws.mediaExpireTime, 10);
    const params = {
      url: `${config.aws.s3PrivateBucketUrl}${imagePath}`,
      expires: expireIn,
    };
    try {
    // Generating a signed URL
      return cloudFront.getSignedUrl(
        params,
      );
    } catch (error) {
      loggers.error(`Media get singled url error: ${error}`);
      throw Error(error);
    }
  },
};
