const cron = require('node-cron');
const { 
  checkAndSendOverdueReminders, 
  checkAndSendDueDateReminders, 
  updateFineAmounts 
} = require('./notificationService');

// Initialize cron jobs
const initializeCronJobs = () => {
  console.log('Initializing cron jobs for notifications...');

  // Check for overdue books and send reminders every day at 9 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('Running daily overdue check at 9 AM...');
    try {
      await updateFineAmounts();
      await checkAndSendOverdueReminders();
      console.log('Daily overdue check completed');
    } catch (error) {
      console.error('Error in daily overdue check:', error);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  });

  // Check for books due tomorrow and send reminders every day at 6 PM
  cron.schedule('0 18 * * *', async () => {
    console.log('Running due date reminder check at 6 PM...');
    try {
      await checkAndSendDueDateReminders();
      console.log('Due date reminder check completed');
    } catch (error) {
      console.error('Error in due date reminder check:', error);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  });

  // Update fine amounts every hour
  cron.schedule('0 * * * *', async () => {
    console.log('Running hourly fine update...');
    try {
      await updateFineAmounts();
      console.log('Hourly fine update completed');
    } catch (error) {
      console.error('Error in hourly fine update:', error);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  });

  console.log('Cron jobs initialized successfully');
  console.log('- Daily overdue check: 9:00 AM IST');
  console.log('- Due date reminders: 6:00 PM IST');
  console.log('- Fine updates: Every hour');
};

// Manual trigger functions for testing
const triggerOverdueCheck = async () => {
  console.log('Manually triggering overdue check...');
  try {
    await updateFineAmounts();
    await checkAndSendOverdueReminders();
    console.log('Manual overdue check completed');
  } catch (error) {
    console.error('Error in manual overdue check:', error);
  }
};

const triggerDueDateReminders = async () => {
  console.log('Manually triggering due date reminders...');
  try {
    await checkAndSendDueDateReminders();
    console.log('Manual due date reminder check completed');
  } catch (error) {
    console.error('Error in manual due date reminder check:', error);
  }
};

module.exports = {
  initializeCronJobs,
  triggerOverdueCheck,
  triggerDueDateReminders
};
