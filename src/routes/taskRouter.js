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

module.exports = router;