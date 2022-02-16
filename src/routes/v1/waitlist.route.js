const express = require('express');
const validate = require('../../middlewares/validate');
const { waitlistValidation } = require('../../validations');
const { waitlistController } = require('../../controllers');

const router = express.Router();

router.route('/').post(validate(waitlistValidation.addEmail), waitlistController.addEmail).get(waitlistController.getEmails);

router.route('/:email').get(validate(waitlistValidation.verifyEmail), waitlistController.checkIfEmailExist);
module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Waitlist
 *   description: For interested creators to join our waitlist
 */

/**
 * @swagger
 * path:
 *  /waitlist:
 *    post:
 *      summary: Add an email to waitlist
 *      description: Allow app visitors to join the waitlist
 *      tags: [Waitlist]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - email
 *              example:
 *                email: interesteduser@email.com
 *      responses:
 *        "201":
 *          description: Created
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Waitlist'
 *        "400":
 *          $ref: '#/components/responses/DuplicateEmail'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *
 *    get:
 *      summary: Get all Emails in waitlist
 *      description: To get all emails in waitlist
 *      tags: [Waitlist]
 *      responses:
 *        "200":
 *          description: Fetched
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Waitlists'
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
 *  /waitlist/{email}:
 *    get:
 *      summary: Verify email
 *      description: To check if email already exist
 *      tags: [Items]
 *      parameters:
 *        - in: path
 *          name: email
 *          required: true
 *          schema:
 *            type: string
 *          description: Email
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Waitlist'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 */
