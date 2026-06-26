

// make .env available everywhere
require('dotenv').config();


// import packages
const { createServer } = require('http');
const mongoose = require('mongoose');
const { formatName } = require('./src/utils/string/formatName');

const PORT = process.env.PORT || 3000;
const nodeEnv = formatName(process.env.NODE_ENV);
const ErrorLog = require('./src/models/errorLog');


// put them all in async function
// for tge step by step process
const start = async () => {
  try {
    // step 1 - connect to MongoDB first
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Database Connected');
    
    
    /**
    // * drop database - clear everything
    mongoose.connection.db.dropDatabase()
    .then(() => console.log('Cleared database'))
    .catch((err) => console.log('Cannot clear db: ', err.message));
    */

    const User = require('./src/models/user');
    // await User.deleteMany();
    // const users = await User.find();
    // console.log('Users: ', users);


    const Product = require('./src/models/product');
    const products = await Product.find();
    // console.log('Products: ', products);
    // products.forEach(p => console.log(p.images));

    const Order = require('./src/models/order');
    // await Order.deleteMany();
    const orders = await Order.find();
    // console.log('Orders: ', orders);

    // await ErrorLog.deleteMany();
    // const errors = await ErrorLog.find().sort({ createdAt: -1 });
    // console.log('Errors: ', errors);
    // errors.forEach(e => console.log(e.message));
    
    /*const newOrder = new Order({
      user: "6a11d7f3f8f1c976ad8e19ba",
      items: [
        {
          product: "6a0dff4b6b34cea750503f9f",
          name: "Ethiopian Yirgacheffe Coffee",
          price: 25.99,
          quantity: 2,
          image: "https://example.com/images/coffee.jpg"
        }
        // … you can push more items if needed
      ],
      stripeSessionId: "cs_test_a1B2c3D4e5F6g7H8i9J0",       // Required; from Stripe Checkout
      // paymentIntentId is optional; can be set later after payment confirmation
      // orderStatus & paymentStatus default to 'pending' – you can override them
      shippingAddress: {
        street: "Bole Road, House 123",
        city: "Addis Ababa",
        state: "Addis Ababa",
        zipCode: "1000",
        country: "Ethiopia"                                   // default, can be omitted
      },
      subtotal: 51.98,                                       // required
      shippingCost: 5.00,                                    // default 0
      tax: 7.80,                                             // default 0
      total: 64.78,                                          // required
      notes: "Please deliver before 5 PM."
    });
    
    // Then save it to the database
    newOrder.save()
    .then(doc => console.log('Order saved:', doc))
    .catch(err => console.error('Save failed:', err));*/
    
    
    // step 2 - load app after connection
    const app = require('./src/app');
    const server = createServer(app);
    
    server.listen(PORT, () => {
      console.log(`${nodeEnv} server started on port ${PORT}...`);
    });
    
    // step 3 - handle graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      server.close(() => {
        console.log(`${nodeEnv} server and database connection closed`);
        process.exit(0);
      });
    });

  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    console.error(err);
    process.exit(1);
  }
};


// then call the function
start();
