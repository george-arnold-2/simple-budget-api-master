const CategoryService = {
  getAllCategories(knex, userId) {
    return knex
      .select('*')
      .from('categories')
      .where('user_id', '=', userId);
  },

  insertCategory(knex, newCategory) {
    return knex
      .insert(newCategory)
      .into('categories')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },
  getById(knex, categoryId) {
    return knex
      .from('categories')
      .select('*')
      .where('id', categoryId)
      .first();
  },
  deleteCategory(knex, id) {
    return knex('categories')
      .where({ id })
      .delete();
  },
  updateCategory(knex, id, newCategory) {
    return knex('categories')
      .where({ id })
      .update(newCategory);
  }
};

module.exports = CategoryService;
