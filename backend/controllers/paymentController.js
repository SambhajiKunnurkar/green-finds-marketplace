
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Order = require('../models/Order');

exports.createCheckoutSession = async (req, res) => {
  try {
    const { orderId } = req.body;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Order #' + orderId,
              description: `Payment for order ${orderId}`,
            },
            unit_amount: Math.round(order.total * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/cart`,
    });

    // Create payment record
    const payment = new Payment({
      user: req.user._id,
      order: orderId,
      amount: order.total,
      stripePaymentId: session.id,
    });
    await payment.save();

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ message: 'Error creating checkout session' });
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === 'paid') {
      const payment = await Payment.findOne({ stripePaymentId: sessionId });
      if (payment) {
        payment.status = 'completed';
        await payment.save();
        
        // Update order status
        const order = await Order.findById(payment.order);
        if (order) {
          order.status = 'Processing';
          await order.save();
        }
      }
      res.json({ success: true });
    } else {
      res.status(400).json({ message: 'Payment not completed' });
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ message: 'Error confirming payment' });
  }
};
