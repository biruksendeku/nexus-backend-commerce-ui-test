

// import packages
const mongoose = require('mongoose');


// create item schema
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product reference is required']
  },
  name: {
    type: String,
    required: [true, 'Product name is required']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  image: {
  	type: String,
  	required: [true, 'Product image is required']
  }
});



// create order schema
const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
  },
  items: [orderItemSchema],
  
  // payment information
  stripeSessionId: {
    type: String,
    required: [true, 'Stripe session ID is required'],
  },
  paymentIntentId: String,
  
  // order status
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  
  // shipping information
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'USA' }
  },
  
  // price breakdown
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required']
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: [true, 'Total is required']
  },
  
  // timestamps for order lifecycle
  paidAt: Date,
  shippedAt: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  cancelReason: String,
  
  // customer notes
  notes: String
  
}, { timestamps: true });

// indexes for better query performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ stripeSessionId: 1 }, { unique: true });

// virtual for order age
orderSchema.virtual('orderAge').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// method to update payment status
orderSchema.methods.markAsPaid = async function(paymentIntentId) {
  this.paymentStatus = 'paid';
  this.paymentIntentId = paymentIntentId;
  this.paidAt = new Date();
  this.orderStatus = 'confirmed';
  return this.save();
};



// export the model
module.exports = mongoose.model('Order', orderSchema);
