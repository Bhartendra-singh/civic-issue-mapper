import cron from 'node-cron';
import { performClustering } from '../controllers/reportController.js';

export const startClusteringCron = () => {
    cron.schedule('0 */6 * * *', async () => {
        console.log('Running scheduled DBSCAN clustering...');

        try {
            const result = await performClustering();
            console.log(`Clustering done: ${result.reportsUpdated}/${result.totalReportsChecked} reports updated`);
        } catch (error) {
            console.error('Scheduled clustering failed:', error.message);
        }
    });

    console.log('Clustering cron job scheduled');
};