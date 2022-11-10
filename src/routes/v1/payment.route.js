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
router.route('/dump-check').get(async (req, res) => {
  const results = await Account.find({ user: '6309e3ec8bf5f07978371548' });
  res.send(results);
});
router.route('/terminate-account').delete(auth('creator'), async (req, res) => {
  const results = await Account.deleteOne({ user: req.user.id });
  res.send(results);
});
router.route('/withdraw').post(auth('creator'), validate(paymentValidation.withdrawal), paymentController.withdrawMoney);
router.route('/mobile-operators').get(auth('creator'), paymentController.getMobileOperators);
router.route('/buy-data').post(auth('creator'), validate(paymentValidation.buyData), paymentController.buyData);
router.route('/buy-airtime').post(auth('creator'), validate(paymentValidation.buyAirtime), paymentController.buyAirtime);
router
  .route('/utilities')
  .post(auth('creator'), validate(paymentValidation.purchaseUtilities), paymentController.purchaseUtilities)
  .get(auth('creator'), paymentController.getUtilitiesProviders);
router.route('/get-startimes-utilities').get(auth('creator'), paymentController.getStartimesUtilities);
router
  .route('/transactions')
  .get(auth('creator'), validate(paymentValidation.getTransactions), paymentController.getTransactions);
router
  .route('/validate-account')
  .post(auth('creator'), validate(paymentValidation.validateAccount), paymentController.validateAccount);
router.route('/funding/:reference').get(paymentController.creditAccount);
router.route('/funding/:reference').post(paymentController.creditAccount);
router
  .route('/validate-payment-callback')
  .post(validate(paymentValidation.validatePaymentCallback), paymentController.validatePaymentCallback);

router.route('/transaction-overview').get(auth('creator'), paymentController.getTransactionOverview);

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

/**
 * @swagger
 * path:
 *  /utilities:
 *    post:
 *      summary: Pay for utilities
 *      description: Creators can be able to pay for utilities from their dashboard
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
 *                - merchant
 *                - amount
 *                - merchantNumber
 *                - merchantServiceProductCode
 *                - utilityType
 *              example:
 *                merchant: 13B5041B-7143-46B1-9A88-F355AD7EA1EC
 *                amount: 1000
 *                merchantNumber: '45030319920'
 *                merchantServiceProductCode: 'MY003'
 *                utilityType: 'DStv'
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/PurchaseUtilities'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *    get:
 *      summary: Get all utility providers for the application
 *      description: Website users can fetch all the utility providers the application provides
 *      tags: [Payments]
 *      parameters:
 *        - in: query
 *          name: referenceNumber
 *          schema:
 *            type: string
 *          description: Reference number for the utility, this is the smart card number of the user.
 *      responses:
 *        "200":
 *          description: Success
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/UtilityProvider'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * path:
 *  /get-startimes-utilities:
 *    get:
 *      summary: Startimes utilities
 *      description: Get all startimes utilities
 *      tags: [Payments]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: query
 *          name: referenceNumber
 *          schema:
 *            type: string
 *          description: Reference number for the utility, this is the smart card number of the user.
 *        - in: query
 *          name: uuid
 *          schema:
 *            type: string
 *          description: Startimes merchant unique id.
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/StartimesServices'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * path:
 *  /transaction-overview:
 *    get:
 *      summary: Get the overview of transactions
 *      description: Get the overview of the creators transaction.
 *      tags: [Payments]
 *      parameters:
 *        - in: query
 *          name: period
 *          schema:
 *            type: string
 *          description: Period will be a set of either ''today ,'week', 'month' or 'year' to get the overview of the transactions for that period.
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/TransactionOverview'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * path:
 *  /mobile-operators:
 *    get:
 *      summary: Get mobile operators
 *      description: Get the list of mobile operators that will be used for data purchase
 *      tags: [Payments]
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/MobileOperatorProvider'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * path:
 *  /buy-data:
 *    post:
 *      summary: Purchase Data
 *      description: Creators can be able to purchase data from their dashboard
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
 *                - destinationPhoneNumber
 *                - isDataBundle
 *                - mobileOperatorServiceId
 *              example:
 *                amount: 1000,
 *                destinationPhoneNumber: 08157582132,
 *                isDataBundle: true,
 *                mobileOperatorServiceId: 126,
 *      responses:
 *        "201":
 *          description: Created
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Data'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 */
