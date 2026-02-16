const { Sequelize, DataTypes } = require('sequelize');

// Support both DATABASE_URL (for Neon) and individual config variables
let sequelizeConfig;

if (process.env.DATABASE_URL) {
    // Use DATABASE_URL for Neon and cloud deployments
    sequelizeConfig = {
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: process.env.NODE_ENV === 'production' ? 10 : 20,
            min: 0,
            acquire: 60000,
            idle: 10000
        },
        define: {
            timestamps: true,
            underscored: true,
            freezeTableName: true
        },
        dialectOptions: {
            ssl: process.env.NODE_ENV === 'production' ? {
                require: true,
                rejectUnauthorized: false
            } : false
        }
    };
} else {
    // Use individual config variables for local development
    sequelizeConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 20,
            min: 0,
            acquire: 60000,
            idle: 10000
        },
        define: {
            timestamps: true,
            underscored: true,
            freezeTableName: true
        }
    };
}

const sequelize = new Sequelize(
    process.env.DATABASE_URL || `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'tunzacare_db'}`,
    sequelizeConfig
);

// Test the connection
sequelize.authenticate()
    .then(() => console.log('✅ PostgreSQL connection established successfully'))
    .catch(err => console.error('❌ Unable to connect to PostgreSQL:', err));

// User Model
const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    firstName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: { notEmpty: true }
    },
    lastName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: { notEmpty: true }
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: { notEmpty: true }
    },
    idNumber: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        validate: { notEmpty: true }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    userType: {
        type: DataTypes.ENUM('client', 'caregiver', 'admin'),
        allowNull: false,
        defaultValue: 'client'
    },
    profilePicture: {
        type: DataTypes.STRING(255),
        defaultValue: 'default-avatar.png'
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    lastLogin: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'users',
    timestamps: true,
    indexes: [
        { unique: true, fields: ['email'] },
        { unique: true, fields: ['id_number'] },
        { fields: ['user_type'] }
    ]
});

// Caregiver Profile Model
const CaregiverProfile = sequelize.define('CaregiverProfile', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    bio: {
        type: DataTypes.TEXT
    },
    experienceYears: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: { min: 0, max: 50 }
    },
    specialization: {
        type: DataTypes.ENUM('childcare', 'elderly', 'disability', 'special_needs', 'general'),
        defaultValue: 'general'
    },
    certifications: {
        type: DataTypes.JSONB,
        defaultValue: []
    },
    languages: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: ['English', 'Swahili']
    },
    hourlyRate: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        validate: { min: 0 }
    },
    availability: {
        type: DataTypes.ENUM('full_time', 'part_time', 'on_call'),
        defaultValue: 'full_time'
    },
    location: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    county: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    verificationStatus: {
        type: DataTypes.ENUM('pending', 'verified', 'rejected'),
        defaultValue: 'pending'
    },
    subscriptionStatus: {
        type: DataTypes.ENUM('active', 'expired', 'none'),
        defaultValue: 'none'
    },
    subscriptionExpiry: {
        type: DataTypes.DATE
    },
    rating: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0.00,
        validate: { min: 0, max: 5 }
    },
    totalReviews: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: { min: 0 }
    }
}, {
    tableName: 'caregiver_profiles',
    timestamps: true,
    indexes: [
        { fields: ['user_id'] },
        { fields: ['county'] },
        { fields: ['specialization'] },
        { fields: ['verification_status'] }
    ]
});

// Client Profile Model
const ClientProfile = sequelize.define('ClientProfile', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    preferredLocation: {
        type: DataTypes.STRING(100)
    },
    careTypeNeeded: {
        type: DataTypes.ENUM('childcare', 'elderly', 'disability', 'special_needs', 'general')
    },
    budgetRange: {
        type: DataTypes.STRING(50)
    }
}, {
    tableName: 'client_profiles',
    timestamps: true,
    indexes: [
        { fields: ['user_id'] }
    ]
});

// Review Model
const Review = sequelize.define('Review', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    clientId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    caregiverId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 5 }
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'reviews',
    timestamps: true,
    indexes: [
        { fields: ['client_id'] },
        { fields: ['caregiver_id'] }
    ]
});

// Subscription Model
const Subscription = sequelize.define('Subscription', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    planType: {
        type: DataTypes.ENUM('monthly', 'quarterly', 'yearly'),
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('active', 'expired', 'cancelled'),
        defaultValue: 'active'
    },
    transactionId: {
        type: DataTypes.STRING(100),
        unique: true
    }
}, {
    tableName: 'subscriptions',
    timestamps: true,
    indexes: [
        { fields: ['user_id'] },
        { fields: ['status'] }
    ]
});

// Payment Model
const Payment = sequelize.define('Payment', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    currency: {
        type: DataTypes.STRING(3),
        defaultValue: 'KES'
    },
    paymentMethod: {
        type: DataTypes.ENUM('mpesa', 'card', 'bank'),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed'),
        defaultValue: 'pending'
    },
    transactionId: {
        type: DataTypes.STRING(100),
        unique: true
    },
    description: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'payments',
    timestamps: true,
    indexes: [
        { fields: ['user_id'] },
        { fields: ['transaction_id'] }
    ]
});

// Define relationships
User.hasOne(CaregiverProfile, { foreignKey: 'userId' });
CaregiverProfile.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(ClientProfile, { foreignKey: 'userId' });
ClientProfile.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Review, { foreignKey: 'clientId', as: 'ClientReviews' });
Review.belongsTo(User, { foreignKey: 'clientId', as: 'Client' });

User.hasMany(Review, { foreignKey: 'caregiverId', as: 'CaregiverReviews' });
Review.belongsTo(User, { foreignKey: 'caregiverId', as: 'Caregiver' });

User.hasMany(Subscription, { foreignKey: 'userId' });
Subscription.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Payment, { foreignKey: 'userId' });
Payment.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
    sequelize,
    User,
    CaregiverProfile,
    ClientProfile,
    Review,
    Subscription,
    Payment
};