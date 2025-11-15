const axios = require("axios");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const { createOrderLive } = require("../lib/cashfree");

module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const { user_id, amount } = req.body;

    if (!user_id || !amount) {
      return res.status(400).json({ error: "user_id & amount required" });
    }

    const appId = process.env.CASHFREE_APP_ID;
    const secret = process.env.CASHFREE_SECRET;

    const orderId = `order_${Date.now()}`;

    // Call Cashfree new API
    const cfData = await createOrderLive({
      appId,
      secret,
      orderId,
      amount,
      userId: user_id
    });

    if (!cfData?.payment_session_id) {
      return res.status(500).json({
        error: "Cashfree did not return payment_session_id",
        raw: cfData
      });
    }

    const paymentLink = `https://payments.cashfree.com/pg/links/${cfData.payment_session_id}`;

    const qrDataUrl = await QRCode.toDataURL(paymentLink);

    const ordersPath = path.join(__dirname, "..", "data", "orders.json");
    let orders = [];
    try {
      orders = JSON.parse(fs.readFileSync(ordersPath));
    } catch (e) {}

    orders.push({
      orderId,
      user_id,
      amount,
      paymentLink,
      createdAt: new Date().toISOString(),
      status: "CREATED"
    });

    fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));

    return res.json({
      orderId,
      paymentLink,
      qrDataUrl
    });

  } catch (err) {
    console.error("Create Order Error:", err.message);
    return res.status(500).json({
      error: "Cashfree Order Failed",
      detail: err.message
    });
  }
};
