const Joi = require('joi');

const getAnalytics = {
  query: Joi.object().keys({
    include: Joi.array(),
    page: Joi.number(),
    limit: Joi.number(),
    paginate: Joi.boolean().default(true),
    sortBy: Joi.string(),
  }),
};

module.exports = {
  getAnalytics,
};
