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
  .route('/process-invoice-payment')
  .post(validate(invoiceValidation.processInvoicePayment), invoiceController.processInvoicePayment);

router.route('/reminder/:invoiceId').get(auth('creator'), invoiceController.sendInvoiceReminders);

router
  .route('/client')
  .get(auth('creator'), invoiceController.queryCreatorClient)
  .post(auth('creator'), validate(invoiceValidation.createClient), invoiceController.createClient);

router
  .route('/payment-link')
  .get(auth('creator'), invoiceController.getPaymentLinks)
  .post(auth('creator'), validate(invoiceValidation.createPaymentLink), invoiceController.createPaymentLink);

router.route('/payment-link/:paymentCode').get(invoiceController.getPaymentLink);

router
  .route('/payment-link/checkout')
  .post(validate(invoiceValidation.generateCheckoutLink), invoiceController.generateCheckoutLink);

router
  .route('/payment-link/validate-payment')
  .post(validate(invoiceValidation.paymentLinkPay), invoiceController.paymentLinkPay);

router.route('/payment-link/:paymentCode/purchased').get(auth('creator'), invoiceController.getPaymentLinkPurchased);

router.route('/tickets').get(invoiceController.getTickets);

router.route('/issue').post(auth('creator'), validate(invoiceValidation.createIssue), invoiceController.createIssue);
router
  .route('/:invoiceId')
  .patch(auth('creator'), validate(invoiceValidation.updateInvoice), invoiceController.updateInvoice)
  .get(auth('creator'), invoiceController.getInvoice)
  .delete(auth('creator'), invoiceController.deleteInvoice);
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

/**
 * @swagger
 * path:
 *  /payment-link:
 *    post:
 *      summary: Create a payment link
 *      description: Allow creators to be able to payment links for their products
 *      tags: [Invoice]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - pageName
 *                - pageDescription
 *                - pageRedirectUrl
 *                - amount
 *                - paymentType
 *                - eventPayment: {}
 *              example:
 *                pageName: 'Merchro'
 *                pageDescription: 'Merchro payment page'
 *                pageRedirectUrl: 'https://merchro.com'
 *                amount: 100
 *                paymentType: 'event'
 *                eventPayment: {type: true, location: 'Lagos', date: {from: '2021-01-01', to: '2021-01-01'}, tickets: [{ticketType: 'VIP', ticketPrice: 100, ticketQuantity: 10}, {ticketType: 'Regular', ticketPrice: 50, ticketQuantity: 10}]}
 *      responses:
 *        "201":
 *          description: Created
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/PaymentLink'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *
 *    get:
 *      summary: Get all Payment Links
 *      description: Get all creator payment links
 *      tags: [Invoice]
 *      responses:
 *        "200":
 *          description: Fetched
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/PaymentLink'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * path:
 *  /payment-links/{paymentCode}:
 *    get:
 *      summary: Get a payment link
 *      description: Get a payment link by the payment code
 *      tags: [Invoice]
 *      responses:
 *        "200":
 *          description: Fetched
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/PaymentLink'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * path:
 *  /payment-link/checkout:
 *    post:
 *      summary: Create a payment link
 *      description: Allow creators to be able to payment links for their products
 *      tags: [Invoice]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - clientFirstName
 *                - clientLastName
 *                - clientEmail
 *                - clientPhoneNumber
 *                - creatorPaymentLinkId
 *                - redirectUrl
 *                - paymentType
 *                - amount
 *                - event: {ticketType: 'VIP', ticketQuantity: 10, peopleReceivingTicket: [{clientFirstName: 'John', clientLastName: 'Doe', clientEmail: ' [emailProtected] ', clientPhoneNumber: '08012345678'}]}
 *              example:
 *                clientFirstName: 'John'
 *                clientLastName: 'Doe'
 *                clientEmail: ' [emailProtected]'
 *                clientPhoneNumber: '08012345678'
 *                creatorPaymentLinkId: '5f9f5b9c0b9d3b0b8c8b4567'
 *                redirectUrl: 'https://merchro.com'
 *                paymentType: 'event'
 *                amount: 100
 *                event: {ticketType: 'VIP', ticketPrice: 100, ticketQuantity: 10, peopleReceivingTicket: [{clientFirstName: 'John', clientLastName: 'Doe', clientEmail: ' [emailProtected] ', clientPhoneNumber: '08012345678'}]}
 *      responses:
 *        "201":
 *          description: Created
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/PaymentLinkCheckout'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * path:
 *  /payment-link/validate-payment:
 *    post:
 *      summary:  Validate payment link payment
 *      description:  Validate payment link payment
 *      tags: [Invoice]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - transaction_id
 *                - tx_ref
 *                - idempotentKey
 *              example:
 *                transaction_id: '3930674'
 *                tx_ref: '0215149335'
 *                idempotentKey: '8014193946DFADFAD3915878119943491039235553930674wefwe'
 *      responses:
 *        "200":
 *          description: Created
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/PaymentLink'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * path:
 *  /payment-links/{paymentCode}/purchased:
 *    get:
 *      summary: Get insights for a payment link
 *      description: Get insights for a payment link
 *      tags: [Invoice]
 *      responses:
 *        "200":
 *          description: Fetched
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/PaymentLinkInsights'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * path:
 *  /process-invoice-payment:
 *    post:
 *      summary:  Process invoice payment
 *      description:  Process invoice payment
 *      tags: [Invoice]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - transaction_id
 *                - tx_ref
 *                - idempotentKey
 *              example:
 *                transaction_id: '3930674'
 *                tx_ref: '0215149335'
 *                idempotentKey: '8014193946DFADFAD3915878119943491039235553930674wefwe'
 *      responses:
 *        "200":
 *          description: Created
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
 *  /reminder/{invoiceId}:
 *    get:
 *      summary: Send reminder to a client
 *      description: Send reminder to a client
 *      tags: [Invoice]
 *      responses:
 *        "204":
 *          description: No content
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 */
