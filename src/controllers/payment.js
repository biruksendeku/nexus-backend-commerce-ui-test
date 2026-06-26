

// import packages
const stripe = require('../config/payment/stripe');
const {
	handleCheckoutCompleted,
	handlePaymentFailed,
	handleRefund
} = require('../utils/payment/webhookHandlers');

const User = require('../models/user');
const Product = require('../models/product');
const Order = require('../models/order');

const withAbortCheck = require('../utils/helpers/abortCheck');
const { BadRequestError, NotFoundError, AppError } = require('../middlewares/errors/customErrors');



/* ===================================================
   ===================================================
                   * CREATE-PAYMENT
   ===================================================
   =================================================== */
exports.createPayment = async (req, res) => {
  const guard = withAbortCheck(req);
  
  const { items, shippingAddress } = req.body;
  const userId = req.user?._id; // passport attaches user to req
  
  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new BadRequestError('Cart is empty');
  }
  
  // critical checkpoint before database operations
  guard.check();
  
  // validate and calculate prices
  let subtotal = 0;
  const lineItems = [];
  const orderItems = [];
  
  for (const item of items) {
    const product = await Product.findById(item.productId).exec({ signal: req.signal });
    
    if (!product) {
      throw new NotFoundError(`Product ${item.productId}`);
    }
    
    if (product.status === 'out of stock') {
      throw new BadRequestError(`${product.name} is out of stock`);
    }
    
    if (product.quantity < item.quantity) {
      throw new BadRequestError(`Only ${product.quantity} units of ${product.name} available`);
    }
    
    const itemTotal = product.price * item.quantity;
    subtotal += itemTotal;
    
    // prepare Stripe line items
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: product.name,
          images: [product.images[0].url] || '',
          metadata: {
            productId: product._id.toString()
          }
        },
        unit_amount: Math.round(product.price * 100), // convert to cents
      },
      quantity: item.quantity,
    });
    
    // prepare order items for database
    orderItems.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      image: product.images[0].url || ''
    });
  }
  
  // calculate totals
  const shippingCost = 0; // free shipping or calculate based on logic
  const tax = Math.round(subtotal * Number(process.env.TAX_PERCENT)) / 100;
  const total = subtotal + shippingCost + tax;
  
  // create pending order first
  const order = new Order({
    user: userId,
    items: orderItems,
    subtotal,
    shippingCost,
    tax,
    total,
    shippingAddress: shippingAddress || {},
    orderStatus: 'pending',
    paymentStatus: 'pending'
  });
  
  // checkpoint before Stripe API call
  guard.check();
  
  // create Stripe session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: lineItems,
    
    // attach metadata for webhook
    metadata: {
      orderId: order._id.toString(),
      userId: userId.toString()
    },
    
    // customer info
    customer_email: req.user.email,
    
    // URLs to be returned
    success_url: `${process.env.FRONTEND_URL}/api/payment/success`,
    cancel_url: `${process.env.FRONTEND_URL}/api/payment/cancel`,
  });
  
  // save Stripe session ID to order
  order.stripeSessionId = session.id;
  await order.save();
  
  // checkpoint before sending response
  guard.check();
  
  res.status(200).json({
    success: true,
    sessionId: session.id,
    url: session.url,
    orderId: order._id
  });
};



/* ===================================================
   ===================================================
                   * POST-WEBHOOK
   ===================================================
   =================================================== */
exports.webhookController = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  if (!sig) {
    throw new BadRequestError('Missing Stripe signature');
  }
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    throw new BadRequestError(`Webhook Error: ${err.message}`);
  }
  
  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object);
      break;
      
    case 'payment_intent.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
      
    case 'charge.refunded':
      await handleRefund(event.data.object);
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  
  // always respond with 200 to acknowledge receipt
  res.status(200).json({ received: true });
};
