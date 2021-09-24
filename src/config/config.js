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
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  baseApiUrl: `${envVars.ENFORCE_SSL ? 'https' : 'http'}://${envVars.API_DOMAIN}:${envVars.USE_PORT ? envVars.PORT : ''}`,
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
};
