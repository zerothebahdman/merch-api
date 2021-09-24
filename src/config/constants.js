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
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  IN_COMPLETED: 'in_completed',
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

module.exports = {
  USER_STATUSES,
  UserStatusMapping,
  ACCOUNT_MEMBERSHIP_STATUSES,
  AccountMembershipStatusMapping,
  ORDER_STATUSES,
  SHIPPING_STATUSES,
  ONBOARDING_STAGES,
  CURRENCIES,
  CurrencySymbolMapping,
};
