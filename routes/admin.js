const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Sequelize } = require('sequelize');
const { isAuthenticated, isAdmin } = require('../middleWare/middleware');
const { User, CaregiverProfile, ClientProfile, Review, Subscription, Payment, sequelize } = require('../models/database');

// Admin dashboard with analytics
router.get('/dashboard', isAuthenticated, isAdmin, async (req, res) => {
    try {
        // Get statistics
        const totalUsers = await User.count();
        const totalCaregivers = await User.count({ where: { userType: 'caregiver' } });
        const totalClients = await User.count({ where: { userType: 'client' } });
        const pendingVerifications = await CaregiverProfile.count({
            where: { verificationStatus: 'pending' }
        });
        const activeSubscriptions = await Subscription.count({
            where: { status: 'active' }
        });
        const totalRevenue = await Payment.sum('amount', {
            where: { status: 'completed' }
        });

        // Recent activities
        const recentUsers = await User.findAll({
            limit: 10,
            order: [['createdAt', 'DESC']]
        });

        const recentPayments = await Payment.findAll({
            limit: 10,
            order: [['createdAt', 'DESC']],
            include: [{
                model: User,
                attributes: ['firstName', 'lastName', 'email']
            }]
        });

        res.render('admin/dashboard', {
            title: 'Admin Dashboard - TunzaCare',
            page: 'admin',
            stats: {
                totalUsers,
                totalCaregivers,
                totalClients,
                pendingVerifications,
                activeSubscriptions,
                totalRevenue: totalRevenue || 0
            },
            recentUsers,
            recentPayments
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.redirect('/');
    }
});

// User management
router.get('/users', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const users = await User.findAll({
            include: [
                { model: CaregiverProfile },
                { model: ClientProfile }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.render('admin/users', {
            title: 'User Management - TunzaCare',
            page: 'admin',
            users
        });
    } catch (error) {
        console.error('Users error:', error);
        res.redirect('/admin/dashboard');
    }
});

// Caregiver verification
router.get('/verifications', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const caregivers = await CaregiverProfile.findAll({
            where: { verificationStatus: 'pending' },
            include: [{
                model: User,
                attributes: ['firstName', 'lastName', 'email', 'phone', 'idNumber', 'profilePicture']
            }]
        });

        res.render('admin/verifications', {
            title: 'Caregiver Verifications - TunzaCare',
            page: 'admin',
            caregivers
        });
    } catch (error) {
        console.error('Verifications error:', error);
        res.redirect('/admin/dashboard');
    }
});

router.post('/verify/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { status } = req.body;

        await CaregiverProfile.update({
            verificationStatus: status
        }, {
            where: { id: req.params.id }
        });

        req.flash('success_msg', `Caregiver ${status} successfully`);
        res.redirect('/admin/verifications');
    } catch (error) {
        console.error('Verification error:', error);
        req.flash('error_msg', 'Failed to update verification status');
        res.redirect('/admin/verifications');
    }
});

// Subscription management
router.get('/subscriptions', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const subscriptions = await Subscription.findAll({
            include: [{
                model: User,
                attributes: ['firstName', 'lastName', 'email']
            }],
            order: [['createdAt', 'DESC']]
        });

        res.render('admin/subscriptions', {
            title: 'Subscription Management - TunzaCare',
            page: 'admin',
            subscriptions
        });
    } catch (error) {
        console.error('Subscriptions error:', error);
        res.redirect('/admin/dashboard');
    }
});

// Review management
router.get('/reviews', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const reviews = await Review.findAll({
            include: [
                {
                    model: User,
                    as: 'ClientReviews',
                    attributes: ['firstName', 'lastName', 'email']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.render('admin/reviews', {
            title: 'Review Management - TunzaCare',
            page: 'admin',
            reviews
        });
    } catch (error) {
        console.error('Reviews error:', error);
        res.redirect('/admin/dashboard');
    }
});

// Analytics reports
router.get('/analytics', isAuthenticated, isAdmin, async (req, res) => {
    try {
        // Monthly revenue
        const monthlyRevenue = await Payment.findAll({
            attributes: [
                [sequelize.fn('MONTH', sequelize.col('createdAt')), 'month'],
                [sequelize.fn('SUM', sequelize.col('amount')), 'total']
            ],
            where: {
                status: 'completed',
                createdAt: {
                    [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 12))
                }
            },
            group: [sequelize.fn('MONTH', sequelize.col('createdAt'))],
            raw: true
        });

        // User growth
        const userGrowth = await User.findAll({
            attributes: [
                [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: {
                createdAt: {
                    [Op.gte]: new Date(new Date().setDate(new Date().getDate() - 30))
                }
            },
            group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
            raw: true
        });

        res.render('admin/analytics', {
            title: 'Analytics - TunzaCare',
            page: 'admin',
            monthlyRevenue,
            userGrowth
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.redirect('/admin/dashboard');
    }
});

module.exports = router;