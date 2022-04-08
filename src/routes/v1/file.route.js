const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const fileValidation = require('../../validations/file.validation');
const fileController = require('../../controllers/file.controller');

const router = express.Router();

router.post('/', auth('creator'), validate(fileValidation.uploadFiles), fileController.uploadBase64File);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: File Uploads
 *   description: To upload files - all files must first be converted to base64
 */

/**
 * @swagger
 * path:
 *  /file-upload:
 *    post:
 *      summary: Upload files
 *      description: Only creators account can upload files and get the url in return
 *      tags: [File Upload]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - files
 *              properties:
 *                files:
 *                  type: array
 *              example:
 *                files: ['xcaydtklejd', '6hs8nkendkjxbsfnshfsifyzifhk']
 *      responses:
 *        "201":
 *          description: Created
 *          content:
 *            application/json:
 *              schema:
 *                 type: object,
 *                 example:
 *                   data: ['https://cloudinary.com/merchro/uploads/fsg6s.jpg', 'https://https://cloudinary.com/merchro/uploads/hymalienjdud.pdf']
 *        "400":
 *          $ref: '#/components/responses/DuplicateName'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 */
