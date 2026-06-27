

// import packages
const User = require('../models/user');
const Product = require('../models/product');
const Order = require('../models/order');
const ErrorLog = require('../models/errorLog');
const cloudinary = require('../config/storage/cloudinary');
const buildFilter = require('../utils/query/buildFilter');
const buildSort = require('../utils/query/buildSort');
const calculateTopSellingProducts = require('../utils/query/calculateTopSellingProducts');
const getRevenue = require('../utils/query/getRevenue');
const comparison = require('../utils/math/compareData');
const timeline = require('../utils/date/timeline');
const withAbortCheck = require('../utils/helpers/abortCheck');
const {
  NotFoundError,
  BadRequestError,
} = require('../middlewares/errors/customErrors');




/*
  ====================================================
  ====================================================
                   * DASHBOARD
  ====================================================
  ====================================================*/
exports.dashboard = async (req, res) => {
  const guard = withAbortCheck(req);
  const daysAgo = Date.now() - Number(process.env.RECENT_DAY_AGE || 7) * 86400000;

  // counts + recent docs in parallel for better performance
  const [products, totalCustomers, totalProducts, inStock, outOfStock, recentUsers, recentOrders, pendingOrders, deliveredOrders, cancelledOrders] =
    await Promise.all([
      Product.find(),
      User.countDocuments(),
      Product.countDocuments(),
      Product.countDocuments({ status: 'in stock' }),
      Product.countDocuments({ status: 'out of stock' }),
      User.find({ createdAt: { $gte: daysAgo } }).sort({ createdAt: -1 }).lean().exec({ signal: req.signal }),
      Order.find({ createdAt: { $gte: daysAgo } }).sort({ createdAt: -1 }).lean().exec({ signal: req.signal }),
      Order.find({ orderStatus: 'pending' }).sort({ createdAt: 1 }).lean().exec({ signal: req.signal }),
      Order.find({ orderStatus: 'delivered' }).sort({ createdAt: 1 }).lean().exec({ signal: req.signal }),
      Order.find({ orderStatus: 'cancelled' }).sort({ createdAt: -1 }).lean().exec({ signal: req.signal }),
    ]);

  // Check client existence before sending response
  guard.check();

  // Revenue & orders in parallel
  const [todayRevenue, yesterdayRevenue, allTimeRevenue, todayOrders, yesterdayOrders, topSellingData] =
    await Promise.all([
      getRevenue({ paymentStatus: 'paid', createdAt: { $gte: timeline.today } }, req.signal),
      getRevenue({ paymentStatus: 'paid', createdAt: { $gte: timeline.yesterday, $lte: timeline.yesterdayEnd } }, req.signal),
      getRevenue({ paymentStatus: 'paid' }, req.signal),
      Order.find({ orderStatus: 'delivered', createdAt: { $gte: timeline.today } }).sort({ createdAt: -1 }).lean().exec({ signal: req.signal }),
      Order.find({ orderStatus: 'delivered', createdAt: { $gte: timeline.yesterday, $lte: timeline.yesterdayEnd } }).sort({ createdAt: -1 }).lean().exec({ signal: req.signal }),
      calculateTopSellingProducts(req),
    ]);

  // Check client existence before sending response
  guard.check();

  // Send json response
  res.status(200).json({
    success: true,
    data: {
      orders: {
        recent: recentOrders,
        pending: pendingOrders,
        cancelled: cancelledOrders,
        today: todayOrders,
        yesterday: yesterdayOrders,
        dailyChange: comparison(todayOrders.length, yesterdayOrders.length),
        topSelling: topSellingData,
      },
      revenue: {
        today: todayRevenue,
        yesterday: yesterdayRevenue,
        dailyChange: comparison(todayRevenue, yesterdayRevenue),
        allTime: allTimeRevenue,
      },
      products: {
      	products,
        total: totalProducts,
        inStock,
        outOfStock,
      },
      users: {
        total: totalCustomers,
        recent: recentUsers,
      },
    },
  });
};



/*
  ====================================================
  ====================================================
                   * GET ALL PRODUCTS
  ====================================================
  ====================================================*/
