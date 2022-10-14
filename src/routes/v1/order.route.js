const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const orderValidation = require('../../validations/order.validation');
const orderController = require('../../controllers/order.controller');

const router = express.Router();

router.route('/').post(auth('user'), validate(orderValidation.createOrder), orderController.createOrder);
router.route('/get-order-by-code').get(validate(orderValidation.getOrderByCode), orderController.getOrderByCode);
router.route('/:orderId/successful').post(auth('user'), orderController.paymentSuccessful);
router.route('/:orderId/failed').post(auth('user'), orderController.paymentFailed);
router
  .route('/update-order-status/:orderId')
  .patch(auth('user'), validate(orderValidation.updateOrder), orderController.updateOrderStatus);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management and retrieval
 */

/**
 * @swagger
 * path:
 *  /orders:
 *    post:
 *      summary: Create a Order
 *      description: Only admins can create a Order.
 *      tags: [Orders]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - name
 *              properties:
 *                name:
 *                  type: string
 *                contactEmail:
 *                  type: string
 *                  format: email
 *                timezone:
 *                  type: string
 *              example:
 *                name: John Doe
 *                contactEmail: contact@example.com
 *                timezone: (GMT+01:00) Lagos
 *      responses:
 *        "201":
 *          description: Created
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Item'
 *        "400":
 *          $ref: '#/components/responses/DuplicateName'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * path:
 *  /Orders/{id}:
 *    get:
 *      summary: Get a Order
 *      description: Logged in users and admins can fetch only their own Order information.
 *      tags: [Orders]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Order id
 *        - in: query
 *          name: include
 *          schema:
 *            type: string
 *          description: Comma separated list of related objects
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Item'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 *
 */

/**
 * @swagger
 * path:
 *  /update-order-status/{id}:
 *    patch:
 *      summary: Update a Order
 *      description: Logged in admins can only update their own Order information.
 *      tags: [Orders]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Order id
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: string
 *              example:
 *                status: to pickup
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Item'
 *        "400":
 *          $ref: '#/components/responses/DuplicateName'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 */
