import Report from '../models/Report.js';
import User from '../models/User.js';
import { createStatusChangeNotification } from './notificationController.js';
import { getDepartmentByCategory } from './departmentController.js';
import { createAuditLog } from './auditLogController.js';
import cloudinary from '../config/cloudinary.js';
import redisClient from '../config/redis.js';
import { clusterActiveReports } from '../services/clusteringService.js';


export const createReport = async (req, res) => {
    try {
        const { category, description, lat, lng, } = req.body;


        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: ' At least one Photo is required' });
        }

        const photoUrls = req.files.map((file) => ({
            url: file.path,
            publicId: file.filename,
        }));

        const department = await getDepartmentByCategory(category);

        const newReport = await Report.create({
            user: req.user.id,
            category,
            description,
            photoUrls,
            location: { lat, lng },
            department: department ? department._id : null,
        });

        res.status(201).json({
            message: 'Report submitted successfully',
            report: newReport,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const getMyReports = async (req, res) => {
    try {
        const reports =  await Report.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ reports });
    
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    } 
};



export const getAllReports = async (req, res) => {
    try {
        const reports = await Report.find().populate('user', 'name email').sort({ createdAt: -1 });
        res.status(200).json({ reports });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const updateReportStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        report.status = status;

        if (status === 'resolved') {
            report.resolvedAt = new Date();
        }

        await report.save();

        await createStatusChangeNotification(report.user, report._id, report.category, report.status);

        await createAuditLog(
            req.user.id,
            'status-update',
            'Report',
            report.id,
            `Changed status of ${report.category} report to ${report.status}`
        );

        res.status(200).json({ message: 'Status updated successfully', report });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const deleteReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        const isOwner = report.user.toString() === req.user.id;
        const isAdminUser = req.user.role === 'admin';

        if (!isOwner && !isAdminUser) {
            return res.status(403).json({ message: 'You can only delete your own reports' });
        }

        const reportId = report._id;
        const reportCategory = report.category;

        await report.deleteOne();

        await createAuditLog(
            req.user.id,
            'delete-report',
            'Report',
            reportId,
            `Deleted ${reportCategory} report`
        );

        res.status(200).json({ message: 'Report deleted successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const getAnalytics = async (req, res) => {
    try {
        const cacheKey = 'admin-analytics';

        const cachedAnalytics = await redisClient.get(cacheKey);

        if (cachedAnalytics) {
            console.log('Serving admin-analytics from Redis cache');
            return res.status(200).json(JSON.parse(cachedAnalytics));
        }

        console.log('Cache miss — querying MongoDB for admin-analytics');

        const totalReports = await Report.countDocuments();

        const statusCounts = await Report.aggregate([
            { $group: { _id: '$status', count: { $sum: 1} } },
        ]);

        const categoryCounts = await Report.aggregate([
            { $group: { _id: '$category', count: { $sum: 1} } },
        ]);

        const activeUsers = await User.countDocuments({ role: 'citizen' });

        const analytics = {
            totalReports,
            statusCounts,
            categoryCounts,
            activeUsers,
        };

        await redisClient.set(cacheKey, JSON.stringify(analytics), 'EX', 60);

        res.status(200).json(analytics);

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getAllPublicReports = async (req, res) => {
    try {
        const reports = await Report.find().select('category description location status createdAt');
        res.status(200).json({ reports });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const getPublicStats = async (req, res) => {
    try {
        const cacheKey = 'public-stats';

        const cachedStats = await redisClient.get(cacheKey);

        if (cachedStats) {
            console.log('Serving public-stats from Redis cache');
            return res.status(200).json(JSON.parse(cachedStats));
        }

        console.log('Cache miss — querying MongoDB for public-stats');

        const totalReports = await Report.countDocuments();
        const resolvedCount = await Report.countDocuments({ status: 'resolved' });
        const activeUsers = await User.countDocuments({ role: 'citizen' });

        const stats = { totalReports, resolvedCount, activeUsers };

        await redisClient.set(cacheKey, JSON.stringify(stats), 'EX', 60);

        res.status(200).json(stats);
    
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const editReport = async (req, res) => {
    try {
        const { description, removePhotoIds } = req.body;

        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(400).json({ message: 'Report not found' });
        }

        const isOwner = report.user.toString() === req.user.id;

        if (!isOwner) {
            return res.status(403).json({ message: 'You can only edit your own reports' });
        }

        if (report.status !== 'pending') {
            return res.status(400).json({ message: 'Report can only be edited while it is pending' });
        }

        if (description) {
            report.description = description;
        }

        const idsToRemove = removePhotoIds ? removePhotoIds.split(',') : [] ;

        if (idsToRemove.length > 0) {
            for (const publicId of idsToRemove) {
                await cloudinary.uploader.destroy(publicId);
            }

            report.photoUrls = report.photoUrls.filter(
                (photo) => !idsToRemove.includes(photo.publicId)
            );
        }

        if(req.files && req.files.length > 0) {
            const newPhotos = req.files.map((file) => ({
                url: file.path,
                publicId: file.filename,
            }));

            report.photoUrls = [...report.photoUrls, ...newPhotos];
        }

        if (report.photoUrls.length > 4) {
            return res.status(400).json({ message: 'A report can have a maximum of 4 photos' });
        }

        if (report.photoUrls.length === 0) {
            return res.status(400).json({ message: 'A report must have at least 1 photo' });
        }

        await report.save();

        res.status(200).json({ message: 'Report updated successfully', report });
    
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }

};


export const reopenReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        const isOwner = report.user.toString() === req.user.id;

        if (!isOwner) {
            return res.status(403).json({ message: 'Only the report owner can reopen this report' });
        }

        if (report.status !== 'resolved') {
            return res.status(400).json({ message: 'Only resolved reports can be reopened' });
        }

        if (report.hasBeenReopened) {
            return res.status(400).json({ message: 'This report has already been reopened once' });
        }

        const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
        const timeSinceResolved = Date.now() - report.resolvedAt.getTime();

        if (timeSinceResolved > sevenDaysInMs) {
            return res.status(400).json({ message: 'Reopen window has expired (7 days after resolution)' });
        }

        report.status = 'reopened';
        report.hasBeenReopened = true;
        report.resolvedAt = null;

        await report.save();

        await createAuditLog(
            req.user.id,
            'status-update',
            'Report',
            report._id,
            `Report reopened by citizen: ${report.category}`
        );

        res.status(200).json({ message: 'Report reopened successfully', report });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const getAccountabilityMetrics = async (req, res) => {
    try {

        const cacheKey = 'accountability-metrics';

        const cachedMetrics = await redisClient.get(cacheKey);

        if (cachedMetrics) {
            console.log('Serving accountability-metrics from Redis cache');
            return res.status(200).json(JSON.parse(cachedMetrics));
        }

        console.log('Cache miss — querying MongoDB for accountability-metrics');


        const totalEverResolved = await Report.countDocuments({
            status: { $in: ['resolved', 'reopened'] }
        });

        const reopenedCount = await Report.countDocuments({ hasBeenReopened: true });

        const reopenRate = totalEverResolved > 0
            ? Number(((reopenedCount / totalEverResolved) * 100).toFixed(2))
            : 0;

        const activeReports = await Report.find({
            status: { $in: ['pending', 'in-progress'] }
        }).populate('department', 'slaHours');

        let breachedCount = 0;

        for (const report of activeReports) {
            if (!report.department) continue;

            const slaMs = report.department.slaHours * 60 * 60 * 1000;
            const ageMs = Date.now() - report.createdAt.getTime();

            if (ageMs > slaMs) {
                breachedCount++;
            }
        }

        const breachRate = activeReports.length > 0
            ? Number(((breachedCount / activeReports.length) * 100).toFixed(2))
            : 0;

        const resolvedReports = await Report.find({
            resolvedAt: { $ne: null }
        }).select('createdAt resolvedAt');

        const resolutionTimesInDays = resolvedReports.map((report) => {
            const diffMs = report.resolvedAt.getTime() - report.createdAt.getTime();
            return diffMs / (1000 * 60 * 60 * 24);
        });

        resolutionTimesInDays.sort((a, b) => a - b);

        let medianResolutionDays = 0;

        if (resolutionTimesInDays.length > 0) {
            const mid = Math.floor(resolutionTimesInDays.length / 2);

            if (resolutionTimesInDays.length % 2 === 0) {
                medianResolutionDays = (resolutionTimesInDays[mid - 1] + resolutionTimesInDays[mid]) / 2;
            } else {
                medianResolutionDays = resolutionTimesInDays[mid];
            }

            medianResolutionDays = Number(medianResolutionDays.toFixed(1));
        }

        const metrics = {
            reopenRate,
            slaBreachRate: breachRate,
            medianResolutionDays,
            sampleSize: {
                totalEverResolved,
                activeReports: activeReports.length,
                resolvedWithTimestamp: resolvedReports.length,
            },
        };

        await redisClient.set(cacheKey, JSON.stringify(metrics), 'EX', 60);

        res.status(200).json(metrics);

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('department', 'name slaHours');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.status(200).json({ report });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


export const runClustering = async (req, res) => {
    try {
        const activeReports = await Report.find({
            status: { $in: ['pending', 'in-progress'] }
        });

        const clusterMap = await clusterActiveReports(activeReports);

        let updatedCount = 0;

        for (const report of activeReports) {
            const newClusterId = clusterMap[report._id.toString()] || null;

            if (report.clusterId !== newClusterId) {
                report.clusterId = newClusterId;
                await report.save();
                updatedCount++;
            }
        }

        res.status(200).json({
            message: 'Clustering completed',
            totalReportsChecked: activeReports.length,
            reportsUpdated: updatedCount,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const getReportsByCluster = async (req, res) => {
    try {
        const { clusterId } = req.params;

        const reports = await Report.find({ clusterId })
            .select('category description location status createdAt photoUrls');

        res.status(200).json({ reports });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};