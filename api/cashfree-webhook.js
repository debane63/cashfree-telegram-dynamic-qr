const fs = require('fs');
const path = require('path');
const { sendMessage } = require('../lib/telegram');

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const body = req.body || {};
    // Cashfree may use different field names — check your webhook payload
    const orderId = body.order_id || body.orderId || body.orderid || body.reference_order_id;
    const status = body.order_status || body.orderStatus || body.tx_status || body.status;

    // TODO: verify signature header if you configured one in Cashfree dashboard
    // Example: const signature = req.headers['x-cashfree-signature'];

    // load orders
    const ordersPath = path.join(__dirname, '..', 'data', 'orders.json');
    let orders = [];
    try { orders = JSON.parse(fs.readFileSync(ordersPath)); } catch (e) {}

    const idx = orders.findIndex(o => o.orderId === orderId || o.order_id === orderId);
    if (idx === -1) {
      console.warn('order not found', orderId);
    } else {
      orders[idx].status = status || 'UNKNOWN';
      orders[idx].rawWebhook = body;
      fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));

      // credit points if paid
      const upStatus = String(status || '').toUpperCase();
      if (upStatus === 'PAID' || upStatus === 'SUCCESS' || upStatus === 'CAPTURED') {
        const usersPath = path.join(__dirname, '..', 'data', 'users.json');
        let users = {};
        try { users = JSON.parse(fs.readFileSync(usersPath)); } catch (e) {}

        const userId = orders[idx].user_id;
        const amount = Number(orders[idx].amount) || Number(body.order_amount) || 0;
        users[userId] = users[userId] || { points: 0 };
        users[userId].points = (users[userId].points || 0) + amount;
        fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

        // notify user via Telegram
        if (process.env.TELEGRAM_BOT_TOKEN) {
          try {
            await sendMessage(process.env.TELEGRAM_BOT_TOKEN, userId, `Payment received ✔\nAmount: ₹${amount}\n${amount} points added to your account.`);
          } catch (e) { console.error('notify failed', e.message); }
        }
      }
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error(err);
    res.status(500).send('error');
  }
};
