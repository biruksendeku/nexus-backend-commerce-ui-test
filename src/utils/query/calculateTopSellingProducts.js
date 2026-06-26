

// import packages
const Order = require('../../models/order');

const calculateTopSellingProducts = async (req) => {

		return await Order.aggregate([
			{ $match: { status: 'completed' } },
			{ $unwind: '$items' },
			{ $group: {
			    _id: '$items.productId',
			    count: { $sum: '$items.quantity' },
				totalRevenue: { $sum: '$items.price' }
			}},
			{ $sort: { count: -1 } },
			{ $limit: Number(process.env.TOP_SELLING_PRODUCTS) },
			{ $lookup: {
				from: 'products',
				localField: '_id',
				foreignField: '_id',
				as: 'productDetails'
			}},
			{ $unwind: '$productDetails' }
		]).exec({ signal: req.signal });
};



// export the function
module.exports = calculateTopSellingProducts;
