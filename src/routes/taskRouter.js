const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middlewares/authMiddleware');
const { taskValidationRules } = require('../middlewares/validationRules');
const validate = require('../middlewares/dynamicValidation');

router.use(authMiddleware);

router.get('/', taskController.getAllTasks);
router.get('/:id', taskController.getTaskById);
router.post('/create', validate(taskValidationRules.createTask), taskController.createTask);
router.put('/edit/:id', validate(taskValidationRules.updateTask), taskController.updateTask);
router.delete('/delete/:id', taskController.deleteTask);

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management
 */

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved tasks
 *       404:
 *         description: No tasks found
 *       500:
 *         description: Error retrieving tasks
 */

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get a task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The task ID
 *     responses:
 *       200:
 *         description: Successfully retrieved task
 *       404:
 *         description: Task not found or not authorized
 *       500:
 *         description: Error retrieving task
 */

/**
 * @swagger
 * /tasks/create:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - dueDate
 *               - status
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task created successfully
 *       500:
 *         description: Error creating task
 */

/**
 * @swagger
 * /tasks/edit/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       404:
 *         description: Task not found
 *       500:
 *         description: Error updating task
 */

/**
 * @swagger
 * /tasks/delete/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found
 *       500:
 *         description: Error deleting task
 */

module.exports = router;