
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const auth = require('../middleware/auth');

router.get('/', auth, cartController.getCart);
router.post('/add', auth, cartController.addToCart);
router.patch('/update/:productId', auth, cartController.updateCartItem);
router.delete('/remove/:productId', auth, cartController.removeFromCart);
router.delete('/clear', auth, cartController.clearCart);
router.put('/', auth, cartController.updateCart);

module.exports = router;
