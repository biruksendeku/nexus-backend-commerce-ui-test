

// import packages
const mongoose = require('mongoose');


// create schema
const errorLogSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  stack: String,
  statusCode: Number,
  method: String,
  path: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  body: Object,
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });


// Index for faster queries
errorLogSchema.index({ createdAt: -1 });
errorLogSchema.index({ statusCode: 1 });


// export the model
module.exports = mongoose.model('ErrorLog', errorLogSchema);
