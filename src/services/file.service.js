const cloudinary = require('cloudinary').v2;
const config = require('../config/config');
const ApiError = require('../utils/ApiError');
// set cloudinary configuration
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

/**
 * Upload base64 file
 * @param {string} base64File
 * @param {string} folder
 * @returns {Promise}
 */
const uploadBase64File = async (base64File, folder = 'uploads') => {
  try {
    const response = await cloudinary.uploader.upload(base64File, {
      folder,
      resource_type: 'auto',
    });
    return response;
  } catch (err) {
    throw ApiError(err);
  }
};

module.exports = {
  uploadBase64File,
};
