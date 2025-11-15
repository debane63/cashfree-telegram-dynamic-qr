const axios = require("axios");

async function createOrderLive(appId, secret, orderId, amount, userId) {
  try {
    const auth = Buffer.from(`${appId}:${secret}`).toString("base64");

    const resp = await axios.post(
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

    return resp.data;

  } catch (err) {
    console.error("Cashfree Error:", err.response?.data || err.message);
    throw err;
  }
}

module.exports = { createOrderLive };            process.env.TELEGRAM_BOT_TOKEN,
            chatId,
            `Payment link আলাদা হল👇\n${r.data.paymentLink}`
          );
        } else {
          await sendMessage(process.env.TELEGRAM_BOT_TOKEN, chatId, 'Payment creation failed.');
        }

      } catch (e) {
        console.error('create-order error:', e.message);
        await sendMessage(process.env.TELEGRAM_BOT_TOKEN, chatId, 'Server error.');
      }
    }

    res.status(200).send('ok');

  } catch (err) {
    console.error(err);
    res.status(500).send('error');
  }
};
