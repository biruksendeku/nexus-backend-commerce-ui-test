

// import packages
const Order = require('../../models/order');
const Product = require('../../models/product');
const { AppError } = require('../../middlewares/errors/customErrors');
const emailService = require('../../services/emailService');



/*
 * Helper to retry failed operations
 */
const retry = async (fn, retries = Number(process.env.MAX_RETRIES) || 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => 
        setTimeout(resolve, (Number(process.env.RETRY_DELAY) || 1000) * (i + 1))
      );
    }
  }
};



/*
 * Handle completed checkouts
 */
async function handleCheckoutCompleted(session) {
  const { orderId, userId } = session.metadata;
  
  // use a database transaction for atomicity
  const session_db = await Order.startSession();
  
  try {
    await session_db.withTransaction(async () => {
      const order = await Order.findById(orderId).session(session_db);
      
      if (!order) {
        throw new AppError(`Order ${orderId} not found`, 404);
      }
      
      // idempotency check - prevent double processing
      if (order.paymentStatus === 'paid') {
        console.log(`[INFO] Order ${orderId} already processed - skipping`);
        return; // successfully handled, just duplicate webhook
      }
      
      // mark order as paid with retry logic
      await retry(async () => {
        order.paymentStatus = 'paid';
        order.paymentIntentId = session.payment_intent;
        order.paidAt = new Date();
        order.orderStatus = 'confirmed';
        await order.save({ session: session_db });
      });
      
      // update product stock atomically with retry
      for (const item of order.items) {
        await retry(async () => {
          const product = await Product.findById(item.product).session(session_db);
          
          if (!product) {
            throw new AppError(`Product ${item.product} not found`, 404);
          }
          
          // check stock availability
          if (product.quantity < item.quantity) {
            throw new AppError(`Insufficient stock for ${product.name}`, 400);
          }
          
          // atomic update
          await Product.findByIdAndUpdate(
            item.product,
            {
              $inc: {
                quantity: -item.quantity,
                purchaseCount: item.quantity
              },
              $push: { orderedBy: userId }
            },
            { session: session_db }
          );
        });
      }
      
      // populate user email before sending email
      await order.populate('user', 'email name');
      
      // send order confirmation email
      await emailService.sendOrderConfirmation(order);
      
      console.log(`[SUCCESS] Order ${orderId} processed successfully`);
    });
    
  } catch (error) {
    // log to monitoring service
    console.error('[CRITICAL] Failed to process checkout:', {
      orderId,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    throw error; // re-throw to trigger webhook retry from Stripe
    
  } finally {
    await session_db.endSession();
  }
}



/*
 * Handle failed payments
 */
async function handlePaymentFailed(paymentIntent) {
  try {
    const order = await Order.findOne({
      paymentIntentId: paymentIntent.id
    }).populate('user', 'email name'); // populating user
    
    if (order) {
      order.paymentStatus = 'failed';
      order.lastError = paymentIntent.last_payment_error?.message;
      await order.save();
      
      // notify user about failed payment
      await emailService.sendPaymentFailed(order);
      
      console.log(`[INFO] Payment failed for order ${order._id}`);
    }
  } catch (error) {
    console.error('[ERROR] Handle payment failure error:', {
      paymentIntentId: paymentIntent.id,
      error: error.message
    });
  }
}



/*
 * Handle refund
 */
async function handleRefund(charge) {
  try {
    const order = await Order.findOne({
      paymentIntentId: charge.payment_intent
    }).populate('user', 'email name'); // populating user
    
    if (order) {
      order.paymentStatus = 'refunded';
      order.orderStatus = 'cancelled';
      await order.save();
      
      // restore stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product,
          {
            $inc: { quantity: item.quantity }
          }
        );
      }
      
      // send refund confirmation email
      await emailService.sendRefundEmail(order);
      
      console.log(`[INFO] Refund processed for order ${order._id}`);
    }
  } catch (error) {
    console.error('[ERROR] Handle refund error:', {
      chargeId: charge.id,
      error: error.message
    });
  }
}



// export the configured helper functions
module.exports = {
  handleCheckoutCompleted,
  handlePaymentFailed,
  handleRefund
};
