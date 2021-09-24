const cloudinary = require('cloudinary').v2;
const config = require('../config/config');
// set cloudinary configuration
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

/**
 * Upload base64 image
 * @param {string} base64Image
 * @param {string} folder
 * @returns {Promise}
 */
const uploadBase64Image = async (base64Image, folder) => {
  const response = await cloudinary.uploader.upload(base64Image, { folder });
  return response;
};

module.exports = {
  uploadBase64Image,
};
