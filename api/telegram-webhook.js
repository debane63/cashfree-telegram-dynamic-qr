const { sendMessage } = require('../lib/telegram');
const axios = require('axios');

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const body = req.body || {};
    const message = body.message || body.edited_message || {};
    const chatId = message.chat && message.chat.id;
    const text = (message.text || '').trim();

    if (!chatId) return res.status(200).send('no-chat');

    // handle /pay command: /pay 10  or just /pay
    if (text.startsWith('/pay')) {
      const parts = text.split(/\s+/);
      const amount = Number(parts[1] || '10');
      const baseUrl = process.env.BASE_URL;
      if (!baseUrl) {
        await sendMessage(process.env.TELEGRAM_BOT_TOKEN, chatId, 'Server not configured (BASE_URL missing). contact admin.');
        return res.status(200).send('ok');
      }

      // call our create-order endpoint
      try {
        const resp = await axios.post(`${baseUrl}/api/create-order`, { user_id: chatId, amount, customer_phone: null });
        const json = resp.data;
        if (json.paymentLink) {
          // send link and QR image (we have qrDataUrl too)
          await sendMessage(process.env.TELEGRAM_BOT_TOKEN, chatId, `পেমেন্ট লিংক: ${json.paymentLink}\nScan QR or open the link.`);
          // if qrDataUrl available, send it as photo
          if (json.qrDataUrl) {
            // Telegram can accept data URLs via sendPhoto by uploading; easier: send the link only.
            // Alternatively host the QR somewhere or send base64 as file — keeping simple: send link.
          }
        } else {
          await sendMessage(process.env.TELEGRAM_BOT_TOKEN, chatId, 'Payment creation failed. Admin দেখুন logs.');
        }
      } catch (e) {
        console.error('create-order call failed', e.message);
        await sendMessage(process.env.TELEGRAM_BOT_TOKEN, chatId, 'Payment creation failed (server error).');
      }
    }

    res.status(200).send('ok');
  } catch (err) {
    console.error(err);
    res.status(500).send('error');
  }
};
