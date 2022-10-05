const { Charge } = require('../models');

const saveCharge = async (price, order, user) => {
  const charge = (3 / 100) * price;
  await Charge.create({ order, user, price, charge });
  return charge;
};

module.exports = {
  saveCharge,
};
