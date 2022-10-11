const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { merchValidation } = require('../../validations');
const { merchController } = require('../../controllers');

const router = express.Router();

router
  .route('/')
  .post(auth('creator'), validate(merchValidation.createMerch), merchController.createMerch)
  .get(validate(merchValidation.getMerches), merchController.getMerches);

router
  .route('/:merchId')
  .get(validate(merchValidation.getMerch), merchController.getMerch)
  .patch(auth('creator'), validate(merchValidation.updateMerch), merchController.updateMerch)
  .delete(auth('creator'), validate(merchValidation.deleteMerch), merchController.deleteMerch);

// eslint-disable-next-line jest/no-export
module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Merches
 *   description: Merch management
 */

/**
 * @swagger
 * path:
 *  /merches:
 *    post:
 *      summary: Create a Merch
 *      description: Only creators can create a Merch.
 *      tags: [Merches]
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
 *                creatorPage: 614d0ff5c5d8b07020a899d1
 *                images: [url1, url2, url3]
 *                avatar: image.jpg
 *                preOrder: {enabled: true, maxNumOfPreOrders: 10, productionDuration: 14}
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
 *  /merches:
 *    get:
 *      summary: Get all available Items
 *      description: website users can fetch all available Items.
 *      tags: [Merches]
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
 *                 $ref: '#/components/schemas/merches'
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
 *  /merches/{id}:
 *    get:
 *      summary: Get an Item by ID
 *      description: Available for all users
 *      tags: [Merches]
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
 *      tags: [Merches]
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
 *                preOrder: {enabled: true, maxNumOfPreOrders: 10, productionDuration: 14}
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
 *      tags: [Merches]
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
