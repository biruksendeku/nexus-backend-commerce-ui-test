

// import packages
const Product = require('../../models/product');
const { NotFoundError } = require('../../middlewares/errors/customErrors');


const loadProduct = async (req, res, next) => {
  const product = await Product.findById(req.params.id).lean();
  if (!product) throw new NotFoundError('Product');
  req.product = product;
  next();
};

// export the function
module.exports = loadProduct;
