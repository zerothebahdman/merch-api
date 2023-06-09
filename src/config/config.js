const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    ENVIRONMENT: Joi.string().default('staging'),
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
    FLUTTER_PUBLIC_KEY: Joi.string().description('Flutter wave Public Key'),
    PAGA_API_SECRET: Joi.string().description('PAGA API Secret'),
    PAGA_API_KEY: Joi.string().description('PAGA API key'),
    PAGA_API_PUBLIC_KEY: Joi.string().description('PAGA API public key'),
    PAGA_API_URL: Joi.string()
      .description('PAGA BASE API Url')
      .default('https://www.mypaga.com/paga-webservices/business-rest/secured'),
    REFERRAL_CODE: Joi.string().description('Default referral code, restricted use'),
    CRON_SCHEDULE_PROCESS_ORDER: Joi.string().description('Cron schedule for processing order').default('0 * * * *'),
    CRON_INITIATE_RECURRING_PAYMENT: Joi.string()
      .description('Cron schedule for initiating recurring payment')
      .default('0 * * * *'),
    CRON_SEND_INVOICE_REMINDER: Joi.string().description('Cron schedule for sending invoice reminder').default('0 11 * * *'),
    ORDER_RESERVATION_TIMELINE: Joi.number().description('Order reservation timeline in minutes').default(48),
    STORE_PAYMENT_PROCESSING_FEE: Joi.number().description('Store payment processing fees').default(1.4),
    STORE_PAYMENT_CHARGE: Joi.number().description('Store payment charge').default(3),
    WITHDRAWAL_PROCESSING_COST: Joi.number().description('Store withdrawal processing cost').default(53.5),
    WITHDRAWAL_CHARGE: Joi.number().description('Store withdrawal charge').default(60),
    DEPOSIT_CHARGE: Joi.number().description('Store deposit charge').default(0.75),
    INVOICE_PROCESSING_COST: Joi.number().description('Store invoice processing cost').default(1.4),
    INVOICE_PROCESSING_CHARGE: Joi.number().description('Store invoice processing charge').default(3),
    AIRTIME_RECHARGE_CHARGE: Joi.number().description('Store airtime recharge charge').default(3),
    DSTV_PROCESSING_CHARGE: Joi.number().description('Store DSTV processing charge').default(1.5),
    GOTV_PROCESSING_CHARGE: Joi.number().description('Store DSTV charge').default(1.5),
    STARTIMES_PROCESSING_CHARGE: Joi.number().description('Store DSTV charge').default(2),
    AEDC_PROCESSING_CHARGE: Joi.number().description('AEDC charge').default(2),
    EKEDC_PROCESSING_CHARGE: Joi.number().description('EKEDC charge').default(1),
    IEDC_PROCESSING_CHARGE: Joi.number().description('IBEDC charge').default(0.35),
    KEDCO_PROCESSING_CHARGE: Joi.number().description('KEDCO charge').default(1.5),
    PHED_PROCESSING_CHARGE: Joi.number().description('PHED charge').default(1),
    IKEJA_ELECTRIC_PROCESSING_CHARGE: Joi.number().description('IKEJA ELECTRIC charge').default(1.5),
    JED_ELECTRIC_PROCESSING_CHARGE: Joi.number().description('JED ELECTRIC charge').default(1),
    KADUNA_ELECTRIC_PROCESSING_CHARGE: Joi.number().description('KADUNA ELECTRIC charge').default(0.4),
    MIX_PANEL_TOKEN: Joi.string().description('Mix panel token'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  environment: envVars.ENVIRONMENT,
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
    url: envVars.NODE_ENV === 'test' ? encodeURI(envVars.MONGODB_URL_TEST) : encodeURI(envVars.MONGODB_URL),
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
    flutter_public_key: envVars.FLUTTER_PUBLIC_KEY,
    flutter_redirect_url: envVars.FLUTTER_API_REDIRECT,
    paga_secret: envVars.PAGA_API_SECRET,
    paga_key: envVars.PAGA_API_KEY,
    paga_public_key: envVars.PAGA_API_PUBLIC_KEY,
    paga_url: envVars.PAGA_API_URL,
    withdrawalFee: envVars.WITHDRAWAL_FEE,
  },
  backdoorAccess: {
    referralCode: envVars.REFERRAL_CODE,
  },
  cronSchedule: {
    processOrder: envVars.CRON_SCHEDULE_PROCESS_ORDER,
    initiateRecurringPayment: envVars.CRON_INITIATE_RECURRING_PAYMENT,
    sendInvoiceReminder: envVars.CRON_SEND_INVOICE_REMINDER,
  },
  orderReservationTimeline: envVars.ORDER_RESERVATION_TIMELINE,
  paymentProcessing: {
    storePaymentProcessingFee: envVars.STORE_PAYMENT_PROCESSING_FEE,
    storePaymentCharge: envVars.STORE_PAYMENT_CHARGE,
    withdrawalProcessingCost: envVars.WITHDRAWAL_PROCESSING_COST,
    withdrawalCharge: envVars.WITHDRAWAL_CHARGE,
    depositCharge: envVars.DEPOSIT_CHARGE,
    invoiceProcessingCost: envVars.INVOICE_PROCESSING_COST,
    invoiceProcessingCharge: envVars.INVOICE_PROCESSING_CHARGE,
    airtimeRechargeCharge: envVars.AIRTIME_RECHARGE_CHARGE,
    dstvProcessingCharge: envVars.DSTV_PROCESSING_CHARGE,
    gotvProcessingCharge: envVars.GOTV_PROCESSING_CHARGE,
    startimesProcessingCharge: envVars.STARTIMES_PROCESSING_CHARGE,
    aedcProcessingCharge: envVars.AEDC_PROCESSING_CHARGE,
    iedcProcessingCharge: envVars.IEDC_PROCESSING_CHARGE,
    kedcoProcessingCharge: envVars.KEDCO_PROCESSING_CHARGE,
    phedProcessingCharge: envVars.PHED_PROCESSING_CHARGE,
    ikejaElectricProcessingCharge: envVars.IKEJA_ELECTRIC_PROCESSING_CHARGE,
    jedElectricProcessingCharge: envVars.JED_ELECTRIC_PROCESSING_CHARGE,
    kadunaElectricProcessingCharge: envVars.KADUNA_ELECTRIC_PROCESSING_CHARGE,
    ekedcProcessingCharge: envVars.EKEDC_PROCESSING_CHARGE,
  },
  mixPanelToken: envVars.MIX_PANEL_TOKEN,
};
