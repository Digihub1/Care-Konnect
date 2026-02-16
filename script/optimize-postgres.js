import { sequelize } from '../models/database';

async function optimizeDatabase() {
    let transaction;
    try {
        console.log('🔧 Optimizing PostgreSQL for TunzaCare...');
        
        // Verify connection and start transaction
        await sequelize.authenticate();
        transaction = await sequelize.transaction();
        
        // Prevent concurrent optimizations
        await sequelize.query('SELECT pg_advisory_xact_lock(123456)', { transaction });
        
        // Enable pg_trgm extension for text search indexes
        await sequelize.query('CREATE EXTENSION IF NOT EXISTS pg_trgm;', { transaction });

        // Create indexes for better performance
        await sequelize.query(`
            -- Index for frequently searched columns
            CREATE INDEX IF NOT EXISTS idx_caregivers_location ON caregiver_profiles USING gin(location gin_trgm_ops);
            CREATE INDEX IF NOT EXISTS idx_caregivers_county ON caregiver_profiles(county);
            CREATE INDEX IF NOT EXISTS idx_caregivers_rating ON caregiver_profiles(rating DESC);
            CREATE INDEX IF NOT EXISTS idx_caregivers_specialization ON caregiver_profiles(specialization);
            
            -- Partial indexes for active users
            CREATE INDEX IF NOT EXISTS idx_active_caregivers ON caregiver_profiles(id) 
            WHERE verification_status = 'verified' AND subscription_status = 'active';
            
            -- Index for text search in bios
CREATE INDEX IF NOT EXISTS idx_bio_search ON caregiver_profiles 
USING gin(to_tsvector('english', coalesce(bio, '')));
            
            -- Index for user searches
CREATE INDEX IF NOT EXISTS idx_user_email ON users USING gin(email gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_user_name ON users USING gin(
(coalesce(first_name, '') || ' ' || coalesce(last_name, '')) gin_trgm_ops
);
`, { transaction });
        
        await transaction.commit();
        transaction = null;

        // Update statistics (must run outside transaction)
        console.log('📊 Updating database statistics...');
        await sequelize.query('ANALYZE VERBOSE;');
        
        console.log('✅ PostgreSQL optimization complete!');
    } catch (error) {
        console.error('❌ Optimization error:', error.message);
        
        if (transaction) {
            try {
                await transaction.rollback();
                console.log('🔄 Optimization changes rolled back');
            } catch (rollbackError) {
                console.error('❌ Rollback failed:', rollbackError.message);
            }
        }
        
        throw error; // Re-throw to allow caller handling
    }
}

if (require.main === module) {
    optimizeDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

export default { optimizeDatabase };