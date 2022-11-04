const { Router } = require('express');
const { invoiceController } = require('../../controllers');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { invoiceValidation } = require('../../validations');

const router = Router();

router
  .route('/')
  .get(auth('creator'), invoiceController.getInvoices)
  .post(auth('creator'), validate(invoiceValidation.createInvoiceValidation), invoiceController.createInvoice);

router
  .route('/client')
  .get(auth('creator'), invoiceController.getCreatorClient)
  .post(auth('creator'), validate(invoiceValidation.createClient), invoiceController.createClient);

router
  .route('/:invoiceId')
  .patch(auth('creator'), validate(invoiceValidation.updateInvoice), invoiceController.updateInvoice)
  .get(auth('creator'), invoiceController.getInvoice)
  .delete(auth('creator'), invoiceController.deleteInvoice);

router.route('/issue').post(auth('creator'), validate(invoiceValidation.createIssue), invoiceController.createIssue);

router
  .route('/payment-link')
  .get(auth('creator'), invoiceController.getPaymentLinks)
  .post(auth('creator'), validate(invoiceValidation.createPaymentLink), invoiceController.createPaymentLink);

router.route('/payment-link/:paymentCode').get(auth('creator'), invoiceController.getPaymentLink);

router
  .route('/payment-link/checkout')
  .post(auth('creator'), validate(invoiceValidation.generateCheckoutLink), invoiceController.generateCheckoutLink);

router
  .route('/payment-link/validate-payment')
  .post(auth('creator'), validate(invoiceValidation.paymentLinkPay), invoiceController.paymentLinkPay);
 
module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Invoice
 *   description: Creators can create invoice for their customers
 */

/**
 * @swagger
 * path:
 *  /invoices:
 *    post:
 *      summary: Create an invoice
 *      description: Allow creators to be able to create invoice for their customers
 *      tags: [Invoice]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - items
 *                - client
 *                - totalAmount
 *              example:
 *                client: 6360e10c520fcc49d5d97cd4
 *                items: [{ itemDetails: 'item1', quantity: 1, amount: 100 }]
 *                totalAmount: 100
 *                discount: 0
 *                tax: 0
 *                shipping: 0
 *                invoiceNote: 'invoice note'
 *                dueDate: '2021-01-01'
 *      responses:
 *        "201":
 *          description: Created
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Invoice'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *
 *    get:
 *      summary: Get all Invoice
 *      description: Get all invoice for a creator
 *      tags: [Invoice]
 *      responses:
 *        "200":
 *          description: Fetched
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Invoice'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * path:
 *  /invoices/client:
 *    post:
 *      summary: Create a client
 *      description: Creators are able to create a client for their invoices
 *      tags: [Invoice]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - name
 *                - email
 *                - phoneNumber
 *                - address
 *                - state
 *                - country
 *              example:
 *                name: 'John Doe'
 *                email: 'zero@merchro.com'
 *                phoneNumber: '08012345678'
 *                address: 'No 1, Lagos'
 *                state: 'Lagos'
 *                country: 'Nigeria'
 *      responses:
 *        "201":
 *          description: Created
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Client'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *
 *    get:
 *      summary: Get all Clients
 *      description: Get all clients for a creator
 *      tags: [Invoice]
 *      responses:
 *        "200":
 *          description: Fetched
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Clients'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * path:
 *  /invoices/{invoiceId}:
 *    patch:
 *      summary: Update an invoice
 *      description: Creators are able to update an invoice
 *      tags: [Invoice]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - amountPaid
 *                - status
 *                - datePaid
 *              example:
 *                amountPaid: 100
 *                status: 'paid'
 *                datePaid: '2021-01-01'
 *      responses:
 *        "201":
 *          description: Created
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Invoice'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *
 *    get:
 *      summary: Get an invoice
 *      description: Get an invoice for a creator
 *      tags: [Invoice]
 *      responses:
 *        "200":
 *          description: Fetched
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Invoice'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *
 *    delete:
 *      summary: Delete an invoice
 *      description: Creators are able to delete an invoice
 *      tags: [Invoice]
 *      responses:
 *        "204":
 *          description: No Content
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * path:
 *  /invoices/issues:
 *    post:
 *      summary: Create an issue
 *      description: Creators are able to create an issue for an invoice
 *      tags: [Invoice]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - reasonForReport
 *                - description
 *                - invoice
 *              example:
 *                invoice: 6360e10c520fcc49d5d97cd4
 *                reasonForReport: 'late delivery'
 *                description: 'The product was delivered late'
 *      responses:
 *        "201":
 *          description: Created
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Issue'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 */
