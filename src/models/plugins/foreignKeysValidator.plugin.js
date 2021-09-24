const config = require('../../config/config');

const foreignKeysValidator = (schema) => {
  if (config.env !== 'test') {
    // eslint-disable-next-line global-require
    const models = require('..');
    Object.entries(schema.obj).forEach(([key, value]) => {
      if (value.ref) {
        schema.path(key).validate(async function (id) {
          const filter = { _id: id };
          const doc = await models[value.ref].findOne(filter);
          return !!doc;
        }, `${value.ref} with id \`{VALUE}\` does not exist`);
      }
    });
  }
};

module.exports = foreignKeysValidator;
