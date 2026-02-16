const express = require('express');
const router = express.Router();
const { User, CaregiverProfile, ClientProfile } = require('../models/database');
const { hashPassword, comparePassword } = require('../middleWare/middleware');
const { check, validationResult } = require('express-validator');
const { loginLimiter } = require('../server');

// Register routes
router.get('/register', (req, res) => {
    res.render('auth/register', {
        title: 'Register - TunzaCare',
        page: 'register'
    });
});

router.get('/register/caregiver', (req, res) => {
    res.render('auth/register-caregiver', {
        title: 'Caregiver Registration - TunzaCare',
        page: 'register'
    });
});

router.get('/register/client', (req, res) => {
    res.render('auth/register-client', {
        title: 'Client Registration - TunzaCare',
        page: 'register'
    });
});

// Handle registration
router.post('/register/caregiver', [
    check('firstName').notEmpty().withMessage('First name is required').trim(),
    check('lastName').notEmpty().withMessage('Last name is required').trim(),
    check('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    check('phone').notEmpty().withMessage('Phone number is required').trim(),
    check('idNumber').notEmpty().withMessage('ID number is required').trim(),
    check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    check('location').notEmpty().withMessage('Location is required').trim(),
    check('county').notEmpty().withMessage('County is required').trim()
], async (req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.render('auth/register-caregiver', {
            title: 'Caregiver Registration - TunzaCare',
            errors: errors.array(),
            formData: req.body
        });
    }

    try {
        const {
            firstName, lastName, email, phone, idNumber,
            password, location, county, specialization,
            experienceYears, bio
        } = req.body;

        // Validate password strength
        const { hashPassword, validatePasswordStrength } = require('../middleWare/middleware');
        const passwordCheck = validatePasswordStrength(password);
        if (!passwordCheck.valid) {
            req.flash('error_msg', passwordCheck.message);
            return res.render('auth/register-caregiver', {
                title: 'Caregiver Registration - TunzaCare',
                formData: req.body
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({
            where: { email }
        });

        if (existingUser) {
            req.flash('error_msg', 'Email already registered');
            return res.redirect('/register/caregiver');
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const user = await User.create({
            firstName,
            lastName,
            email,
            phone,
            idNumber,
            password: hashedPassword,
            userType: 'caregiver'
        });

        // Create caregiver profile
        await CaregiverProfile.create({
            userId: user.id,
            location,
            county,
            specialization: specialization || 'general',
            experienceYears: experienceYears || 0,
            bio: bio || ''
        });

        req.flash('success_msg', 'Registration successful! Please login.');
        res.redirect('/login');
    } catch (error) {
        console.error('Registration error:', error);
        req.flash('error_msg', 'Registration failed. Please try again.');
        res.redirect('/register/caregiver');
    }
});

// Login routes
router.get('/login', (req, res) => {
    res.render('auth/login', {
        title: 'Login - TunzaCare',
        page: 'login'
    });
});

router.post('/login', loginLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({
            where: { email }
        });

        if (!user) {
            req.flash('error_msg', 'Invalid credentials');
            return res.redirect('/login');
        }

        // Check password
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            req.flash('error_msg', 'Invalid credentials');
            return res.redirect('/login');
        }

        // Set session
        req.session.userId = user.id;
        req.session.userType = user.userType;
        req.session.user = {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            type: user.userType
        };

        // Update last login
        await user.update({ lastLogin: new Date() });

        // Redirect based on user type
        switch (user.userType) {
            case 'client':
                res.redirect('/client/dashboard');
                break;
            case 'caregiver':
                res.redirect('/caregiver/dashboard');
                break;
            case 'admin':
                res.redirect('/admin/dashboard');
                break;
            default:
                res.redirect('/');
        }
    } catch (error) {
        console.error('Login error:', error);
        req.flash('error_msg', 'Login failed. Please try again.');
        res.redirect('/login');
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;