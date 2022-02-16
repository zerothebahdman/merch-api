const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const storeRoute = require('./store.route');
const itemRoute = require('./item.route');
const merchRoute = require('./merch.route');
const orderRoute = require('./order.route');
const waitlistRoute = require('./waitlist.route');
const docsRoute = require('./docs.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/stores',
    route: storeRoute,
  },
  {
    path: '/items',
    route: itemRoute,
  },
  {
    path: '/merches',
    route: merchRoute,
  },
  {
    path: '/orders',
    route: orderRoute,
  },
  {
    path: '/waitlist',
    route: waitlistRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development' || config.env === 'production') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
