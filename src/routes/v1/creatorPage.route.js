const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { creatorPageValidation } = require('../../validations');
const { creatorPageController } = require('../../controllers');

const router = express.Router();

router
  .route('/')
  .post(auth('creator'), validate(creatorPageValidation.createCreatorPage), creatorPageController.createCreatorPage)
  .get(validate(creatorPageValidation.getCreatorPage), creatorPageController.getCreatorPages);

router.route('/slug/:slug').get(validate(creatorPageValidation.getCreatorPage), creatorPageController.getCreatorPageBySlug);

router
  .route('/:creatorPageId')
  .get(validate(creatorPageValidation.getCreatorPage), creatorPageController.getCreatorPage)
  .patch(auth('creator'), validate(creatorPageValidation.updateCreatorPage), creatorPageController.updateCreatorPage)
  .delete(auth('creator'), validate(creatorPageValidation.deleteCreatorPage), creatorPageController.deleteCreatorPage);

router.get(
  '/:creatorPageId/merches',
  validate(creatorPageValidation.getCreatorPage),
  creatorPageController.getCreatorPageMerches
);

router
  .route('/:creatorPageId/orders')
  .get(auth('creator'), validate(creatorPageValidation.getOrders), creatorPageController.getCreatorPageOrders);

router
  .route('/:creatorPageId/items')
  .post(auth('creator'), validate(creatorPageValidation.addItem), creatorPageController.addItem)
  .get(validate(creatorPageValidation.getItems), creatorPageController.getItems);

router
  .route('/:creatorPageId/items/:itemId')
  .patch(auth('creator'), validate(creatorPageValidation.updateItem), creatorPageController.updateItem)
  .delete(validate(creatorPageValidation.deleteItem), creatorPageController.deleteItem);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: creatorPages
 *   description: creatorPage management
 */

/**
 * @swagger
 * path:
 *  /creator-page:
 *    post:
 *      summary: Create creator page
 *      description: Only creators can create a creator page.
 *      tags: [Creator Page]
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
 *                name: Merchro creator page
 *                avatar: merchro-creator-avatar.png
 *                coverImage: merchro-creator-pagecover.png
 *                description: Merchro creator page description
 *      responses:
 *        "201":
 *          description: Created
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/creatorPage'
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
 *  /creator-page:
 *    get:
 *      summary: Get all available creator pages
 *      description: website users can fetch all available creator pages.
 *      tags: [Creator Page]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              example:
 *                name: Merchro creator page
 *      responses:
 *        "201":
 *          description: Created
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/creatorPage'
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
 *  /creator-page/{id}:
 *    get:
 *      summary: Get a creator page by ID
 *      description: Available for all users
 *      tags: [Creator Page]
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: creator page id
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
 *                 $ref: '#/components/schemas/creatorPage'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 *
 *    patch:
 *      summary: Update a creator page
 *      description:  Only creators can update their creator page information
 *      tags: [Creator Page]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: creator page id
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
 *                 $ref: '#/components/schemas/creatorPage'
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
 *      summary: Delete a creator page
 *      description:  Only creators can delete their page
 *      tags: [Creator Page]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: creator page id
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
 *  /creator-page/{id}/items:
 *    get:
 *      summary: Get all items (links...) in creator page.
 *      tags: [Creator Page]
 *      description: Get all the merches that are available in the creator store
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: creator page id
 *        - in: query
 *          name: isPublic
 *          schema:
 *            type: boolean
 *          description: Optional. [true || false] true returns all urls that are visible to the user
 *        - in: query
 *          name: isFeature
 *          schema:
 *            type: boolean
 *          description: Optional. [true || false] returns featured url
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
 *                 $ref: '#/components/schemas/Merches'
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
 *  /creator-page/{id}/merches:
 *    get:
 *      summary: Get all merches in creator store.
 *      tags: [Creator Page]
 *      description: Get all the merches that are available in the creator store
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: creator page id
 *        - in: query
 *          name: published
 *          schema:
 *            type: boolean
 *          description: Optional. [true || false] false returns drafts, true returns published or active merches. Leaving out this field returns all merches
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
 *                 $ref: '#/components/schemas/Merches'
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
 *  /creator-page/{id}/orders:
 *    get:
 *      summary: Get all orders history in creator store.
 *      tags: [Creator Page]
 *      description: Get history of orders in the creator store
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: creator page id
 *        - in: query
 *          name: status
 *          schema:
 *            type: string
 *          description: Shows the status of the order []
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
 *                 $ref: '#/components/schemas/Orders'
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
 *  /creator-page/slug/{slug}:
 *    get:
 *      summary: Get a creator-page by the slug of it's name.
 *      tags: [Creator Page]
 *      description: Apart from getting creator page information by it's slug, this is also designed to cater for verifying if name of creator page already exists
 *      parameters:
 *        - in: path
 *          name: slug
 *          required: true
 *          schema:
 *            type: string
 *          description: creator page id
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
 *                 $ref: '#/components/schemas/creatorPage'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 */
