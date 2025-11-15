const axios = require("axios");

async function createOrderLive({ appId, secret, orderId, amount, userId }) {
  const auth = Buffer.from(`${appId}:${secret}`).toString("base64");

  try {
    const response = await axios.post(
      "https://api.cashfree.com/pg/orders",
      {
        order_id: orderId,
        order_amount: amount,
        order_currency: "INR",
        customer_details: {
          customer_id: String(userId),
          customer_phone: "9999999999"
        }
      },
      {
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          authorization: `Basic ${auth}`
        }
      }
    );

    return response.data;
  } catch (err) {
    console.error("Cashfree API Error:", err.response?.data || err.message);
    throw err;
  }
}

module.exports = { createOrderLive };
