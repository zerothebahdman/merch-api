const mongoose = require('mongoose');
const { ONBOARDING_STAGES } = require('../config/constants');

const onboardingSchema = mongoose.Schema({
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: true,
  },
  stages: [
    {
      type: String,
      enum: Object.values(ONBOARDING_STAGES),
    },
  ],
});

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
onboardingSchema.statics.isUserTaken = async function (user, excludeOnboardingId) {
  const onboarding = await this.findOne({ user, _id: { $ne: excludeOnboardingId } });
  return !!onboarding;
};

const Onboarding = mongoose.model('Onboarding', onboardingSchema);

module.exports = Onboarding;
