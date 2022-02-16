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
const sendResetPasswordEmail = async (to, token) => {
  const subject = 'Reset password';
  const resetPasswordUrl = `${config.resetPasswordPageUrl}?token=${token}`;
  const currentDate = moment().format('dddd, MMM DD, YYYY');
  const html = renderFile('reset-password', { resetPasswordUrl, currentDate });
  await sendEmail(to, subject, null, html);
};

/**
 * Send creator signup verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendUserSignUpEmail = async (to, token) => {
  const subject = 'Invitation Email';
  const currentDate = moment().format('dddd, MMM DD, YYYY');
  const html = renderFile('user-signup', { token, currentDate });
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
const sendUserWelcomeEmail = async (to) => {
  const subject = 'Welcome Email';
  const workSpaceHomePageUrl = `${config.workSpaceHomePageUrl}`;
  const currentDate = moment().format('dddd, MMM DD, YYYY');
  const html = renderFile('user-welcome', { workSpaceHomePageUrl, currentDate });
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

module.exports = {
  transport,
  sendEmail,
  sendResetPasswordEmail,
  sendUserSignUpEmail,
  sendUserInvitationEmail,
  sendUserWelcomeEmail,
  waitlistEmail,
};
