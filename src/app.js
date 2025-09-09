require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const categoriesRouter = require('./categories/categories-router');
const transactionsRouter = require('./transactions/transaction-router');
const signinRouter = require('./signin/signin-router');

const app = express();

const morganOption = NODE_ENV === 'production' ? 'tiny' : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

// Add this root route
app.get('/', (req, res) => {
  res.json({
    message: 'Simple Budget API is running!',
    endpoints: {
      categories: '/api/categories',
      transactions: '/api/transactions',
      signin: '/api',
    },
  });
});

app.use('/api/categories', categoriesRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api', signinRouter);

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
