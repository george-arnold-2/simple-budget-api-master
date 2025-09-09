const express = require('express');
const categoriesRouter = express.Router();
const CategoryService = require('./categories-service');
const bodyParser = express.json();
const { requireAuth } = require('../basic-auth');

const serializeCategory = category => ({
  id: category.id,
  name: category.name,
  user: category.user_id
});

categoriesRouter
  .route('/')
  .all(requireAuth)
  .get((req, res, next) => {
    CategoryService.getAllCategories(req.app.get('db'), req.user.id)
      .then(categories => {
        res.json(categories.map(serializeCategory));
      })
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    const { name } = req.body;
    const newCategory = { name };
    for (const [key, value] of Object.entries(newCategory))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });
    newCategory.user_id = req.user.id;
    CategoryService.insertCategory(req.app.get('db'), newCategory)
      .then(category => {
        res
          .status(201)
          .location(`${category.id}`)
          .json(serializeCategory(category));
      })
      .catch(next);
  });

categoriesRouter
  .route('/:categoryId')
  .all(requireAuth)
  .all((req, res, next) => {
    const { categoryId } = req.params;
    CategoryService.getById(req.app.get('db'), categoryId)
      .then(category => {
        res.category = category;
        next();
      })
      .catch(next);
  })
  .get((req, res) => {
    res.json(serializeCategory(res.category));
  })
  .delete((req, res, next) => {
    const { categoryId } = req.params;
    CategoryService.deleteCategory(req.app.get('db'), req.params.categoryId)
      .then(numRowsAffected => {
        res.status(202).json({ info: { numRowsAffected: numRowsAffected } }), end();
      })
      .catch(next);
  })
  .patch(bodyParser, (req, res, next) => {
    const { name } = req.body;
    const categoryToUpdate = { name };
    CategoryService.updateCategory(req.app.get('db'), req.params.categoryId, categoryToUpdate)
      .then(numRowsAffected => {
        res.status(202).end();
      })
      .catch(next);
  });

module.exports = categoriesRouter;
