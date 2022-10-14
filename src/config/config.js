const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    USE_PORT: Joi.bool().default(false).description('This is to determine whether to use the PORT value'),
    API_DOMAIN: Joi.string().description('API Domain'),
    FRONT_END_APP_URL: Joi.string().description('Frontend App Domain'),
    ENFORCE_SSL: Joi.bool().default(false).description('This is to determine whether to use HTTP or HTTPS'),
    STORE_SETUP_PAGE_URL: Joi.string().description(
      'This is the frontend url to direct the user to after email verification is successful'
    ),
    USER_SIGNUP_PAGE_URL: Joi.string().description(
      'This is the frontend url to direct the user to after user invitation verification is successful'
    ),
    RESET_PASSWORD_PAGE_URL: Joi.string().description(
      'This is the frontend url to direct the user when attempting to reset password'
    ),
    STORE_HOME_PAGE_URL: Joi.string().description('This is the frontend url to direct the user to the home page of a store'),
    MONGODB_URL: Joi.string().required().description('Mongo DB url'),
    MONGODB_URL_TEST: Joi.string().description('Mongo DB Test url'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire'),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(60)
      .description('minutes after which reset password tokens expire'),
    JWT_EMAIL_VERIFICATION_EXPIRATION_MINUTES: Joi.number()
      .default(60)
      .description('minutes after which reset password tokens expire'),
    JWT_USER_INVITATION_EXPIRATION_MINUTES: Joi.number()
      .default(60)
      .description('minutes after which reset password tokens expire'),
    SMTP_HOST: Joi.string().description('server that will send the emails'),
    SMTP_PORT: Joi.number().description('port to connect to the email server'),
    SMTP_USERNAME: Joi.string().description('username for email server'),
    SMTP_PASSWORD: Joi.string().description('password for email server'),
    EMAIL_FROM: Joi.string().description('the from field in the emails sent by the app'),
    SENTRY_DSN: Joi.string().description('Sentry DSN'),
    ENABLE_SENTRY_LOGGING: Joi.bool().default(false).description('Enable Sentry Logging'),
    GOOGLE_CLIENT_ID: Joi.string().description('Google Client Id'),
    CLOUDINARY_CLOUD_NAME: Joi.string().description('Cloudinary Cloud Name'),
    CLOUDINARY_API_KEY: Joi.string().description('Cloudinary API Key'),
    CLOUDINARY_API_SECRET: Joi.string().description('Cloudinary API Secret'),
    FLUTTER_API_URL: Joi.string().description('Flutter wave API Url'),
    FLUTTER_API_REDIRECT: Joi.string().description('Flutter wave API Redirect URL'),
    FLUTTER_API_SECRET: Joi.string().description('Flutter wave API Secret'),
    PAGA_API_SECRET: Joi.string().description('PAGA API Secret'),
    PAGA_API_KEY: Joi.string().description('PAGA API key'),
    PAGA_API_PUBLIC_KEY: Joi.string().description('PAGA API public key'),
    REFERRAL_CODE: Joi.string().description('Default referral code, restricted use'),
    CRON_SCHEDULE_SEND_ORDER_NOT_FULFILLED_REMINDER: Joi.string()
      .description('Cron schedule for sending order not fulfilled reminder')
      .default('0 */6 * * *'),
    CRON_SCHEDULE_REVERT_MERCH_QUANTITY_FOR_UNFULFILLED_ORDERS: Joi.string()
      .description('Cron schedule for reverting merch quantity for unfulfilled orders')
      .default('0 0 * * *'),
    CRON_SCHEDULE_SEND_ORDER_PENDING_REMINDER: Joi.string()
      .description('Cron schedule for sending order pending reminder')
      .default('* * * * *'),
    CRON_SCHEDULE_SEND_USER_ORDER_TERMINATION_EMAIL: Joi.string()
      .description('Cron schedule for sending user order termination email')
      .default('0 * * * *'),
    ORDER_RESERVATION_TIMELINE: Joi.number().description('Order reservation timeline in minutes').default(48),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  baseApiUrl: `${envVars.ENFORCE_SSL ? 'https' : 'http'}://${envVars.API_DOMAIN}${
    envVars.USE_PORT ? `:${envVars.PORT}` : ''
  }`,
  frontendAppUrl: envVars.FRONT_END_APP_URL,
  storeSetupPageUrl: envVars.STORE_SETUP_PAGE_URL,
  resetPasswordPageUrl: envVars.RESET_PASSWORD_PAGE_URL,
  storeHomePageUrl: envVars.STORE_HOME_PAGE_URL,
  userSignupPageUrl: envVars.USER_SIGNUP_PAGE_URL,

  google: {
    clientId: envVars.GOOGLE_CLIENT_ID,
  },
  mongoose: {
    url: envVars.NODE_ENV === 'test' ? envVars.MONGODB_URL_TEST : envVars.MONGODB_URL,
    options: {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    emailVerificationExpirationMinutes: envVars.JWT_EMAIL_VERIFICATION_EXPIRATION_MINUTES,
    userInvitationExpirationMinutes: envVars.JWT_USER_INVITATION_EXPIRATION_MINUTES,
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
  },
  sentry: {
    enabled: envVars.ENABLE_SENTRY_LOGGING,
    dsn: envVars.SENTRY_DSN,
  },
  cloudinary: {
    cloudName: envVars.CLOUDINARY_CLOUD_NAME,
    apiKey: envVars.CLOUDINARY_API_KEY,
    apiSecret: envVars.CLOUDINARY_API_SECRET,
  },
  paymentData: {
    flutter_url: envVars.FLUTTER_API_URL,
    flutter_secret: envVars.FLUTTER_API_SECRET,
    flutter_redirect_url: envVars.FLUTTER_API_REDIRECT,
    paga_secret: envVars.PAGA_API_SECRET,
    paga_key: envVars.PAGA_API_KEY,
    paga_public_key: envVars.PAGA_API_PUBLIC_KEY,
  },
  backdoorAccess: {
    referralCode: envVars.REFERRAL_CODE,
  },
  cronSchedule: {
    sendOrderNotFulfilledReminder: envVars.CRON_SCHEDULE_SEND_ORDER_NOT_FULFILLED_REMINDER,
    revertMerchQuantityForUnfulfilledOrders: envVars.CRON_SCHEDULE_REVERT_MERCH_QUANTITY_FOR_UNFULFILLED_ORDERS,
    sendOrderPendingReminder: envVars.CRON_SCHEDULE_SEND_ORDER_PENDING_REMINDER,
    sendUserOrderTerminationEmail: envVars.CRON_SCHEDULE_SEND_USER_ORDER_TERMINATION_EMAIL,
  },
  orderReservationTimeline: envVars.ORDER_RESERVATION_TIMELINE,
};
