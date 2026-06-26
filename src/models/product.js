

// import packages
const mongoose = require('mongoose');


// create schema
const productSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [ true, 'Product-Name field is required' ]
	},
	price: {
		type: Number,
		required: [ true, 'Product-Price is required' ]
	},
	quantity: {
		type: Number,
		required: [ true, 'Product-Quantity is required' ]
	},
	purchaseCount: {
		type: Number,
		default: 0
	},
	images: {
		type: Array,
		required: [ true, 'Product-Image is required' ]
	},
	category: {
		type: String,
		lowercase: true,
		required: [ true, 'Product category is required' ],
		enum: [ 'clothing', 'electronics', 'books', 'home', 'sports', 'beauty', 'toys', 'other' ]
	},
	productInfo: {
		type: String,
		required: [ true, 'Product information is required' ]
	},
	deliveryTime: {
		type: String,
		required: [ true, 'Product delivery-time is required' ]
	},
	status: {
		type: String,
		// if we give it default value we can ignore the required method
		required: [ true, 'Product current status is required' ],
		enum: [ 'in stock', 'out of stock', 'pre-order' ],
		default: 'in stock'
	},
	// to track ordering users
	orderedBy: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}]
}, { timestamps: true } ); // enabling mongoose native createdAt and updatedAt time-trackers



// Indexing for search functionality
productSchema.index({ name: 'text', category: 'text' });


// export the model
module.exports = mongoose.model('Product', productSchema);
