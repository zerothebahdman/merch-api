/* eslint-disable no-param-reassign */
const MixPanel = require('mixpanel');
const { mixPanelToken, environment } = require('../config/config');

const mixPanel = async (event, data) => {
  if (environment === 'production') {
    if (data._id) data = data.toJSON();
    data.distinct_id = data.creator || data.user || data.owner || data.id;
    const mixpanel = MixPanel.init(mixPanelToken);
    data.event = event;
    mixpanel.track(event, data);
  }
};

module.exports = mixPanel;
