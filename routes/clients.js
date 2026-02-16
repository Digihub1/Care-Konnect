const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { isAuthenticated, isClient } = require('../middleWare/middleware');
const { User, CaregiverProfile, Review, ClientProfile } = require('../models/database');

// Client dashboard
router.get('/dashboard', isAuthenticated, isClient, async (req, res) => {
    try {
        const user = await User.findByPk(req.session.userId, {
            include: [ClientProfile]
        });

        // Get available caregivers
        const caregivers = await CaregiverProfile.findAll({
            where: {
                verificationStatus: 'verified',
                subscriptionStatus: 'active',
                isActive: true
            },
            include: [{
                model: User,
                attributes: ['firstName', 'lastName', 'email', 'phone', 'profilePicture']
            }],
            limit: 10
        });

        res.render('client/dashboard', {
            title: 'Client Dashboard - TunzaCare',
            page: 'dashboard',
            user,
            caregivers
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.redirect('/');
    }
});

// Browse caregivers
router.get('/caregivers', isAuthenticated, isClient, async (req, res) => {
    try {
        const { specialization, county, minRating, availability } = req.query;
        
        let whereClause = {
            verificationStatus: 'verified',
            subscriptionStatus: 'active',
            isActive: true
        };

        if (specialization) whereClause.specialization = specialization;
        if (county) whereClause.county = county;
        if (availability) whereClause.availability = availability;
        if (minRating) whereClause.rating = { [Op.gte]: minRating };

        const caregivers = await CaregiverProfile.findAll({
            where: whereClause,
            include: [{
                model: User,
                attributes: ['firstName', 'lastName', 'email', 'phone', 'profilePicture']
            }],
            order: [['rating', 'DESC']]
        });

        res.render('client/caregivers', {
            title: 'Browse Caregivers - TunzaCare',
            page: 'caregivers',
            caregivers,
            filters: req.query
        });
    } catch (error) {
        console.error('Caregivers error:', error);
        res.redirect('/client/dashboard');
    }
});

// View caregiver profile
router.get('/caregiver/:id', isAuthenticated, isClient, async (req, res) => {
    try {
        const caregiver = await CaregiverProfile.findByPk(req.params.id, {
            include: [{
                model: User,
                attributes: ['firstName', 'lastName', 'email', 'phone', 'profilePicture']
            }]
        });

        if (!caregiver) {
            req.flash('error_msg', 'Caregiver not found');
            return res.redirect('/client/caregivers');
        }

        // Get reviews
        const reviews = await Review.findAll({
            where: { caregiverId: req.params.id, isVerified: true },
            include: [{
                model: User,
                as: 'ClientReviews',
                attributes: ['firstName', 'lastName', 'profilePicture']
            }],
            order: [['createdAt', 'DESC']]
        });

        res.render('client/caregiver-profile', {
            title: `${caregiver.User.firstName}'s Profile - TunzaCare`,
            page: 'caregivers',
            caregiver,
            reviews
        });
    } catch (error) {
        console.error('Caregiver profile error:', error);
        res.redirect('/client/caregivers');
    }
});

// Submit review
router.post('/review/:caregiverId', isAuthenticated, isClient, async (req, res) => {
    try {
        const { rating, comment } = req.body;

        await Review.create({
            clientId: req.session.userId,
            caregiverId: req.params.caregiverId,
            rating,
            comment,
            isVerified: true
        });

        // Update caregiver rating
        const caregiverReviews = await Review.findAll({
            where: { caregiverId: req.params.caregiverId, isVerified: true }
        });

        const avgRating = caregiverReviews.reduce((acc, review) => acc + review.rating, 0) / caregiverReviews.length;

        await CaregiverProfile.update({
            rating: avgRating,
            totalReviews: caregiverReviews.length
        }, {
            where: { id: req.params.caregiverId }
        });

        req.flash('success_msg', 'Review submitted successfully');
        res.redirect(`/client/caregiver/${req.params.caregiverId}`);
    } catch (error) {
        console.error('Review error:', error);
        req.flash('error_msg', 'Failed to submit review');
        res.redirect(`/client/caregiver/${req.params.caregiverId}`);
    }
});

// Payment page
router.get('/payment/:caregiverId', isAuthenticated, isClient, async (req, res) => {
    try {
        const caregiver = await CaregiverProfile.findByPk(req.params.caregiverId, {
            include: [{
                model: User,
                attributes: ['firstName', 'lastName']
            }]
        });

        res.render('client/payment', {
            title: 'Payment - TunzaCare',
            page: 'payment',
            caregiver
        });
    } catch (error) {
        console.error('Payment page error:', error);
        res.redirect('/client/dashboard');
    }
});

module.exports = router;