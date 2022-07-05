const express = require('express');
const { paymentController } = require('../../controllers');
const auth = require('../../middlewares/auth');
const { Paga } = require('../../utils/paga');

const router = express.Router();

router.route('/account-info').get(auth('user'), paymentController.getAccountInfo);
router.route('/bank-list').get(auth('user'), paymentController.getBanks);
router.route('/withdraw').get(auth('user'), async (req, res) => {
  const resp = await Paga.withdraw();
  res.send(resp);
});
router.route('/funding/:reference').get(paymentController.creditAccount);

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
 *  /account-info:
 *    get:
 *      summary: Get all available Categories
 *      description: website users can fetch all available Categories.
 *      tags: [Payments]
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
