const CLOWAND_LOGO = `
  <h1 style="margin: 0; color: #0f172a; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 32px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase;">
    CLO<span style="color: #2563eb;">WAND</span>
  </h1>
`;

const EMAIL_FOOTER = `
  <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e2e8f0; text-align: center;">
    <p style="margin: 0; color: #64748b; font-size: 12px; line-height: 1.5;">
      &copy; 2026 Clowand. All rights reserved.<br />
      123 Clean St, Boston, MA 02108
    </p>
    <div style="margin-top: 16px;">
      <a href="https://clowand.com" style="color: #2563eb; text-decoration: none; font-size: 12px; margin: 0 8px;">Website</a>
      <a href="mailto:support@clowand.com" style="color: #2563eb; text-decoration: none; font-size: 12px; margin: 0 8px;">Support</a>
    </div>
  </div>
`;

export function welcomeTemplate(email) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Clowand</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 40px 20px;">
              ${CLOWAND_LOGO}
              <p style="margin: 8px 0 0; color: #64748b; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">Premium Bathroom Hygiene</p>
            </td>
          </tr>
          <!-- Hero -->
          <tr>
            <td style="padding: 20px 40px 40px;">
              <h2 style="margin: 0 0 16px; color: #0f172a; font-size: 24px; font-weight: 800; text-align: center;">Welcome to Cleaner Living!</h2>
              <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6; text-align: center;">
                You're now on your way to a cleaner, more hygienic bathroom. Here's your welcome gift — plus a free guide to better bathroom hygiene.
              </p>
              
              <div style="background-color: #eff6ff; border: 2px dashed #2563eb; border-radius: 16px; padding: 32px; text-align: center;">
                <p style="margin: 0 0 8px; color: #1e40af; font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">Your Welcome Gift</p>
                <p style="margin: 0 0 8px; color: #2563eb; font-size: 36px; font-weight: 900; letter-spacing: 4px;">CLOWAND10</p>
                <p style="margin: 0; color: #60a5fa; font-size: 14px;">10% OFF your first order</p>
              </div>

              
              <!-- Free Hygiene Guide -->
              <div style="margin-top: 24px; background-color: #f0fdf4; border: 2px solid #86efac; border-radius: 16px; padding: 24px; text-align: center;">
                <p style="margin: 0 0 8px; color: #166534; font-size: 14px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">Free Bathroom Hygiene Guide</p>
                <p style="margin: 0 0 16px; color: #15803d; font-size: 15px; line-height: 1.5;">
                  5 science-backed tips for a germ-free bathroom. Your guide is waiting.
                </p>
                <a href="https://clowand.com/blog/bathroom-hygiene-guide-2025" style="display: inline-block; padding: 14px 28px; background-color: #15803d; color: #ffffff; font-weight: 700; font-size: 13px; text-decoration: none; border-radius: 100px; letter-spacing: 1px;">
                  READ THE GUIDE →
                </a>
              </div>

              <div style="margin-top: 32px; text-align: center;">
                <a href="https://clowand.com/#bundles" style="display: inline-block; padding: 18px 36px; background-color: #2563eb; color: #ffffff; font-weight: 800; font-size: 14px; text-decoration: none; border-radius: 100px; letter-spacing: 1px; box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);">
                  REDEEM MY DISCOUNT &rarr;
                </a>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 0 40px 40px;">
              ${EMAIL_FOOTER}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export function orderConfirmTemplate({ orderData }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <tr>
            <td align="center" style="padding: 40px 40px 20px;">
              ${CLOWAND_LOGO}
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px 40px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; width: 48px; height: 48px; background-color: #dcfce7; border-radius: 50%; text-align: center; line-height: 48px; margin-bottom: 16px;">
                  <span style="color: #16a34a; font-size: 24px;">✓</span>
                </div>
                <h2 style="margin: 0; color: #0f172a; font-size: 24px; font-weight: 800;">Order Confirmed!</h2>
                <p style="margin: 8px 0 0; color: #64748b; font-size: 16px;">Hi ${orderData.customer_name || 'there'}, we've received your order.</p>
              </div>

              <div style="background-color: #f1f5f9; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 12px;">Order Summary</td>
                    <td align="right" style="color: #64748b; font-size: 12px; font-weight: 700;">#${orderData.order_id}</td>
                  </tr>
                  <tr>
                    <td style="color: #0f172a; font-size: 15px; font-weight: 600; padding: 12px 0; border-top: 1px solid #e2e8f0;">
                      ${orderData.product_name || 'Clowand Product'}
                    </td>
                    <td align="right" style="color: #0f172a; font-size: 15px; font-weight: 700; padding: 12px 0; border-top: 1px solid #e2e8f0;">
                      $${Number(orderData.amount).toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding-top: 12px; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0; color: #64748b; font-size: 13px;">Shipping to: <strong>${orderData.shipping_city || 'USA'}</strong></p>
                    </td>
                  </tr>
                </table>
              </div>

              <p style="margin: 0 0 24px; color: #475569; font-size: 14px; line-height: 1.6;">
                Your order is being prepared and will ship within 1-2 business days. We'll send you another email with a tracking number as soon as it's on the way!
              </p>

              <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 8px; padding: 16px;">
                <p style="margin: 0; color: #166534; font-size: 13px;">
                  <strong>100% Satisfaction Guarantee</strong><br />
                  If you're not happy with your order, we'll make it right. No questions asked.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 40px;">
              ${EMAIL_FOOTER}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export function shippingTemplate({ orderData }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <tr>
            <td align="center" style="padding: 40px 40px 20px;">
              ${CLOWAND_LOGO}
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px 40px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; font-size: 48px; margin-bottom: 16px;">📦</div>
                <h2 style="margin: 0; color: #0f172a; font-size: 24px; font-weight: 800;">Your order is on its way!</h2>
                <p style="margin: 8px 0 0; color: #64748b; font-size: 16px;">Great news, ${orderData.customer_name || 'there'}!</p>
              </div>

              <div style="background-color: #0f172a; border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 24px; color: #ffffff;">
                <p style="margin: 0 0 12px; color: #94a3b8; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">Tracking Number</p>
                <p style="margin: 0 0 24px; color: #ffffff; font-size: 28px; font-weight: 900; letter-spacing: 2px;">${orderData.tracking_number}</p>
                <a href="https://clowand.com/track?id=${orderData.order_id}" style="display: inline-block; padding: 14px 28px; background-color: #2563eb; color: #ffffff; font-weight: 800; font-size: 13px; text-decoration: none; border-radius: 100px; letter-spacing: 1px;">
                  TRACK MY ORDER &rarr;
                </a>
              </div>

              <div style="margin-bottom: 24px;">
                <h4 style="margin: 0 0 12px; color: #0f172a; font-size: 14px; font-weight: 700;">Shipping Details</h4>
                <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;">
                  <p style="margin: 0 0 4px; color: #0f172a; font-size: 14px; font-weight: 600;">${orderData.product_name || 'Clowand Product'}</p>
                  <p style="margin: 0; color: #64748b; font-size: 13px;">Dest: ${orderData.shipping_city || 'USA'}</p>
                </div>
              </div>

              <p style="margin: 0 0 24px; color: #475569; font-size: 14px; line-height: 1.6;">
                Delivery typically takes 7-14 business days. Please allow 24-48 hours for the tracking information to update.
              </p>

              <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 8px; padding: 16px;">
                <p style="margin: 0; color: #991b1b; font-size: 13px;">
                  <strong>Need help?</strong><br />
                  If your package doesn't arrive as expected, just reply to this email.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 40px;">
              ${EMAIL_FOOTER}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export function reviewRequestTemplate({ customerName, orderData }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <tr>
            <td align="center" style="padding: 40px 40px 20px;">
              ${CLOWAND_LOGO}
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px 40px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; font-size: 48px; margin-bottom: 16px;">✨</div>
                <h2 style="margin: 0; color: #0f172a; font-size: 24px; font-weight: 800;">How was your experience?</h2>
                <p style="margin: 8px 0 0; color: #64748b; font-size: 16px;">Hi ${customerName || 'there'}, we'd love your feedback!</p>
              </div>

              <p style="margin: 0 0 24px; color: #475569; font-size: 15px; line-height: 1.6; text-align: center;">
                We hope you're loving your <strong>${orderData.product_name || 'Clowand product'}</strong>. 
                Your feedback helps us improve and helps other customers make better choices.
              </p>

              <div style="text-align: center; margin-bottom: 32px;">
                <a href="https://search.google.com/local/writereview?placeid=clowand" style="display: block; padding: 18px; background-color: #2563eb; color: #ffffff; font-weight: 800; font-size: 14px; text-decoration: none; border-radius: 100px; letter-spacing: 1px; margin-bottom: 12px; box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);">
                  LEAVE A GOOGLE REVIEW &rarr;
                </a>
                <a href="https://www.trustpilot.com/review/clowand.com" style="display: block; padding: 14px; background-color: #00b67a; color: #ffffff; font-weight: 800; font-size: 13px; text-decoration: none; border-radius: 100px; letter-spacing: 1px;">
                  REVIEW ON TRUSTPILOT
                </a>
              </div>

              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; text-align: center;">
                <p style="margin: 0 0 4px; color: #94a3b8; font-size: 11px; font-weight: 700; text-transform: uppercase;">Order Reference</p>
                <p style="margin: 0; color: #0f172a; font-size: 16px; font-weight: 700;">#${orderData.order_id}</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 40px;">
              ${EMAIL_FOOTER}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export function abandonedCartTemplate({ customerName, cartItems, totalAmount }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Clowand Cart is waiting</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 40px 20px;">
              ${CLOWAND_LOGO}
              <p style="margin: 8px 0 0; color: #64748b; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">Premium Bathroom Hygiene</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 20px 40px 40px;">
              <h2 style="margin: 0 0 16px; color: #0f172a; font-size: 24px; font-weight: 800; text-align: center;">Wait, you forgot something!</h2>
              <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6; text-align: center;">
                Hi ${customerName || 'there'}, we noticed you left some items in your cart. Don't let your bathroom stay dirty—complete your order now!
              </p>
              
              <div style="background-color: #f1f5f9; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 12px;">Your Cart</td>
                    <td align="right" style="color: #64748b; font-size: 12px; font-weight: 700;">Subtotal</td>
                  </tr>
                  <tr>
                    <td style="color: #0f172a; font-size: 15px; font-weight: 600; padding: 12px 0; border-top: 1px solid #e2e8f0;">
                      ${cartItems || 'Clowand Cleaning System'}
                    </td>
                    <td align="right" style="color: #0f172a; font-size: 15px; font-weight: 700; padding: 12px 0; border-top: 1px solid #e2e8f0;">
                      $${totalAmount ? Number(totalAmount).toFixed(2) : '0.00'}
                    </td>
                  </tr>
                </table>
              </div>

              <div style="background-color: #fff7ed; border: 1px solid #ffedd5; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <p style="margin: 0 0 8px; color: #9a3412; font-size: 14px; font-weight: 700;">Limited Time Offer</p>
                <p style="margin: 0 0 16px; color: #ea580c; font-size: 18px; font-weight: 800;">Get 10% OFF if you finish now!</p>
                <div style="display: inline-block; background-color: #ea580c; color: #ffffff; padding: 8px 16px; border-radius: 8px; font-weight: 900; font-size: 18px; letter-spacing: 2px;">
                  COMEBACK10
                </div>
              </div>

              <div style="text-align: center;">
                <a href="https://clowand.com" style="display: inline-block; padding: 18px 36px; background-color: #2563eb; color: #ffffff; font-weight: 800; font-size: 14px; text-decoration: none; border-radius: 100px; letter-spacing: 1px; box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);">
                  FINISH MY ORDER &rarr;
                </a>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 0 40px 40px;">
              ${EMAIL_FOOTER}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
