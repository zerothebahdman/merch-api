const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { storeValidation } = require('../../validations');
const { storeController } = require('../../controllers');

const router = express.Router();

router
  .route('/')
  .post(auth('creator'), validate(storeValidation.createStore), storeController.createStore)
  .get(validate(storeValidation.getStore), storeController.getStores);

router.route('/slug/:slug').get(validate(storeValidation.getStore), storeController.getStoreBySlug);

router
  .route('/:storeId')
  .get(validate(storeValidation.getStore), storeController.getStore)
  .patch(auth('creator'), validate(storeValidation.updateStore), storeController.updateStore)
  .delete(auth('creator'), validate(storeValidation.deleteStore), storeController.deleteStore);

router.get('/:storeId/items', validate(storeValidation.getStore), storeController.getStoreItems);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Stores
 *   description: Store management
 */

/**
 * @swagger
 * path:
 *  /stores:
 *    post:
 *      summary: Create Store
 *      description: Only creators can create a store.
 *      tags: [Stores]
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
 *                name: Merchro Store
 *                avatar: merchrostoreavatar.png
 *                coverImage: merchrostorecover.png
 *                description: Merchro Store description
 *      responses:
 *        "201":
 *          description: Created
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Store'
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
 *  /stores:
 *    get:
 *      summary: Get all available Stores
 *      description: website users can fetch all available stores.
 *      tags: [Stores]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              example:
 *                name: Merchro Store
 *      responses:
 *        "201":
 *          description: Created
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Stores'
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
 *  /stores/{id}:
 *    get:
 *      summary: Get a Store by ID
 *      description: Available for all users
 *      tags: [Stores]
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Store id
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
 *                 $ref: '#/components/schemas/Store'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 *
 *    patch:
 *      summary: Update a Store
 *      description:  Only creators can update their store information
 *      tags: [Stores]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Store id
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                name:
 *                  type: string
 *                contactEmail:
 *                  type: string
 *                  format: email
 *                timezone:
 *                  type: string
 *              example:
 *                name: fake name
 *                timezone: (GMT+01:00) Lagos
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Store'
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
 *      summary: Delete a Store
 *      description:  Only creators can delete their store
 *      tags: [Stores]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Store id
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

/**
 * @swagger
 * path:
 *  /stores/{id}/items:
 *    get:
 *      summary: Get all items in store.
 *      tags: [Stores]
 *      description: Get all the items that are available in the store
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Store id
 *        - in: query
 *          name: published
 *          schema:
 *            type: boolean
 *          description: Optional. [true || false] false returns drafts, true returns published or active items. Leaving out this field returns all items
 *        - in: query
 *          type: include
 *          schema:
 *            type: string
 *          description: Comma separated list of foreign fields to be populated
 *        - in: query
 *          type: include
 *          schema:
 *            type: string
 *          description: Comma separated list of foreign fields to be populated
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Items'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * path:
 *  /stores/slug/{slug}:
 *    get:
 *      summary: Get a Store by the slug of it's name.
 *      tags: [Stores]
 *      description: Apart from getting store information by it's slug, this is also designed to cater for verifying if name of store already exists
 *      parameters:
 *        - in: path
 *          name: slug
 *          required: true
 *          schema:
 *            type: string
 *          description: Store id
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
 *                 $ref: '#/components/schemas/Store'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * path:
 *  /stores/complete-setup:
 *    post:
 *      summary: Complete the Store setup
 *      description: Logged in creators completes the setup of their Store.
 *      tags: [Stores]
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        "204":
 *          description: No Content
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 */
