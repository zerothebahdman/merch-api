const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { analyticsValidation } = require('../../validations');
const { analyticsController } = require('../../controllers');

const router = express.Router();

router.route('/').get(auth('creator'), validate(analyticsValidation.getCategory), analyticsController.getCategories);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Categories management
 */

/**
 * @swagger
 * path:
 *  /categories:
 *    post:
 *      summary: Create a category
 *      description: Only creators can create a category.
 *      tags: [Categories]
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
 *                price: {amount: 5000, currency: NGN}
 *                store: 614d0ff5c5d8b07020a899d1
 *                images: [url1, url2, url3]
 *      responses:
 *        "201":
 *          description: Created
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Category'
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
 *  /categories:
 *    get:
 *      summary: Get all available Categories
 *      description: website users can fetch all available Categories.
 *      tags: [Categories]
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
 *                 $ref: '#/components/schemas/Categories'
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
 *  /categories/{categoryId}:
 *    get:
 *      summary: Get a Category by ID
 *      description: Available for all users
 *      tags: [Categories]
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Category id
 *        - in: query
 *          name: include
 *          schema:
 *            type: string
 *            description: Comma separated list of foreign fields to be populated
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Category'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 *
 *    patch:
 *      summary: Update a Category
 *      description:  Only creators can update a Category information
 *      tags: [Categories]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Category id
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
 *                 $ref: '#/components/schemas/Category'
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
 *      summary: Delete an Category
 *      description:  Only creators can delete an Category
 *      tags: [Categories]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Category id
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
