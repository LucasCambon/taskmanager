const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

router.get('/', taskController.getAllTasks);
router.get('/:id', taskController.getTaskById);
router.post('/create', taskController.createTask);
router.put('/edit/:id', taskController.updateTask);
router.delete('/delete/:id', taskController.deleteTask);

module.exports = router;