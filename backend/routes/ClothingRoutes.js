const express = require('express');
const router = express.Router();
const controller = require('../controllers/ClothingController');

// Public endpoints for outlet/inventory
router.get('/', controller.getAll);
router.get('/:id', controller.getById);

// Basic CRUD for managing inventory (could be protected later)
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;


