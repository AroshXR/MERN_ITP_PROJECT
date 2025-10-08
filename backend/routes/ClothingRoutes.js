const express = require('express');
const router = express.Router();
const controller = require('../controllers/ClothingController');

router.get('/', controller.getAll);
router.post('/report', controller.report);
router.post('/sales-timeseries', controller.salesTimeSeries);
router.post('/', controller.create);
router.get('/:id', controller.getById);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);
router.post('/:id/reviews', controller.addReview);

module.exports = router;


