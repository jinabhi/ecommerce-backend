/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
import fs from 'fs';
import path from 'path';
import AWS from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3-transform';
import sharp from 'sharp';
import config from '../config';

const allowedFormats = {
  image: ['.png', '.jpg', '.gif', '.jpeg'],
  video: ['.mp4', '.mov', '.wmv', '.avi'],
  presentations: ['.pdf', '.html', '.ppt', '.pptx'],
  audio: ['.aac', '.m4a', '.mp3'],
  upload: ['.xlsx', '.xls', '.csv'],
};
const format = ['jpeg', 'png', 'jpg', 'docx', 'xlsx', 'csv', 'doc', 'mp3', 'mp4', 'pdf'];
const s3 = new AWS.S3({
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
  signatureVersion: 'v4',
  region: config.aws.region, // 'ap-south-1'
});

const storageAWS = multerS3({
  s3,
  // add bucket name here
  bucket(req, file, cb) {
    const bucketPath = req.bucketName ?? config.aws.bucketName;
    cb(null, bucketPath);
  },
  // public-read: available public, authenticated-read: need to create signed up url
  ACL(req, file, cb) {
    const acl = 'public-read';
    cb(null, acl);
  },
  // attachment need to add for files
  // contentDisposition(req, file, cb) {
  //   const contentDisposition = '';
  //   cb(null, contentDisposition);
  // },
  // // AES server side encryption here
  // serverSideEncryption(req, file, cb) {
  //   const serverSideEncryption = 'AES256';
  //   cb(null, serverSideEncryption);
  // },
  // we get submitted file name
  metadata(req, file, cb) {
    const dateTimeStamp = Date.now();
    const filename = file.originalname.replace(/[^A-Z0-9.]/gi, '-');
    const fileArray = filename.split('.');
    const ext = fileArray.pop();
    const newFileName = `${fileArray.join('-')}-${dateTimeStamp}.${ext}`;
    file.newFileName = newFileName;
    cb(null, {
      fieldName: file.fieldname,
    });
  },
  key(req, file, cb) {
    const { mediaType, mediaFor } = req.params;
    const dir = '';
    const dateTimeStamp = Date.now();
    const filename = file.originalname.replace(/[^A-Z0-9.]/gi, '-');
    const fileArray = filename.split('.');
    const ext = fileArray.pop();
    const newFileName = `${fileArray.join('-')}-${dateTimeStamp}.${ext}`;
    file.newFileName = newFileName;
    const storageLocation = `uploads/${mediaType}/${mediaFor}`;
    cb(
      null,
      `${storageLocation}/${dir}${file.newFileName || file.originalname}`,
    );
  },
  shouldTransform(req, file, cb) {
    cb(null, /^image/i.test(file.mimetype));
  },
  transforms: [
    {
      id: 'original',
      key(req, file, cb) {
        const { mediaFor } = req.params;
        const dir = mediaFor;
        cb(null, `${dir}/${file.newFileName}`);
      },
      transform(req, file, cb) {
        cb(null, sharp().png());
      },
    },
    {
      id: 'thumbnail',
      key(req, file, cb) {
        const { mediaFor } = req.params;
        const dir = `${mediaFor}/thumb`;
        cb(null, `${dir}/${file.newFileName}`);
      },
      transform(req, file, cb) {
        cb(null, sharp().resize({ width: 200 }).png());
      },
    },
  ],
});

// using below function for local file system diskStorage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const { mediaFor } = req.params;
    const fileDir = path.join(
      __dirname,
      `../../public/uploads/${mediaFor}/thumb`,
    );
    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true }, (err) => {
        throw Error(err);
      });
    }

    file.thumbDir = fileDir;

    cb(null, `public/uploads/${mediaFor}/`);
  },
  filename: (req, file, cb) => {
    const dateTimeStamp = Date.now();
    const filename = file.originalname.replace(/[^A-Z0-9.]/gi, '-');
    const fileArray = filename.split('.');
    const ext = fileArray.pop();
    cb(null, `${fileArray.join('-')}-${dateTimeStamp}.${ext}`);
  },
});

async function getStorage(type = 'local') {
  return multer({
    storage: type === 's3' ? storageAWS : storage,
    fileFilter: (req, file, callback) => {
      let fileFormats = [];
      const { params: { mediaType } } = req;
      const ext = path.extname(file.originalname);
      if (mediaType === 'image') {
        fileFormats = allowedFormats.image;
      } else if (mediaType === 'video') {
        fileFormats = allowedFormats.video;
      } else if (mediaType === 'presentations') {
        fileFormats = allowedFormats.presentations;
      } else if (mediaType === 'audio') {
        fileFormats = allowedFormats.audio;
      } else if (mediaType === 'upload') {
        fileFormats = allowedFormats.upload;
      }
      if (!fileFormats.includes(ext.toLowerCase())) {
        return callback(new Error('Invalid file format.'));
      }
      callback(null, true);
    },
    limits: {
      fileSize: config.app.mediaUploadSizeLimit,
    },
  });
}
async function getFileStorage(type = 'local') {
  return multer({
    storage: type === 's3' ? storageAWS : storage,
    fileFilter: (req, file, callback) => {
      const ext = path.extname(file.originalname).split('.').pop();
      if (!format.includes(ext.toLowerCase())) {
        return callback(new Error(`Please add either a ${format.toString()} file`));
      }
      callback(null, true);
    },
    limits: {
      fileSize: config.app.mediaUploadSizeLimit,
    },
  });
}

export default {
  getStorage,
  getFileStorage,
};
