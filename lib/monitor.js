import crypto from 'crypto';

const FEISHU_WEBHOOK = 'https://open.feishu.cn/open-apis/bot/v2/hook/30ce9bd2-1eac-4dd5-a7d2-23c1fbcf1096';
const FEISHU_SECRET = 'EJlDQOP2AfDEo8EyX7HnOg';

/**
 * Sends a categorized alert to Feishu
 * @param {Object} params
 * @param {'P0'|'P1'|'P2'|'P3'} params.level - Priority level
 * @param {string} params.title - Short title of the alert
 * @param {string} params.message - Detailed description
 * @param {string} [params.evidence] - Log snippet, URL, or error stack
 */
export async function sendAlert({ level = 'P2', title, message, evidence }) {
  // Use a fallback for build time if needed, though this is usually called at runtime
  if (!FEISHU_WEBHOOK) return false;

  const timestamp = Math.floor(Date.now() / 1000);
  const stringToSign = `${timestamp}\n${FEISHU_SECRET}`;
  const sign = crypto
    .createHmac('sha256', stringToSign)
    .update('') // Feishu expects an empty message for the signature itself
    .digest('base64');

  const levelIcons = {
    P0: '🚨 [P0 CRITICAL]',
    P1: '⚠️ [P1 SEVERE]',
    P2: '🔔 [P2 GENERAL]',
    P3: '💡 [P3 SUGGESTION]'
  };

  const text = `${levelIcons[level] || '🔔'} ${title}\n\n` +
               `Time: ${new Date().toISOString()}\n` +
               `Message: ${message}\n\n` +
               `${evidence ? `Evidence:\n${evidence}` : ''}`;

  const payload = {
    timestamp: timestamp.toString(),
    sign: sign,
    msg_type: "text",
    content: {
      text: text
    }
  };

  try {
    const response = await fetch(FEISHU_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Feishu API error:', errorData);
    }
    
    return response.ok;
  } catch (error) {
    console.error('Failed to send alert to Feishu:', error);
    return false;
  }
}
