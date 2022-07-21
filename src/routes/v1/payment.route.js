const express = require('express');
const { paymentController } = require('../../controllers');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { paymentValidation } = require('../../validations');

const router = express.Router();

router.route('/account-info').get(auth('user'), paymentController.getAccountInfo);
router.route('/bank-list').get(auth('user'), paymentController.getBanks);
router.route('/withdraw').post(auth('user'), validate(paymentValidation.withdrawal), paymentController.withdrawMoney);
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
