const express = require('express');
const { paymentController } = require('../../controllers');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { TransactionDump, Account } = require('../../models');
const { paymentValidation } = require('../../validations');

const router = express.Router();

router.route('/account-info').get(auth('creator'), paymentController.getAccountInfo);
router.route('/bank-list').get(auth('creator'), paymentController.getBanks);
router.route('/dump').get(auth('creator'), async (req, res) => {
  const results = await TransactionDump.find();
  res.send(results);
});
router.route('/terminate-account').delete(auth('creator'), async (req, res) => {
  const results = await Account.deleteMany({ user: req.user.id });
  res.send(results);
});
router.route('/withdraw').post(auth('creator'), validate(paymentValidation.withdrawal), paymentController.withdrawMoney);
router
  .route('/transactions')
  .get(auth('creator'), validate(paymentValidation.getTransactions), paymentController.getTransactions);
router
  .route('/validate-account')
  .post(auth('creator'), validate(paymentValidation.validateAccount), paymentController.validateAccount);
router.route('/funding/:reference').get(paymentController.creditAccount);
router.route('/funding/:reference').post(paymentController.creditAccount);

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
