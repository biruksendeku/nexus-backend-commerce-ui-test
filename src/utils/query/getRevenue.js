

// import the model
const Order = require('../../models/order');

// reusable function to calculate revenue efficiently
const getRevenue = async (match, signal) => {
  const [result] = await Order.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: '$total' } } },   // ✅ changed totalAmount → total
  ]).exec({ signal });
  return result?.total || 0;
};


// export the function
module.exports = getRevenue;
