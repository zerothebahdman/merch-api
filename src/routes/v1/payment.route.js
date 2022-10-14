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
  const results = await TransactionDump.find({ user: req.user.id });
  res.send(results);
});
router.route('/terminate-account').delete(auth('creator'), async (req, res) => {
  const results = await Account.deleteOne({ user: req.user.id });
  res.send(results);
});
router.route('/withdraw').post(auth('creator'), validate(paymentValidation.withdrawal), paymentController.withdrawMoney);
router.route('/buy-airtime').post(auth('creator'), validate(paymentValidation.buyAirtime), paymentController.buyAirtime);
router
  .route('/transactions')
  .get(auth('creator'), validate(paymentValidation.getTransactions), paymentController.getTransactions);
router
  .route('/validate-account')
  .post(auth('creator'), validate(paymentValidation.validateAccount), paymentController.validateAccount);
router.route('/funding/:reference').get(paymentController.creditAccount);
router.route('/funding/:reference').post(paymentController.creditAccount);
router.route('/validate-payment-callback').post(paymentController.validatePaymentCallback);

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

/**
 * @swagger
 * path:
 *  /validate-payment-callback:
 *    post:
 *      summary: Validate payment for an order
 *      description: After a user has made payments, he will be redirected to a url that contain's information's about the payment status, pass in those information to this endpoint to validate the payment.
 *      tags: [Payments]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - transactionId
 *                - status
 *                - txRef
 *              example:
 *                transactionId: 8157582101
 *                txRef: 157582101
 *                status: 'successful'
 *      responses:
 *        "200":
 *          description: Success
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Item'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * path:
 *  /buy-airtime:
 *    post:
 *      summary: Purchase airtime
 *      description: Creators can be able to purchase airtime from their dashboard
 *      tags: [Payments]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - amount
 *                - phoneNumber
 *              example:
 *                amount: 1000
 *                phoneNumber: '+2348157582101'
 *      responses:
 *        "201":
 *          description: Created
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Airtime'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 */
