const express = require('express');
const { ROLES } = require('../../config/roles');
const auth = require('../../middlewares/auth');
const { fetchNotifications } = require('../../utils/notification');
const pick = require('../../utils/pick');

const router = express.Router();

router.route('/').get(auth('user'), async (req, res) => {
  const filter = { target: { $in: [req.user.id, 'everyone'] } };
  if (req.user.role === ROLES.ADMIN) filter.target.$in.push('admin');
  if (req.user.creatorPage) filter.target.$in.push('creators');
  else filter.target.$in.push('users');
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const notifications = await fetchNotifications(filter, options, req.query.paginate ? req.query.paginate : true);
  res.send(notifications);
});

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Users notifications
 */

/**
 * @swagger
 * path:
 *  /notifications:
 *    get:
 *      summary: Get all available Categories
 *      description: website users can fetch all available Categories.
 *      tags: [Notifications]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *      responses:
 *        "201":
 *          description: Created
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Notifications'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 */
