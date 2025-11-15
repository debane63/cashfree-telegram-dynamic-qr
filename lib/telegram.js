const axios = require('axios');

async function sendMessage(botToken, chatId, text, extra = {}) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const body = { chat_id: chatId, text, ...extra };
  await axios.post(url, body);
}

async function sendPhoto(botToken, chatId, photoUrl, caption = '') {
  const url = `https://api.telegram.org/bot${botToken}/sendPhoto`;
  await axios.post(url, { chat_id: chatId, photo: photoUrl, caption });
}

async function setWebhook(botToken, webhookUrl) {
  const url = `https://api.telegram.org/bot${botToken}/setWebhook`;
  await axios.post(url, { url: webhookUrl });
}

module.exports = { sendMessage, sendPhoto, setWebhook };
