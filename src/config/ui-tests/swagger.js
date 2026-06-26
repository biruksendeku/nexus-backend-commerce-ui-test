

// import packages
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: process.env.YOUR_COMPANY_NAME,
    version: '1.0.0',
    description: `
    Official API documentation for the ${process.env.YOUR_COMPANY_NAME} e-commerce platform.
    
    ## Authentication
    Most endpoints require prior authentication via session cookie (connect.sid). 
    Use the endpoints under the **Auth** tag below to register a new account or log in.
    
    ⚠️ **Testing in Swagger**: If a protected route returns a \`302\` redirect or \`404\` error, your backend is redirecting unauthenticated API requests to an HTML login page. 
    For seamless Swagger testing, your API middleware should return a \`401 Unauthorized\` JSON response instead of a redirect.
    `,
  },
  servers: [
    {
      url: process.env.BASE_URL || 'http://localhost:8000',
      description: 'Development server',
    },
  ],
  tags: [
      { name: 'Auth', description: 'Registration, login, and OAuth (Google, Facebook)' },
      { name: 'Account', description: 'User profile, verification, and account management' },
      { name: 'Verification', description: 'Email verification and resend endpoints' },
      { name: 'Password', description: 'Password reset, forgot password, and change password' },
      { name: 'Products', description: 'Product catalog CRUD operations' },
      { name: 'Payment', description: 'Checkout, Stripe webhooks, and order management' },
      { name: 'Admin', description: 'Admin-only endpoints for managing users and orders' },
    ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'connect.sid',
      },
    },
    // reusable schemas
    schemas: {
      Product: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          price: { type: 'number' },
          quantity: { type: 'integer' },
          images: { type: 'array', items: { type: 'object' } },
          category: { type: 'string' },
          productInfo: { type: 'string' },
          deliveryTime: { type: 'string' },
          status: { type: 'string' },
          purchaseCount: { type: 'integer' },
          orderedBy: { type: 'array', items: { type: 'string' } },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      
      Order: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          user: { type: 'string' },
          items: { type: 'array', items: { type: 'object' } },
          stripeSessionId: { type: 'string' },
          orderStatus: { type: 'string' },
          paymentStatus: { type: 'string' },
          total: { type: 'number' },
          shippingAddress: { type: 'object' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },

      User: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' },
          avatar: { type: 'string' },
          isVerified: { type: 'boolean' },
          userRole: { type: 'string', enum: ['user', 'admin'] },
          authProvider: { type: 'array', items: { type: 'string' } },
          verifiedAt: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      }
    },
  },
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.js', './src/controllers/*.js'],
};


// instantiate swagger spec
const swaggerSpec = swaggerJSDoc(options);


// export the spec
module.exports = swaggerSpec;
