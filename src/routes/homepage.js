

// import packages
const router = require('express').Router();

const homepageController = require('../controllers/home');

// routes
router.get('/', homepageController.getHomepage);

// export the router
module.exports = router;
