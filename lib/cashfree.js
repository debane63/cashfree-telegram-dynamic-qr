const axios = require('axios');

const CASHFREE_API_BASE = 'https://api.cashfree.com';

async function getAuthToken(appId, secret) {
  // Cashfree token endpoint (adjust if Cashfree changes)
  const url = `${CASHFREE_API_BASE}/api/v2/cftoken/login`;
  const resp = await axios.post(url, { appId, secret });
  // resp.data = { status, message, token }
  return resp.data?.token || resp.data?.data?.token;
}

async function createOrder({ appId, secret, orderId, amount, customerId, customerPhone, returnUrl }) {
  const token = await getAuthToken(appId, secret);
  if (!token) throw new Error('Cashfree token not returned');

  const orderPayload = {
    order_id: orderId,
    order_amount: String(amount),
    order_currency: 'INR',
    customer_details: {
      customer_id: customerId || 'user',
      customer_phone: customerPhone || ''
    },
    return_url: returnUrl
  };

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  // Orders API
  const resp = await axios.post(`${CASHFREE_API_BASE}/pg/orders`, orderPayload, { headers });
  // return raw response body for caller to interpret
  return resp.data;
}
