const fetch = require('node-fetch');
const { paymentInfo } = require('../config/config');

// eslint-disable-next-line
// const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

/**
 * Payment API - Get payment link
 * @param {string} base64File
 * @param {string} folder
 * @returns {Promise}
 */
const getPaymentLink = async (paymentBody) => {
  try {
    const response = await fetch(`${paymentInfo.url}/payments`, {
      headers: {
        Authorization: `Bearer ${paymentInfo.secret}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        ...paymentBody,
        redirect_url: paymentInfo.redirect_url,
        customizations: {
          title: 'Merchro Pay',
          logo: 'https://www.merchro.com/logo-black.svg',
        },
      }),
    });
    const data = await response.json();
    return data;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
  }
};

module.exports = {
  getPaymentLink,
};