exports.getAllProducts = async (req, res) => {
  const guard = withAbortCheck(req);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const filter = buildFilter(req.query);
  const sort = buildSort(req.query.sort);

  // Check client existence before sending response
  guard.check();

  // Executing query in parallel for performance
  const [products, totalProducts, inStock, outOfStock, popular] = await Promise.all([
    Product.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec({ signal: req.signal }),
    Product.countDocuments(filter),
    Product.countDocuments({ status: 'in stock' }),
    Product.countDocuments({ status: 'out of stock' }),
    Product.countDocuments({ purchaseCount: { $gt: Number(process.env.POPULAR_PRODUCTS_SOLD || 10) } }),
  ]);

  // Check client existence before sending response
  guard.check();

  // Send json response
  res.status(200).json({
    success: true,
    data: products,
    stats: {
      total: totalProducts,
      inStock,
      outOfStock,
      popular,
    },
    pagination: {
      page,
      limit,
      totalItems: totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      hasNextPage: page < Math.ceil(totalProducts / limit),
      hasPrevPage: page > 1,
    },
  });
};



/*
  ====================================================
  ====================================================
                   * GET ONE PRODUCT
  ====================================================
  ====================================================*/
exports.getOneProduct = async (req, res) => {
  const guard = withAbortCheck(req);
  const product = await Product.findById(req.params.id).lean();

  // Check product existence
  if (!product) throw new NotFoundError('Product');

  // Check client existence before sending response
  guard.check();

  // Send json response
  res.status(200).json({
    success: true,
    data: product,
  });
};



/*
  ====================================================
  ====================================================
                   * GET ALL ORDERS
  ====================================================
  ====================================================*/
exports.getAllOrders = async (req, res) => {
  const guard = withAbortCheck(req);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sort = buildSort(req.query.sort);

  // build filter - order specific
  const filter = {};
  
  if (req.query.status) {
    filter.orderStatus = req.query.status;
  }

  // check client status
  guard.check();

  // parallel calculation for better performance
  const [orders, totalOrders] = await Promise.all([
    Order.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'name email')
      .lean()
      .exec({ signal: req.signal }),
    Order.countDocuments(filter),
  ]);

  // check client existence
  guard.check();

  // order filter helper - fallback to {} when no filter
  const matchForAnalytics = filter.orderStatus
    ? { orderStatus: filter.orderStatus }
    : {};
  
  // const todayOrders = await Order.countDocuments({ ...matchForAnalytics, createdAt: { $gte: timeline.today } });

  // Time-based counts in parallel
  const [
    todayOrders, yesterdayOrders,
    thisWeekOrders, lastWeekOrders,
    thisMonthOrders, lastMonthOrders,
    thisYearOrders, lastYearOrders,
    allTimeOrders
  ] = await Promise.all([
    Order.countDocuments({ ...matchForAnalytics, createdAt: { $gte: timeline.today } }),
    Order.countDocuments({ ...matchForAnalytics, createdAt: { $gte: timeline.yesterday, $lte: timeline.yesterdayEnd } }),
    Order.countDocuments({ ...matchForAnalytics, createdAt: { $gte: timeline.weekStart } }),
    Order.countDocuments({ ...matchForAnalytics, createdAt: { $gte: timeline.lastWeekStart, $lte: timeline.lastWeekEnd } }),
    Order.countDocuments({ ...matchForAnalytics, createdAt: { $gte: timeline.monthStart } }),
    Order.countDocuments({ ...matchForAnalytics, createdAt: { $gte: timeline.lastMonthStart, $lte: timeline.lastMonthEnd } }),
    Order.countDocuments({ ...matchForAnalytics, createdAt: { $gte: timeline.yearStart } }),
    Order.countDocuments({ ...matchForAnalytics, createdAt: { $gte: timeline.lastYearStart, $lte: timeline.lastYearEnd } }),
    Order.countDocuments({ ...matchForAnalytics }),
  ]);

  // Check client existence before sending response
  guard.check();

  // Send json response
  res.status(200).json({
    success: true,
    data: orders,
    analytics: {
      daily: comparison(todayOrders, yesterdayOrders),
      weekly: comparison(thisWeekOrders, lastWeekOrders),
      monthly: comparison(thisMonthOrders, lastMonthOrders),
      yearly: comparison(thisYearOrders, lastYearOrders),
      allTime: allTimeOrders,
    },
    pagination: {
      page,
      limit,
      totalItems: totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
      hasNextPage: page < Math.ceil(totalOrders / limit),
      hasPrevPage: page > 1,
    },
  });
};



