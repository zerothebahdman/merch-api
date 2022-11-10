const config = require('../config/config');
const { Charge } = require('../models');

const saveCharge = async (price, order, user) => {
  const charge = (config.paymentProcessing.storePaymentCharge / 100) * price;
  await Charge.create({ order, user, price, charge });
  return charge;
};

module.exports = {
  saveCharge,
};
