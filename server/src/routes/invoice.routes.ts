import { Router } from "express";
import { invoiceController } from "../controllers/invoice.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { invoiceSchemas } from "../validation/schemas";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Invoice
 *   description: Invoice management
 */

/**
 * @swagger
 * /invoices:
 *   post:
 *     tags: [Invoice]
 *     summary: Create a new invoice
 *     description: Create a new invoice with details
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               businessId:
 *                 type: string
 *               customerId:
 *                 type: string
 *               tax:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     description:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     unitPrice:
 *                       type: number
 *               issueDate:
 *                 type: string
 *               dueDate:
 *                 type: string
 *               status:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Successfully created an invoice
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 result:
 *                   type: object
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  authMiddleware,
  validate(invoiceSchemas.create),
  invoiceController.create,
);

/**
 * @swagger
 * /invoices:
 *   get:
 *     tags: [Invoice]
 *     summary: List invoices
 *     description: Retrieve a list of invoices
 *     parameters:
 *       - name: businessId
 *         in: query
 *         description: The business Id of the invoice to retrieve
 *         schema:
 *           type: string
 *       - name: customerId
 *         in: query
 *         description: The customer Id of the invoice to retrieve
 *         schema:
 *           type: string
 *       - name: status
 *         in: query
 *         description: The status of the invoice to retrieve
 *         schema:
 *           type: string
 *       - name: search
 *         in: query
 *         description: The search term for the invoice to retrieve
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         description: The page number for the invoice to retrieve
 *         schema:
 *           type: string
 *       - name: limit
 *         in: query
 *         description: The limit for the invoice to retrieve
 *         schema:
 *           type: string
 *       - name: sortBy
 *         in: query
 *         description: The field to sort the invoices by
 *         schema:
 *           type: string
 *       - name: sortOrder
 *         in: query
 *         description: The order to sort the invoices by (ASC or DESC)
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved an invoice
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 result:
 *                   type: object
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  "/",
  authMiddleware,
  validate(invoiceSchemas.listQuery, "query"),
  invoiceController.list,
);

/**
 * @swagger
 * /invoices/{id}:
 *   get:
 *     tags: [Invoice]
 *     summary: Get invoice by ID
 *     description: Retrieve an invoice by its ID
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the invoice to retrieve
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved an invoice
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 result:
 *                   type: object
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/:id", authMiddleware, invoiceController.getById);

/**
 * @swagger
 * /invoices/{id}:
 *   put:
 *     tags: [Invoice]
 *     summary: Update an existing invoice
 *     description: Update an existing invoice with new details
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the invoice to update
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               businessId:
 *                 type: string
 *               customerId:
 *                 type: string
 *               subtotal:
 *                 type: string
 *               tax:
 *                 type: string
 *               total:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     description:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     price:
 *                       type: number
 *               issueDate:
 *                 type: string
 *               dueDate:
 *                 type: string
 *               status:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully updated an invoice
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 result:
 *                   type: object
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id",
  authMiddleware,
  validate(invoiceSchemas.update),
  invoiceController.update,
);

/**
 * @swagger
 * /invoices/{id}:
 *   delete:
 *     tags: [Invoice]
 *     summary: Delete an invoice
 *     description: Delete an existing invoice by its ID
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the invoice to delete
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully deleted an invoice
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 result:
 *                   type: object
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", authMiddleware, invoiceController.delete);

/**
 * @swagger
 * /invoices/{id}/pdf:
 *   get:
 *     tags: [Invoice]
 *     summary: Download invoice as PDF
 *     description: Download an invoice as a PDF by its ID
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the invoice to download
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully downloaded an invoice as PDF
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 result:
 *                   type: object
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/:id/pdf", authMiddleware, invoiceController.pdf);

/**
 * @swagger
 * /invoices/{id}/send:
 *   post:
 *     tags: [Invoice]
 *     summary: Send invoice by email
 *     description: Send an existing invoice by email and mark as SENT
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the invoice to send
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully sent an invoice
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 result:
 *                   type: object
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/:id/send", authMiddleware, invoiceController.send);

export default router;
