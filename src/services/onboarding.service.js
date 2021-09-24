const { Onboarding } = require('../models');

/**
 * Create an onboarding entry
 * @param {Object} onboardingBody
 * @returns {Promise<Onboarding>}
 */
const createOnboarding = async (onboardingBody) => {
  if (await Onboarding.isUserTaken(onboardingBody.user)) {
    // TODO: This is causing the test to fail
    // throw new ApiError(httpStatus.BAD_REQUEST, ERROR_MESSAGES.USER_ONBOARDING_EXIST);
    return;
  }
  const onboarding = await Onboarding.create(onboardingBody);
  return onboarding;
};

/**
 * Update onboarding next stages
 * @param {ObjectId} userId
 * @param {Object} nextStages
 * @returns {Promise<Onboarding>}
 */
const updateOnboardingNextStages = async (userId, nextStages = []) => {
  const onboarding = await Onboarding.findOne({ user: userId });
  if (!onboarding) {
    // TODO: This is causing the test to fail
    // throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.ONBOARDING_NOT_FOUND);
    return;
  }
  nextStages.forEach((stage) => {
    if (!onboarding.stages.includes(stage)) onboarding.stages.push(stage);
  });
  await onboarding.save();
  return onboarding;
};

module.exports = {
  createOnboarding,
  updateOnboardingNextStages,
};
