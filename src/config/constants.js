const USER_STATUSES = {
  CONFIRMED: 'confirmed',
  INVITED: 'invited',
  DEACTIVATED: 'deactivated',
  COMPROMISED: 'compromised',
};

const UserStatusMapping = new Map([
  [USER_STATUSES.CONFIRMED, 'Confirmed'],
  [USER_STATUSES.INVITED, 'Invited'],
  [USER_STATUSES.COMPROMISED, 'Compromised'],
  [USER_STATUSES.DEACTIVATED, 'Deactivated'],
]);

const ACCOUNT_MEMBERSHIP_STATUSES = {
  USER: 'user',
  CREATOR: 'creator',
  ADMIN: 'admin',
};

const AccountMembershipStatusMapping = new Map([
  [ACCOUNT_MEMBERSHIP_STATUSES.User, 'User'],
  [ACCOUNT_MEMBERSHIP_STATUSES.Creator, 'Creator'],
  [ACCOUNT_MEMBERSHIP_STATUSES.ADMIN, 'Admin'],
]);

const CURRENCIES = {
  DOLLARS: 'USD',
  NAIRA: 'NGN',
  POUNDS: 'GBP',
  EURO: 'EUR',
};

const CurrencySymbolMapping = new Map([
  [CURRENCIES.DOLLARS, '$'],
  [CURRENCIES.NAIRA, '₦'],
  [CURRENCIES.POUNDS, '£'],
  [CURRENCIES.EURO, '€'],
]);

const ORDER_STATUSES = {
  UNPAID: 'unpaid',
  PENDING: 'pending',
  ENROUTE: 'enroute',
  PICKUP: 'to pickup',
  COMPLETED: 'fulfilled',
  PROCESSING: 'processing',
  PREORDER: 'preorder',
  UNFULFILLED: 'unfufilled',
  FAILED: 'failed',
};

const SHIPPING_STATUSES = {
  PENDING: 'pending',
  IN_TRANSIT: 'in_transit',
  COMPLETED: 'completed',
  COMPROMISED: 'compromised',
};

const ONBOARDING_STAGES = {
  SIGNED_UP: 'userSignedUp',
  CREATOR_SIGNED_UP: 'userSignedUpAsCreator',
  EMAIL_VERIFIED: 'userEmailVerified',
  CART: 'userAddedItemToCart',
  PURCHASE: 'userMadePurchase',
  CREATED_STORE: 'userCreatedStore',
  CREATED_ITEM: 'userCreatedItem',
  USER_PUBLISHED_STORE: 'userPublishedStore',
  COMPLETED_SETUP: 'userCompletedSetup',
};

const TRANSACTION_TYPES = {
  CREDIT: 'credit',
  DEBIT: 'debit',
  LOAN: 'loan',
  REFUND: 'refund',
  STASH: 'stash',
};

const TRANSACTION_SOURCES = {
  BANK_TRANSFER: 'bank_transfer',
  USER_TRANSFER: 'user_transfer',
  CARD_DEPOSIT: 'card_deposit',
  STORE: 'store',
  INVOICE: 'invoice',
  PAYMENT_LINK: 'payment_link',
  SAVINGS: 'savings',
  STASH: 'stash',
  REVERSAL: 'reversal',
};

const MERCH_PRODUCTION_DURATION = {
  ONE_WEEK: '7',
  TWO_WEEKS: '14',
  THREE_WEEKS: '21',
  ONE_MONTH: '28',
  TWO_MONTHS: '56',
};

const INVOICE_STATUSES = {
  FULLY_PAID: 'fully_paid',
  UNPAID: 'unpaid',
  PARTIALLY_PAID: 'partially_paid',
};

const PAYMENT_LINK_TYPES = {
  ONE_TIME: 'one_time',
  SUBSCRIPTION: 'subscription',
  EVENT: 'event',
};

const RECURRING_PAYMENT = {
  ONE_TIME: 'one_time',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
  BI_WEEKLY: 'bi_weekly',
  BI_MONTHLY: 'bi_monthly',
  QUARTERLY: 'quarterly',
  BI_ANNUALLY: 'bi_annually',
};

const EVENTS = {
  SIGNED_UP: 'Creator signed up',
  LOGIN: 'Creator logged in',
  CREATOR_SETUP_PAGE: 'Creator setup page',
  CREATOR_SETUP_STORE: 'Creator setup store',
  CREATOR_UPDATE_PAGE: 'Creator updated page',
  ADD_PRODUCT: 'Creator adds a product to the store',
  DEPOSIT: 'Creator deposits money',
  WITHDRAW: 'Creator withdraws money',
  CREATE_INVOICE: 'Creator creates an invoice',
  CREATE_PAYMENT_LINK: 'Creator creates a payment link',
  SALE_FROM_STORE: 'Creator makes a sale from the store',
  PAID_FROM_PAYMENT_LINK: 'Creator got paid via payment link',
  PAID_FROM_INVOICE: 'Creator got paid via invoice',
};

module.exports = {
  USER_STATUSES,
  UserStatusMapping,
  ACCOUNT_MEMBERSHIP_STATUSES,
  AccountMembershipStatusMapping,
  ORDER_STATUSES,
  SHIPPING_STATUSES,
  ONBOARDING_STAGES,
  CURRENCIES,
  TRANSACTION_TYPES,
  TRANSACTION_SOURCES,
  CurrencySymbolMapping,
  MERCH_PRODUCTION_DURATION,
  INVOICE_STATUSES,
  PAYMENT_LINK_TYPES,
  RECURRING_PAYMENT,
  EVENTS,
};
