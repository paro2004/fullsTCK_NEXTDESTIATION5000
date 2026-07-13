const path = require('path');
const fs = require('fs');
const multer = require('multer');
const cloudinary = require('cloudinary');
const CloudinaryStorage = require('multer-storage-cloudinary');

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDE_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY || process.env.CLOUDE_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.CLOUDE_API_SECRET;

const isCloudinaryConfigured = Boolean(cloudName && apiKey && apiSecret);

if (isCloudinaryConfigured) {
  cloudinary.v2.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
} else {
  console.warn(
    'Cloudinary is not fully configured. File uploads will use local storage instead.'
  );
}

const localUploadPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(localUploadPath)) {
  fs.mkdirSync(localUploadPath, { recursive: true });
}

const storage = isCloudinaryConfigured
  ? new CloudinaryStorage({
      cloudinary,
      params: {
        folder: 'nextdestination_DEV',
        allowedFormats: ['png', 'jpg', 'jpeg'],
      },
    })
  : multer.diskStorage({
      destination: localUploadPath,
      filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
    });

// also export a disk storage instance for fallback when Cloudinary is temporarily unavailable
const diskStorage = multer.diskStorage({
  destination: localUploadPath,
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

module.exports = {
  cloudinary,
  storage,
  isCloudinaryConfigured,
  diskStorage,
};