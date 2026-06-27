markdown
# Production‑ready e‑commerce backend — advanced dashboard and analytics, authentication, orders, payments, email, and more


A battle‑tested, modular Node.js + Express.js + MongoDB backend for e‑commerce applications.  
Built for teams who need to ship fast without sacrificing scalability or security.

---


### ⚠️⚠️⚠️ Important Notice Before You Proceed ⚠️⚠️⚠️
* Rename the ".env.example" into ".env" and put real environment variables
 before you proceed, otherwise the app WILL CRASH.
 The guide to get those variables is here in README.md file.
 The commonly used variables have been set, you can also reset them.


## 🚀 Features

### 🔐 Authentication & Security
- Email/password local authentication
- OAuth (Google)
- Email verification & password reset flows
- Session management
- Role‑based access control
- Rate limiting and brute‑force protection

### 🛍️ Product Management
- Full CRUD operations
- Advanced filtering, sorting, and search
- Popular & top‑selling product endpoints
- Image upload & management via Cloudinary

### 🖼️ Image Handling
- Upload up to 5 images per product
- Delete individual images
- Reorder images (drag‑and‑drop ready)
- Set primary image

### 📊 Dashboard & Analytics
- Revenue overview and order statistics
- Top‑selling products
- Recent orders and customer summaries
- Ready‑to‑consume endpoints for your admin panel

### 💳 Payments
- Stripe integration (checkout + webhooks)
- Secure payment intent creation
- Payment status tracking

### 📦 Orders
- Order creation and lifecycle management
- Coupon code support
- Revenue calculation utilities
- Shipping address handling

### 📧 Email Services
- Transactional emails (verification, password reset, order confirmations, refunds, etc.)
- Reusable, template‑based system with unified styling
- Customizable company branding via environment variables

### ⚙️ Developer Experience
- Clean, modular architecture (controllers → services → utils)
- Centralized error handling
- Input validation middleware
- Request timeout protection (15s per endpoint)
- Environment‑based configuration
- Logging and retry logic built‑in

---


## 📁 Project Structure

online-shop/
├── .env.example
├── .gitignore
├── README.md
├── package.json
├── package-lock.json
├── server.js
├── node_modules/
└── src/
├── app.js
├── config/
├── controllers/
├── middlewares/
├── models/
├── public/
├── routes/
├── services/
└── utils/



---

## 🛠️ Installation

1. **Clone the repository**

bash
git clone <your-repo-url>
cd online-shop


1. Install dependencies

```bash
npm install
```

1. Set up environment variables

Create a .env file in the root directory:

```bash
touch .env
```

Then paste the following template (replace placeholders with your real values):

```env
NODE_ENV=development
PORT=8000

# App Config
BASE_URL=http://localhost:8000
STATIC_DIR=./public/

# Security
SESSION_SECRET_KEY=keyboard_cat
SALT=10

# Token Config
TOKEN_EXPIRATION_DAY=1
TOKEN_STRING_LENGTH=32

# Retry Logic
MAX_RETRIES=3
RETRY_DELAY=1000

# Product Config
MAX_IMAGE_LIMIT=5
RECENT_DAY_AGE=7
POPULAR_PRODUCTS_SOLD=10
TOP_SELLING_PRODUCTS=3

# Tax
TAX_PERCENT=15

# Database
MONGODB_URI=your_mongodb_connection_string

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER_NAME=my-folder

# Email (Gmail example)
EMAIL_USER=yourcompany@gmail.com
EMAIL_PASS=your_16_digit_app_password

# Company Info
YOUR_COMPANY_ADDRESS=1 Corporate Drive, Suite 200, Anytown, ST 12345
```

---

🔑 How to Get Environment Variables

📦 MongoDB

· Go to MongoDB Atlas
· Create a cluster and click “Connect” → “Connect your application”
· Copy the connection string into MONGODB_URI

💳 Stripe

· Create an account on Stripe
· Go to Developers → API Keys
· Copy the Secret Key → STRIPE_SECRET_KEY
· For webhook:
  · Use the Stripe CLI or dashboard
  · Add an endpoint → copy the signing secret → STRIPE_WEBHOOK_SECRET

☁️ Cloudinary

· Sign up on Cloudinary
· From the Dashboard copy:
  · Cloud Name → CLOUDINARY_CLOUD_NAME
  · API Key → CLOUDINARY_API_KEY
  · API Secret → CLOUDINARY_API_SECRET

📧 Gmail (for Nodemailer)

· Enable 2‑factor authentication on your Google account
· Generate an App Password
· Use your email as EMAIL_USER and the app password as EMAIL_PASS

---

▶️ Running the App

Development (with hot reload)

```bash
npm run dev
```

Production

```bash
npm start
```

Server starts at: http://localhost:8000

---

# 📡 API Highlights

🖼️ Product Image Management

Endpoint: PATCH /products/:id/images

```json
{
  "deleteImages": ["public_id_1"],
  "order": ["public_id_3", "public_id_1"],
  "primaryImage": "public_id_3"
}
```

💳 Create Payment

Endpoint: POST /api/payment/create-payment

```json
{
  "items": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "quantity": 2,
      "variant": "Size: M, Color: Blue"
    }
  ],
  "shippingAddress": {
    "street": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "United States"
  },
  "couponCode": "SAVE20",
  "notes": "Gift wrap please"
}
```

---

🏗️ Architecture Notes

· Controllers – Request/response handling
· Services – Business logic abstraction
· Utils – Reusable helpers (email templates, wrappers)
· Middlewares – Cross‑cutting concerns (auth, error handling, rate limiting, timeout)
· Config – Third‑party integrations (Stripe, Cloudinary, email)

---

🔒 Security Practices

· All secrets kept in environment variables (.env)
· Password hashing with bcrypt & salt rounds
· Token expiration & rotation
· Rate limiting on sensitive routes
· Input validation & sanitization
· Request timeout to prevent hanging operations

---

📌 Future Improvements

· Admin dashboard frontend (SPA)
· Advanced reporting
· Multi‑vendor marketplace support
· Redis caching layer
· Job queue (BullMQ) for async tasks

---

## 💰 Licensing & Pricing

This project is available in two tiers:

### 🆓 Freemium (Community Edition)
- Full backend source code
- All features except: [list what you limit, e.g., admin dashboard, priority support, team collaboration]
- MIT License for personal and evaluation use
- Public GitHub repository

### 💼 Premium (Production License)
- Everything in Freemium, plus:
  - Complete admin dashboard frontend (SPA)
  - Stripe/email/webhook setup walkthrough video
  - One‑year email support
  - Commercial use allowed
- [Buy now →](https://your-purchase-link.com)

Already purchased? Check your email for the private repo invite.

🤝 Contributing

Contributions, issues, and feature requests are welcome. Feel free to fork and open a pull request.

---

📄 License

MIT License

```
