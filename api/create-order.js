const { createOrder } = require('../lib/cashfree');
const { sendMessage } = require('../lib/telegram');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { user_id, amount, customer_phone } = req.body || {};
    if (!user_id || !amount) return res.status(400).json({ error: 'user_id and amount required' });

    const orderId = `order_${Date.now()}_${Math.floor(Math.random()*10000)}`;
    const appId = process.env.CASHFREE_APP_ID;
    const secret = process.env.CASHFREE_SECRET;
    const baseUrl = process.env.BASE_URL;

    if (!appId || !secret || !baseUrl) {
      return res.status(500).json({ error: 'Missing env vars (CASHFREE_APP_ID / CASHFREE_SECRET / BASE_URL)' });
    }

    const cfResp = await createOrder({
      appId,
      secret,
      orderId,
      amount,
      customerId: String(user_id),
      customerPhone: customer_phone,
      returnUrl: `${baseUrl}/thankyou`
    });

    // 인기 possible fields: payment_link, payment_link_ref, payment_url
    const paymentLink =
      cfResp.payment_link ||
      cfResp.payment_url ||
      (cfResp.data && (cfResp.data.payment_link || cfResp.data.payment_url)) ||
      (cfResp?.data?.payment_link);

    if (!paymentLink) {
      // Some Cashfree responses embed link differently; return raw to debug
      return res.status(500).json({ error: 'No payment link from Cashfree', raw: cfResp });
    }

    // Generate QR as data URL
    const qrDataUrl = await QRCode.toDataURL(paymentLink);

    // persist order (simple JSON file for demo)
    const ordersPath = path.join(__dirname, '..', 'data', 'orders.json');
    let orders = [];
    try { orders = JSON.parse(fs.readFileSync(ordersPath)); } catch (e) {}
    orders.push({ orderId, user_id, amount, paymentLink, status: 'CREATED', createdAt: new Date().toISOString() });
    fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));

    // Optionally notify user via Telegram (if bot token present)
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (botToken) {
      try {
        await sendMessage(botToken, user_id, `Payment link তৈরি হয়েছে — ₹${amount}\n${paymentLink}`);
      } catch (e) { console.error('telegram send failed', e.message); }
    }

    return res.json({ orderId, paymentLink, qrDataUrl });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};
