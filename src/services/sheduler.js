const cron = require('node-cron');
const { getNearbyTasks, sendEmail, sendWhatsAppMessage, markTaskAsNotified } = require('./nofiticationService');

// Define the scheduled task
const scheduledTask = async () => {
    try {
        // Get nearby tasks that need to be notified
        const tasks = await getNearbyTasks();

        // Iterate over the tasks and send notifications
        for (const task of tasks) {
            await sendEmail(user.email, 'Tarea cercana', `Recordatorio: La tarea "${task.title}" tiene una fecha límite ${task.dueDate}.`);
            await sendWhatsAppMessage(user.phoneNumber, `Recordatorio: La tarea "${task.title}" tiene una fecha límite ${task.dueDate}.`);
            await markTaskAsNotified(task.id);
        }
    } catch (error) {
        console.error('Error en la tarea programada de notificación:', error);
    }
};

// Execute the scheduled task when the application starts
scheduledTask();

// Schedule the task to run at midnight
cron.schedule('0 0 * * *', scheduledTask);
