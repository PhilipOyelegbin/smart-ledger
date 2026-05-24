import { Router } from "express";
import { receiptController } from "../controllers/receipt.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { receiptSchemas } from "../validation/schemas";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Receipt
 *   description: Receipt management
 */

/**
 * @swagger
 * /receipts:
 *   post:
 *     tags: [Receipt]
 *     summary: Create a new receipt
 *     description: Create a new receipt with details
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               invoiceId:
 *                 type: string
 *               amountPaid:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *               paymentDate:
 *                 type: string
 *     responses:
 *       201:
 *         description: Successfully created a receipt
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
  validate(receiptSchemas.create),
  receiptController.create,
);

/**
 * @swagger
 * /receipts:
 *   get:
 *     tags: [Receipt]
 *     summary: List receipts
 *     description: Retrieve receipts, optionally filtered by businessId
 *     parameters:
 *       - name: businessId
 *         in: query
 *         description: The business ID to filter receipts by
 *         schema:
 *           type: string
 *       - name: search
 *         in: query
 *         description: Search by receipt number, invoice number, or customer name
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         description: Page number
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         description: Page size
 *         schema:
 *           type: integer
 *       - name: sortBy
 *         in: query
 *         description: Field to sort by
 *         schema:
 *           type: string
 *       - name: sortOrder
 *         in: query
 *         description: Sort order ASC or DESC
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved receipts
 */
router.get(
  "/",
  authMiddleware,
  validate(receiptSchemas.listQuery, "query"),
  receiptController.list,
);

/**
 * @swagger
 * /receipts/{id}:
 *   get:
 *     tags: [Receipt]
 *     summary: Get receipt by ID
 *     description: Retrieve a receipt by its ID
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the receipt to retrieve
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved a receipt
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
router.get("/:id", authMiddleware, receiptController.getById);

/**
 * @swagger
 * /receipts/{id}/pdf:
 *   get:
 *     tags: [Receipt]
 *     summary: Download receipt by ID
 *     description: Download a receipt by its ID
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the receipt to retrieve
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully downloaded a receipt
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
router.get("/:id/pdf", authMiddleware, receiptController.pdf);

/**
 * @swagger
 * /receipts/{id}/send:
 *   post:
 *     tags: [Receipt]
 *     summary: Send receipt to customer
 *     description: Email a generated receipt PDF to the customer or business email
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully sent receipt
 */
router.post("/:id/send", authMiddleware, receiptController.send);

export default router;
