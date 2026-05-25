import { Router } from "express";
import { businessController } from "../controllers/business.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { businessSchemas } from "../validation/schemas";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Business
 *   description: Business management
 */

/**
 * @swagger
 * /businesses:
 *   get:
 *     tags: [Business]
 *     summary: Get all businesses for the logged-in user
 *     description: Retrieve every business owned by the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved businesses
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Business'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/", authMiddleware, businessController.getAllForUser);

/**
 * @swagger
 * /businesses:
 *   post:
 *     tags: [Business]
 *     summary: Register a new business
 *     description: Create a new business account with name and email
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               businessName:
 *                 type: string
 *               logo:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               address:
 *                 type: string
 *               taxNumber:
 *                 type: string
 *               bankName:
 *                 type: string
 *               accountName:
 *                 type: string
 *               accountNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: Successfully created a business
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
  validate(businessSchemas.create),
  businessController.create,
);

/**
 * @swagger
 * /businesses/{id}:
 *   get:
 *     tags: [Business]
 *     summary: Get a business by ID
 *     description: Retrieve details of a specific business
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the business
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
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Business not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", authMiddleware, businessController.getById);

/**
 * @swagger
 * /businesses/{id}:
 *   put:
 *     tags: [Business]
 *     summary: Update a business
 *     description: Update details of an existing business
 *     parameters:
 *       - in: path
 *         name: id
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
 *               businessName:
 *                 type: string
 *               logo:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               address:
 *                 type: string
 *               taxNumber:
 *                 type: string
 *               bankName:
 *                 type: string
 *               accountName:
 *                 type: string
 *               accountNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully updated the business
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
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id",
  authMiddleware,
  validate(businessSchemas.update),
  businessController.update,
);

/**
 * @swagger
 * /businesses/{id}:
 *   delete:
 *     tags: [Business]
 *     summary: Delete a business
 *     description: Delete an existing business owned by the authenticated user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully deleted the business
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Business not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", authMiddleware, businessController.delete);

export default router;
