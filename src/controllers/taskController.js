const db = require("../database/models");

const taskController = {
    getAllTasks: async (req, res) => {
        try {
             // Get all tasks from the database that belong to the authenticated user
            const tasks = await db.Task.findAll({
                where: {
                    userId: req.user.userId // Only get tasks for the authenticated user
                }
            });
            if (!tasks || tasks.length === 0) {
                return res.status(404).json({ message: 'No tasks found.' });
            }
            res.status(200).json(tasks);
        } catch (error) {
            console.error('Error getting tasks:', error);
            res.status(500).json({ message: 'Error getting tasks. Please try again later.' });
        }
    },

    getTaskById: async (req, res) => {
        try {
            const taskId = req.params.id;
            const task = await db.Task.findOne({
                where: {
                    id: taskId,
                    userId: req.user.userId // Ensure the task belongs to the authenticated user
                }
            });
            if (!task) {
                return res.status(404).json({ message: 'Task not found with the provided ID or you are not authorized to view it.' });
            }
            res.status(200).json(task);
        } catch (error) {
            console.error('Error getting task:', error);
            res.status(500).json({ message: 'Error getting task. Please try again later.' });
        }
    },

    createTask: async (req, res) => {
        // Start a transaction
        const t = await db.sequelize.transaction();

        try {
            // Get the data from the request
            const { title, description, dueDate, status } = req.body;
            const userId = req.user.userId; // Get the userId from the req object

            // Create the task in the database
            const newTask = await db.Task.create(
                { title, description, dueDate, status, userId },
                { transaction: t }
            );

            // Commit the transaction
            await t.commit();

            // Send the new task as a response to the client
            res.status(201).json(newTask);
        } catch (error) {
            // Rollback the transaction in case of error
            await t.rollback();

            console.error('Error creating task:', error);
            res.status(500).json({ message: 'Error creating task. Please try again later.' });
        }
    },

    updateTask: async (req, res) => {
        const taskId = req.params.id;

        // Start a transaction
        const t = await db.sequelize.transaction();

        try {
            const task = await db.Task.findByPk(taskId, { transaction: t });

            if (!task) {
                await t.rollback();
                return res.status(404).json({ message: 'Task not found with the provided ID.' });
            }

            // Update the task with the new partial data within the transaction
            await task.update(req.body, { transaction: t });

            // Commit the transaction
            await t.commit();

            res.status(200).json({ message: 'Task updated successfully.' });
        } catch (error) {
            // Rollback the transaction in case of error
            await t.rollback();

            console.error('Error updating task:', error);
            res.status(500).json({ message: 'Error updating task. Please try again later.' });
        }
    },

    // Method to delete an existing task
    deleteTask: async (req, res) => {
        const taskId = req.params.id;
        // Start a transaction
        const t = await db.sequelize.transaction();

        try {
            const task = await db.Task.findByPk(taskId, { transaction: t });
            if (!task) {
                await t.rollback();
                return res.status(404).json({ message: 'Task not found with the provided ID.' });
            }

            // Delete the task from the database within the transaction
            await task.destroy({ transaction: t });
            // Commit the transaction
            await t.commit();
            res.status(200).json({ message: 'Task deleted successfully.' });
        } catch (error) {
            // Rollback the transaction in case of error
            await t.rollback();

            console.error('Error deleting task:', error);
            res.status(500).json({ message: 'Error deleting task. Please try again later.' });
        }
    }
};

module.exports = taskController;