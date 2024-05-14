const db = require("../database/models");

const taskController = {

    getAllTasks: async (req, res) => {
        try {
            // Obtener todas las tareas de la base de datos
            const tasks = await db.Task.findAll();
            // Si no se encontraron tareas, enviar una respuesta con código 404
            if (!tasks || tasks.length === 0) {
                return res.status(404).json({ message: 'No se encontraron tareas.' });
            }
            // Enviar las tareas encontradas como respuesta al cliente
            res.status(200).json(tasks);
        } catch (error) {
            // Si ocurre algún error durante la consulta a la base de datos, enviar una respuesta con código 500
            console.error('Error al obtener las tareas:', error);
            res.status(500).json({ message: 'Error al obtener las tareas. Por favor, inténtelo de nuevo más tarde.' });
        }
    },

    getTaskById: async (req, res) => {
        try {
            //Obtener parametro del request
            const taskId = req.params.id;
            //Busqueda de la tarea especifica
            const task = await db.Task.findByPk(taskId);
            //Si no se encuentra tarea, enviar una respuesta con código 404
            if (!task) {
                return res.status(404).json({ message: 'No se encontró la tarea con el ID proporcionado.' });
            }
            // Enviar la tarea encontrada como respuesta al cliente
            res.status(200).json(task);
        } catch (error) {
            // Si ocurre algún error durante la consulta a la base de datos, enviar una respuesta con código 500
            console.error('Error al obtener la tarea:', error);
            res.status(500).json({ message: 'Error al obtener la tarea. Por favor, inténtelo de nuevo más tarde.' });
        }
    },

    createTask: async (req, res) => {
        // Iniciar una transacción
        const t = await db.sequelize.transaction();

        try {
            // Obtener los datos de la solicitud
            const { title, description, dueDate, status } = req.body;

            // Crear la tarea en la base de datos
            const newTask = await db.Task.create(
                { title, description, dueDate, status, userId: 1 },
                { transaction: t }
            );

            // Commit de la transacción
            await t.commit();

            // Enviar la nueva tarea como respuesta al cliente
            res.status(201).json(newTask);
        } catch (error) {
            // Rollback de la transacción en caso de error
            await t.rollback();

            console.error('Error al crear la tarea:', error);
            res.status(500).json({ message: 'Error al crear la tarea. Por favor, inténtelo de nuevo más tarde.' });
        }
    },

    updateTask: async (req, res) => {
        const taskId = req.params.id;

        // Iniciar una transacción
        const t = await db.sequelize.transaction();

        try {
            const task = await db.Task.findByPk(taskId, { transaction: t });

            if (!task) {
                await t.rollback();
                return res.status(404).json({ message: 'No se encontró la tarea con el ID proporcionado.' });
            }

            // Actualizar la tarea con los nuevos datos parciales dentro de la transacción
            await task.update(req.body, { transaction: t });

            // Commit de la transacción
            await t.commit();

            res.status(200).json({ message: 'Tarea actualizada correctamente.' });
        } catch (error) {
            // Rollback de la transacción en caso de error
            await t.rollback();

            console.error('Error al actualizar la tarea:', error);
            res.status(500).json({ message: 'Error al actualizar la tarea. Por favor, inténtelo de nuevo más tarde.' });
        }
    },

    // Método para eliminar una tarea existente
    deleteTask: async (req, res) => {
        const taskId = req.params.id;

        // Iniciar una transacción
        const t = await db.sequelize.transaction();

        try {
            const task = await db.Task.findByPk(taskId, { transaction: t });

            if (!task) {
                await t.rollback();
                return res.status(404).json({ message: 'No se encontró la tarea con el ID proporcionado.' });
            }

            // Eliminar la tarea de la base de datos dentro de la transacción
            await task.destroy({ transaction: t });

            // Commit de la transacción
            await t.commit();

            res.status(200).json({ message: 'Tarea eliminada correctamente.' });
        } catch (error) {
            // Rollback de la transacción en caso de error
            await t.rollback();

            console.error('Error al eliminar la tarea:', error);
            res.status(500).json({ message: 'Error al eliminar la tarea. Por favor, inténtelo de nuevo más tarde.' });
        }
    }

};

module.exports = taskController;