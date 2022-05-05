const Joi = require('joi');
const { objectId } = require('./custom.validation');
const { password } = require('./custom.validation');

const getUsers = {
  query: Joi.object().keys({
    firstName: Joi.string(),
    lastName: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    paginate: Joi.boolean().default(true),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      firstName: Joi.string(),
      lastName: Joi.string(),
      phoneNumber: Joi.string(),
      email: Joi.string().email(),
      jobTitle: Joi.string(),
      department: Joi.string(),
      timezone: Joi.string(),
      reviewer: Joi.string().custom(objectId),
      shippingAddress: Joi.object().keys({
        city: Joi.string(),
        state: Joi.string(),
        country: Joi.string(),
        Address: Joi.string(),
        zipCode: Joi.string(),
      }),
    })
    .min(1),
};

const uploadUserAvatar = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({ avatar: Joi.string().required() }),
};

const changeUserPassword = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({ oldPassword: Joi.string().required(), newPassword: Joi.string().required().custom(password) }),
};

module.exports = {
  getUsers,
  getUser,
  updateUser,
  uploadUserAvatar,
  changeUserPassword,
};
