require('dotenv').config();
const knex = require('knex');
const app = require('./app');
const { PORT, DATABASE_URL } = require('./config');

const db = knex({
  client: 'pg',
  connection: {
    connectionString: DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  },
});

app.set('db', db);

// Test database connection and create tables
async function setupDatabase() {
  try {
    await db.raw('SELECT NOW()');
    console.log('✅ Database connected successfully');

    // Check if we need to recreate tables (only if schema is wrong)
    const needsRecreation = await checkSchemaNeedsUpdate();
    if (needsRecreation) {
      console.log('🔄 Schema needs update, recreating tables...');
      await dropTables();
      await createTables();
    } else {
      console.log('✅ Database schema is up to date');
      await createTables(); // This will skip existing tables
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

async function checkSchemaNeedsUpdate() {
  try {
    // Check if transactions table has the correct columns
    const hasTransactionsTable = await db.schema.hasTable('transactions');
    if (!hasTransactionsTable) {
      return true; // Need to create tables
    }

    // Check if transactions table has 'venue' column (new schema)
    const columns = await db('transactions').columnInfo();
    const hasVenueColumn = 'venue' in columns;
    const hasDescriptionColumn = 'description' in columns;

    // If it has 'description' but not 'venue', schema needs update
    if (hasDescriptionColumn && !hasVenueColumn) {
      console.log('⚠️  Old schema detected (has description, missing venue)');
      return true;
    }

    return false; // Schema is correct
  } catch (error) {
    console.log('⚠️  Could not check schema, assuming recreation needed');
    return true;
  }
}

async function dropTables() {
  try {
    // Drop tables in reverse order (due to foreign key constraints)
    await db.schema.dropTableIfExists('transactions');
    await db.schema.dropTableIfExists('categories');
    await db.schema.dropTableIfExists('login');
    await db.schema.dropTableIfExists('users');
    console.log('✅ Tables dropped successfully');
  } catch (error) {
    console.error('❌ Error dropping tables:', error.message);
  }
}

async function createTables() {
  try {
    // Users table
    const hasUsersTable = await db.schema.hasTable('users');
    if (!hasUsersTable) {
      await db.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string('name', 50);
        table.text('email').notNullable();
        table.timestamp('joined').notNullable();
        table.timestamps(true, true);
      });
      console.log('✅ Users table created');
    } else {
      console.log('✅ Users table already exists');
    }

    // Login table (for authentication)
    const hasLoginTable = await db.schema.hasTable('login');
    if (!hasLoginTable) {
      await db.schema.createTable('login', (table) => {
        table.increments('id').primary();
        table.string('hash', 100);
        table.text('email').notNullable();
        table.timestamps(true, true);
      });
      console.log('✅ Login table created');
    } else {
      console.log('✅ Login table already exists');
    }

    // Categories table
    const hasCategoriesTable = await db.schema.hasTable('categories');
    if (!hasCategoriesTable) {
      await db.schema.createTable('categories', (table) => {
        table.increments('id').primary();
        table.string('name', 50).notNullable();
        table.string('type').notNullable(); // 'income' or 'expense'
        table.integer('user_id').references('id').inTable('users').onDelete('SET NULL');
        table.timestamps(true, true);
      });
      console.log('✅ Categories table created');
    } else {
      console.log('✅ Categories table already exists');
    }

    // Transactions table
    const hasTransactionsTable = await db.schema.hasTable('transactions');
    if (!hasTransactionsTable) {
      await db.schema.createTable('transactions', (table) => {
        table.increments('id').primary();
        table.string('venue', 50).notNullable();
        table.decimal('amount', 10, 2).notNullable();
        table.text('comments');
        table.integer('category_id').references('id').inTable('categories');
        table.integer('user_id').references('id').inTable('users').onDelete('SET NULL');
        table.timestamps(true, true);
      });
      console.log('✅ Transactions table created');
    } else {
      console.log('✅ Transactions table already exists');
    }

    console.log('✅ Database setup complete!');
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
  }
}

setupDatabase();

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
