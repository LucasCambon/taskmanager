const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middlewares/authMiddleware');
const { taskValidationRules } = require('../middlewares/validationRules');
const validate = require('../middlewares/dynamicValidation');

router.get('/', taskController.getAllTasks);
router.get('/:id', taskController.getTaskById);
router.post('/create', authMiddleware, validate(taskValidationRules.createTask), taskController.createTask);
router.put('/edit/:id', authMiddleware, taskController.updateTask);
router.delete('/delete/:id', authMiddleware, taskController.deleteTask);

module.exports = router;