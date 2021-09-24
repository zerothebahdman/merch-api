const { version } = require('../../package.json');
const config = require('../config/config');

const swaggerDef = {
  openapi: '3.0.0',
  info: {
    title: 'Merchro API documentation (V1)',
    version,
  },
  servers: [
    {
      url: config.env === 'production' ? `${config.baseApiUrl}/v1` : `http://localhost:${config.port}/v1`,
    },
  ],
};

module.exports = swaggerDef;
