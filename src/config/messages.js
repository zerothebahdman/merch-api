const ERROR_MESSAGES = {
  PASSWORD_RESET_FAILED: 'Password reset failed',
  EMAIL_VERIFICATION_FAILED: 'Email verification failed',
  USER_INVITATION_VERIFICATION_FAILED: 'User invitation verification failed',
  USER_SIGNUP_VERIFICATION_FAILED: 'User signup verification failed',
  USER_EMAIL_EXIST: 'User with email already exist',
  USER_ONBOARDING_EXIST: 'User onboarding already exist',
  USER_NOT_FOUND: 'User not found',
  USER_CANNOT_CREATE_STORE: 'User is not a creator. Only creators can create store',
  USER_CANNOT_CREATE_ITEM: 'User is not a creator. Only creators can add items to store',
  USER_EMAIL_VERIFIED: 'User email is already verified',
  USER_EMAIL_NOT_VERIFIED: 'User email is not verified',
  USER_DEACTIVATED: 'User is deactivated. Please contact your administrator',
  INCORRECT_USERNAME_AND_PASSWORD: 'Incorrect email or password',
  WRONG_PASSWORD: 'Your current password is incorrect',
  FORBIDDEN: 'You are forbidden to perform this action',
  NOT_ALLOWED_TO_UPDATE_FIELDS: 'You are not allowed to update some of the fields here. Remove email',
  PAGE_NOT_FOUND: 'Creator page not found',
  PAGE_NAME_EXIST: 'Creator page with name already exist',
  PAGE_CREATED_ALREADY: 'You have already created your landing page',
  CATEGORY_NOT_FOUND: 'Category not found',
  INVALID_NAME: 'Name should start with alphabets and should not contain special characters',
  TOKEN_NOT_FOUND: 'Token not found',
  JWT_INVALID_TOKEN_TYPE: 'Invalid token type',
  USER_NOT_LOGGED_IN: 'You are not logged in. Please authenticate',
  CONTACT_ADMINISTRATOR: 'Please contact your administrator',
  INVALID_EMAIL: 'Invalid email',
  INVALID_PHONE_NUMBER: 'Invalid phone number',
  INVALID_PASSWORD:
    'Password not strong enough. Must be at least 8 characters, a mixture of letters (uppercase and lowercase), numbers and one special character',
  ONBOARDING_NOT_FOUND: 'Onboarding not found',
  EMAIL_LIST_EMPTY: 'You need to enter at least one email',
  EMAIL_NOT_MATCHING_USER: 'You have entered an email that does not match the active user',
  ORDER_NOT_FOUND: 'Order not found',
  SHIPPING_NOT_FOUND: 'Shipping info not found',
};

const SUCCESS_MESSAGES = {
  PAGE_CREATED: 'You have succesfully created your landing page',
  CREATOR_ACCOUNT_CREATED: 'Welcome on board, you can go ahead and create your landing page',
};

module.exports = {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};
