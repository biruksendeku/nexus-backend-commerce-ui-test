

// import packages
const  { emailWrapper, button, linkBox } = require('./base');



/* * Order confirmation with item table */
const orderConfirmationTemplate = (order = {}) => {
  const orderId = (order._id || '').toString().slice(-8).toUpperCase();
  const itemsRows = (order.items || [])
    .map(
      (item) => `
    <tr>
      <td style="padding:10px; border-bottom:1px solid #e5e7eb;">
        ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width:50px; height:50px; object-fit:cover; border-radius:6px;" />` : ''}
      </td>
      <td style="padding:10px; border-bottom:1px solid #e5e7eb;">${item.name || 'Unknown item'}</td>
      <td style="padding:10px; border-bottom:1px solid #e5e7eb;">${item.quantity || 1}x</td>
      <td style="padding:10px; border-bottom:1px solid #e5e7eb;">$${(item.price || 0).toFixed(2)}</td>
      <td style="padding:10px; border-bottom:1px solid #e5e7eb;">$${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
    </tr>`
    )
    .join('');

  const orderUrl = `${process.env.BASE_URL}/orders/${order._id}`;

  return emailWrapper(
    'Order Confirmed!',
    `
      <p>Thank you for your order! Your order has been confirmed and is being processed.</p>
      <div style="background:#f9fafb; padding:16px; border-radius:8px; margin:20px 0;">
        <h3 style="margin:0 0 8px 0;">Order Details</h3>
        <p><strong>Order ID:</strong> #${orderId}</p>
        <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
        <p><strong>Payment Status:</strong> <span style="color:#16a34a;">Paid ✓</span></p>
      </div>
      <table style="width:100%; border-collapse:collapse; margin:20px 0;">
        <thead>
          <tr style="background:#f3f4f6;">
            <th style="padding:10px; text-align:left;">Image</th>
            <th style="padding:10px; text-align:left;">Product</th>
            <th style="padding:10px; text-align:left;">Qty</th>
            <th style="padding:10px; text-align:left;">Price</th>
            <th style="padding:10px; text-align:left;">Total</th>
          </tr>
        </thead>
        <tbody>${itemsRows}</tbody>
      </table>
      <div style="background:#f9fafb; padding:16px; border-radius:8px; margin:20px 0;">
        <h3 style="margin:0 0 8px 0;">Price Summary</h3>
        <p><strong>Subtotal:</strong> $${(order.subtotal || 0).toFixed(2)}</p>
        <p><strong>Shipping:</strong> ${order.shippingCost === 0 ? 'FREE' : '$' + (order.shippingCost || 0).toFixed(2)}</p>
        <p><strong>Tax:</strong> $${(order.tax || 0).toFixed(2)}</p>
        <p style="font-size:18px; font-weight:bold; color:#111827;">
          <strong>Total:</strong> $${(order.total || 0).toFixed(2)}
        </p>
      </div>
      ${order.shippingAddress ? `
        <div style="background:#f9fafb; padding:16px; border-radius:8px; margin:20px 0;">
          <h3 style="margin:0 0 8px 0;">Shipping Address</h3>
          <p>${order.shippingAddress.street || ''}</p>
          <p>${order.shippingAddress.city || ''}, ${order.shippingAddress.state || ''} ${order.shippingAddress.zipCode || ''}</p>
          <p>${order.shippingAddress.country || ''}</p>
        </div>
      ` : ''}
      ${button(orderUrl, 'View Order Details')}
      ${linkBox(orderUrl)}
      <p>We’ll send you another email when your order ships.</p>
    `
  );
};



/* * Payment failed notification */
const paymentFailedTemplate = (order = {}) => {
  const orderId = (order._id || '').toString().slice(-8).toUpperCase();

  return emailWrapper(
    'Payment Failed',
    `
      <p>Unfortunately, your payment couldn't be processed.</p>
      <div style="background:#fff7ed; border:1px solid #fcd34d; padding:16px; border-radius:8px; margin:20px 0;">
        <h3 style="margin:0 0 8px 0; color:#b45309;">Order Details</h3>
        <p><strong>Order ID:</strong> #${orderId}</p>
        <p><strong>Total Amount:</strong> $${(order.total || 0).toFixed(2)}</p>
        <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
      </div>
      <p>Don't worry! Your order hasn’t been cancelled. Here’s what you can do:</p>
      <ul style="color:#374151; line-height:1.8;">
        <li>Check your payment method details</li>
        <li>Ensure you have sufficient funds</li>
        <li>Try a different payment method</li>
        <li>Contact your bank for assistance</li>
      </ul>
      <p>If you need further assistance, our support team is here to help!</p>
    `
  );
};



/* * Refund processed notification */
const refundTemplate = (order = {}) => {
  const orderId = (order._id || '').toString().slice(-8).toUpperCase();
  const itemsRows = (order.items || [])
    .map(
      (item) => `
    <tr>
      <td style="padding:10px; border-bottom:1px solid #e5e7eb;">${item.name || 'Unknown item'}</td>
      <td style="padding:10px; border-bottom:1px solid #e5e7eb;">${item.quantity || 1}x</td>
      <td style="padding:10px; border-bottom:1px solid #e5e7eb;">$${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
    </tr>`
    )
    .join('');

  return emailWrapper(
    'Refund Processed',
    `
      <p>Your refund has been processed successfully.</p>
      <div style="background:#f9fafb; padding:16px; border-radius:8px; margin:20px 0;">
        <h3 style="margin:0 0 8px 0;">Refund Details</h3>
        <p><strong>Order ID:</strong> #${orderId}</p>
        <p><strong>Refund Amount:</strong> <span style="color:#16a34a; font-size:18px; font-weight:bold;">$${(order.total || 0).toFixed(2)}</span></p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
      </div>
      <table style="width:100%; border-collapse:collapse; margin:20px 0;">
        <thead>
          <tr style="background:#f3f4f6;">
            <th style="padding:10px; text-align:left;">Product</th>
            <th style="padding:10px; text-align:left;">Quantity</th>
            <th style="padding:10px; text-align:left;">Amount</th>
          </tr>
        </thead>
        <tbody>${itemsRows}</tbody>
      </table>
      <p>The refund should appear in your account within 5–10 business days.</p>
      <p>We’re sorry things didn’t work out. If you have any questions, don’t hesitate to contact us.</p>
      ${button(`${process.env.BASE_URL}`, 'Continue Shopping')}
    `
  );
};


// export them
module.exports = {
  orderConfirmationTemplate,
  paymentFailedTemplate,
  refundTemplate,
};