/* ===================================================
   ===================================================
                   * GET ONE ORDER
   ===================================================
   =================================================== */
exports.getOneOrder = async (req, res) => {
  const guard = withAbortCheck(req);
  const orderId = req.params.id;

  // get the order and populate related data
  const order = await Order.findById(orderId)
    .populate('user', 'name email')
    .lean()
    .exec({ signal: req.signal });

  // check order existence
  if (!order) throw new NotFoundError('Order');

  // check client connection before response
  guard.check();

  // send json response
  res.status(200).json({
    success: true,
    data: order,
  });
};



/* ===================================================
   ===================================================
                   * UPDATE ORDER
   ===================================================
   =================================================== */
exports.updateOrder = async (req, res) => {
  const guard = withAbortCheck(req);
  const orderId = req.params.id;
  const { orderStatus, paymentStatus } = req.body;

  // @ least one field required
  if (!orderStatus && !paymentStatus) {
    throw new BadRequestError('At least one field required (orderStatus or paymentStatus)');
  }

  // build update object
  const update = {};
  if (orderStatus) update.orderStatus = orderStatus;
  if (paymentStatus) update.paymentStatus = paymentStatus;

  // update the order
  const order = await Order.findByIdAndUpdate(
    orderId,
    update,
    { new: true, runValidators: true }
  ).populate('user', 'name email').lean();

  // check order existence
  if (!order) throw new NotFoundError('Order');

  // check client connection before response
  guard.check();

  // send json response
  res.status(200).json({
    success: true,
    data: order,
  });
};



/*
  ====================================================
  ====================================================
                   * GET ALL REVENUE
  ====================================================
  ====================================================*/
exports.getAllRevenue = async (req, res) => {
  const guard = withAbortCheck(req);

  // Executing query in parallel - for performance
  const [
    todayRevenue, yesterdayRevenue,
    thisWeekRevenue, lastWeekRevenue,
    thisMonthRevenue, lastMonthRevenue,
    thisYearRevenue, lastYearRevenue,
    allTimeRevenue,
    todayOrders, yesterdayOrders,
    thisWeekOrders, thisMonthOrders, thisYearOrders, allTimeOrders,
    topSellingData,
  ] = await Promise.all([
    getRevenue({ paymentStatus: 'paid', createdAt: { $gte: timeline.today } }, req.signal),
    getRevenue({ paymentStatus: 'paid', createdAt: { $gte: timeline.yesterday, $lte: timeline.yesterdayEnd } }, req.signal),
    getRevenue({ paymentStatus: 'paid', createdAt: { $gte: timeline.weekStart } }, req.signal),
    getRevenue({ paymentStatus: 'paid', createdAt: { $gte: timeline.lastWeekStart, $lte: timeline.lastWeekEnd } }, req.signal),
    getRevenue({ paymentStatus: 'paid', createdAt: { $gte: timeline.monthStart } }, req.signal),
    getRevenue({ paymentStatus: 'paid', createdAt: { $gte: timeline.lastMonthStart, $lte: timeline.lastMonthEnd } }, req.signal),
    getRevenue({ paymentStatus: 'paid', createdAt: { $gte: timeline.yearStart } }, req.signal),
    getRevenue({ paymentStatus: 'paid', createdAt: { $gte: timeline.lastYearStart, $lte: timeline.lastYearEnd } }, req.signal),
    getRevenue({ paymentStatus: 'paid' }, req.signal),
    Order.countDocuments({ createdAt: { $gte: timeline.today } }),
    Order.countDocuments({ createdAt: { $gte: timeline.yesterday, $lte: timeline.yesterdayEnd } }),
    Order.countDocuments({ createdAt: { $gte: timeline.weekStart } }),
    Order.countDocuments({ createdAt: { $gte: timeline.monthStart } }),
    Order.countDocuments({ createdAt: { $gte: timeline.yearStart } }),
    Order.countDocuments({}),
    calculateTopSellingProducts(req),
  ]);

  // Check client existence before sending response
  guard.check();

  // Send json response
  res.status(200).json({
    success: true,
    data: {
      revenue: {
        daily: comparison(todayRevenue, yesterdayRevenue),
        weekly: comparison(thisWeekRevenue, lastWeekRevenue),
        monthly: comparison(thisMonthRevenue, lastMonthRevenue),
        yearly: comparison(thisYearRevenue, lastYearRevenue),
        allTime: allTimeRevenue,
      },
      orders: {
        today: todayOrders,
        yesterday: yesterdayOrders,
        thisWeek: thisWeekOrders,
        thisMonth: thisMonthOrders,
        thisYear: thisYearOrders,
        allTime: allTimeOrders,
      },
      products: {
        topSelling: topSellingData,
      },
    },
  });
};



