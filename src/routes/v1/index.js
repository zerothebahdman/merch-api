const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const creatorPageRoute = require('./creatorPage.route');
const categoryRoute = require('./category.route');
const fileRoute = require('./file.route');
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
    path: '/creator-page',
    route: creatorPageRoute,
  },
  {
    path: '/categories',
    route: categoryRoute,
  },
  {
    path: '/file-upload',
    route: fileRoute,
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
