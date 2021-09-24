const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createHub = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    contactEmail: Joi.string().email(),
    timezone: Joi.string(),
  }),
};
const getHub = {
  params: Joi.object().keys({
    hubId: Joi.string().custom(objectId),
  }),
};

const updateHub = {
  params: Joi.object().keys({
    hubId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      timezone: Joi.string(),
      contactEmail: Joi.string().email(),
    })
    .min(1),
};

const inviteTeam = {
  body: Joi.object()
    .keys({
      emails: Joi.array().items(Joi.string().email()).required(),
    })
    .min(1),
};

const uploadHubAvatar = {
  params: Joi.object().keys({
    hubId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({ avatar: Joi.string().required() }),
};

module.exports = {
  getHub,
  updateHub,
  inviteTeam,
  createHub,
  uploadHubAvatar,
};
