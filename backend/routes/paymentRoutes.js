
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

router.post('/create-checkout-session', auth, paymentController.createCheckoutSession);
router.post('/confirm-payment', auth, paymentController.confirmPayment);

module.exports = router;
