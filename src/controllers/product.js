

// import custom modules
const User = require('../models/user');
const Product = require('../models/product');
const Order = require('../models/order');

const buildSearchQuery = require('../utils/query/buildSearchQuery');
const buildSort = require('../utils/query/buildSort');
const buildFilter = require('../utils/query/buildFilter');

const withAbortCheck = require('../utils/helpers/abortCheck');

const {
	NotFoundError,
	BadRequestError
} = require('../middlewares/errors/customErrors');




/* ==================================================
   ==================================================
                   * GET-PRODUCTS
   ==================================================
   ================================================== */
exports.products = async (req, res) => {
  const guard = withAbortCheck(req);
  const { page = 1, limit = 10, sort: sortBy } = req.query;

  const filter = buildFilter(req.query);
  const sort = buildSort(sortBy);

  guard.check();

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  const [products, totalCount] = await Promise.all([
    Product.find(filter)
      .sort(sort)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .select('-__v') // excluding unnecessary fields
      .lean(),
    Product.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalCount / limitNum);

  // check client connection before response
  guard.check();

  // send json response
  res.status(200).json({
    success: true,
    data: products,
    pagination: {
      page: pageNum,
      limit: limitNum,
      totalItems: totalCount,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    },
  });
};



/* ==================================================
   ==================================================
                   * ADD-TO-CART
   ==================================================
   ================================================== */
exports.addToCart = async (req, res) => {


		// passing req to extract and check signal with the client
		const guard = withAbortCheck(req);

		// add product to cart using it's unique mongoose given id
		const productId = req.params.id.trim().toString();
		const { quantity } = req.body;
		const product = await Product.findById(productId);

		// check product existance
		if(!product) {
			throw new NotFoundError('Product');
		}

		if(product.quantity <= 0) {
			throw new BadRequestError('Product out of stock');
		}

		// initialize cart if doesn't exist
		if(!req.session.cart) {
			req.session.cart = [];
		}

		// check exusting product to simply add number on the item
		const existingProduct = req.session.cart.find(item => item.id === productId);

		if(existingProduct) {
			// check if 1 additional would make it "out of stock"
			if(existingProduct.quantity + 1 > product.quantity) {
				throw new BadRequestError('Product out of stock');
			}
			// add 1 to the existing one in one add to cart click
			existingProduct.quantity += 1;

		// for newly added product
		} else {
			req.session.cart.push({
				id: product._id,
				name: product.name,
				price: product.price,
				quantity: quantity || 1, // for the very first click
				
				// choosing the first image from the list or default to the demo one
				imageUrl: product.images && product.images[0] ? product.images[0] : '/images/default-product-image.jpg'
			});
		}

		// save session
		req.session.save();

		// check connection to prevent response if aborted
		guard.check();

		// send json response
		res.status(201).json({
			success: true,
			message: 'Item added to cart',
			cartCount: req.session.cart.reduce((total, item) => total + item.quantity, 0)
		});
};



/* ==================================================
   ==================================================
                   * GET-CART
   ==================================================
   ================================================== */
exports.cart = async (req, res) => {

		// passing req to extract and check signal with the client
		const guard = withAbortCheck(req);


		const cart = req.session.cart || [];

		// check cart existance
		if(!cart || cart.length === 0) {
			return res.status(204).json({
				success: false,
				cart: [],
				total: 0,
				message: 'Looks like your cart is empty'
			});
		}
		
		const total = cart.reduce((sum, product) => {
			return sum + (product.price * product.quantity);
		}, 0); // initial price can be set to any number that's to be added on the price the customer pays


		// check client connection to prevent response if aborted
		guard.check();


		// send json response
		res.status(200).json({
			success: true,
			cart: cart,
			total: total,
			message: 'Your cart'
		});
};



/* ==================================================
   ==================================================
                   * UPDATE-CART
   ==================================================
   ================================================== */
exports.updateCart = async (req, res) => {


		const productId = req.params.id;
		const { quantity } = req.body;

		// check product existance
		const product = await Product.findById(productId);
		if(!product) {
			throw new NotFoundError('Product');
		}

		// initialize cart if there isn't - using express-session library
		if(!req.session.cart) {
			req.session.cart = [];
		}

		// find product index
		const productIndex = req.session.cart.findIndex(item => item.id === productId);
		if(productIndex !== -1) {
			if(quantity <= 0) {
				// remove if given negative or 0 quantity
				req.session.cart.splice(productIndex, 1);
				return res.status(204).json({
					success: true,
					message: 'Item removed from cart'
				});
			} else {
				// check stock from database
				const productItem = await Product.findById(productId);
				if(productItem && quantity > productItem.quantity) {
					throw new BadRequestError(`Only ${productItem.quantity} available in stock`);
				}
				req.session.cart[productIndex].quantity = quantity;

				// send json response
				res.status(200).json({
					success: true,
					message: 'Cart updated successfully'
				});
			}
		}

		// save session
		req.session.save();
};



/* ==================================================
   ==================================================
                   * REMOVE-FROM-CART
   ==================================================
   ================================================== */
exports.removeFromCart = async (req, res) => {

		// passing req to extract and check signal with the client
		const guard = withAbortCheck(req);


		const productId = req.params.id;

		const product = await Product.findById(productId);

		// check product existance
		if(!product) {
			throw new NotFoundError('Product');
		}

		if(req.session.cart) {
			req.session.cart = req.session.cart.filter(item => item.id !== productId);
			req.session.save();
			return res.status(200).json({
				success: true,
				message: 'Item removed from cart'
			});
		}

		// check client connection to prevent response if aborted
		guard.check();


		// if there was't cart in the first place
		// initialize one with empty values
		req.session.cart = [];

		// let them know
		res.status(200).json({
			success: true,
			message: 'Looks like your cart is empty'
		});
};



/* ==================================================
   ==================================================
                   * GET-ORDER-HISTORY
   ==================================================
   ================================================== */
exports.orderHistory = async (req, res) => {

		// passing req to extract and check signal with the client
		const guard = withAbortCheck(req);


		const userId = req.user._id;

		// get all orders for this user - sorted from NEWEST first
		const orders = await Order.find({ user: userId })
			.populate('user', 'name email') // user details
			.populate('items.product', 'name price') // product details
			.sort({ createdAt: -1 }) // newest first
			.exec({ signal: req.signal });

		// check orders existance
		if(!orders) {
			return res.status(204).json({
				success: true,
				message: 'Looks like you have no order history'
			});
		}

		// check client connection to prevent response if aborted
		guard.check();

		// send json response
		res.status(200).json({
			success: true,
			message: 'Your journey with us',
			orders: orders,
			user: req.user
		});
};



/* ==================================================
   ==================================================
                   * GET-SINGLE-ORDER-HISTORY
   ==================================================
   ================================================== */
exports.singleOrderHistory = async (req, res) => {

		// passing req to extract and check signal with the client
		const guard = withAbortCheck(req);


		const orderId = req.params.id.trim().toString();
		const userId = req.user._id;

		// check client status
		guard.check();

		// find that specific order
		const order = await Order.findOne({
			_id: orderId,
			user: userId
		}).populate('items.product', 'name images price category')
		.exec({ signal: req.signal });

		// check order existance
		if(!order) {
			throw new NotFoundError('Order');
		}

		// check client connection
		guard.check();

		// send json response
		res.status(200).json({
			success: true,
			order,
			message: 'Your order details'
		});
};



/* ==================================================
   ==================================================
                   * ADD-TO-WISHLIST
   ==================================================
   ================================================== */
exports.addToWishlist = async (req, res) => {

		// passing req to extract and check signal with the client
		const guard = withAbortCheck(req);


		const productId = req.params.id.trim().toString();
		const userId = req.user._id;

		// find the product
		const product = await Product.findById(productId);
		if(!product) {
			throw new NotFoundError('Product');
		}

		// check client status
		guard.check();

		// find user && add the productv id to the user object
		const user = await User.findById(userId);
		user.wishlist.push(product._id);
		await user.save();

		// check client connection to prevent response if aborted
		guard.check();

		// send json response
		res.status(201).json({
			success: true,
			product,
			message: 'Product added to wishlist'
		});
};