/*
  ====================================================
  ====================================================
                   * CREATE
  ====================================================
  ====================================================*/
exports.createProduct = async (req, res) => {
  const guard = withAbortCheck(req);
  const { name, price, quantity, category, deliveryTime, productInfo, status } = req.body;

  // Re-check input existence
  if (!name || !price || !quantity || !category || !deliveryTime || !productInfo || !status) {
    throw new BadRequestError('Missing required fields');
  }

  // Check file existence
  if (!req.files?.length) {
    throw new BadRequestError('At least one product image is required');
  }

  // Enforce max image limit (this was missing — only updateProduct checked it before)
  const maxImages = parseInt(process.env.MAX_IMAGE_LIMIT || 5);
  if (req.files.length > maxImages) {
    throw new BadRequestError(`Max ${maxImages} images allowed`);
  }

  // Upload with allSettled so a partial failure can be cleanly rolled back
  const results = await Promise.allSettled(
    req.files.map((file) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: process.env.CLOUDINARY_FOLDER_NAME, resource_type: 'image' },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(file.buffer);
      });
    })
  );

  const failed = results.filter((r) => r.status === 'rejected');
  const succeeded = results.filter((r) => r.status === 'fulfilled').map((r) => r.value);

  if (failed.length > 0) {
    await Promise.allSettled(succeeded.map((r) => cloudinary.uploader.destroy(r.public_id)));
    throw new Error(`Upload failed: ${failed[0].reason.message}`);
  }

  try {
    // Creating new product
    const newProduct = await Product.create({
      name,
      price: parseFloat(price),
      quantity: parseFloat(quantity),
      images: succeeded.map((r) => ({ url: r.secure_url, public_id: r.public_id })),
      category,
      productInfo,
      deliveryTime,
      status: status || 'in stock',
    });

    // Check client existence before sending response
    guard.check();

    // Send json response
    res.status(201).json({
      success: true,
      data: newProduct,
    });
  } catch (err) {
    // roll back uploaded images if the DB save failed
    await Promise.allSettled(succeeded.map((r) => cloudinary.uploader.destroy(r.public_id)));
    throw err; // caught by global error handler
  }
};



/*
  ====================================================
  ====================================================
                   * UPDATE PRODUCT
  ====================================================
  ====================================================*/
