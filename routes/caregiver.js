const express = require('express');
const router = express.Router();
const { isAuthenticated, isCaregiver } = require('../middleWare/middleware');
const { User, CaregiverProfile, Subscription, Payment, Review } = require('../models/database');

// Caregiver dashboard
router.get('/dashboard', isAuthenticated, isCaregiver, async (req, res) => {
    try {
        const user = await User.findByPk(req.session.userId, {
            include: [CaregiverProfile]
        });

        // Get recent reviews
        const reviews = await Review.findAll({
            where: { caregiverId: user.CaregiverProfile.id },
            include: [{
                model: User,
                as: 'ClientReviews',
                attributes: ['firstName', 'lastName']
            }],
            limit: 5,
            order: [['createdAt', 'DESC']]
        });

        res.render('caregiver/dashboard', {
            title: 'Caregiver Dashboard - TunzaCare',
            page: 'dashboard',
            user,
            reviews
        });
    } catch (error) {
        console.error('Caregiver dashboard error:', error);
        res.redirect('/');
    }
});

// Edit profile
router.get('/profile/edit', isAuthenticated, isCaregiver, async (req, res) => {
    try {
        const user = await User.findByPk(req.session.userId, {
            include: [CaregiverProfile]
        });

        res.render('caregiver/edit-profile', {
            title: 'Edit Profile - TunzaCare',
            page: 'profile',
            user
        });
    } catch (error) {
        console.error('Edit profile error:', error);
        res.redirect('/caregiver/dashboard');
    }
});

router.post('/profile/update', isAuthenticated, isCaregiver, async (req, res) => {
    try {
        const {
            bio, experienceYears, specialization,
            languages, hourlyRate, availability,
            location, county
        } = req.body;

        await CaregiverProfile.update({
            bio,
            experienceYears,
            specialization,
            languages,
            hourlyRate,
            availability,
            location,
            county
        }, {
            where: { userId: req.session.userId }
        });

        req.flash('success_msg', 'Profile updated successfully');
        res.redirect('/caregiver/dashboard');
    } catch (error) {
        console.error('Profile update error:', error);
        req.flash('error_msg', 'Failed to update profile');
        res.redirect('/caregiver/profile/edit');
    }
});

// Subscription management
router.get('/subscription', isAuthenticated, isCaregiver, async (req, res) => {
    try {
        const subscriptions = await Subscription.findAll({
            where: { userId: req.session.userId },
            order: [['createdAt', 'DESC']]
        });

        const currentSubscription = subscriptions.find(sub => sub.status === 'active');

        res.render('caregiver/subscription', {
            title: 'Subscription - TunzaCare',
            page: 'subscription',
            subscriptions,
            currentSubscription
        });
    } catch (error) {
        console.error('Subscription error:', error);
        res.redirect('/caregiver/dashboard');
    }
});

// Payment processing
router.post('/subscribe', isAuthenticated, isCaregiver, async (req, res) => {
    try {
        const { planType } = req.body;
        
        // Calculate amount and duration
        const planDetails = {
            monthly: { amount: 500, days: 30 },
            quarterly: { amount: 1400, days: 90 },
            yearly: { amount: 5000, days: 365 }
        };

        const plan = planDetails[planType];
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + plan.days);

        // Create subscription
        const subscription = await Subscription.create({
            userId: req.session.userId,
            planType,
            amount: plan.amount,
            startDate,
            endDate,
            status: 'active',
            transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        });

        // Update caregiver subscription status
        await CaregiverProfile.update({
            subscriptionStatus: 'active',
            subscriptionExpiry: endDate
        }, {
            where: { userId: req.session.userId }
        });

        // Create payment record
        await Payment.create({
            userId: req.session.userId,
            amount: plan.amount,
            paymentMethod: 'mpesa',
            status: 'completed',
            transactionId: subscription.transactionId,
            description: `${planType} subscription payment`
        });

        req.flash('success_msg', 'Subscription activated successfully');
        res.redirect('/caregiver/dashboard');
    } catch (error) {
        console.error('Subscription error:', error);
        req.flash('error_msg', 'Failed to process subscription');
        res.redirect('/caregiver/subscription');
    }
});

module.exports = router;