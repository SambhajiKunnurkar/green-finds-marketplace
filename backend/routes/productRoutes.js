
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getAllProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/eco-alternatives', productController.getEcoAlternatives);
router.get('/:id', productController.getProductById);
router.get('/alternatives/:id', productController.getAlternatives);

module.exports = router;
