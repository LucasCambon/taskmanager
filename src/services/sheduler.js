const cron = require('node-cron');
const { getNearbyTasks, sendEmail, sendWhatsAppMessage, markTaskAsNotified } = require('./nofiticationService');

// Definir la tarea programada
const scheduledTask = async () => {
    try {
        // Obtener tareas cercanas que necesitan ser notificadas
        const tasks = await getNearbyTasks();

        // Iterar sobre las tareas y enviar notificaciones
        for (const task of tasks) {
            await sendEmail('lucas.j.cambon@gmail.com', 'Tarea cercana', `La tarea "${task.title}" tiene una fecha límite cercana.`);
            await sendWhatsAppMessage('+541169754773', `La tarea "${task.title}" tiene una fecha límite cercana.`);
            await markTaskAsNotified(task.id);
        }
    } catch (error) {
        console.error('Error en la tarea programada de notificación:', error);
    }
};

// Ejecutar la tarea programada al iniciar la aplicación
scheduledTask();

// Programar la tarea para ejecutarse a la medianoche
cron.schedule('0 0 * * *', scheduledTask);
