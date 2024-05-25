const cron = require('node-cron');
const scheduledTask = require('./scheduledTask');

// Execute the scheduled task when the application starts
scheduledTask();

// Schedule the task to run at midnight
cron.schedule('0 0 * * *', scheduledTask);