exports.updateProduct = async (req, res) => {
  const guard = withAbortCheck(req);

  // fetched and attached by 'loadProduct' in routes
  const product = req.product;
  if (!product) throw new NotFoundError('Product');

  const { name, price, quantity, category, productInfo, deliveryTime, status } = req.body;

  // handling image retention
  const imagesToKeep = req.body.deleteImages?.length
    ? product.images.filter((img) => !req.body.deleteImages.includes(img.public_id))
    : [...product.images]; // shallow copy to avoid accidental mutation

  // validate final image count (already done in validation, but kept as safety)
  const newImagesCount = req.files?.length || 0;
  if (imagesToKeep.length + newImagesCount > parseInt(process.env.MAX_IMAGE_LIMIT || 5)) {
    throw new BadRequestError(`Max ${process.env.MAX_IMAGE_LIMIT || 5} images allowed`);
  }

  let newlyUploaded = [];

  try {
    // upload new images with allSettled to safely handle partial failures
    if (req.files?.length) {
      const results = await Promise.allSettled(
        req.files.map((file) => {
          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: process.env.CLOUDINARY_FOLDER_NAME, resource_type: 'image' },
              (error, result) => (error ? reject(error) : resolve(result))
            );
            stream.end(file.buffer);
          });
        })
      );

      const failed = results.filter(r => r.status === 'rejected');
      const succeeded = results.filter(r => r.status === 'fulfilled').map(r => r.value);

      // if any upload failed, roll back all successfully uploaded images
      if (failed.length > 0) {
        await Promise.allSettled(
          succeeded.map(r => cloudinary.uploader.destroy(r.public_id))
        );
        throw new Error(`Upload failed: ${failed[0].reason.message}`);
      }

      newlyUploaded = succeeded;
    }

    // build the final images array
    product.images = imagesToKeep; // images to keep from old set
    if (newlyUploaded.length) {
      product.images.push(
        ...newlyUploaded.map(r => ({ url: r.secure_url, public_id: r.public_id }))
      );
    }

    // apply other field updates
    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = price;
    if (quantity !== undefined) product.quantity = quantity;
    if (category !== undefined) product.category = category;
    if (productInfo !== undefined) product.productInfo = productInfo;
    if (deliveryTime !== undefined) product.deliveryTime = deliveryTime;
    if (status !== undefined) product.status = status;

    // reorder images if requested (with validation)
    if (req.body.order?.length) {
      const orderArr = req.body.order;
      const currentIds = product.images.map(img => img.public_id);
      // order array must contain exactly the current image IDs
      const isValidOrder =
        orderArr.length === currentIds.length &&
        orderArr.every(id => currentIds.includes(id));
      if (!isValidOrder) {
        throw new BadRequestError('Order array must contain exactly the current image IDs');
      }
      product.images.sort(
        (a, b) => orderArr.indexOf(a.public_id) - orderArr.indexOf(b.public_id)
      );
    }

    // save product to db first
    await product.save();

    // delete old Cloudinary images (safe: db already updated)
    if (req.body.deleteImages?.length) {
      await Promise.allSettled(
        req.body.deleteImages.map(id => cloudinary.uploader.destroy(id))
      );
      // failed deletions are logged but not thrown (they're not critical)
    }

    // client abort check and response
    guard.check();
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: { id: product._id },
    });
  } catch (err) {
    // cleanup any newly uploaded images if something failed before/after db save
    if (newlyUploaded.length) {
      await Promise.allSettled(
        newlyUploaded.map(r => cloudinary.uploader.destroy(r.public_id))
      );
    }
    throw err; // will be caught by global error handler
  }
};



/*
   ====================================================
   ====================================================
                   * DELETE PRODUCT
   ====================================================
   ====================================================*/
exports.deleteProduct = async (req, res) => {

  const guard = withAbortCheck(req);
  const product = await Product.findById(req.params.id);

  // Check product existence
  if (!product) throw new NotFoundError('Product');

  // Delete images from Cloudinary
  if (product.images?.length) {
    await Promise.all(product.images.map((img) => cloudinary.uploader.destroy(img.public_id)));
  }

  // Delete product
  await Product.findByIdAndDelete(req.params.id);

  // Check client existence before sending response
  guard.check();

  // Send json response
  res.status(200).json({
    success: true,
    data: null,
  });
};



/*
   ====================================================
   ====================================================
                   * GET-ALL-USERS
   ====================================================
   ====================================================*/
