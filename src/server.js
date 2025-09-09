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

    // Create tables if they don't exist
    await createTables();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

async function createTables() {
  try {
    // Categories table
    const hasCategoriesTable = await db.schema.hasTable('categories');
    if (!hasCategoriesTable) {
      await db.schema.createTable('categories', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('type').notNullable(); // 'income' or 'expense'
        table.timestamps(true, true);
      });
      console.log('✅ Categories table created');
    }

    // Transactions table
    const hasTransactionsTable = await db.schema.hasTable('transactions');
    if (!hasTransactionsTable) {
      await db.schema.createTable('transactions', (table) => {
        table.increments('id').primary();
        table.decimal('amount', 10, 2).notNullable();
        table.string('description');
        table.integer('category_id').references('id').inTable('categories');
        table.date('date').notNullable();
        table.timestamps(true, true);
      });
      console.log('✅ Transactions table created');
    }

    console.log('✅ Database setup complete!');
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
  }
}

setupDatabase();

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
