/* eslint-disable no-param-reassign */
const MixPanel = require('mixpanel');
const os = require('os');
const config = require('../config/config');
const { mixPanelToken } = require('../config/config');

const mixPanel = async (event, data) => {
  if (config.environment === 'production') {
    if (data._id) data = data.toJSON();
    data.distinct_id = data.creator || data.user || data.owner || data.id;
    data.$os = os.hostname();
    data.$device = os.machine();
    const mixpanel = MixPanel.init(mixPanelToken);
    data.event = event;
    mixpanel.track(event, data);
  }
};

module.exports = mixPanel;
