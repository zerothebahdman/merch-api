const cron = require('node-cron');
const { User, Account } = require('./models');
const { addNotification } = require('./utils/notification');
const { Paga } = require('./utils/paga');

const PeriodicEmails = async () => {
  const addAccountInfo = cron.schedule(
    '0 0 * * *',
    async () => {
      const filter = { deletedBy: null };
      let accountHolders = await Account.find().select('-_id user');
      accountHolders = accountHolders.map((x) => {
        return x.user;
      });
      filter.creatorPage = { $ne: null };
      filter._id = { $nin: accountHolders };
      const creators = await User.find(filter);
      if (creators.length > 0) {
        creators.map(async (creator) => {
          const data = {
            firstName: creator.firstName,
            lastName: creator.lastName,
            email: creator.email,
            phoneNumber: `${creator.countryCode || '+234'}${creator.phoneNumber || ''}`,
          };
          data.accountName = `${data.firstName} ${data.lastName}`;
          const accountInfo = await Paga.generatePermanentAccount(data);
          if (!accountInfo.error) {
            await creator.updateOne(
              { _id: creator.id },
              {
                accountInfo: {
                  accountNumber: accountInfo.response.accountNumber,
                  referenceNumber: accountInfo.response.referenceNumber,
                  accountReference: accountInfo.response.accountReference,
                  accountName: data.accountName,
                  bankName: 'Paga',
                },
              }
            );
            addNotification('A dedicated bank account was activated for you.', creator.id);
            addNotification(
              'You can now fund your Merchro wallet, receive money and send money through your personal bank account',
              creator.id
            );
          } else {
            addNotification(
              `Could not generate a dedicated bank account for you due to ${accountInfo.response.statusMessage}. Update your profile and your dedicated bank account will be generated within 24hours`,
              creator.id
            );
          }
        });
      }
    },
    { timezone: 'Africa/Lagos' }
  );
  addAccountInfo.start();

  const updateBanks = cron.schedule(
    '0 12 * * 2',
    async () => {
      Paga.getBanks();
    },
    { timezone: 'Africa/Lagos' }
  );
  updateBanks.start();
};

module.exports = PeriodicEmails;
