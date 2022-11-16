/* eslint-disable no-param-reassign */
const MixPanel = require('mixpanel');
const { mixPanelToken } = require('../config/config');

const mixPanel = async (event, data) => {
  if (data._id) data = data.toJSON();
  const mixpanel = MixPanel.init(mixPanelToken);
  data.event = event;
  mixpanel.track(event, data);
};

module.exports = mixPanel;
