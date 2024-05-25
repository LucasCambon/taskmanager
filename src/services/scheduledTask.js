const { getNearbyTasks, sendEmail, sendWhatsAppMessage, markTaskAsNotified } = require('./nofiticationService');

// Define the scheduled task
const scheduledTask = async () => {
    try {
        // Get nearby tasks that need to be notified
        const tasks = await getNearbyTasks();
        
        // Iterate over the tasks and send notifications
        for (const task of tasks) {
            // Send email

            await sendEmail(task.User.email, 'Tarea cercana', `Recordatorio: La tarea "${task.title}" tiene una fecha límite ${task.dueDate}.`);

            // Send WhatsApp message after email is sent
            await sendWhatsAppMessage(task.User.phoneNumber, `Recordatorio: La tarea "${task.title}" tiene una fecha límite ${task.dueDate}.`);

            // Mark task as notified after WhatsApp message is sent
            await markTaskAsNotified(task.id);
        }
    } catch (error) {
        console.error('Error en la tarea programada de notificación:', error);
    }
};

module.exports = scheduledTask;