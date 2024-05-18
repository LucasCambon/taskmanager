require('dotenv').config();
const db = require("../database/models");
const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Configure Twilio
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Get nearby tasks
async function getNearbyTasks() {
    try {
        // Calculate the current date and the deadline date (3 days from today)
        const currentDate = new Date();
        const deadlineDate = new Date();
        deadlineDate.setDate(deadlineDate.getDate() + 3);

        // Query the database to get tasks with a deadline within the next 3 days and not previously notified
        const tasks = await db.Task.findAll({
            where: {
                dueDate: {
                    [db.Sequelize.Op.between]: [currentDate, deadlineDate] // Tasks with a deadline within the next 3 days
                },
                notified: false // Only tasks that have not been notified previously
            },
            include: [{
                model: db.User, // Assuming your User model is associated with Task
                attributes: ['email', 'phoneNumber'] // Select the required fields from the User model
            }]
        });

        return tasks;
    } catch (error) {
        console.error('Error while fetching nearby tasks:', error);
        throw error;
    }
}

// Send email
async function sendEmail(to, subject, body) {
    try {
        // Create a transporter object using the default SMTP transport
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'cambonlucas26@gmail.com',
                pass: 'ykpq ckec ahgq cgsn'
            }
        });

        // Define the email options
        const mailOptions = {
            from: 'cambonlucas26@gmail.com',
            to: to,
            subject: subject,
            text: body
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);

        console.log('Email sent:', info.response);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

// Send WhatsApp message
async function sendWhatsAppMessage(to, body) {
    try {
        // Send the WhatsApp message
        await client.messages.create({
            from: `whatsapp:+14155238886`,
            to: `whatsapp:${to}`,
            body: body
        });
        console.log('WhatsApp message sent successfully');
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        throw error;
    }
}

// Mark task as notified
async function markTaskAsNotified(taskId) {
    try {
        // Find the task by its ID
        const task = await db.Task.findByPk(taskId);

        if (!task) {
            throw new Error('Task not found');
        }

        // Update the 'notified' field to true
        task.notified = true;

        // Save the changes to the database
        await task.save();

        console.log(`Task ${taskId} marked as notified`);
    } catch (error) {
        console.error('Error marking task as notified:', error);
        throw error;
    }
}

module.exports = { getNearbyTasks, sendEmail, sendWhatsAppMessage, markTaskAsNotified };