exports.getAllUsers = async (req, res) => {
  const guard = withAbortCheck(req);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sort = buildSort(req.query.sort);

  // checking client connection before heavy task
  guard.check();

  // find all users
  const [users, total] = await Promise.all([
    User.find()
      .select('-password -__v')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec({ signal: req.signal }),
    User.countDocuments(),
  ]);

  // check client connection before response
  guard.check();

  // send json response
  res.status(200).json({
    success: true,
    data: users,
    pagination: {
      page,
      limit,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
  });
};



/*
   ====================================================
   ====================================================
                   * UPDATE-USER
   ====================================================
   ====================================================*/
exports.updateUser = async (req, res) => {
  const guard = withAbortCheck(req);

  // destructure fields to update
  const { userRole, getEmail } = req.body;

  // at least one field required
  if (userRole === undefined && getEmail === undefined) {
    throw new BadRequestError('Nothing to update');
  }

  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError('User');

  // apply changes only if the value is explicitly provided
  if (userRole !== undefined) user.userRole = userRole;
  if (getEmail !== undefined) user.getEmail = getEmail;

  // save the changes
  await user.save();

  // check client connection before response
  guard.check();

  // send json response
  res.status(200).json({
    success: true,
    message: 'User updated',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userRole: user.userRole,
        getEmail: user.getEmail,
      },
    },
  });
};



/*
   ====================================================
   ====================================================
                   * GET-ONE-USER
   ====================================================
   ====================================================*/
exports.getOneUser = async (req, res) => {
  const guard = withAbortCheck(req);

  // find the user
  const user = await User.findById(req.params.id)
    .select('-password -__v')
    .lean()
    .exec({ signal: req.signal });

  // check user existence
  if (!user) throw new NotFoundError('User');

  // check client connection before response
  guard.check();

  // send json response
  res.status(200).json({
    success: true,
    data: { user },
  });
};



/*
   ====================================================
   ====================================================
                   * DELETE-USER
   ====================================================
   ====================================================*/
exports.deleteUser = async (req, res) => {
  const guard = withAbortCheck(req);

  // find the user
  const user = await User.findById(req.params.id);

  // check user existence
  if (!user) throw new NotFoundError('User');

  // prevent deleting the currently logged-in admin
  if (user._id.toString() === req.user._id.toString()) {
    throw new BadRequestError('Cannot delete your own account from here');
  }

  // find the user and delete it
  await User.findByIdAndDelete(req.params.id);

  // check client existence before response
  guard.check();

  // send json response
  res.status(200).json({
    success: true,
    message: 'User deleted',
    data: { user: { id: user._id, email: user.email } },  // minimal info
  });
};



/*
   ====================================================
   ====================================================
                   * GET-ERRORS
   ====================================================
   ====================================================*/
exports.getCriticalErrors = async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const sort = req.query.sort === 'oldest' ? 1 : -1; // -1 for newest first
    const skip = (page - 1) * limit;

    const guard = withAbortCheck(req);

    const errors = await ErrorLog.find()
        .sort({ createdAt: sort })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email')
        .select('-__v');

    const total = await ErrorLog.countDocuments();

    // check client connection before response
    guard.check();

    // send json response
    res.status(200).json({
        success: true,
        count: errors.length,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        errors
    });
};



/*
   ====================================================
   ====================================================
                   * GET-SINGLE-ERROR
   ====================================================
   ====================================================*/
exports.getErrorDetail = async (req, res) => {

	const guard = withAbortCheck(req);
    const error = await ErrorLog.findById(req.params.id)
        .populate('userId', 'name email');

    // check error existence
    if (!error) {
        return res.status(404).json({
            success: false,
            message: 'Error log not found'
        });
    }

    // check client connection before response
    guard.check();

    // send json response
    res.status(200).json({
        success: true,
        error
    });
};



/*
   ====================================================
   ====================================================
                   * DELETE-SINGLE-ERROR
   ====================================================
   ====================================================*/
exports.deleteError = async (req, res) => {

	const guard = withAbortCheck(req);

	const errorId = req.params.id.trim().toString();
    const error = await ErrorLog.findByIdAndDelete(errorId);

    // check error existence
    if (!error) {
        return res.status(404).json({
            success: false,
            message: 'Error log not found'
        });
    }

    // check client connection before response
    guard.check();
    
    // send json response
    res.status(200).json({
        success: true,
        message: 'Error log deleted successfully'
    });
};
