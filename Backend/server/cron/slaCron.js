import cron from 'node-cron';
import { checkSlaBreaches } from '../controllers/reportController.js';

export const startSlaCron = () => {
    cron.schedule('0 9 * * *', async () => {
        console.log('Running scheduled SLA breach check...');

        try {
            const result = await checkSlaBreaches();
            console.log(`SLA check done: ${result.notified}/${result.totalChecked} reports breached, admins notified`);
        } catch (error) {
            console.error('Scheduled SLA check failed:', error.message);
        }
    });

    console.log('SLA breach cron job scheduled');
};