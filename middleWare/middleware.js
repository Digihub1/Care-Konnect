const bcrypt = require('bcryptjs');
const { User } = require('../models/database');

// Authentication middleware
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    req.flash('error_msg', 'Please login to access this page');
    res.redirect('/login');
};

const isClient = (req, res, next) => {
    if (req.session && req.session.userType === 'client') {
        return next();
    }
    req.flash('error_msg', 'Access denied. Client access only.');
    res.redirect('/');
};

const isCaregiver = (req, res, next) => {
    if (req.session && req.session.userType === 'caregiver') {
        return next();
    }
    req.flash('error_msg', 'Access denied. Caregiver access only.');
    res.redirect('/');
};

const isAdmin = (req, res, next) => {
    if (req.session && req.session.userType === 'admin') {
        return next();
    }
    req.flash('error_msg', 'Access denied. Admin access only.');
    res.redirect('/');
};

// Password hashing with increased salt rounds
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(12);
    return await bcrypt.hash(password, salt);
};

// Password comparison
const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

// Validate password strength
const validatePasswordStrength = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);

    if (password.length < minLength) {
        return { valid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!hasUpperCase) {
        return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!hasLowerCase) {
        return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!hasNumbers) {
        return { valid: false, message: 'Password must contain at least one number' };
    }
    if (!hasSpecialChar) {
        return { valid: false, message: 'Password must contain at least one special character (!@#$%^&*)' };
    }

    return { valid: true, message: 'Password is strong' };
};

module.exports = {
    isAuthenticated,
    isClient,
    isCaregiver,
    isAdmin,
    hashPassword,
    comparePassword,
    validatePasswordStrength
};