const express = require('express');
const transactionsRouter = express.Router();
const TransactionService = require('./transaction-service');
const bodyParser = express.json();
const path = require('path');
const { requireAuth } = require('../basic-auth');

//what does this do?
const serializeTransaction = (transaction) => ({
  id: transaction.id,
  venue: transaction.venue,
  amount: transaction.amount,
  comments: transaction.comments,
  categoryId: transaction.category_id,
});

transactionsRouter
  .route('/')
  .all(requireAuth)
  .get((req, res, next) => {
    TransactionService.getAllTransactions(req.app.get('db'), req.user.id)
      .then((transactions) => {
        res.json(transactions.map(serializeTransaction));
      })
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    const { venue, amount, category_id } = req.body;
    const newTransaction = { venue, amount, category_id };

    for (const [key, value] of Object.entries(newTransaction))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`,
        });

    // Add user_id to the transaction
    newTransaction.user_id = req.user.id;

    TransactionService.insertTransaction(req.app.get('db'), newTransaction)
      .then((transaction) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${transaction.id}`))
          .json(serializeTransaction(transaction));
      })
      .catch(next);
  });

transactionsRouter
  .route('/:transactionId')
  .all(requireAuth)
  .all((req, res, next) => {
    TransactionService.getTransactionById(req.app.get('db'), req.params.transactionId)
      .then((transaction) => {
        if (!transaction) {
          return res.status(404).json({
            error: { message: `Transaction does not exist` },
          });
        }
        res.transaction = transaction;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeTransaction(res.transaction));
  })
  .delete((req, res, next) => {
    TransactionService.deleteTransaction(req.app.get('db'), req.params.transactionId)
      .then((numRowsAffected) => {
        res.status(202).json({ info: { numRowsAffected: numRowsAffected } });
      })
      .catch(next);
  })

  .patch(bodyParser, (req, res, next) => {
    const { venue, amount, comments } = req.body;
    const transactionToUpdate = { venue, amount, comments };

    TransactionService.updateTransaction(req.app.get('db'), req.params.transactionId, transactionToUpdate)
      .then((numRowsAffected) => {
        res.status(204).json({ info: { numRowsAffected: numRowsAffected } });
      })
      .catch(next);
  });

module.exports = transactionsRouter;
