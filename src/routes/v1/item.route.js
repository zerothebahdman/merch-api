const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { itemValidation } = require('../../validations');
const { itemController } = require('../../controllers');

const router = express.Router();

router
  .route('/')
  .post(auth('creator'), validate(itemValidation.createItem), itemController.createItem)
  .get(validate(itemValidation.getItem), itemController.getItems);

router
  .route('/:ItemId')
  .get(validate(itemValidation.getItem), itemController.getItem)
  .patch(auth('creator'), validate(itemValidation.updateItem), itemController.updateItem)
  .delete(auth('creator'), validate(itemValidation.deleteItem), itemController.deleteItem);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Items
 *   description: Item management
 */

/**
 * @swagger
 * path:
 *  /items:
 *    post:
 *      summary: Create an Item
 *      description: Only creators can create a Item.
 *      tags: [Items]
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
 *              example:
 *                name: T-shirt
 *                quantity: 10
 *                amount: {price: 5000, currency: NGN}
 *                store: 614d0ff5c5d8b07020a899d1
 *                images: [url1, url2, url3]
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
 *  /items:
 *    get:
 *      summary: Get all available Items
 *      description: website users can fetch all available Items.
 *      tags: [Items]
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
 *                 $ref: '#/components/schemas/Items'
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
 *  /items/{id}:
 *    get:
 *      summary: Get an Item by ID
 *      description: Available for all users
 *      tags: [Items]
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Item id
 *        - in: query
 *          name: include
 *          schema:
 *            type: string
 *          description: Comma separated list of foreign fields to be populated
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
 *    patch:
 *      summary: Update an Item
 *      description:  Only creators can update their Item information
 *      tags: [Items]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Item id
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              example:
 *                name: T-shirt
 *                quantity: 10
 *                amount: {price: 5000, currency: NGN}
 *                store: 614d0ff5c5d8b07020a899d1
 *                images: [url1, url2, url3]
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
 *
 *    delete:
 *      summary: Delete an Item
 *      description:  Only creators can delete an Item
 *      tags: [Items]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Item id
 *      responses:
 *        "200":
 *          description: OK
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 */
