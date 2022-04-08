const httpStatus = require('http-status');
const { fileService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const uploadBase64File = catchAsync(async (req, res) => {
  let urls = req.body.files.map(async (file) => {
    const fileUrl = await fileService.uploadBase64File(file);
    return fileUrl;
  });

  urls = await Promise.all(urls);
  res.status(httpStatus.CREATED).send(urls);
});

module.exports = {
  uploadBase64File,
};
