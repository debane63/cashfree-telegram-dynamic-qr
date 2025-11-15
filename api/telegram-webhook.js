const axios = require('axios');
const { sendMessage } = require('../lib/telegram');

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const body = req.body || {};
    const message = body.message || body.edited_message || {};
    const chatId = message.chat?.id;
    const text = (message.text || '').trim();

    if (!chatId) return res.status(200).send('no-chat');

    // Handle /pay <amount>
    if (text.startsWith('/pay')) {

      const parts = text.split(/\s+/);
      const amount = Number(parts[1] || '10');

      const baseUrl = process.env.BASE_URL;
      if (!baseUrl) {
        await sendMessage(process.env.TELEGRAM_BOT_TOKEN, chatId, 'Server BASE_URL missing.');
        return res.status(200).send('ok');
      }

      // ⚠ fetch এর জায়গায় axios ব্যবহার করো
      try {
        const r = await axios.post(`${baseUrl}/api/create-order`, {
          user_id: chatId,
          amount,
          customer_phone: null
        });

        if (r.data.paymentLink) {
          await sendMessage(
            process.env.TELEGRAM_BOT_TOKEN,
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
