

// import the Stripe class
const Stripe = require('stripe');

// create a new instance by passing the api key as an argument
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


// export the configured stripe
module.exports = stripe;
