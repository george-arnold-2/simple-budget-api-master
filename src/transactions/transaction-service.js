const TransactionService = {
  getAllTransactions(knex, userId) {
    return knex.select('*').from('transactions').where('user_id', userId);
  },
  insertTransaction(knex, newTransaction) {
    return knex
      .insert(newTransaction)
      .into('transactions')
      .returning('*')
      .then((rows) => {
        return rows[0];
      });
  },
  getTransactionById(knex, transactionId) {
    return knex.from('transactions').select('*').where('id', transactionId).first();
  },
  deleteTransaction(knex, id) {
    return knex('transactions').where({ id }).delete();
  },
  updateTransaction(knex, id, newTransaction) {
    return knex('transactions').where({ id }).update(newTransaction);
  },
};

module.exports = TransactionService;
