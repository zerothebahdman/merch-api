const nodemailer = require('nodemailer');
const path = require('path');
const pug = require('pug');
const moment = require('moment');
const config = require('../config/config');
const logger = require('../config/logger');

const transport = nodemailer.createTransport(config.email.smtp);
/* istanbul ignore next */
if (config.env !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
}

const renderFile = (filename, data) => {
  const fullPath = path.join(__dirname, `../templates/emails/${filename}.pug`);
  return pug.renderFile(fullPath, data);
};

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
const sendEmail = async (to, subject, text, html) => {
  const msg = { from: config.email.from, to, subject, text };
  if (html) msg.html = html;
  await transport.sendMail(msg);
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to, token, firstName) => {
  const subject = 'Reset password';
  const html = renderFile('reset-password', { token, firstName });
  await sendEmail(to, subject, null, html);
};

/**
 * Send creator signup verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendUserSignUpEmail = async (to, token, firstName) => {
  const subject = 'Merchro - Verify your email';
  const html = renderFile('user-signup', { token, firstName });
  await sendEmail(to, subject, null, html);
};

/**
 * Send user invitation email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendUserInvitationEmail = async (to, token) => {
  const subject = 'Invitation Email';
  const userInvitationUrl = `${config.frontendAppUrl}/verify-user-invitation?token=${token}`;
  const currentDate = moment().format('dddd, MMM DD, YYYY');
  const html = renderFile('user-invitation', { userInvitationUrl, currentDate });
  await sendEmail(to, subject, null, html);
};

/**
 * Send creator welcome email
 * @param {string} to
 * @returns {Promise}
 */
const sendUserWelcomeEmail = async (to, firstName) => {
  const subject = 'Welcome Email';
  const html = renderFile('user-welcome', { firstName });
  await sendEmail(to, subject, null, html);
};

/**
 * Send credit email
 * @param {string} to
 * @param {string} firstName
 * @param {string} message
 * @returns {Promise}
 */
const creditEmail = async (to, firstName, message) => {
  const subject = 'Your Merchro wallet was credited!';
  const html = renderFile('credit', { firstName, message });
  await sendEmail(to, subject, null, html);
};

/**
 * Send debit email
 * @param {string} to
 * @param {string} firstName
 * @param {string} message
 * @returns {Promise}
 */
const debitEmail = async (to, firstName, message) => {
  const subject = 'Your withdrawal was successful!';
  const html = renderFile('debit', { firstName, message });
  await sendEmail(to, subject, null, html);
};

/**
 * Send waitlist email
 * @param {string} to
 * @returns {Promise}
 */
const waitlistEmail = async (to) => {
  const subject = 'You are on our waitlist!';
  const workSpaceHomePageUrl = `${config.workSpaceHomePageUrl}`;
  const currentDate = moment().format('dddd, MMM DD, YYYY');
  const html = renderFile('waitlist', { workSpaceHomePageUrl, currentDate, email: to });
  await sendEmail(to, subject, null, html);
};

const sendUserOrderFulfillmentEmail = (user, order) => {
  const subject = 'Your order has been fulfilled!';
  const html = renderFile('order-fulfillment', { user, order });
  return sendEmail(user.email, subject, null, html);
};

const sendUserOrderReminderEmail = (user, order) => {
  const subject = '[URGENT!] You have pending orders';
  const html = renderFile('order-reminder', { user, order });
  return sendEmail(user.email, subject, null, html);
};

const sendPaymentTrackingEmail = (message) => {
  const subject = 'Payment tracking';
  return sendEmail('amadebusuyi@gmail.com', subject, null, `<p>${message}</p>`);
};

const sendUserEventPaymentLinkTicket = (user, event) => {
  const subject = 'Your ticket for the event';
  const html = renderFile('event-payment-link-ticket', { user, event });
  return sendEmail(user.clientEmail, subject, null, html);
};

const sendInvoiceReminderEmail = (invoice) => {
  const subject = `${invoice.creator.firstName} ${invoice.creator.lastName} sent an invoice`;
  const html = renderFile('invoice-reminder', { invoice });
  return sendEmail(invoice.client.email, subject, null, html);
};

module.exports = {
  transport,
  sendEmail,
  sendResetPasswordEmail,
  sendUserSignUpEmail,
  sendUserInvitationEmail,
  sendUserWelcomeEmail,
  creditEmail,
  debitEmail,
  waitlistEmail,
  sendUserOrderFulfillmentEmail,
  sendPaymentTrackingEmail,
  sendUserOrderReminderEmail,
  sendUserEventPaymentLinkTicket,
  sendInvoiceReminderEmail,
};
